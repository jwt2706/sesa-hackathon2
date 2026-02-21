import { Trade } from '../../types/trade';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TradeHistoryGraphProps {
  trades: Trade[];
}

export default function TradeHistoryGraph({ trades }: TradeHistoryGraphProps) {
  if (!trades || trades.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white/20 rounded-lg border-2 border-gray-300">
        <p className="text-gray-700 font-medium">No trades to display history</p>
      </div>
    );
  }

  // Sort trades by timestamp and calculate cumulative P/L
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let cumulativePL = 0;
  const data = sortedTrades.map((trade, index) => {
    cumulativePL += trade.profit_loss;
    const tradeDate = new Date(trade.timestamp);
    return {
      index: index + 1,
      timestamp: trade.timestamp,
      date: tradeDate.toLocaleDateString(),
      time: tradeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cumulativePL: Math.round(cumulativePL * 100) / 100,
      tradePL: Math.round(trade.profit_loss * 100) / 100,
      asset: trade.asset,
    };
  });

  const minPL = Math.min(...data.map(d => d.cumulativePL));
  const maxPL = Math.max(...data.map(d => d.cumulativePL));
  const avgPL = cumulativePL / data.length;

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
          <p className={`text-2xl font-bold ${minPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${minPL.toFixed(2)}
          </p>
          <p className="text-xs text-gray-700 font-medium mt-1">Lowest Point</p>
        </div>
        <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
          <p className={`text-2xl font-bold ${avgPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${avgPL.toFixed(2)}
          </p>
          <p className="text-xs text-gray-700 font-medium mt-1">Avg Per Trade</p>
        </div>
        <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
          <p className={`text-2xl font-bold ${maxPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${maxPL.toFixed(2)}
          </p>
          <p className="text-xs text-gray-700 font-medium mt-1">Peak P/L</p>
        </div>
      </div>

      <div className="bg-white/20 rounded-lg border-2 border-gray-300 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="index"
              stroke="rgba(0,0,0,0.5)"
              tick={{ fontSize: 12 }}
              label={{ value: 'Trade Number', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              stroke="rgba(0,0,0,0.5)"
              tick={{ fontSize: 12 }}
              label={{ value: 'Cumulative P/L ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '2px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
              }}
              formatter={(value: any) => `$${value.toFixed(2)}`}
              labelFormatter={(label: any) => {
                const trade = data[label - 1];
                return trade ? `Trade #${label}: ${trade.asset}` : '';
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cumulativePL"
              stroke={cumulativePL >= 0 ? '#16a34a' : '#dc2626'}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name="Cumulative P/L"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
