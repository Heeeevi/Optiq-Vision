import type { GradeKey, ScanRecord } from '../components/CameraQC';
import type { BatchMeta } from '../components/IntakeForm';
import { supabase } from './supabase';

export interface StoredBatch {
  id: string;
  meta: BatchMeta;
  records: ScanRecord[];
  completedAt: string;
  counts: Record<GradeKey, number>;
  total: number;
  yieldRate: string;
  rejectRate: string;
  operatorName?: string;
  operatorRole?: string;
}

const BATCH_KEY = 'optiq_batches';

// ─── localStorage (always works, offline-first) ───

function getLocalBatches(): StoredBatch[] {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalBatches(batches: StoredBatch[]) {
  localStorage.setItem(BATCH_KEY, JSON.stringify(batches));
}

// ─── Public API ───

export function saveBatch(
  meta: BatchMeta,
  records: ScanRecord[],
  operatorName?: string,
  operatorRole?: string,
): StoredBatch {
  const counts: Record<GradeKey, number> = { A: 0, B: 0, C: 0, REJECT: 0 };
  records.forEach(r => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
  const total = records.length;
  const rejects = counts.REJECT;

  // Strip snapshot images before saving to Supabase (too large for DB)
  const lightRecords = records.map(r => ({ ...r, snapshot: '' }));

  const batch: StoredBatch = {
    id: Date.now().toString(36),
    meta,
    records: lightRecords,
    completedAt: new Date().toISOString(),
    counts,
    total,
    yieldRate: total > 0 ? (((total - rejects) / total) * 100).toFixed(1) : '0.0',
    rejectRate: total > 0 ? ((rejects / total) * 100).toFixed(1) : '0.0',
    operatorName,
    operatorRole,
  };

  // 1) Always save locally (with full snapshots for this session)
  const localBatch = { ...batch, records };
  const existing = getLocalBatches();
  existing.unshift(localBatch);
  saveLocalBatches(existing);

  // 2) Sync to Supabase (fire-and-forget, non-blocking)
  if (supabase) {
    supabase.from('batches').insert({
      batch_id: batch.id,
      supplier: meta.supplier,
      lot_number: meta.lotNumber,
      commodity: meta.commodity,
      expected_qty: meta.expectedQty,
      total_scanned: total,
      grade_a: counts.A,
      grade_b: counts.B,
      grade_c: counts.C,
      grade_reject: counts.REJECT,
      yield_rate: parseFloat(batch.yieldRate),
      reject_rate: parseFloat(batch.rejectRate),
      operator_name: operatorName || 'unknown',
      operator_role: operatorRole || 'operator',
      completed_at: batch.completedAt,
    }).then(({ error }) => {
      if (error) console.warn('Supabase sync failed:', error.message);
      else console.log('Batch synced to Supabase');
    });
  }

  return batch;
}

export function getAllBatches(): StoredBatch[] {
  return getLocalBatches();
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
  const batches = getLocalBatches();
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
