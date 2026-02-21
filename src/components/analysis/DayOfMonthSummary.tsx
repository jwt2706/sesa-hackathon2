import { Trade } from '../../types/trade';
import { computeDayOfMonthStats } from '../../trade_analysis/aggregations';

const DayOfMonthSummary = ({ trades }: { trades: Trade[] }) => {
  const stats = computeDayOfMonthStats(trades);
  const top = stats.slice(0, 3);

  return (
    <div className="bg-white/40 border-2 border-gray-300 rounded-xl p-6">
      <h3 className="text-black font-bold mb-3">Most Profitable Days (by total P/L)</h3>

      {top.length === 0 ? (
        <p className="text-gray-700 font-medium">No trades available to analyze.</p>
      ) : (
        <div className="space-y-3">
          {top.map((t) => (
            <div key={t.day} className="flex items-center justify-between">
              <div>
                <p className="text-black font-medium">Day {t.day}</p>
                <p className="text-sm text-gray-700">{t.count} trades · avg {t.avgPL.toFixed(2)}</p>
              </div>
              <div>
                <p className={`text-lg font-semibold ${t.totalPL >= 0 ? 'text-emerald-600' : 'text-red-700'}`}>
                  {t.totalPL >= 0 ? '+' : '-'}${Math.abs(t.totalPL).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-white/60 rounded-lg border-2 border-gray-300 text-sm text-gray-700 font-medium">
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
