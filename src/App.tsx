import React, { useState } from 'react';
import CameraQC from './components/CameraQC';
import ResultDashboard from './components/ResultDashboard';
import DailyStats from './components/DailyStats';
import HistoryTable from './components/HistoryTable';
import { Hexagon } from 'lucide-react';
import './App.css';

function App() {
  const [lastResult, setLastResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    rejected: 0
  });

  const handleResult = (result: any) => {
    const newRecord = { ...result, id: Math.random().toString(36).substring(2, 9) };
    setLastResult(newRecord);
    setHistory(prev => [newRecord, ...prev].slice(0, 50)); // Keep last 50
    setStats(prev => ({
      total: prev.total + 1,
      passed: result.status === 'FRESH' ? prev.passed + 1 : prev.passed,
      rejected: result.status === 'REJECT' ? prev.rejected + 1 : prev.rejected
    }));
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <Hexagon size={24} color="var(--text-primary)" />
          OptiQ Vision
        </div>
        <div className="header-status">
          <div className="status-dot"></div>
          System Online (Local Mode)
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <CameraQC onResult={handleResult} />
        <HistoryTable items={history} />
      </main>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <ResultDashboard result={lastResult} />
        <DailyStats 
          total={stats.total} 
          passed={stats.passed} 
          rejected={stats.rejected} 
        />
      </aside>
    </div>
  );
}

export default App;
