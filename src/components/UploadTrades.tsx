import { FaUpload } from 'react-icons/fa';
import { useState } from 'react';
import { Trade } from '../types/trade';
import supabase from '../lib/supabase';

interface UploadTradesProps {
  onTradesUploaded: (trades: Trade[]) => void | Promise<void>;
  sessions?: Array<{ id: string; name?: string; created_at?: string }>;
  onOpenSession?: (session: { id: string; name?: string; created_at?: string }) => void;
  onDeleteSession?: (session: { id: string; name?: string; created_at?: string }) => void;
}

const HEADER_ALIASES: Record<string, string[]> = {
  timestamp: ['timestamp', 'time', 'datetime', 'date', 'opened_at', 'open_time', 'close_time'],
  asset: ['asset', 'symbol', 'ticker', 'instrument', 'market', 'pair'],
  side: ['side', 'type', 'direction', 'position'],
  quantity: ['quantity', 'qty', 'size', 'units', 'volume'],
  entry_price: ['entry_price', 'entryprice', 'entry', 'buy_price', 'open_price', 'price_in'],
  exit_price: ['exit_price', 'exitprice', 'exit', 'sell_price', 'close_price', 'price_out'],
  profit_loss: ['profit_loss', 'profitloss', 'p_l', 'pl', 'pnl', 'profit', 'loss', 'net'],
  balance: ['balance', 'equity', 'account_balance', 'running_balance', 'wallet_balance'],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function getField(tradeData: Record<string, string>, canonical: keyof typeof HEADER_ALIASES): string {
  const keys = HEADER_ALIASES[canonical];
  for (const key of keys) {
    const value = tradeData[key];
    if (value != null && value !== '') return value;
  }
  return '';
}

function splitCsvLine(line: string): string[] {
  return line
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((v) => v.trim().replace(/^"|"$/g, ''));
}

function parseNumberLike(value: string): number {
  if (!value) return NaN;
  const cleaned = value
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .replace(/^\((.*)\)$/, '-$1');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeTimestamp(raw: string): string {
  if (!raw) return new Date().toISOString();
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

function normalizeSide(raw: string): 'buy' | 'sell' {
  const side = raw?.toLowerCase().trim();
  if (side === 'buy' || side === 'long' || side === 'b') return 'buy';
  if (side === 'sell' || side === 'short' || side === 's') return 'sell';
  return 'sell';
}

export default function UploadTrades({ onTradesUploaded, sessions = [], onOpenSession, onDeleteSession }: UploadTradesProps) {
  const [uploading, setUploading] = useState(false);
  const [pastUploadsOpen, setPastUploadsOpen] = useState(false);
  const enableSessionUpload = import.meta.env.VITE_ENABLE_UPLOAD_SESSIONS !== 'false';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) {
        alert('CSV appears empty. Please upload a file with headers and at least one trade row.');
        return;
      }

      const headers = splitCsvLine(lines[0]).map(normalizeHeader);

      let runningBalance = 0;
      const trades: Trade[] = lines.slice(1).map((line, index) => {
        const values = splitCsvLine(line);
        const tradeData: Record<string, string> = {};

        headers.forEach((header, i) => {
          tradeData[header] = values[i] || '';
        });

        const timestamp = normalizeTimestamp(getField(tradeData, 'timestamp'));
        const asset = getField(tradeData, 'asset') || 'Unknown';
        const side = normalizeSide(getField(tradeData, 'side'));
        const quantity = parseNumberLike(getField(tradeData, 'quantity'));
        const entryPrice = parseNumberLike(getField(tradeData, 'entry_price'));
        const exitPrice = parseNumberLike(getField(tradeData, 'exit_price'));
        const profitLossRaw = parseNumberLike(getField(tradeData, 'profit_loss'));
        const profitLoss = Number.isFinite(profitLossRaw)
          ? profitLossRaw
          : Number.isFinite(entryPrice) && Number.isFinite(exitPrice) && Number.isFinite(quantity)
          ? (exitPrice - entryPrice) * quantity * (side === 'buy' ? 1 : -1)
          : 0;

        const rawBalance = parseNumberLike(getField(tradeData, 'balance'));
        const computedBalance = Number.isFinite(rawBalance) ? rawBalance : runningBalance + profitLoss;
        const balance = Math.max(0, Number.isFinite(computedBalance) ? computedBalance : 0);
        runningBalance = balance;

        return {
          id: `upload-${Date.now()}-${index}`,
          timestamp,
          asset,
          side,
          // don't mask missing quantity with 1 — prefer 0 so analysis can detect invalid rows
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
          // default to 0 when prices are missing so profit calculations don't assume tiny defaults
          entry_price: Number.isFinite(entryPrice) && entryPrice > 0 ? entryPrice : 0,
          exit_price: Number.isFinite(exitPrice) && exitPrice > 0 ? exitPrice : 0,
          profit_loss: Number.isFinite(profitLoss) ? profitLoss : 0,
          balance,
        };
      });

      if (enableSessionUpload) {
        try {
          const userRes = await supabase.auth.getUser();
          const user = userRes.data?.user;

          if (user) {
            const path = `${user.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });

            if (uploadError) {
              console.warn('Session upload disabled by policy or bucket settings:', uploadError.message);
            } else {
              const { error: insertError } = await supabase.from('upload_sessions').insert([
                {
                  user_id: user.id,
                  name: file.name,
                  path,
                  metadata: { rows: trades.length },
                },
              ]);

              if (insertError) {
                console.warn('Upload session record skipped:', insertError.message);
              }
            }
          }
        } catch (err) {
          console.warn('Session recording skipped:', err);
        }
      }

      await onTradesUploaded(trades);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please ensure it is a valid CSV with the correct format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white/75 border-2 border-white/20 rounded-2xl p-6 shadow-lg">
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
            </div>
          </div>
        </div>
      </label>

      <div className="mt-4 p-4 bg-white/25 rounded-lg border-2 border-gray-300 shadow-sm">
        <button
          type="button"
          onClick={() => setPastUploadsOpen((open) => !open)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-bold text-gray-900">Past Uploads</h3>
          <span className="text-sm font-bold text-gray-700">{pastUploadsOpen ? '▲' : '▼'}</span>
        </button>

        {pastUploadsOpen && (
          <div className="mt-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-700 font-medium">No previous uploads yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {sessions.map((sess) => (
                  <div key={sess.id} className="bg-white/40 border-2 border-gray-300 rounded-lg p-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-900 font-bold">{sess.name || 'Unnamed upload'}</p>
                      <p className="text-xs text-gray-700 mt-1 font-medium">
                        {sess.created_at ? new Date(sess.created_at).toLocaleString() : 'No timestamp'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenSession?.(sess)}
                        className="px-2.5 py-1 rounded-lg border-2 border-red-500 text-red-700 text-xs font-bold hover:bg-red-50 transition-all"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => onDeleteSession?.(sess)}
                        className="px-2.5 py-1 rounded-lg border-2 border-gray-300 text-gray-900 text-xs font-bold hover:bg-white/50 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
