import { useState } from 'react';
import LoginScreen, { type UserSession } from './components/LoginScreen';
import IntakeForm, { type BatchMeta } from './components/IntakeForm';
import CameraQC, { type ScanRecord } from './components/CameraQC';
import ResultDashboard from './components/ResultDashboard';
import DailyStats from './components/DailyStats';
import BatchReport from './components/BatchReport';
import BatchHistory from './components/BatchHistory';
import SupplierScore from './components/SupplierScore';
import { saveBatch, type StoredBatch } from './services/storage';
import { ClipboardCheck, BarChart3, History, LogOut } from 'lucide-react';
import './App.css';

type Phase = 'LOGIN' | 'DASHBOARD' | 'INTAKE' | 'SCAN' | 'REPORT' | 'HISTORY' | 'SUPPLIERS' | 'VIEW_BATCH';

function App() {
  const [phase, setPhase] = useState<Phase>('LOGIN');
  const [session, setSession] = useState<UserSession | null>(null);
  const [batchMeta, setBatchMeta] = useState<BatchMeta | null>(null);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [lastResult, setLastResult] = useState<ScanRecord | null>(null);
  const [viewBatch, setViewBatch] = useState<StoredBatch | null>(null);

  const handleLogin = (s: UserSession) => {
    setSession(s);
    setPhase(s.role === 'admin' ? 'DASHBOARD' : 'INTAKE');
  };

  const handleLogout = () => {
    setSession(null);
    setPhase('LOGIN');
  };

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
    if (batchMeta) {
      saveBatch(batchMeta, records, session?.name, session?.role);
    }
    setPhase('REPORT');
  };

  const handleNewBatch = () => {
    setPhase(session?.role === 'admin' ? 'DASHBOARD' : 'INTAKE');
    setBatchMeta(null);
    setRecords([]);
    setLastResult(null);
  };

  // LOGIN
  if (phase === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ADMIN DASHBOARD
  if (phase === 'DASHBOARD') {
    return (
      <div className="dash-page">
        <div className="dash-panel glass-panel">
          <div className="dash-header">
            <div>
              <h1 className="heading-tight">OptiQ Vision</h1>
              <p className="text-subtle">Welcome, {session?.name} ({session?.role})</p>
            </div>
            <button className="btn-secondary" onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="dash-grid">
            <button className="dash-card glass-panel" onClick={() => setPhase('INTAKE')}>
              <ClipboardCheck size={24} />
              <span className="dc-title">New Inspection</span>
              <span className="dc-desc">Start a new batch intake and QC session</span>
            </button>
            <button className="dash-card glass-panel" onClick={() => setPhase('HISTORY')}>
              <History size={24} />
              <span className="dc-title">Batch History</span>
              <span className="dc-desc">View all past inspection batches</span>
            </button>
            <button className="dash-card glass-panel" onClick={() => setPhase('SUPPLIERS')}>
              <BarChart3 size={24} />
              <span className="dc-title">Supplier Scorecard</span>
              <span className="dc-desc">Reject rates and supplier performance</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HISTORY
  if (phase === 'HISTORY') {
    return (
      <BatchHistory
        onSelectBatch={(b) => { setViewBatch(b); setPhase('VIEW_BATCH'); }}
        onBack={() => setPhase(session?.role === 'admin' ? 'DASHBOARD' : 'INTAKE')}
      />
    );
  }

  // VIEW SINGLE PAST BATCH
  if (phase === 'VIEW_BATCH' && viewBatch) {
    return (
      <BatchReport
        meta={viewBatch.meta}
        records={viewBatch.records}
        onNewBatch={() => setPhase('HISTORY')}
      />
    );
  }

  // SUPPLIERS
  if (phase === 'SUPPLIERS') {
    return (
      <SupplierScore
        onBack={() => setPhase(session?.role === 'admin' ? 'DASHBOARD' : 'INTAKE')}
      />
    );
  }

  // INTAKE FORM
  if (phase === 'INTAKE') {
    return <IntakeForm onStart={handleStartBatch} />;
  }

  // BATCH REPORT (after completing a scan session)
  if (phase === 'REPORT' && batchMeta) {
    return <BatchReport meta={batchMeta} records={records} onNewBatch={handleNewBatch} />;
  }

  // SCAN PHASE
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
        <div className="header-actions">
          {session?.role === 'admin' && (
            <button className="btn-secondary" onClick={() => setPhase('DASHBOARD')}>
              Dashboard
            </button>
          )}
          <button className="btn-primary" onClick={handleCompleteBatch} disabled={records.length === 0}>
            <ClipboardCheck size={16} /> Complete Batch
          </button>
        </div>
      </header>

      <main className="main-col">
        <CameraQC onResult={handleResult} operatorName={session?.name} />
      </main>

      <aside className="side-col">
        <ResultDashboard result={lastResult} />
        <DailyStats records={records} />
      </aside>
    </div>
  );
}

export default App;
