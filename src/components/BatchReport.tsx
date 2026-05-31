import type { GradeKey, ScanRecord } from './CameraQC';
import type { BatchMeta } from './IntakeForm';
import { Download, ArrowLeft, FileText } from 'lucide-react';
import { useRef } from 'react';
import './BatchReport.css';

interface BatchReportProps {
  meta: BatchMeta;
  records: ScanRecord[];
  onNewBatch: () => void;
}

const GRADE_INFO: Record<GradeKey, { label: string; color: string; criteria: string; action: string }> = {
  A: { label: 'Grade A', color: '#22c55e', criteria: 'Optimal color saturation, no surface defects, correct ripeness window, uniform shape', action: 'Store directly — premium quality for retail or primary production' },
  B: { label: 'Grade B', color: '#3b82f6', criteria: 'Minor cosmetic imperfection, slight color deviation, acceptable size variance', action: 'Standard processing — suitable for bulk or secondary product lines' },
  C: { label: 'Grade C', color: '#eab308', criteria: 'Overripe or softening, multiple minor defects, approaching shelf-life limit', action: 'Process immediately — route to juice, extract, or concentrate production' },
  REJECT: { label: 'Reject', color: '#ef4444', criteria: 'Rot, mold, foreign matter, contamination, or severe physical damage', action: 'Segregate and document — do not use in any production line' },
};

export default function BatchReport({ meta, records, onNewBatch }: BatchReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const counts: Record<GradeKey, number> = { A: 0, B: 0, C: 0, REJECT: 0 };
  const reasonMap: Record<string, number> = {};

  records.forEach(r => {
    counts[r.grade] = (counts[r.grade] || 0) + 1;
    reasonMap[r.reason] = (reasonMap[r.reason] || 0) + 1;
  });

  const total = records.length;
  const rejectRate = total > 0 ? ((counts.REJECT / total) * 100).toFixed(1) : '0.0';
  const yieldRate = total > 0 ? (((total - counts.REJECT) / total) * 100).toFixed(1) : '0.0';

  // Top reasons sorted by frequency
  const topReasons = Object.entries(reasonMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const exportCSV = () => {
    const hdr = 'Lot,Supplier,Commodity,Time,Grade,Confidence,Reason';
    const rows = records.map(r =>
      `${meta.lotNumber},${meta.supplier},${meta.commodity},${r.timestamp},${r.grade},${r.confidence}%,"${r.reason}"`
    );
    const blob = new Blob([hdr + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `QC_${meta.lotNumber}.csv`; a.click();
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`QC_Report_${meta.lotNumber}.pdf`);
  };

  return (
    <div className="report-page">
      <div className="report-card glass-panel" ref={reportRef}>
        <div className="report-top">
          <div>
            <h1 className="heading-tight">QC Batch Report</h1>
            <p className="text-subtle">{meta.lotNumber} · {meta.supplier}</p>
          </div>
          <div className="report-actions">
            <button className="btn-secondary btn-sm" onClick={exportCSV}>
              <Download size={14} /> CSV
            </button>
            <button className="btn-secondary btn-sm" onClick={exportPDF}>
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="report-meta">
          <div className="meta-item"><span className="meta-label">Commodity</span><span>{meta.commodity}</span></div>
          <div className="meta-item"><span className="meta-label">Started</span><span>{meta.startedAt}</span></div>
          <div className="meta-item"><span className="meta-label">Total Scanned</span><span>{total}</span></div>
          <div className="meta-item"><span className="meta-label">Expected Qty</span><span>{meta.expectedQty} kg</span></div>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <div className="kpi-card">
            <span className="kpi-val good">{yieldRate}%</span>
            <span className="kpi-label">Yield Rate</span>
            <span className="kpi-desc">Usable product (A+B+C)</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-val bad">{rejectRate}%</span>
            <span className="kpi-label">Reject Rate</span>
            <span className="kpi-desc">Material loss</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-val">{total > 0 ? ((counts.A / total) * 100).toFixed(0) : 0}%</span>
            <span className="kpi-label">Premium Rate</span>
            <span className="kpi-desc">Grade A proportion</span>
          </div>
        </div>

        {/* Grade Distribution Chart */}
        <div className="chart-section">
          <h3 className="section-title">Grade Distribution</h3>
          <div className="bar-chart-h">
            {(['A', 'B', 'C', 'REJECT'] as GradeKey[]).map(g => {
              const pct = total > 0 ? (counts[g] / total) * 100 : 0;
              return (
                <div key={g} className="bar-h-row">
                  <span className="bar-h-label" style={{ color: GRADE_INFO[g].color }}>
                    {g === 'REJECT' ? 'Rej' : g}
                  </span>
                  <div className="bar-h-track">
                    <div className="bar-h-fill" style={{ width: `${pct}%`, background: GRADE_INFO[g].color }} />
                  </div>
                  <span className="bar-h-val">{counts[g]} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Criteria Table */}
        <div className="chart-section">
          <h3 className="section-title">Grading Criteria & Actions</h3>
          <div className="criteria-list">
            {(['A', 'B', 'C', 'REJECT'] as GradeKey[]).map(g => (
              <div key={g} className="criteria-row">
                <div className="cr-badge" style={{ borderColor: GRADE_INFO[g].color, color: GRADE_INFO[g].color }}>
                  {GRADE_INFO[g].label}
                </div>
                <div className="cr-body">
                  <p className="cr-criteria">{GRADE_INFO[g].criteria}</p>
                  <p className="cr-action text-subtle">{GRADE_INFO[g].action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Reasons */}
        {topReasons.length > 0 && (
          <div className="chart-section">
            <h3 className="section-title">Top Assessment Reasons</h3>
            <div className="reason-list">
              {topReasons.map(([reason, count], i) => (
                <div key={i} className="reason-row">
                  <span className="reason-text">{reason}</span>
                  <span className="reason-count">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Evidence */}
        {records.some(r => r.snapshot) && (
          <div className="chart-section">
            <h3 className="section-title">Photo Evidence</h3>
            <div className="thumb-grid">
              {records.filter(r => r.snapshot).slice(0, 20).map(r => (
                <div key={r.id} className={`thumb-item ti-${r.grade.toLowerCase()}`}>
                  <img src={r.snapshot} alt="" />
                  <span className="thumb-grade">{r.grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="report-bottom-actions">
        <button className="btn-primary" onClick={onNewBatch}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    </div>
  );
}
