import { Cell, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Trade } from "../types/trade";

export default function HabitGraph({ data }: { data: Trade[] }) {
  // Helper to color code points
  const getPointColor = (tags: string[] = []) => {
    if (tags.includes('Revenge Trading')) return '#ef4444'; // Red
    if (tags.includes('Overtrading')) return '#a855f7';    // Purple
    if (tags.includes('Poor Stop Loss')) return '#f97316'; // Orange
    return '#22c55e'; // Green (Disciplined)
  };

  // Convert timestamp to unix time for XAxis if needed
  const chartData = data.map(trade => ({
    ...trade,
    unixTime: new Date(trade.timestamp).getTime(),
  }));

  return (
    <div style={{ width: '100%', height: 400, backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ color: '#fff' }}>Bias Detection Timeline</h3>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis 
            dataKey="unixTime" 
            name="Time" 
            tickFormatter={(unixTime: number) => new Date(unixTime).toLocaleTimeString()} 
            stroke="#666"
            type="number"
            domain={['auto', 'auto']}
          />
          <YAxis dataKey="profit_loss" name="P/L" stroke="#666" />
          <ZAxis range={[50, 400]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
            formatter={(
              value: number,
              name: string,
              props: { payload: { biasTags?: string[] } }
            ) => [value, props.payload?.biasTags?.join(', ') || 'Disciplined']}
          />
          <ReferenceLine y={0} stroke="#444" />
          <Scatter name="Trades" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPointColor(entry.biasTags)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', color: '#ccc', fontSize: '12px', marginTop: '10px' }}>
        <span style={{ color: '#ef4444' }}>● Revenge Trading</span>
        <span style={{ color: '#a855f7' }}>● Overtrading</span>
        <span style={{ color: '#f97316' }}>● Poor Stop Loss</span>
        <span style={{ color: '#22c55e' }}>● Disciplined</span>
      </div>
    </div>
  );
}