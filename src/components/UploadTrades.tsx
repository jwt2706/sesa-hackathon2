import { FaUpload } from 'react-icons/fa';
import { useState } from 'react';
import { Trade } from '../types/trade';

interface UploadTradesProps {
  onTradesUploaded: (trades: Trade[]) => void;
}

export default function UploadTrades({ onTradesUploaded }: UploadTradesProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const trades: Trade[] = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim());
        const tradeData: Record<string, string> = {};

        headers.forEach((header, i) => {
          tradeData[header] = values[i] || '';
        });

        return {
          timestamp: tradeData.timestamp || new Date().toISOString(),
          asset: tradeData.asset || '',
          side: (tradeData.side?.toLowerCase() === 'buy' ? 'buy' : 'sell') as 'buy' | 'sell',
          quantity: parseFloat(tradeData.quantity || '0'),
          entry_price: parseFloat(tradeData.entry_price || tradeData.entryprice || '0'),
          exit_price: parseFloat(tradeData.exit_price || tradeData.exitprice || '0'),
          profit_loss: parseFloat(tradeData.profit_loss || tradeData.profitloss || tradeData.p_l || tradeData.pl || '0'),
          balance: parseFloat(tradeData.balance || '0'),
        };
      });

      onTradesUploaded(trades);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it is a valid CSV with the correct format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white/10 border-2 border-white/20 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Trading History</h2>

      <label className="block">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <div className="border-3 border-dashed border-gray-400 rounded-xl p-8 cursor-pointer hover:border-red-500 hover:bg-white/20 transition-all group">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30 border-2 border-red-700">
              <FaUpload className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-bold text-lg">
                {uploading ? 'Processing...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                Supports CSV files with trading history
              </p>
            </div>
          </div>
        </div>
      </label>

      <div className="mt-4 p-4 bg-white/25 rounded-lg border-2 border-gray-300 shadow-sm">
        <p className="text-sm text-gray-900 font-bold mb-2">Required columns:</p>
        <p className="text-xs text-gray-800 font-mono font-medium">
          timestamp, asset, side, quantity, entry_price, exit_price, profit_loss, balance
        </p>
      </div>
    </div>
  );
}
