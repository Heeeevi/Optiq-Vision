import React from 'react';
import { Activity, PackageCheck, PackageX } from 'lucide-react';
import './DailyStats.css';

interface StatsProps {
  total: number;
  passed: number;
  rejected: number;
}

export default function DailyStats({ total, passed, rejected }: StatsProps) {
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <div className="stats-container glass-panel">
      <div className="stats-header">
        <h3 className="heading-tight">Session Metrics</h3>
        <Activity size={16} className="text-subtle" />
      </div>
      
      <div className="stats-main">
        <div className="stat-large">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Scanned</span>
        </div>
        
        <div className="stats-divider"></div>
        
        <div className="stats-row">
          <div className="stat-item pass">
            <PackageCheck size={16} />
            <div className="stat-details">
              <span className="stat-num">{passed}</span>
              <span className="stat-label">Passed</span>
            </div>
          </div>
          
          <div className="stat-item fail">
            <PackageX size={16} />
            <div className="stat-details">
              <span className="stat-num">{rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-label">Yield Rate</span>
            <span className="progress-value">{passRate}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${passRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
