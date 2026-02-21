import { FaBolt, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { BiasAnalysisResult } from '../types/trade';

interface AnalysisDashboardProps {
  analysis: BiasAnalysisResult | null;
}

export default function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  if (!analysis) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 shadow-xl text-center">
        <p className="text-white/60 text-lg">No analysis available</p>
        <p className="text-white/40 text-sm mt-2">Add trades to see your bias analysis</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'from-red-500 to-red-600';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'low':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30';
      case 'medium':
        return 'border-yellow-500/30';
      case 'low':
        return 'border-green-500/30';
      default:
        return 'border-gray-500/30';
    }
  };

  const biases = [
    {
      name: 'Overtrading',
      icon: FaBolt,
      data: analysis.overtrading,
      description: 'Excessive trading frequency or impulsive trades',
    },
    {
      name: 'Loss Aversion',
      icon: FaExclamationTriangle,
      data: analysis.lossAversion,
      description: 'Holding losers too long, cutting winners too early',
    },
    {
      name: 'Revenge Trading',
      icon: FaChartLine,
      data: analysis.revengeTrading,
      description: 'Emotional trading after losses',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Bias Analysis</h2>
        <p className="text-white/60">Behavioral patterns detected in your trading history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {biases.map((bias) => {
          const Icon = bias.icon;
          return (
            <div
              key={bias.name}
              className={`backdrop-blur-md bg-white/10 border ${getSeverityBorder(
                bias.data.severity
              )} rounded-2xl p-6 shadow-xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${getSeverityColor(
                    bias.data.severity
                  )} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    bias.data.severity === 'high'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : bias.data.severity === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}
                >
                  {bias.data.severity}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{bias.name}</h3>
              <p className="text-sm text-white/60 mb-4">{bias.description}</p>

              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/80">{bias.data.message}</p>
              </div>

              {bias.data.detected && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-xs text-white/70">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span>Active pattern detected</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-medium">Set daily trade limits</p>
              <p className="text-sm text-white/60 mt-1">
                Limit yourself to a maximum number of trades per day to avoid overtrading
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-medium">Implement stop-loss discipline</p>
              <p className="text-sm text-white/60 mt-1">
                Always use stop-loss orders and stick to them to prevent loss aversion
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-medium">Take cooling-off periods after losses</p>
              <p className="text-sm text-white/60 mt-1">
                Wait at least 15 minutes after a loss before placing another trade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
