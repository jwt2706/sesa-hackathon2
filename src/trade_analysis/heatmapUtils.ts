import { Trade } from '../types/trade';

function getDayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

function getHourFromTimestamp(timestamp: unknown): number {
  if (typeof timestamp !== 'string' || !timestamp.trim()) return 0;
  const parsed = new Date(timestamp);
  if (!Number.isNaN(parsed.getTime())) return parsed.getHours();
  const timePart = timestamp.includes('T') ? timestamp.split('T')[1] : timestamp.split(' ')[1];
  if (!timePart) return 0;
  const hour = parseInt(timePart.split(':')[0], 10);
  return Number.isFinite(hour) ? hour : 0;
}

export function prepareHeatmapData(trades: Trade[]) {
  // Add day and hour to each trade
  const enriched = trades.map((t) => {
    const timestamp = typeof t.timestamp === 'string' && t.timestamp ? t.timestamp : new Date().toISOString();
    const parsed = new Date(timestamp);
    const dayDate = !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : timestamp;
    const hour = getHourFromTimestamp(timestamp);
    return {
      ...t,
      day: getDayOfWeek(dayDate),
      hour,
    };
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map(day => {
    const obj: any = { id: day };
    for (let hour = 0; hour < 24; hour++) {
      obj[hour] = enriched.filter(t => t.day === day && t.hour === hour).length;
    }
    return obj;
  });
}