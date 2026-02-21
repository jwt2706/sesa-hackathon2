import TradeHeatmap from '../trade_analysis/tradeHeatmap';
import PLCard from '../components/analysis/PLCard';
import DayOfMonthSummary from '../components/analysis/DayOfMonthSummary';
import TradeHistoryGraph from '../components/analysis/TradeHistoryGraph';
import { Trade, BiasAnalysisResult } from '../types/trade';

function SentimentGraphCard({ trades }: { trades: Trade[] }) {
  const sortedTrades = [...trades]
    .filter((trade) => trade.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (sortedTrades.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Graph</h3>
        <p className="text-gray-700 font-medium">No trades to analyze sentiment.</p>
      </div>
    );
  }

  const positiveTrades = sortedTrades.filter((trade) => trade.profit_loss > 0);
  const avgWin =
    positiveTrades.length > 0
      ? positiveTrades.reduce((sum, trade) => sum + trade.profit_loss, 0) / positiveTrades.length
      : 0;

  let score = 50;
  const trendPoints: number[] = [];
  let revengeHits = 0;
  let lossAversionHits = 0;
  let overtradingHits = 0;

  sortedTrades.forEach((trade, index) => {
    const tradeTime = new Date(trade.timestamp).getTime();

    const prevTrade = index > 0 ? sortedTrades[index - 1] : null;
    const prevTradeTime = prevTrade ? new Date(prevTrade.timestamp).getTime() : null;

    if (trade.profit_loss > 0) {
      score += 2.5;
    } else if (trade.profit_loss < 0) {
      score -= 2;
    }

    if (prevTrade && prevTrade.profit_loss < 0 && prevTradeTime && tradeTime - prevTradeTime <= 5 * 60 * 1000) {
      score -= 6;
      revengeHits += 1;
    }

    if (trade.profit_loss < 0 && avgWin > 0 && Math.abs(trade.profit_loss) > avgWin * 2) {
      score -= 7;
      lossAversionHits += 1;
    }

    if (index >= 3) {
      const recent = sortedTrades.slice(index - 3, index + 1);
      const firstRecentTime = new Date(recent[0].timestamp).getTime();
      if (tradeTime - firstRecentTime <= 10 * 60 * 1000) {
        score -= 5;
        overtradingHits += 1;
      }
    }

    score = Math.max(0, Math.min(100, score));
    trendPoints.push(score);
  });

  const minScore = Math.min(...trendPoints);
  const maxScore = Math.max(...trendPoints);
  const sentimentLabel =
    score >= 65 ? 'Positive' : score >= 40 ? 'Neutral' : 'Negative';

  const width = 100;
  const height = 46;
  const points = trendPoints
    .map((value, index) => {
      const x = trendPoints.length === 1 ? 0 : (index / (trendPoints.length - 1)) * width;
      const y = height - (value / 100) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Graph</h3>
      <div className="space-y-4">
        <div className="bg-white/50 border-2 border-gray-300 rounded-xl p-3">
          <svg viewBox="0 0 100 46" className="w-full h-28">
            <polyline fill="none" stroke="#16a34a" strokeWidth="2.5" points={points} />
          </svg>
          <div className="mt-2 flex items-center justify-between text-xs font-bold">
            <span className="text-gray-600">Start</span>
            <span className="text-green-700">End: {score.toFixed(0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/40 border-2 border-gray-300 rounded-lg p-3">
            <p className="text-gray-700 font-semibold">Detected Sentiment</p>
            <p className={`text-lg font-bold ${score >= 65 ? 'text-green-700' : score >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>
              {sentimentLabel}
            </p>
          </div>
          <div className="bg-white/40 border-2 border-gray-300 rounded-lg p-3">
            <p className="text-gray-700 font-semibold">Score Range</p>
            <p className="text-lg font-bold text-gray-900">
              {minScore.toFixed(0)} - {maxScore.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="bg-white/40 border-2 border-gray-300 rounded-lg p-3">
          <p className="text-sm font-bold text-gray-900 mb-2">Legend (what pushes sentiment down)</p>
          <div className="space-y-1 text-sm text-gray-700 font-medium">
            <p><span className="text-red-700 font-bold">Revenge Trading:</span> quick new trade after a loss ({revengeHits})</p>
            <p><span className="text-red-700 font-bold">Loss Aversion:</span> outsized losing trades ({lossAversionHits})</p>
            <p><span className="text-red-700 font-bold">Overtrading:</span> clustered high-frequency trades ({overtradingHits})</p>
            <p><span className="text-green-700 font-bold">Healthy behavior:</span> disciplined profitable sequence pushes trend up.</p>
          </div>
        </div>
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
    <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analysis Results:</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 border-b-2 border-gray-300">
        <PLCard trades={trades} />
        <SentimentGraphCard trades={trades} />
      </div>

      <div className="pb-8 border-b-2 border-gray-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Trade History & Equity Curve</h3>
        <TradeHistoryGraph trades={trades} />
      </div>

      <div className="space-y-6 pb-8 border-b-2 border-gray-300">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Trading Activity Heatmap</h3>
          <TradeHeatmap trades={trades} />
        </div>
      </div>

      <div className="space-y-6">
        <DayOfMonthSummary trades={trades} />
        <div>
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
