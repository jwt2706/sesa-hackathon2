import React, { useMemo, useState } from 'react';
import { Trade } from '../../types/trade';
import analyzePersonal, { generateRecommendations, summarizeWithHuggingFace } from '../../trade_analysis/personalAnalysis';

export default function PersonalAnalysis({ trades }: { trades: Trade[] }) {
  const { analysis, monthlyCounts } = useMemo(() => analyzePersonal(trades || []), [trades]);
  const [hfRecommendation, setHfRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const prompt = `User trades analysis:\nOvertrading: ${analysis.overtrading.severity} - ${analysis.overtrading.message}\nLoss aversion: ${analysis.lossAversion.severity} - ${analysis.lossAversion.message}\nRevenge trading: ${analysis.revengeTrading.severity} - ${analysis.revengeTrading.message}\nMonthly counts: ${JSON.stringify(monthlyCounts)}\n\nProvide a concise set of personalized recommendations and a short action plan.`;
    const out = await summarizeWithHuggingFace(prompt).catch(() => null);
    setHfRecommendation(out || generateRecommendations(analysis));
    setLoading(false);
  };

  return (
    <div className="backdrop-blur-xl bg-white/75 border-2 border-gray-300 rounded-2xl p-6">
      <h4 className="text-lg font-bold text-gray-900 mb-3">Personal Analysis</h4>

      <div className="space-y-2 mb-3">
        <p><strong>Overtrading:</strong> {analysis.overtrading.severity} — {analysis.overtrading.message}</p>
        <p><strong>Loss aversion:</strong> {analysis.lossAversion.severity} — {analysis.lossAversion.message}</p>
        <p><strong>Revenge trading:</strong> {analysis.revengeTrading.severity} — {analysis.revengeTrading.message}</p>
      </div>

      <div className="mb-3">
        <h5 className="font-bold">Trades per month</h5>
        <div className="text-sm text-gray-700">{Object.entries(monthlyCounts).map(([m, c]) => (`${m}: ${c}`)).join(' · ') || 'No trades'}</div>
      </div>

      <div className="space-y-2">
        <p className="font-bold">Recommendation</p>
        <p className="text-sm text-gray-700">{hfRecommendation || generateRecommendations(analysis)}</p>
      </div>

      <div className="mt-4">
        <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>
          {loading ? 'Generating…' : 'Open up Chat bot to get personalized recommendations'}
        </button>
      </div>
    </div>
  );
}
