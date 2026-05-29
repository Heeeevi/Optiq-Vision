import React, { useState } from 'react';
import IntakeForm, { type BatchMeta } from './components/IntakeForm';
import CameraQC, { type ScanRecord } from './components/CameraQC';
import ResultDashboard from './components/ResultDashboard';
import DailyStats from './components/DailyStats';
import BatchReport from './components/BatchReport';
import { ClipboardCheck } from 'lucide-react';
import './App.css';

type Phase = 'INTAKE' | 'SCAN' | 'REPORT';

function App() {
  const [phase, setPhase] = useState<Phase>('INTAKE');
  const [batchMeta, setBatchMeta] = useState<BatchMeta | null>(null);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [lastResult, setLastResult] = useState<ScanRecord | null>(null);

  const handleStartBatch = (meta: BatchMeta) => {
    setBatchMeta(meta);
    setRecords([]);
    setLastResult(null);
    setPhase('SCAN');
  };

  const handleResult = (record: ScanRecord) => {
    setLastResult(record);
    setRecords(prev => [record, ...prev]);
  };

  const handleCompleteBatch = () => {
    setPhase('REPORT');
  };

  const handleNewBatch = () => {
    setPhase('INTAKE');
    setBatchMeta(null);
    setRecords([]);
    setLastResult(null);
  };

  // Phase 1: Intake Form
  if (phase === 'INTAKE') {
    return <IntakeForm onStart={handleStartBatch} />;
  }

  // Phase 3: Report
  if (phase === 'REPORT' && batchMeta) {
    return <BatchReport meta={batchMeta} records={records} onNewBatch={handleNewBatch} />;
  }

  // Phase 2: Scan
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">OptiQ Vision</h1>
          {batchMeta && (
            <span className="header-lot text-subtle">
              {batchMeta.lotNumber} · {batchMeta.supplier} · {batchMeta.commodity}
            </span>
          )}
        </div>
        <button className="btn-primary" onClick={handleCompleteBatch} disabled={records.length === 0}>
          <ClipboardCheck size={16} /> Complete Batch
        </button>
      </header>

      <main className="main-col">
        <CameraQC onResult={handleResult} />
      </main>

      <aside className="side-col">
        <ResultDashboard result={lastResult} />
        <DailyStats records={records} />
      </aside>
    </div>
  );
}

export default App;
