import { FaUpload } from 'react-icons/fa';
import { useState } from 'react';
import { Trade } from '../types/trade';
import supabase from '../lib/supabase';

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

      const trades: Trade[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const tradeData: Record<string, string> = {};

        headers.forEach((header, i) => {
          tradeData[header] = values[i] || '';
        });

        return {
          id: `upload-${Date.now()}-${index}`,
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

      try {
        // Try to upload the raw CSV to Supabase Storage and create a session record
        const userRes = await supabase.auth.getUser();
        const user = userRes.data?.user;

        if (user) {
          const path = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });

          if (uploadError) {
            console.warn('Failed to upload CSV to storage:', uploadError.message);
          } else {
            // create session record
            const { error: insertError } = await supabase.from('upload_sessions').insert([
              {
                name: file.name,
                path: path,
                metadata: { rows: trades.length },
              },
            ]);

            if (insertError) {
              console.warn('Failed to create upload session record:', insertError.message);
            }
          }
        }
      } catch (err) {
        console.warn('Session recording skipped:', err);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it is a valid CSV with the correct format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Upload Trading History</h2>

      <label className="block">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <div className="border-2 border-dashed border-white/30 rounded-xl p-8 cursor-pointer hover:border-red-400 hover:bg-white/5 transition-all group">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
              <FaUpload className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                {uploading ? 'Processing...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-white/60 mt-1">
                Supports CSV files with trading history
              </p>
            </div>
          </div>
        </div>
      </label>

      <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-white/80 font-medium mb-2">Required columns:</p>
        <p className="text-xs text-white/60 font-mono">
          timestamp, asset, side, quantity, entry_price, exit_price, profit_loss, balance
        </p>
      </div>
    </div>
  );
}
