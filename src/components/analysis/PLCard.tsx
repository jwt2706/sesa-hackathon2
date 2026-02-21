import { Trade } from '../../types/trade';

interface PLCardProps {
  trades: Trade[];
}

export default function PLCard({ trades }: PLCardProps) {
  const totalPL = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);

  const formatted = (v: number) =>
    `${v >= 0 ? '+' : '-'}$${Math.abs(v).toFixed(2)}`;

  return (
    <div className="bg-white/40 border-2 border-gray-300 rounded-xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-sm text-gray-700 uppercase tracking-wider font-bold">Total P/L</h3>
        <p className={`text-3xl font-extrabold mt-2 ${totalPL >= 0 ? 'text-emerald-600' : 'text-red-700'}`}>
          {formatted(totalPL)}
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-700 font-medium">
        <p>{trades.length} trades analyzed</p>
      </div>
    </div>
  );
}
