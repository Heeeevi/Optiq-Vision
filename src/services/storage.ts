import type { GradeKey, ScanRecord } from '../components/CameraQC';
import type { BatchMeta } from '../components/IntakeForm';

export interface StoredBatch {
  id: string;
  meta: BatchMeta;
  records: ScanRecord[];
  completedAt: string;
  counts: Record<GradeKey, number>;
  total: number;
  yieldRate: string;
  rejectRate: string;
}

const BATCH_KEY = 'optiq_batches';

export function saveBatch(meta: BatchMeta, records: ScanRecord[]): StoredBatch {
  const counts: Record<GradeKey, number> = { A: 0, B: 0, C: 0, REJECT: 0 };
  records.forEach(r => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
  const total = records.length;
  const rejects = counts.REJECT;

  const batch: StoredBatch = {
    id: Date.now().toString(36),
    meta,
    records,
    completedAt: new Date().toLocaleString(),
    counts,
    total,
    yieldRate: total > 0 ? (((total - rejects) / total) * 100).toFixed(1) : '0.0',
    rejectRate: total > 0 ? ((rejects / total) * 100).toFixed(1) : '0.0',
  };

  const existing = getAllBatches();
  existing.unshift(batch);
  localStorage.setItem(BATCH_KEY, JSON.stringify(existing));
  return batch;
}

export function getAllBatches(): StoredBatch[] {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || '[]');
  } catch {
    return [];
  }
}

export interface SupplierStats {
  supplier: string;
  totalBatches: number;
  totalScanned: number;
  totalReject: number;
  rejectRate: string;
  avgYield: string;
  lastBatch: string;
}

export function getSupplierStats(): SupplierStats[] {
  const batches = getAllBatches();
  const map = new Map<string, { batches: number; scanned: number; reject: number; lastDate: string }>();

  batches.forEach(b => {
    const key = b.meta.supplier;
    const prev = map.get(key) || { batches: 0, scanned: 0, reject: 0, lastDate: '' };
    prev.batches += 1;
    prev.scanned += b.total;
    prev.reject += b.counts.REJECT;
    if (!prev.lastDate) prev.lastDate = b.completedAt;
    map.set(key, prev);
  });

  return Array.from(map.entries()).map(([supplier, d]) => ({
    supplier,
    totalBatches: d.batches,
    totalScanned: d.scanned,
    totalReject: d.reject,
    rejectRate: d.scanned > 0 ? ((d.reject / d.scanned) * 100).toFixed(1) : '0.0',
    avgYield: d.scanned > 0 ? (((d.scanned - d.reject) / d.scanned) * 100).toFixed(1) : '0.0',
    lastBatch: d.lastDate,
  }));
}
