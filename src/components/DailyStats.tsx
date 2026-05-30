
import type { GradeKey, ScanRecord } from './CameraQC';
import './DailyStats.css';

interface StatsProps {
  records: ScanRecord[];
}

export default function DailyStats({ records }: StatsProps) {
  const total = records.length;
  const counts: Record<GradeKey, number> = { A: 0, B: 0, C: 0, REJECT: 0 };
  records.forEach(r => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
  const passRate = total > 0 ? Math.round(((total - counts.REJECT) / total) * 100) : 0;

  const bars: { key: GradeKey; label: string; cls: string }[] = [
    { key: 'A', label: 'A', cls: 'bar-a' },
    { key: 'B', label: 'B', cls: 'bar-b' },
    { key: 'C', label: 'C', cls: 'bar-c' },
    { key: 'REJECT', label: 'Rej', cls: 'bar-reject' },
  ];

  return (
    <div className="stats-container glass-panel">
      <h3 className="heading-tight">Session</h3>

      <div className="stat-big">
        <span className="stat-num">{total}</span>
        <span className="text-subtle">scanned</span>
      </div>

      <div className="bar-chart">
        {bars.map(b => {
          const pct = total > 0 ? (counts[b.key] / total) * 100 : 0;
          return (
            <div key={b.key} className="bar-row">
              <span className="bar-label">{b.label}</span>
              <div className="bar-track">
                <div className={`bar-fill ${b.cls}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="bar-count">{counts[b.key]}</span>
            </div>
          );
        })}
      </div>

      <div className="yield-line">
        <span className="text-subtle">Yield</span>
        <span className="yield-pct">{passRate}%</span>
      </div>
    </div>
  );
}
