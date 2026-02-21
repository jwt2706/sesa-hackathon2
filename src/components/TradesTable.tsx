import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Trade } from '../types/trade';

interface TradesTableProps {
  trades: Trade[];
}

export default function TradesTable({ trades }: TradesTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (trades.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-12 shadow-xl text-center">
        <p className="text-white/60 text-lg">No trades to display</p>
        <p className="text-white/40 text-sm mt-2">Upload a CSV or add trades manually to get started</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white">Trading History</h2>
        <p className="text-sm text-white/60 mt-1">{trades.length} trades recorded</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                Exit Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                P/L
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                  {formatDate(trade.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">{trade.asset}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      trade.side === 'buy'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {trade.side === 'buy' ? (
                      <FaArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <FaArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 text-right">
                  {trade.quantity.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 text-right">
                  {formatCurrency(trade.entry_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 text-right">
                  {formatCurrency(trade.exit_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span
                    className={`font-semibold ${
                      trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {trade.profit_loss >= 0 ? '+' : ''}
                    {formatCurrency(trade.profit_loss)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium text-right">
                  {formatCurrency(trade.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
