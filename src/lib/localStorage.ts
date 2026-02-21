import { Trade } from '../types/trade';

const STORAGE_KEY = 'sesa_trades_v1';
const MAX_LOCAL_TRADES = 2000;

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
  const normalized = trades.slice(0, MAX_LOCAL_TRADES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      try {
        const compact = normalized.slice(0, Math.max(250, Math.floor(MAX_LOCAL_TRADES / 2)));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
        return;
      } catch (retryError) {
        console.error('Error saving compacted local trades:', retryError);
      }
    }
    console.error('Error saving local trades:', e);
  }
};

export const appendTradesLocal = async (newTrades: Trade[]) => {
  const existing = await loadTradesLocal();
  const merged = [...newTrades, ...existing].slice(0, MAX_LOCAL_TRADES);
  await saveTradesLocal(merged);
  return merged;
};
