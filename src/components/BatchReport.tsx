import React from 'react';
import type { GradeKey, ScanRecord } from './CameraQC';
import type { BatchMeta } from './IntakeForm';
import { Download, ArrowLeft } from 'lucide-react';
import './BatchReport.css';

interface BatchReportProps {
  meta: BatchMeta;
  records: ScanRecord[];
  onNewBatch: () => void;
}

export default function BatchReport({ meta, records, onNewBatch }: BatchReportProps) {
  const counts: Record<GradeKey, number> = { A: 0, B: 0, C: 0, REJECT: 0 };
  records.forEach(r => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
  const total = records.length;
  const rejectRate = total > 0 ? ((counts.REJECT / total) * 100).toFixed(1) : '0.0';
  const yieldRate = total > 0 ? (((total - counts.REJECT) / total) * 100).toFixed(1) : '0.0';

  const exportCSV = () => {
    const hdr = 'Lot,Supplier,Commodity,Time,Grade,Confidence,Reason';
    const rows = records.map(r =>
      `${meta.lotNumber},${meta.supplier},${meta.commodity},${r.timestamp},${r.grade},${r.confidence}%,${r.reason}`
    );
    const blob = new Blob([hdr + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `QC_${meta.lotNumber}.csv`;
    a.click();
  };

  return (
    <div className="report-page">
      <div className="report-card glass-panel">
        <div className="report-top">
          <div>
            <h1 className="heading-tight">Batch Report</h1>
            <p className="text-subtle">{meta.lotNumber} · {meta.supplier}</p>
          </div>
          <button className="btn-secondary" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="report-meta">
          <div className="meta-item"><span className="meta-label">Commodity</span><span>{meta.commodity}</span></div>
          <div className="meta-item"><span className="meta-label">Started</span><span>{meta.startedAt}</span></div>
          <div className="meta-item"><span className="meta-label">Total Scanned</span><span>{total}</span></div>
          <div className="meta-item"><span className="meta-label">Expected Qty</span><span>{meta.expectedQty} kg</span></div>
        </div>

        <div className="grade-summary">
          {(['A', 'B', 'C', 'REJECT'] as GradeKey[]).map(g => (
            <div key={g} className={`summary-cell sc-${g.toLowerCase()}`}>
              <span className="sc-count">{counts[g]}</span>
              <span className="sc-label">{g === 'REJECT' ? 'Reject' : `Grade ${g}`}</span>
            </div>
          ))}
        </div>

        <div className="yield-row">
          <div className="yield-item">
            <span className="yield-label">Yield Rate</span>
            <span className="yield-val good">{yieldRate}%</span>
          </div>
          <div className="yield-item">
            <span className="yield-label">Reject Rate</span>
            <span className="yield-val bad">{rejectRate}%</span>
          </div>
        </div>

        {records.length > 0 && (
          <div className="thumb-grid">
            {records.slice(0, 20).map(r => (
              <div key={r.id} className={`thumb-item ti-${r.grade.toLowerCase()}`}>
                {r.snapshot && <img src={r.snapshot} alt="" />}
                <span className="thumb-grade">{r.grade}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary full-width" onClick={onNewBatch}>
          <ArrowLeft size={16} /> Start New Batch
        </button>
      </div>
    </div>
  );
}
