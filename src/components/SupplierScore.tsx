
import { getSupplierStats } from '../services/storage';
import './SupplierScore.css';

interface SupplierScoreProps {
  onBack: () => void;
}

export default function SupplierScore({ onBack }: SupplierScoreProps) {
  const stats = getSupplierStats();

  return (
    <div className="supplier-page">
      <div className="supplier-panel glass-panel">
        <div className="supplier-header">
          <div>
            <h1 className="heading-tight">Supplier Scorecard</h1>
            <p className="text-subtle">{stats.length} suppliers tracked</p>
          </div>
          <button className="btn-secondary" onClick={onBack}>Back</button>
        </div>

        {stats.length === 0 ? (
          <div className="empty-state">
            <p className="text-subtle">Complete at least one batch to see supplier metrics.</p>
          </div>
        ) : (
          <div className="supplier-grid">
            {stats.map(s => (
              <div key={s.supplier} className="supplier-card glass-panel">
                <div className="sc-top">
                  <span className="sc-name">{s.supplier}</span>
                  <span className={`sc-badge ${parseFloat(s.rejectRate) > 10 ? 'bad' : parseFloat(s.rejectRate) > 5 ? 'warn' : 'good'}`}>
                    {parseFloat(s.rejectRate) > 10 ? 'High Risk' : parseFloat(s.rejectRate) > 5 ? 'Monitor' : 'Good'}
                  </span>
                </div>
                <div className="sc-metrics">
                  <div className="sc-metric">
                    <span className="sc-val">{s.totalBatches}</span>
                    <span className="sc-label">Batches</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-val">{s.totalScanned}</span>
                    <span className="sc-label">Scanned</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-val reject">{s.totalReject}</span>
                    <span className="sc-label">Rejected</span>
                  </div>
                  <div className="sc-metric">
                    <span className={`sc-val ${parseFloat(s.rejectRate) > 10 ? 'reject' : ''}`}>{s.rejectRate}%</span>
                    <span className="sc-label">Reject Rate</span>
                  </div>
                </div>
                <div className="sc-yield-bar">
                  <div className="yield-track">
                    <div className="yield-fill" style={{ width: `${s.avgYield}%` }} />
                  </div>
                  <span className="sc-yield-text">{s.avgYield}% yield</span>
                </div>
                <span className="sc-date text-subtle">Last batch: {s.lastBatch}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
