import React from 'react';
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import './HistoryTable.css';

interface HistoryItem {
  id: string;
  timestamp: string;
  status: string;
  confidence: string;
  reason: string;
}

interface HistoryProps {
  items: HistoryItem[];
}

export default function HistoryTable({ items }: HistoryProps) {
  const exportToCSV = () => {
    if (items.length === 0) return;
    
    const headers = ['ID,Timestamp,Status,Confidence,Reason'];
    const rows = items.map(item => 
      `${item.id},${item.timestamp},${item.status},${item.confidence}%,${item.reason}`
    );
    
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `QC_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-container glass-panel">
      <div className="history-header">
        <h3 className="heading-tight">Recent Scans</h3>
        <button 
          className="btn-secondary" 
          onClick={exportToCSV}
          disabled={items.length === 0}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-row text-subtle">
                  No scans recorded yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="time-cell">{item.timestamp}</td>
                  <td>
                    <span className={`status-pill ${item.status === 'FRESH' ? 'pill-pass' : 'pill-fail'}`}>
                      {item.status === 'FRESH' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="conf-cell">{item.confidence}%</td>
                  <td className="reason-cell">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
