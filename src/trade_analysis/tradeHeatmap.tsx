import React from 'react';
import { Trade } from '../types/trade';
import { prepareHeatmapData } from './heatmapUtils';

const colors = ['#0f766e', '#16a34a', '#65a30d', '#f59e0b', '#fb923c', '#ef4444'];

const getColorForCount = (count: number) => {
  if (count === 0) return '#111827';
  if (count < 2) return colors[0];
  if (count < 4) return colors[1];
  if (count < 8) return colors[2];
  if (count < 12) return colors[3];
  return colors[5];
};

const TradeHeatmap = ({ trades }: { trades: Trade[] }) => {
  const data = prepareHeatmapData(trades);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ backgroundColor: '#0b1220', borderRadius: 8, padding: 12 }}>
      <h3 style={{ color: '#fff', marginBottom: 8 }}>Overtrading "Hot Zones"</h3>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${hours.length}, 32px)`, gap: 6, alignItems: 'center' }}>
          <div />
          {hours.map(h => (
            <div key={`h-${h}`} style={{ color: '#bbb', fontSize: 12, textAlign: 'center' }}>{h}</div>
          ))}

          {data.map((dayRow) => (
            <React.Fragment key={dayRow.id}>
              <div style={{ color: '#fff', paddingRight: 8 }}>{dayRow.id}</div>
              {hours.map(h => {
                const count = (dayRow as Record<string, number>)[String(h)] || 0;
                return (
                  <div key={`${dayRow.id}-${h}`} title={`${dayRow.id} ${h}:00 — ${count} trades`} style={{ width: 32, height: 24, background: getColorForCount(count), borderRadius: 4 }} />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradeHeatmap;