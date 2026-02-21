import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UploadTrades from './components/UploadTrades';
import ManualTradeEntry from './components/ManualTradeEntry';
import TradesTable from './components/TradesTable';
import AnalysisDashboard from './components/AnalysisDashboard';
import FAQPage from './components/FAQPage';
import AnalysisPage from './pages/AnalysisPage';
import { Trade, BiasAnalysisResult } from './types/trade';
import { loadTradesLocal, appendTradesLocal, saveTradesLocal } from './lib/localStorage';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'faq' | 'analysis'>('dashboard');
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
    const data = await loadTradesLocal();
    setTrades(data);
    setAnalysis(generateDummyAnalysis(data));
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleTradesUploaded = async (newTrades: Trade[]) => {
    try {
      // append to local storage and reload
      await appendTradesLocal(newTrades);
      await loadTrades();
      setCurrentPage('analysis');
    } catch (e) {
      console.error('Error saving trades locally:', e);
      alert('Error saving trades locally. Please try again.');
    }
  };

  const handleTradeAdded = async (trade: Trade) => {
    try {
      await appendTradesLocal([trade]);
      await loadTrades();
    } catch (e) {
      console.error('Error adding trade locally:', e);
      alert('Error adding trade locally.');
    }
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
      ) : currentPage === 'analysis' ? (
        <AnalysisPage trades={trades} analysis={analysis} />
      ) : (
        <FAQPage />
      )}
    </Layout>
  );
}

export default App;
