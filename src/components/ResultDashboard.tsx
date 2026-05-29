import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import './ResultDashboard.css';

interface ResultProps {
  result: {
    status: string;
    confidence: string;
    reason: string;
    timestamp: string;
  } | null;
}

export default function ResultDashboard({ result }: ResultProps) {
  if (!result) {
    return (
      <div className="result-container empty glass-panel">
        <div className="empty-state">
          <div className="pulse-dot"></div>
          <p className="text-subtle">Awaiting inspection data...</p>
        </div>
      </div>
    );
  }

  const isPass = result.status === 'FRESH';

  return (
    <div className={`result-container glass-panel animate-fade-in ${isPass ? 'status-pass' : 'status-fail'}`}>
      <div className="result-header">
        <h3 className="heading-tight">Inspection Result</h3>
        <span className="timestamp">{result.timestamp}</span>
      </div>
      
      <div className="result-main">
        <div className={`status-badge ${isPass ? 'badge-pass' : 'badge-fail'}`}>
          {isPass ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
          <span className="status-text">{result.status}</span>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Confidence</span>
            <span className="metric-value">{result.confidence}%</span>
          </div>
          <div className="metric-box">
            <span className="metric-label">Analysis</span>
            <span className="metric-value value-small">{result.reason}</span>
          </div>
        </div>
      </div>
      
      {!isPass && (
        <div className="alert-banner">
          <AlertTriangle size={16} />
          <span>Segregate immediately. Lot flagged for manual review.</span>
        </div>
      )}
    </div>
  );
}
