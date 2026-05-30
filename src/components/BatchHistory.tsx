
import { getAllBatches, type StoredBatch } from '../services/storage';

import './BatchHistory.css';

interface BatchHistoryProps {
  onSelectBatch: (batch: StoredBatch) => void;
  onBack: () => void;
}

export default function BatchHistory({ onSelectBatch, onBack }: BatchHistoryProps) {
  const batches = getAllBatches();

  return (
    <div className="history-page">
      <div className="history-panel glass-panel">
        <div className="history-header">
          <div>
            <h1 className="heading-tight">Batch History</h1>
            <p className="text-subtle">{batches.length} completed batches</p>
          </div>
          <button className="btn-secondary" onClick={onBack}>Back</button>
        </div>

        {batches.length === 0 ? (
          <div className="empty-state">
            <p className="text-subtle">No batches recorded yet.</p>
          </div>
        ) : (
          <div className="batch-table">
            <div className="bt-header">
              <span>Lot</span>
              <span>Supplier</span>
              <span>Commodity</span>
              <span>Scanned</span>
              <span>Yield</span>
              <span>Date</span>
            </div>
            {batches.map(b => (
              <div key={b.id} className="bt-row" onClick={() => onSelectBatch(b)}>
                <span className="bt-lot">{b.meta.lotNumber}</span>
                <span>{b.meta.supplier}</span>
                <span>{b.meta.commodity}</span>
                <span>{b.total}</span>
                <span className={parseFloat(b.yieldRate) >= 90 ? 'yield-good' : 'yield-warn'}>
                  {b.yieldRate}%
                </span>
                <span className="text-subtle">{b.completedAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
