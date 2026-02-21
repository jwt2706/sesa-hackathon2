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

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseTimestampFlexible(raw?: string) {
  if (!raw) return null;
  // Try direct parse
  let d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  // Try replacing space between date and time with 'T'
  const replaced = raw.replace(' ', 'T');
  d = new Date(replaced);
  if (!Number.isNaN(d.getTime())) return d;
  // Try trimming and removing fractional seconds / stray chars
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  d = new Date(cleaned.replace(' ', 'T'));
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

export function prepareCalendarCountData(trades: Trade[], days = 365) {
  const counts: Record<string, number> = {};
  trades.forEach((t) => {
    const tsRaw = typeof t.timestamp === 'string' && t.timestamp ? t.timestamp : '';
    const d = parseTimestampFlexible(tsRaw) || new Date();
    const key = toISODate(d);
    counts[key] = (counts[key] || 0) + 1;
  });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const values: { date: string; count: number }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toISODate(new Date(d));
    values.push({ date: key, count: counts[key] || 0 });
  }

  return { values, start: toISODate(start), end: toISODate(end) };
}

export function prepareCalendarPLData(trades: Trade[], days = 365) {
  const sums: Record<string, number> = {};
  trades.forEach((t) => {
    const tsRaw = typeof t.timestamp === 'string' && t.timestamp ? t.timestamp : '';
    const d = parseTimestampFlexible(tsRaw);
    if (!d) return;
    const key = toISODate(d);
    // Accept several possible field names for PL
    const pl = typeof (t as any).profit_loss === 'number' ? (t as any).profit_loss : Number((t as any).pl ?? (t as any).profit_loss) || 0;
    sums[key] = (sums[key] || 0) + pl;
  });

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const values: { date: string; value: number }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = toISODate(new Date(d));
    values.push({ date: key, value: sums[key] || 0 });
  }

  return { values, start: toISODate(start), end: toISODate(end) };
}