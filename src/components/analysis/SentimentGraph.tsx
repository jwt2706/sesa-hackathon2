import { Trade } from '../../types/trade';
import { FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

interface SentimentGraphProps {
  trades: Trade[];
}

export default function SentimentGraph({ trades }: SentimentGraphProps) {
  if (!trades || trades.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-6 shadow-xl flex items-center justify-center">
        <p className="text-gray-700 font-medium">No trades to analyze sentiment</p>
      </div>
    );
  }

  // Calculate sentiment metrics
  const winningTrades = trades.filter(t => t.profit_loss > 0).length;
  const winRate = winningTrades / trades.length;
  const totalPL = trades.reduce((sum, t) => sum + t.profit_loss, 0);
  
  // Determine sentiment based on metrics
  let sentiment: 'positive' | 'neutral' | 'negative';
  let sentimentScore: number;
  let Icon;
  let color: string;
  let bgGradient: string;
  
  if (winRate >= 0.6 && totalPL > 0) {
    sentiment = 'positive';
    sentimentScore = Math.min(100, Math.round(winRate * 100));
    Icon = FaSmile;
    color = 'text-green-600';
    bgGradient = 'from-green-500 to-emerald-500';
  } else if (winRate >= 0.4 && winRate < 0.6) {
    sentiment = 'neutral';
    sentimentScore = 50;
    Icon = FaMeh;
    color = 'text-yellow-600';
    bgGradient = 'from-yellow-500 to-orange-500';
  } else {
    sentiment = 'negative';
    sentimentScore = Math.max(0, Math.round((1 - winRate) * 100));
    Icon = FaFrown;
    color = 'text-red-600';
    bgGradient = 'from-red-500 to-rose-500';
  }

  // Get recent trend (last 5 trades or fewer)
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Trading Sentiment</h3>
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Large Sentiment Icon */}
        <div className={`w-24 h-24 bg-gradient-to-br ${bgGradient} rounded-full flex items-center justify-center shadow-lg`}>
          <Icon className="w-12 h-12 text-black" />
        </div>

        {/* Sentiment Label */}
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 capitalize">{sentiment} Sentiment</p>
          <p className={`text-sm font-semibold ${color} mt-1`}>{sentimentScore}% Confidence</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mt-4">
          <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-gray-700 font-medium mt-1">Win Rate</p>
          </div>
          <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{winningTrades}</p>
            <p className="text-xs text-gray-700 font-medium mt-1">Wins</p>
          </div>
          <div className="bg-white/20 rounded-lg border border-gray-300 p-3 text-center">
            <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPL.toFixed(2)}
            </p>
            <p className="text-xs text-gray-700 font-medium mt-1">Total P/L</p>
          </div>
        </div>

        {/* Recent Trend */}
        <div className="w-full mt-4 p-3 bg-white/20 rounded-lg border border-gray-300">
          <p className="text-xs font-bold text-gray-900 mb-2">Recent Trend (Last 5 Trades)</p>
          <div className="flex space-x-1">
            {recentTrades.map((trade, idx) => (
              <div
                key={idx}
                className={`flex-1 h-8 rounded border-2 ${
                  trade.profit_loss > 0
                    ? 'bg-green-500/40 border-green-600'
                    : trade.profit_loss < 0
                    ? 'bg-red-500/40 border-red-600'
                    : 'bg-gray-500/40 border-gray-600'
                }`}
                title={`${trade.asset} - $${trade.profit_loss.toFixed(2)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
