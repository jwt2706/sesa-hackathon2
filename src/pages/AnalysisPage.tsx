import AnalysisDashboard from '../components/AnalysisDashboard';
import TradeHeatmap from '../trade_analysis/tradeHeatmap';
import PLCard from '../components/analysis/PLCard';
import PLByMonthHeatmap from '../components/analysis/PLByMonthHeatmap';
import DayOfMonthSummary from '../components/analysis/DayOfMonthSummary';
import { Trade, BiasAnalysisResult } from '../types/trade';

interface AnalysisPageProps {
  trades: Trade[];
  analysis: BiasAnalysisResult | null;
}

export default function AnalysisPage({ trades, analysis }: AnalysisPageProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PLCard trades={trades} />
        <div className="lg:col-span-2">
          <AnalysisDashboard analysis={analysis} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
          <TradeHeatmap trades={trades} />
        </div>
        <div className="space-y-6">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <PLByMonthHeatmap trades={trades} />
          </div>
          <DayOfMonthSummary trades={trades} />
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">Personal Analysis & Recommendation</h3>
        <p className="text-sm text-white/60">Add your personal notes and recommendations here.</p>
      </div>
    </div>
  );
}
