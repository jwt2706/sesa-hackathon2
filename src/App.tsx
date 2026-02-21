import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UploadTrades from './components/UploadTrades';
import ManualTradeEntry from './components/ManualTradeEntry';
import TradesTable from './components/TradesTable';
import AnalysisDashboard from './components/AnalysisDashboard';
import FAQPage from './components/FAQPage';
import { Trade, BiasAnalysisResult } from './types/trade';
import { supabase } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'faq'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<BiasAnalysisResult | null>(null);

  const generateDummyAnalysis = (trades: Trade[]): BiasAnalysisResult => {
    const hasTrades = trades.length > 0;

    return {
      overtrading: {
        detected: hasTrades && trades.length > 5,
        severity: trades.length > 10 ? 'high' : trades.length > 5 ? 'medium' : 'low',
        message: hasTrades
          ? `You have made ${trades.length} trades. ${
              trades.length > 10
                ? 'This indicates a high frequency of trading which may suggest overtrading behavior.'
                : trades.length > 5
                ? 'Moderate trading activity detected. Consider if each trade aligns with your strategy.'
                : 'Your trading frequency appears controlled and disciplined.'
            }`
          : 'No trades available for analysis.',
      },
      lossAversion: {
        detected: hasTrades,
        severity: hasTrades ? 'medium' : 'low',
        message: hasTrades
          ? 'Analysis suggests a tendency to hold losing positions. Consider implementing stricter stop-loss rules to manage risk more effectively.'
          : 'No trades available for analysis.',
      },
      revengeTrading: {
        detected: hasTrades && trades.some((t) => t.profit_loss < 0),
        severity: hasTrades && trades.filter((t) => t.profit_loss < 0).length > 3 ? 'high' : 'low',
        message: hasTrades
          ? trades.some((t) => t.profit_loss < 0)
            ? 'Patterns suggest emotional trading following losses. Take breaks after negative trades to maintain objectivity.'
            : 'No significant revenge trading patterns detected. Keep maintaining your discipline.'
          : 'No trades available for analysis.',
      },
    };
  };

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading trades:', error);
      return;
    }

    if (data) {
      setTrades(data);
      setAnalysis(generateDummyAnalysis(data));
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleTradesUploaded = async (newTrades: Trade[]) => {
    const { error } = await supabase.from('trades').insert(
      newTrades.map((trade) => ({
        timestamp: trade.timestamp,
        asset: trade.asset,
        side: trade.side,
        quantity: trade.quantity,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        profit_loss: trade.profit_loss,
        balance: trade.balance,
      }))
    );

    if (error) {
      console.error('Error saving trades:', error);
      alert('Error saving trades. Please try again.');
      return;
    }

    await loadTrades();
  };

  const handleTradeAdded = async (trade: Trade) => {
    const { error } = await supabase.from('trades').insert({
      timestamp: trade.timestamp,
      asset: trade.asset,
      side: trade.side,
      quantity: trade.quantity,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      profit_loss: trade.profit_loss,
      balance: trade.balance,
    });

    if (error) {
      console.error('Error adding trade:', error);
      alert('Error adding trade. Please try again.');
      return;
    }

    await loadTrades();
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadTrades onTradesUploaded={handleTradesUploaded} />
            <ManualTradeEntry onTradeAdded={handleTradeAdded} />
          </div>

          <AnalysisDashboard analysis={analysis} />

          <TradesTable trades={trades} />
        </div>
      ) : (
        <FAQPage />
      )}
    </Layout>
  );
}

export default App;
