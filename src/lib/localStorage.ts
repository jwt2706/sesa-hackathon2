import { Trade } from '../types/trade';

const STORAGE_KEY = 'sesa_trades_v1';

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Error saving local trades:', e);
  }
};

export const appendTradesLocal = async (newTrades: Trade[]) => {
  const existing = await loadTradesLocal();
  const merged = [...newTrades, ...existing];
  await saveTradesLocal(merged);
  return merged;
};
