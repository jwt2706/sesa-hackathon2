import React from 'react';
import { Trade } from '../types/trade';
import { prepareCalendarCountData, prepareCalendarPLData } from './heatmapUtils';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(a: string, b: string, t: number) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  const r = Math.round(ra[0] + (rb[0] - ra[0]) * t);
  const g = Math.round(ra[1] + (rb[1] - ra[1]) * t);
  const bl = Math.round(ra[2] + (rb[2] - ra[2]) * t);
  return rgbToHex(r, g, bl);
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readableTextColor(hex: string) {
  return luminance(hex) > 0.55 ? '#000' : '#fff';
}

  const squareSize = 28;
const gap = 8;

const TradeHeatmap = ({ trades }: { trades: Trade[] }) => {
  const days = 365;
  const countData = prepareCalendarCountData(trades, days).values;
  const plData = prepareCalendarPLData(trades, days).values;

  // Diagnostic: unique dates present and sample
  const presentDates = countData.filter(d => d.count > 0).map(d => d.date);
  const uniqueDatesCount = presentDates.length;
  // Log full list for debugging so developer can inspect in console
  console.debug('TradeHeatmap: total trades =', trades.length);
  console.debug('TradeHeatmap: unique active dates count =', uniqueDatesCount);
  console.debug('TradeHeatmap: active dates list =', presentDates);

  const maxCount = Math.max(...countData.map(d => d.count), 1);
  const maxAbsPL = Math.max(...plData.map(d => Math.abs(d.value)), 1);

  // Build date -> index mapping
  const dates = countData.map(d => d.date);
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  // weeks columns
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000)) + 1;
  const weeks = Math.ceil((totalDays + startDate.getDay()) / 7);

  // map date string to data
  const countMap: Record<string, number> = {};
  countData.forEach(d => { countMap[d.date] = d.count; });
  const plMap: Record<string, number> = {};
  plData.forEach(d => { plMap[d.date] = d.value; });

  // Palette
  const darkRed = '#7f1d1d';
  const lightRed = '#fee2e2';
  const lightGreen = '#ecfccb';

  const squareStyleBase: React.CSSProperties = {
    width: squareSize,
    height: squareSize,
    borderRadius: 4,
    boxSizing: 'border-box',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  };

  const renderSquare = (dateStr: string, type: 'count' | 'pl') => {
    const titleDate = dateStr;
    if (type === 'count') {
      const c = countMap[dateStr] || 0;
      const t = Math.min(1, c / maxCount);
      const color = c === 0 ? '#f1f5f9' : mixHex('#fff7f7', '#b91c1c', t * 1.0); // stronger red
      const textColor = readableTextColor(color);
      return (
        <div title={`${titleDate}: ${c} trades`} style={{ ...squareStyleBase, background: color, position: 'relative', color: textColor }}>
          <span>{c}</span>
        </div>
      );
    }
    const v = plMap[dateStr] || 0;
    if (v === 0) {
      const bg = '#f1f5f9';
      return <div title={`${titleDate}: $0`} style={{ ...squareStyleBase, background: bg, color: readableTextColor(bg) }}><span>0</span></div>;
    }
    if (v > 0) {
      const t = Math.min(1, v / maxAbsPL);
      const color = mixHex('#16a34a', '#065f46', Math.pow(t, 0.95)); // stronger greens
      const textColor = readableTextColor(color);
      return (
        <div title={`${titleDate}: +$${v.toFixed(2)}`} style={{ ...squareStyleBase, background: color, position: 'relative', color: textColor }}>
          <span>{`+${Math.round(v)}`}</span>
        </div>
      );
    }
    // negative
    const tneg = Math.min(1, Math.abs(v) / maxAbsPL);
    const color = mixHex('#fecaca', '#b91c1c', Math.pow(tneg, 0.95));
    const textColor = readableTextColor(color);
    return (
      <div title={`${titleDate}: -$${Math.abs(v).toFixed(2)}`} style={{ ...squareStyleBase, background: color, position: 'relative', color: textColor }}>
        <span>{`-${Math.round(Math.abs(v))}`}</span>
      </div>
    );
  };

  // construct weeks array of 7 items each (Sunday=0..Saturday=6)
  const weekCols: string[][] = Array.from({ length: weeks }, () => Array(7).fill(''));
  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dayIdx = cur.getDay();
    const weekIdx = Math.floor((i + startDate.getDay()) / 7);
    const key = cur.toISOString().slice(0, 10);
    weekCols[weekIdx][dayIdx] = key;
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const Legend = ({ type }: { type: 'count' | 'pl' }) => {
    if (type === 'count') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{ color: '#bbb', fontSize: 12 }}>0</div>
          <div style={{ height: 12, flex: 1, borderRadius: 6, background: `linear-gradient(90deg, #fff7f7, ${darkRed})` }} />
          <div style={{ color: '#bbb', fontSize: 12 }}>{maxCount}</div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <div style={{ color: '#bbb', fontSize: 12 }}>−{maxAbsPL.toFixed(0)}</div>
        <div style={{ height: 12, flex: 1, borderRadius: 6, background: `linear-gradient(90deg, ${lightRed}, #fff, ${lightGreen})` }} />
        <div style={{ color: '#bbb', fontSize: 12 }}>+{maxAbsPL.toFixed(0)}</div>
      </div>
    );
  };

  const gridColStyle = { display: 'grid', gridTemplateRows: `repeat(7, ${squareSize}px)`, rowGap: gap, columnGap: gap, marginRight: gap } as React.CSSProperties;

  return (
    <div style={{ backgroundColor: '#071124', borderRadius: 10, padding: 16, color: '#fff' }}>
      <div style={{ marginBottom: 8, color: '#cbd5e1', fontSize: 13 }}>
        <strong style={{ color: '#fff' }}>Data summary:</strong> {trades.length} trades, {uniqueDatesCount} days with activity
        {presentDates.length > 0 ? ` — sample: ${presentDates.slice(0,5).join(', ')}` : ''}
      </div>
      <h3 style={{ marginBottom: 12, fontSize: 16 }}>Trading Activity Heatmap</h3>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(7, ${squareSize}px)`, rowGap: gap, color: '#9ca3af', fontSize: 14 }}>
          {dayLabels.map(d => <div key={d} style={{ height: squareSize, display: 'flex', alignItems: 'center' }}>{d}</div>)}
        </div>
        <div style={{ display: 'flex' }}>
          {weekCols.map((col, ci) => (
            <div key={`c-${ci}`} style={gridColStyle}>
              {col.map((dateStr, ri) => (
                <div key={`${ci}-${ri}`} style={{ position: 'relative' }}>
                  {dateStr ? renderSquare(dateStr, 'count') : <div style={{ width: squareSize, height: squareSize }} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Legend type="count" />

      <h3 style={{ margin: '16px 0 8px', fontSize: 16 }}>Profit &amp; Loss (daily sum)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(7, ${squareSize}px)`, rowGap: gap, color: '#9ca3af', fontSize: 12 }}>
          {dayLabels.map(d => <div key={`p-${d}`} style={{ height: squareSize, display: 'flex', alignItems: 'center' }}>{d}</div>)}
        </div>
        <div style={{ display: 'flex' }}>
          {weekCols.map((col, ci) => (
            <div key={`p-${ci}`} style={gridColStyle}>
              {col.map((dateStr, ri) => (
                <div key={`p-${ci}-${ri}`} style={{ position: 'relative' }}>
                  {dateStr ? renderSquare(dateStr, 'pl') : <div style={{ width: squareSize, height: squareSize }} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Legend type="pl" />
    </div>
  );
};

export default TradeHeatmap;