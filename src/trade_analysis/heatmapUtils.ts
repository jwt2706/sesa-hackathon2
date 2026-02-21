import { Trade } from '../types/trade';

function getDayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

export function prepareHeatmapData(trades: Trade[]) {
  // Add day and hour to each trade
  const enriched = trades.map(t => {
    const [date, time] = t.timestamp.split(' ');
    const hour = parseInt(time.split(':')[0], 10);
    return {
      ...t,
      day: getDayOfWeek(date),
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