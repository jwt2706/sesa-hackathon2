import { Trade } from '../types/trade';

const STORAGE_KEY = 'sesa_trades_v1';
// Allow storing larger uploads locally. Keep reasonably large cap to avoid
// unbounded localStorage growth; fallback logic will trim if quota exceeded.
const MAX_LOCAL_TRADES = 100000;

export const loadTradesLocal = async (): Promise<Trade[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Trade[];
    return parsed;
  } catch (e) {
    console.error('Error reading local trades:', e);
    return [];
  }
};

export const saveTradesLocal = async (trades: Trade[]) => {
  // Try to persist as many trades as possible up to MAX_LOCAL_TRADES.
  const normalized = trades.slice(0, MAX_LOCAL_TRADES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return;
  } catch (e) {
    console.warn('localStorage quota exceeded when saving trades, attempting to compact...', e);
  }

  // If quota exceeded, try progressively smaller sizes to ensure some data is saved.
  const fallbackSizes = [Math.max(5000, Math.floor(MAX_LOCAL_TRADES / 10)), 2000, 1000, 500, 250, 100];
  for (const size of fallbackSizes) {
    try {
      const compact = normalized.slice(0, size);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
      console.warn(`Saved compacted trades (${compact.length} rows) to localStorage.`);
      return;
    } catch (err) {
      // keep trying smaller sizes
    }
  }

  console.error('Failed to save trades to localStorage after multiple compaction attempts.');
};

export const appendTradesLocal = async (newTrades: Trade[]) => {
  const existing = await loadTradesLocal();
  // Keep newest trades first (as UI expects recent first in many places)
  const merged = [...newTrades, ...existing];
  await saveTradesLocal(merged);
  // Return the in-memory merged array (not truncated) so caller can use full set immediately
  return merged;
};
