import { Trade } from '../../types/trade';

interface PLCardProps {
  trades: Trade[];
}

export default function PLCard({ trades }: PLCardProps) {
  const totalPL = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);

  const formatted = (v: number) =>
    `${v >= 0 ? '+' : '-'}$${Math.abs(v).toFixed(2)}`;

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-sm text-black/60 uppercase tracking-wider">Total P/L</h3>
        <p className={`text-3xl font-extrabold mt-2 ${totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatted(totalPL)}
        </p>
      </div>

      <div className="mt-4 text-sm text-black/60">
        <p>{trades.length} trades analyzed</p>
      </div>
    </div>
  );
}
