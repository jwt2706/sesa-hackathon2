import TradeHeatmap from '../trade_analysis/tradeHeatmap';
import PLCard from '../components/analysis/PLCard';
import PLByMonthHeatmap from '../components/analysis/PLByMonthHeatmap';
import DayOfMonthSummary from '../components/analysis/DayOfMonthSummary';
import { Trade, BiasAnalysisResult } from '../types/trade';

function SentimentGraphCard({ trades }: { trades: Trade[] }) {
  const winRate = trades.length > 0 ? trades.filter((t) => t.profit_loss > 0).length / trades.length : 0;
  const totalPL = trades.reduce((sum, t) => sum + t.profit_loss, 0);
  const sentiment = winRate >= 0.6 && totalPL > 0 ? 'Positive' : winRate >= 0.4 ? 'Neutral' : 'Negative';

  return (
    <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Graph</h3>
      <div className="space-y-3">
        <p className="text-gray-900 font-bold">LLM Sentiment Signal: {sentiment}</p>
        <p className="text-sm text-gray-700 font-medium">Win rate: {(winRate * 100).toFixed(0)}%</p>
        <p className={`text-sm font-bold ${totalPL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          Running P/L: ${totalPL.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

interface AnalysisPageProps {
  trades: Trade[];
  analysis: BiasAnalysisResult | null;
}

export default function AnalysisPage({ trades, analysis }: AnalysisPageProps) {
  return (
    <div className="space-y-6">
      {/* Top Section: Total P/L and Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PLCard trades={trades} />
        <SentimentGraphCard trades={trades} />
      </div>

      {/* Middle Section: Trade Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Trading Activity Heatmap</h3>
          <TradeHeatmap trades={trades} />
        </div>
        <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Profit/Loss by Month</h3>
          <PLByMonthHeatmap trades={trades} />
        </div>
      </div>

      {/* Bottom Section: Summary and Personal Notes */}
      <div className="space-y-6">
        <DayOfMonthSummary trades={trades} />
        <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Analysis & Recommendation</h3>
          <p className="text-gray-700 font-medium">
            {analysis
              ? `Detected focus area: ${analysis.overtrading.severity.toUpperCase()} overtrading risk, ${analysis.lossAversion.severity.toUpperCase()} loss aversion risk, and ${analysis.revengeTrading.severity.toUpperCase()} revenge-trading risk.`
              : 'Add your personal notes and recommendations here.'}
          </p>
        </div>
      </div>
    </div>
  );
}
