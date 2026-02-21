import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UploadTrades from './components/UploadTrades';
import ManualTradeEntry from './components/ManualTradeEntry';
import TradesTable from './components/TradesTable';
import AnalysisDashboard from './components/AnalysisDashboard';
import FAQPage from './components/FAQPage';
import AuthForm from './components/AuthForm';
import { Trade, BiasAnalysisResult } from './types/trade';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'faq'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<BiasAnalysisResult | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitLoading, setAuthSubmitLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const loadTrades = async (userId: string) => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
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
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
      setAuthError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setTrades([]);
      setAnalysis(null);
      return;
    }

    loadTrades(session.user.id);
  }, [session?.user?.id]);

  const handleSignIn = async (email: string, password: string) => {
    setAuthSubmitLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setAuthSubmitLoading(false);

    if (error) {
      setAuthError(error.message);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setAuthSubmitLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setAuthSubmitLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setAuthError('Account created. If login did not continue automatically, sign in using your new credentials.');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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

    if (session?.user?.id) {
      await loadTrades(session.user.id);
    }
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

    if (session?.user?.id) {
      await loadTrades(session.user.id);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <AuthForm
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        loading={authSubmitLoading}
        error={authError}
      />
    );
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onSignOut={handleSignOut}
      userEmail={session.user.email || ''}
    >
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
