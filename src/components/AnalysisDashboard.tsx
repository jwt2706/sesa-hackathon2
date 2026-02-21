import { FaBolt, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { BiasAnalysisResult } from '../types/trade';

interface AnalysisDashboardProps {
  analysis: BiasAnalysisResult | null;
}

export default function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  if (!analysis) {
    return (
      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-12 shadow-xl text-center">
        <p className="text-gray-900 text-lg font-semibold">No analysis available</p>
        <p className="text-gray-600 text-sm mt-2">Add trades to see your bias analysis</p>
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
        return 'border-red-500/50';
      case 'medium':
        return 'border-yellow-500/50';
      case 'low':
        return 'border-green-500/50';
      default:
        return 'border-gray-500/50';
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
      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bias Analysis</h2>
        <p className="text-gray-700 font-medium">Behavioral patterns detected in your trading history</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {biases.map((bias) => {
          const Icon = bias.icon;
          return (
            <div
              key={bias.name}
              className={`backdrop-blur-xl bg-white/30 border-2 rounded-2xl p-6 shadow-lg ${
                bias.data.severity === 'high'
                  ? 'border-red-500'
                  : bias.data.severity === 'medium'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase backdrop-blur-md ${
                    bias.data.severity === 'high'
                      ? 'bg-red-500/30 text-red-100 border border-red-500/50'
                      : bias.data.severity === 'medium'
                      ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-500/50'
                      : 'bg-green-500/30 text-green-100 border border-green-500/50'
                  }`}
                >
                  {bias.data.severity}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{bias.name}</h3>
              <p className="text-sm text-gray-700 mb-4 font-medium">{bias.description}</p>

              <div className="mt-4 p-4 bg-white/25 rounded-lg border-2 border-gray-300 shadow-sm">
                <p className="text-sm text-gray-800 font-medium">{bias.data.message}</p>
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

      <div className="backdrop-blur-xl bg-white/30 border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-white/25 rounded-lg border-2 border-red-300 shadow-sm">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-red-700">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-gray-900 font-bold">Set daily trade limits</p>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Limit yourself to a maximum number of trades per day to avoid overtrading
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white/25 rounded-lg border-2 border-red-300 shadow-sm">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-red-700">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-gray-900 font-bold">Implement stop-loss discipline</p>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Always use stop-loss orders and stick to them to prevent loss aversion
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white/25 rounded-lg border-2 border-red-300 shadow-sm">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 border-red-700">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-gray-900 font-bold">Take cooling-off periods after losses</p>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Wait at least 15 minutes after a loss before placing another trade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
