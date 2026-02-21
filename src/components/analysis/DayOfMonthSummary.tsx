import { Trade } from '../../types/trade';
import { computeDayOfMonthStats } from '../../trade_analysis/aggregations';

const DayOfMonthSummary = ({ trades }: { trades: Trade[] }) => {
  const stats = computeDayOfMonthStats(trades);
  const top = stats.slice(0, 3);

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-black font-bold mb-3">Most Profitable Days (by total P/L)</h3>

      {top.length === 0 ? (
        <p className="text-black/60">No trades available to analyze.</p>
      ) : (
        <div className="space-y-3">
          {top.map((t) => (
            <div key={t.day} className="flex items-center justify-between">
              <div>
                <p className="text-black font-medium">Day {t.day}</p>
                <p className="text-sm text-black/60">{t.count} trades · avg {t.avgPL.toFixed(2)}</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${t.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.totalPL >= 0 ? '+' : '-'}${Math.abs(t.totalPL).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-black/60">
            <p>
              The table shows which days of the month historically produced the highest total P/L across
              all months in your data. Use this to spot recurring intra-month patterns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayOfMonthSummary;
