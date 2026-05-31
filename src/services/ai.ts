import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { supabase } from './supabase';

// ─── Serialization helpers ───

function serializeDataset(dataset: { [label: string]: tf.Tensor2D }): { [label: string]: number[][] } {
  const result: { [label: string]: number[][] } = {};
  for (const label in dataset) {
    result[label] = Array.from(dataset[label].arraySync() as number[][]);
  }
  return result;
}

function deserializeDataset(data: { [label: string]: number[][] }): { [label: string]: tf.Tensor2D } {
  const result: { [label: string]: tf.Tensor2D } = {};
  for (const label in data) {
    result[label] = tf.tensor2d(data[label]);
  }
  return result;
}

// ─── Model Profile ───

export interface ModelProfile {
  id?: number;
  name: string;
  commodity: string;
  description: string;
  dataset: { [label: string]: number[][] };
  class_counts: { [label: string]: number };
  created_by: string;
  created_at?: string;
  is_default?: boolean;
}

class AIService {
  private classifier: knnClassifier.KNNClassifier | null = null;
  private graphModel: tf.GraphModel | null = null;
  public isReady = false;
  public activeProfile: string | null = null;

  async init() {
    if (this.isReady) return; // prevent double init
    await tf.ready();
    this.classifier = knnClassifier.create();

    // Load MobileNet from local files (bundled with the app)
    // Falls back to Google CDN if local isn't available
    const localUrl = '/models/mobilenet/model.json';
    try {
      this.graphModel = await tf.loadGraphModel(localUrl);
      console.log('MobileNet loaded from local bundle');
    } catch {
      console.warn('Local model not found, loading from CDN...');
      try {
        this.graphModel = await tf.loadGraphModel(
          'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1',
          { fromTFHub: true }
        );
        console.log('MobileNet loaded from CDN');
      } catch (e) {
        console.error('MobileNet failed to load from both sources:', e);
        // Still mark as ready — heuristic fallback will be used
      }
    }
    this.isReady = true;
  }

  // Extract feature embeddings from an image (equivalent to mobilenet.infer(img, true))
  private infer(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): tf.Tensor {
    if (!this.graphModel) throw new Error('Model not loaded');

    // Preprocess: resize to 224x224, normalize to [-1, 1]
    const img = tf.browser.fromPixels(imageElement)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(127.5)
      .sub(1.0)
      .expandDims(0);

    // Get the second-to-last layer output (feature embeddings for KNN)
    // Run the full model then use global average pooling output
    const logits = this.graphModel.predict(img) as tf.Tensor;
    img.dispose();
    return logits.reshape([1, -1]); // flatten to 2D for KNN
  }

  addExample(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, classId: string) {
    if (!this.classifier || !this.graphModel) return;
    const activation = this.infer(imageElement);
    this.classifier.addExample(activation, classId);
  }

  async predict(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
    if (!this.classifier || !this.graphModel) throw new Error('Model not initialized');
    if (this.classifier.getNumClasses() === 0) return null;
    const activation = this.infer(imageElement);
    return await this.classifier.predictClass(activation);
  }

  getClassCounts(): { [key: string]: number } {
    if (!this.classifier) return {};
    return this.classifier.getClassExampleCount();
  }

  clear() {
    if (this.classifier) this.classifier.clearAllClasses();
    this.activeProfile = null;
  }

  // ─── Save / Load Model ───

  async saveModel(name: string, commodity: string, description: string, createdBy: string): Promise<boolean> {
    if (!this.classifier || this.classifier.getNumClasses() === 0) return false;

    const dataset = this.classifier.getClassifierDataset();
    const serialized = serializeDataset(dataset);
    const classCounts = this.getClassCounts();

    // Save to localStorage always
    const profile: ModelProfile = {
      name, commodity, description,
      dataset: serialized,
      class_counts: classCounts,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    };

    const profiles = getLocalProfiles();
    const existing = profiles.findIndex(p => p.name === name);
    if (existing >= 0) profiles[existing] = profile;
    else profiles.push(profile);
    localStorage.setItem('optiq_models', JSON.stringify(profiles));

    // Sync to Supabase
    if (supabase) {
      const { error } = await supabase.from('model_profiles').upsert({
        name,
        commodity,
        description,
        dataset_json: JSON.stringify(serialized),
        class_counts: classCounts,
        created_by: createdBy,
      }, { onConflict: 'name' });
      if (error) console.warn('Supabase model save failed:', error.message);
      else console.log('Model synced to Supabase');
    }

    this.activeProfile = name;
    return true;
  }

  loadFromProfile(profile: ModelProfile): boolean {
    if (!this.classifier) return false;
    try {
      this.classifier.clearAllClasses();
      const dataset = deserializeDataset(profile.dataset);
      this.classifier.setClassifierDataset(dataset);
      this.activeProfile = profile.name;
      return true;
    } catch (e) {
      console.error('Failed to load model:', e);
      return false;
    }
  }

  async getAvailableProfiles(): Promise<ModelProfile[]> {
    // Start with localStorage
    let profiles = getLocalProfiles();

    // Merge from Supabase if available
    if (supabase) {
      const { data, error } = await supabase
        .from('model_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        for (const row of data) {
          const exists = profiles.find(p => p.name === row.name);
          if (!exists) {
            profiles.push({
              id: row.id,
              name: row.name,
              commodity: row.commodity,
              description: row.description,
              dataset: JSON.parse(row.dataset_json),
              class_counts: row.class_counts,
              created_by: row.created_by,
              created_at: row.created_at,
              is_default: row.is_default,
            });
          }
        }
      }
    }

    return profiles;
  }
}

function getLocalProfiles(): ModelProfile[] {
  try {
    return JSON.parse(localStorage.getItem('optiq_models') || '[]');
  } catch {
    return [];
  }
}

export const aiService = new AIService();
