import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Circle } from 'lucide-react';
import type { GradeKey, ScanRecord } from './CameraQC';
import './ResultDashboard.css';

interface ResultProps {
  result: ScanRecord | null;
}

const GRADE_ICON: Record<GradeKey, React.ReactNode> = {
  A: <CheckCircle2 size={28} />,
  B: <Circle size={28} />,
  C: <AlertTriangle size={28} />,
  REJECT: <XCircle size={28} />,
};

const GRADE_CLASS: Record<GradeKey, string> = {
  A: 'grade-a', B: 'grade-b', C: 'grade-c', REJECT: 'grade-reject',
};

export default function ResultDashboard({ result }: ResultProps) {
  if (!result) {
    return (
      <div className="result-container empty glass-panel">
        <p className="text-subtle">Awaiting inspection...</p>
      </div>
    );
  }

  return (
    <div className={`result-container glass-panel animate-fade-in`}>
      <div className="result-header">
        <h3 className="heading-tight">Last Inspection</h3>
        <span className="timestamp">{result.timestamp}</span>
      </div>

      <div className={`grade-badge ${GRADE_CLASS[result.grade]}`}>
        {GRADE_ICON[result.grade]}
        <span className="grade-text">{result.grade === 'REJECT' ? 'REJECT' : `Grade ${result.grade}`}</span>
      </div>

      <div className="result-row">
        <div className="result-cell">
          <span className="cell-label">Confidence</span>
          <span className="cell-value">{result.confidence}%</span>
        </div>
        <div className="result-cell">
          <span className="cell-label">Analysis</span>
          <span className="cell-value small">{result.reason}</span>
        </div>
      </div>

      {result.snapshot && (
        <img src={result.snapshot} alt="scan thumbnail" className="result-thumb" />
      )}
    </div>
  );
}
