import TradeHeatmap from '../trade_analysis/tradeHeatmap';
import PLCard from '../components/analysis/PLCard';
import DayOfMonthSummary from '../components/analysis/DayOfMonthSummary';
import PersonalAnalysis from '../components/analysis/PersonalAnalysis';
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
  const sortedTrades = [...trades]
    .filter((trade) => trade.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const balanceDrops = sortedTrades
    .map((trade, index) => {
      if (index === 0) return 0;
      const prevBalance = Number(sortedTrades[index - 1].balance);
      const currentBalance = Number(trade.balance);
      if (!Number.isFinite(prevBalance) || !Number.isFinite(currentBalance)) return 0;
      return Math.max(0, prevBalance - currentBalance);
    })
    .filter((drop) => drop > 0);

  const avgBalanceDrop =
    balanceDrops.length > 0 ? balanceDrops.reduce((sum, drop) => sum + drop, 0) / balanceDrops.length : 0;
  const suddenDropThreshold = Math.max(150, avgBalanceDrop * 2);

  const suddenLossHits = sortedTrades.reduce((count, trade, index) => {
    if (index === 0) return count;
    const prevBalance = Number(sortedTrades[index - 1].balance);
    const currentBalance = Number(trade.balance);
    const profitLoss = Number(trade.profit_loss);
    if (!Number.isFinite(prevBalance) || !Number.isFinite(currentBalance) || !Number.isFinite(profitLoss)) return count;
    const drop = prevBalance - currentBalance;
    return drop >= suddenDropThreshold && profitLoss < 0 ? count + 1 : count;
  }, 0);

  const lossAversionFromDrops = suddenLossHits >= 2;

  const severityWeight = (severity?: string) => {
    if (severity === 'high') return 3;
    if (severity === 'medium') return 2;
    return 1;
  };

  const biasScores = analysis
    ? [
        {
          key: 'overtrading' as const,
          label: 'overtrading',
          score: (analysis.overtrading.detected ? 2 : 0) + severityWeight(analysis.overtrading.severity),
        },
        {
          key: 'lossAversion' as const,
          label: 'loss aversion',
          score:
            (analysis.lossAversion.detected ? 2 : 0) +
            severityWeight(analysis.lossAversion.severity) +
            (lossAversionFromDrops ? 4 : 0),
        },
        {
          key: 'revengeTrading' as const,
          label: 'revenge trading',
          score: (analysis.revengeTrading.detected ? 2 : 0) + severityWeight(analysis.revengeTrading.severity),
        },
      ]
    : [];

  const dominantBias = biasScores.length > 0 ? [...biasScores].sort((a, b) => b.score - a.score)[0] : null;

  const recommendationsByBias: Record<string, string[]> = {
    overtrading: [
      'Set a strict max number of trades per day.',
      'Require a checklist before every trade entry.',
      'Pause 10 minutes after each closed trade.',
    ],
    lossAversion: [
      'Use hard stop-loss orders on every position.',
      'Predefine exit rules before entering trades.',
      'Review losers weekly to enforce discipline.',
    ],
    revengeTrading: [
      'Take a mandatory cooling-off break after a loss.',
      'Reduce position size after consecutive losses.',
      'Trade only when setup quality is high and documented.',
    ],
    default: [
      'Keep position sizing consistent with your plan.',
      'Track outcomes and adjust rules monthly.',
      'Protect capital first, then optimize returns.',
    ],
  };

  const recommendations = dominantBias
    ? recommendationsByBias[dominantBias.key] || recommendationsByBias.default
    : recommendationsByBias.default;

  const hasDetectedBias = analysis
    ? analysis.overtrading.detected || analysis.lossAversion.detected || analysis.revengeTrading.detected || lossAversionFromDrops
    : false;

  return (
    <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6 shadow-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analysis Results:</h2>
      </div>

      <div className="space-y-6 pb-8 border-b-2 border-gray-300">
        <PLCard trades={trades}>
          <p className="text-gray-900 font-bold text-lg leading-snug">
            Bro, you're{' '}
            <span className={hasDetectedBias ? 'text-red-700' : 'text-green-700'}>
              {hasDetectedBias && dominantBias ? `${dominantBias.label}` : 'healthy and disciplined'}
            </span>
            .
          </p>
          {analysis ? (
            <p className="text-sm text-gray-700 font-medium mt-2 leading-relaxed">
              {hasDetectedBias && dominantBias?.key === 'overtrading'
                ? analysis.overtrading.message
                : hasDetectedBias && dominantBias?.key === 'lossAversion'
                ? lossAversionFromDrops
                  ? `Detected sudden large loss drops in your trade history (${suddenLossHits} events over ~${suddenDropThreshold.toFixed(0)} balance points), which is a strong loss-aversion signal.`
                  : analysis.lossAversion.message
                : hasDetectedBias && dominantBias?.key === 'revengeTrading'
                ? analysis.revengeTrading.message
                : 'No strong bias detected from current data. Keep following your plan and risk rules.'}
            </p>
          ) : null}

          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-3">Recommendations</h3>
          <ul className="space-y-2.5">
            {recommendations.map((item) => (
              <li key={item} className="text-sm text-gray-800 font-medium leading-relaxed flex items-start gap-2">
                <span className={`${hasDetectedBias ? 'text-red-600' : 'text-green-600'} font-bold`}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PLCard>

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
        <PersonalAnalysis trades={trades} />
      </div>
    </div>
  );
}
