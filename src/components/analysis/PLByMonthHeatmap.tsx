import React from 'react';
import { Trade } from '../../types/trade';
import { preparePLHeatmapData } from '../../trade_analysis/aggregations';

const ramp = ['#0f172a', '#065f46', '#16a34a', '#a3e635', '#facc15', '#f97316', '#b91c1c'];

function hexToRgbLocal(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function luminanceLocal(hex: string) {
  const [r, g, b] = hexToRgbLocal(hex).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const colorFor = (v: number) => {
  if (v === 0) return '#f1f5f9';
  const idx = Math.min(ramp.length - 1, Math.floor(Math.abs(v) / 100) + 1);
  return v > 0 ? ramp[Math.max(1, idx)] : ramp[ramp.length - 1];
};

const PLByMonthHeatmap = ({ trades }: { trades: Trade[] }) => {
  const { data, keys } = preparePLHeatmapData(trades);

  return (
    <div style={{ background: '#071025', padding: 14, borderRadius: 10 }}>
      <h3 className="text-black font-bold mb-2">P/L by Month & Day</h3>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${keys.length}, 128px)`, gap: 10 }}>
          <div />
          {keys.map(k => (
            <div key={`k-${k}`} style={{ color: '#bbb', fontSize: 14, textAlign: 'center', padding: '6px 4px' }}>{k}</div>
          ))}

          {data.map((row) => (
            <React.Fragment key={row.day}>
              <div style={{ color: '#fff', fontSize: 14, paddingTop: 8 }}>{row.day}</div>
              {keys.map(k => {
                const v = (row as any)[k] || 0;
                const bg = colorFor(v);
                const txt = luminanceLocal(bg) > 0.55 ? '#000' : '#fff';
                return (
                  <div key={`${row.day}-${k}`} title={`${row.day} ${k}: ${v.toFixed(2)}`} style={{ width: 128, height: 44, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: txt }}>
                    <span style={{ fontSize: 16, lineHeight: '1' }}>{v.toFixed(0)}</span>
                  </div>
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
