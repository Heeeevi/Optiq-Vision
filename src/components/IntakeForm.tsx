import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './IntakeForm.css';

export interface BatchMeta {
  supplier: string;
  lotNumber: string;
  commodity: string;
  expectedQty: string;
  startedAt: string;
}

interface IntakeFormProps {
  onStart: (meta: BatchMeta) => void;
}

const COMMODITIES = [
  'Apple', 'Orange', 'Banana', 'Papaya', 'Mango',
  'Strawberry', 'Watermelon', 'Tomato', 'Chili', 'Ginger',
  'Turmeric', 'Other'
];

export default function IntakeForm({ onStart }: IntakeFormProps) {
  const [supplier, setSupplier] = useState('');
  const [lotNumber, setLotNumber] = useState(
    `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  );
  const [commodity, setCommodity] = useState('');
  const [expectedQty, setExpectedQty] = useState('');

  const canSubmit = supplier.trim() && commodity && lotNumber.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onStart({
      supplier: supplier.trim(),
      lotNumber: lotNumber.trim(),
      commodity,
      expectedQty: expectedQty || '-',
      startedAt: new Date().toLocaleString()
    });
  };

  return (
    <div className="intake-page">
      <div className="intake-card glass-panel">
        <div className="intake-header">
          <h1 className="heading-tight">New Intake Batch</h1>
          <p className="text-subtle">Record incoming lot details before starting quality inspection.</p>
        </div>

        <form onSubmit={handleSubmit} className="intake-form">
          <div className="field">
            <label htmlFor="supplier">Supplier</label>
            <input
              id="supplier"
              type="text"
              placeholder="e.g. PT Segar Jaya"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="lot">Lot Number</label>
            <input
              id="lot"
              type="text"
              value={lotNumber}
              onChange={e => setLotNumber(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="commodity">Commodity</label>
            <select
              id="commodity"
              value={commodity}
              onChange={e => setCommodity(e.target.value)}
            >
              <option value="" disabled>Select commodity...</option>
              {COMMODITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="qty">Expected Quantity (kg) <span className="text-subtle">— optional</span></label>
            <input
              id="qty"
              type="number"
              placeholder="e.g. 500"
              value={expectedQty}
              onChange={e => setExpectedQty(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-start" disabled={!canSubmit}>
            Start Inspection
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
