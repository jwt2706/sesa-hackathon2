import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Trade } from '../types/trade';

interface ManualTradeEntryProps {
  onTradeAdded: (trade: Trade) => void;
}

export default function ManualTradeEntry({ onTradeAdded }: ManualTradeEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    asset: '',
    side: 'buy' as 'buy' | 'sell',
    quantity: '',
    entry_price: '',
    exit_price: '',
    profit_loss: '',
    balance: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trade: Trade = {
      id: `manual-${Date.now()}`,
      timestamp: new Date(formData.timestamp).toISOString(),
      asset: formData.asset,
      side: formData.side,
      quantity: parseFloat(formData.quantity),
      entry_price: parseFloat(formData.entry_price),
      exit_price: parseFloat(formData.exit_price),
      profit_loss: parseFloat(formData.profit_loss),
      balance: parseFloat(formData.balance),
    };

    onTradeAdded(trade);
    setFormData({
      timestamp: new Date().toISOString().slice(0, 16),
      asset: '',
      side: 'buy',
      quantity: '',
      entry_price: '',
      exit_price: '',
      profit_loss: '',
      balance: '',
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-all group w-full"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Add Trade Manually</span>
        </div>
      </button>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Add Trade Manually</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Timestamp
            </label>
            <input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Asset
            </label>
            <input
              type="text"
              value={formData.asset}
              onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
              placeholder="e.g., AAPL"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Side
            </label>
            <select
              value={formData.side}
              onChange={(e) => setFormData({ ...formData, side: e.target.value as 'buy' | 'sell' })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Quantity
            </label>
            <input
              type="number"
              step="any"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Entry Price
            </label>
            <input
              type="number"
              step="any"
              value={formData.entry_price}
              onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Exit Price
            </label>
            <input
              type="number"
              step="any"
              value={formData.exit_price}
              onChange={(e) => setFormData({ ...formData, exit_price: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Profit/Loss
            </label>
            <input
              type="number"
              step="any"
              value={formData.profit_loss}
              onChange={(e) => setFormData({ ...formData, profit_loss: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Balance
            </label>
            <input
              type="number"
              step="any"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-2">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
          >
            Add Trade
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
