import React from 'react';
import { Trade } from '../../types/trade';
import { preparePLHeatmapData } from '../../trade_analysis/aggregations';

const ramp = ['#0f172a', '#0f766e', '#16a34a', '#a3e635', '#facc15', '#f97316', '#ef4444'];

const colorFor = (v: number) => {
  if (v === 0) return ramp[0];
  const idx = Math.min(ramp.length - 1, Math.floor(Math.abs(v) / 50) + 1);
  return v > 0 ? ramp[idx] : ramp[ramp.length - 1];
};

const PLByMonthHeatmap = ({ trades }: { trades: Trade[] }) => {
  const { data, keys } = preparePLHeatmapData(trades);

  return (
    <div style={{ background: '#071025', padding: 12, borderRadius: 8 }}>
      <h3 className="text-white font-bold mb-2">P/L by Month & Day</h3>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${keys.length}, 80px)`, gap: 6 }}>
          <div />
          {keys.map(k => (
            <div key={`k-${k}`} style={{ color: '#bbb', fontSize: 12, textAlign: 'center' }}>{k}</div>
          ))}

          {data.map((row) => (
            <React.Fragment key={row.day}>
              <div style={{ color: '#fff' }}>{row.day}</div>
              {keys.map(k => {
                const v = (row as any)[k] || 0;
                return (
                  <div key={`${row.day}-${k}`} title={`${row.day} ${k}: ${v.toFixed(2)}`} style={{ width: 80, height: 24, background: colorFor(v), borderRadius: 4 }} />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PLByMonthHeatmap;
