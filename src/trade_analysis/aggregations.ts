import { Trade } from '../types/trade';

export const enrichTrades = (trades: Trade[]): Trade[] => {
  return trades.map((t) => {
    const dateObj = t.dateObj ? new Date(t.dateObj) : new Date(t.timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = dateObj.getDate();
    const monthKey = `${year}-${month}`;
    const day = `${year}-${month}-${String(dayOfMonth).padStart(2, '0')}`;

    return {
      ...t,
      dateObj,
      monthKey,
      dayOfMonth,
      day,
    } as Trade;
  });
};

// Prepare data for a month x day heatmap (months as keys, day-of-month as index)
export const preparePLHeatmapData = (trades: Trade[]) => {
  const enriched = enrichTrades(trades);

  // get unique months sorted
  const monthsSet = new Set<string>();
  enriched.forEach((t) => monthsSet.add(t.monthKey || ''));
  const months = Array.from(monthsSet).filter(Boolean).sort();

  // build map day -> month -> sum
  const dayMap: Record<string, Record<string, number>> = {};

  enriched.forEach((t) => {
    const day = String(t.dayOfMonth || 0);
    const month = t.monthKey || '';
    if (!dayMap[day]) dayMap[day] = {};
    dayMap[day][month] = (dayMap[day][month] || 0) + (t.profit_loss || 0);
  });

  // build data array for @nivo/heatmap: each item has { day: '1', '2025-03': value, ... }
  const data = Object.keys(dayMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((day) => {
      const row: Record<string, any> = { day };
      months.forEach((m) => (row[m] = dayMap[day][m] || 0));
      return row;
    });

  return { data, keys: months };
};

export type DayStats = {
  day: number;
  totalPL: number;
  avgPL: number;
  count: number;
};

export const computeDayOfMonthStats = (trades: Trade[]): DayStats[] => {
  const enriched = enrichTrades(trades);
  const statsMap: Record<number, { total: number; count: number }> = {};

  enriched.forEach((t) => {
    const d = t.dayOfMonth || 0;
    if (!statsMap[d]) statsMap[d] = { total: 0, count: 0 };
    statsMap[d].total += t.profit_loss || 0;
    statsMap[d].count += 1;
  });

  return Object.keys(statsMap)
    .map((k) => {
      const day = Number(k);
      const { total, count } = statsMap[day];
      return {
        day,
        totalPL: total,
        avgPL: total / count,
        count,
      } as DayStats;
    })
    .sort((a, b) => b.totalPL - a.totalPL);
};
