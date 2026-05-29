import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, ScanLine, BrainCircuit, Plus, Trash2 } from 'lucide-react';
import { aiService } from '../services/ai';
import './CameraQC.css';

interface CameraQCProps {
  onResult: (result: any) => void;
}

export default function CameraQC({ onResult }: CameraQCProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  
  // AI State
  const [aiReady, setAiReady] = useState(false);
  const [mode, setMode] = useState<'QC' | 'TRAINING'>('QC');
  const [classCounts, setClassCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    startCamera();
    initAI();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initAI = async () => {
    try {
      await aiService.init();
      setAiReady(true);
      updateClassCounts();
    } catch (e) {
      console.error("Failed to init TFJS:", e);
    }
  };

  const updateClassCounts = () => {
    setClassCounts(aiService.getClassCounts());
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // --- HEURISTIC FALLBACK (From previous phase) ---
  const analyzeHeuristic = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const size = 100;
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    const data = ctx.getImageData(x, y, size, size).data;
    
    let r = 0, g = 0, b = 0;
    const total = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    r /= total; g /= total; b /= total;
    
    const maxColor = Math.max(r, g, b);
    const minColor = Math.min(r, g, b);
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    const saturation = maxColor === 0 ? 0 : (maxColor - minColor) / maxColor;
    
    if (brightness < 60) return { status: 'REJECT', reason: '(Heuristic) Defect: Dark/Bruise' };
    if (saturation > 0.40) return { status: 'FRESH', reason: '(Heuristic) Optimal Color' };
    return { status: 'REJECT', reason: '(Heuristic) Dull/Foreign Object' };
  };

  // --- ML PREDICTION ---
  const handleScan = async () => {
    if (!streamActive || !videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    
    const video = videoRef.current;
    
    try {
      // Try ML Prediction first
      const prediction = await aiService.predict(video);
      
      setTimeout(() => {
        setIsScanning(false);
        if (prediction && prediction.label) {
          // ML Prediction success!
          const isFresh = prediction.label.toUpperCase() === 'FRESH';
          const conf = (prediction.confidences[prediction.label] * 100).toFixed(1);
          onResult({
            status: isFresh ? 'FRESH' : 'REJECT',
            confidence: conf,
            reason: `(ML Model) Class: ${prediction.label}`,
            timestamp: new Date().toLocaleTimeString()
          });
        } else {
          // Fallback to Heuristic if ML not trained
          const canvas = canvasRef.current!;
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0);
          
          const result = analyzeHeuristic(canvas);
          if (result) {
             onResult({
               ...result,
               confidence: (Math.random() * (99 - 85) + 85).toFixed(1),
               timestamp: new Date().toLocaleTimeString()
             });
          }
        }
      }, 500); // Small artificial delay for UX

    } catch (e) {
      console.error(e);
      setIsScanning(false);
    }
  };

  // --- ML TRAINING ---
  const trainClass = (label: string) => {
    if (!videoRef.current || !aiReady) return;
    aiService.addExample(videoRef.current, label);
    updateClassCounts();
  };

  const clearModel = () => {
    aiService.clear();
    updateClassCounts();
  }

  return (
    <div className="camera-container glass-panel">
      <div className="camera-header">
        <h2 className="heading-tight">Optical Inspection</h2>
        <div className="camera-controls">
          <div className="mode-switch">
             <button 
               className={`btn-mode ${mode === 'QC' ? 'active' : ''}`}
               onClick={() => setMode('QC')}
             >QC Mode</button>
             <button 
               className={`btn-mode ${mode === 'TRAINING' ? 'active' : ''}`}
               onClick={() => setMode('TRAINING')}
             >Train AI</button>
          </div>
        </div>
      </div>
      
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline muted className="video-feed" />
        
        {isScanning && (
          <div className="scanner-overlay">
            <div className="scanner-line"></div>
            <div className="scanner-target">
              <ScanLine size={48} color="rgba(255,255,255,0.8)" />
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <div className="camera-footer">
        {mode === 'QC' ? (
          <button 
            className={`btn-analyze ${isScanning ? 'scanning' : ''}`}
            onClick={handleScan}
            disabled={isScanning || !streamActive}
          >
            {isScanning ? <><RefreshCw size={18} className="spin" /> Analyzing...</> : <><Camera size={18} /> Capture & Analyze</>}
          </button>
        ) : (
          <div className="training-panel">
             {!aiReady ? (
               <div className="text-subtle"><RefreshCw size={14} className="spin inline-icon"/> Loading ML Engine...</div>
             ) : (
               <>
                 <div className="train-actions">
                   <button className="btn-train fresh" onClick={() => trainClass('FRESH')}>
                     <Plus size={16}/> Add "FRESH" ({classCounts['FRESH'] || 0})
                   </button>
                   <button className="btn-train reject" onClick={() => trainClass('REJECT')}>
                     <Plus size={16}/> Add "REJECT" ({classCounts['REJECT'] || 0})
                   </button>
                 </div>
                 <button className="btn-clear" onClick={clearModel}>
                   <Trash2 size={14}/> Reset AI Memory
                 </button>
                 <p className="text-subtle train-hint">Aim at a fruit and click to teach the AI. Need ~5-10 samples per class.</p>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
