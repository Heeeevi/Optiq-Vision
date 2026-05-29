import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

class AIService {
  private classifier: knnClassifier.KNNClassifier | null = null;
  private mobilenet: mobilenet.MobileNet | null = null;
  public isReady = false;

  async init() {
    // Ensure tfjs is ready
    await tf.ready();
    // Initialize KNN
    this.classifier = knnClassifier.create();
    // Load MobileNet to act as the feature extractor
    this.mobilenet = await mobilenet.load({ version: 2, alpha: 1.0 });
    this.isReady = true;
  }

  addExample(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, classId: string) {
    if (!this.classifier || !this.mobilenet) return;
    // Extract features from the image using MobileNet
    const activation = this.mobilenet.infer(imageElement, true);
    // Add those features to the KNN model
    this.classifier.addExample(activation, classId);
  }

  async predict(imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
    if (!this.classifier || !this.mobilenet) {
      throw new Error("Model not initialized");
    }
    if (this.classifier.getNumClasses() === 0) {
      return null; // Not trained yet
    }
    const activation = this.mobilenet.infer(imageElement, true);
    const result = await this.classifier.predictClass(activation);
    return result;
  }

  getClassCounts() {
    if (!this.classifier) return {};
    return this.classifier.getClassExampleCount();
  }

  clear() {
    if (this.classifier) {
      this.classifier.clearAllClasses();
    }
  }
}

export const aiService = new AIService();
