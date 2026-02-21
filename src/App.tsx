import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import UploadTrades from './components/UploadTrades';
import FAQPage from './components/FAQPage';
import AnalysisPage from './pages/AnalysisPage';
import { loadTradesLocal, saveTradesLocal } from './lib/localStorage';
import AuthForm from './components/AuthForm';
import { Trade, BiasAnalysisResult } from './types/trade';
import analyzePersonal from './trade_analysis/personalAnalysis';
import supabase from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface UploadSession {
  id: string;
  user_id?: string;
  name?: string;
  path?: string;
  created_at?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'faq' | 'analysis'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<BiasAnalysisResult | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<UploadSession[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitLoading, setAuthSubmitLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoadingMessage, setDataLoadingMessage] = useState('Opening data...');

  // Use the more robust analyzer which returns a full BiasAnalysisResult
  const generateDummyAnalysis = (trades: Trade[]): BiasAnalysisResult => analyzePersonal(trades).analysis;

  const loadLocalTrades = useCallback(async () => {
    const data = await loadTradesLocal();
    setTrades(data);
    setAnalysis(generateDummyAnalysis(data));
  }, []);

  const loadRemoteTrades = useCallback(async (userId: string) => {
    const { data: remoteData, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading trades from supabase:', error);
      return;
    }

    // Merge remote data with locally uploaded (unsynced) trades so the UI shows uploads immediately
    try {
      const local = await loadTradesLocal();
      if (remoteData) {
        const remote = remoteData as Trade[];
        // Keep local (new) trades first, then append remote trades that don't appear to be duplicates
        const combined = [...local];
        for (const r of remote) {
          const exists = combined.some((l) =>
            l.timestamp === r.timestamp &&
            (l.asset || '').trim() === (r.asset || '').trim() &&
            Number(l.quantity) === Number((r as any).quantity) &&
            Number(l.entry_price) === Number((r as any).entry_price) &&
            Number(l.exit_price) === Number((r as any).exit_price)
          );
          if (!exists) combined.push(r as Trade);
        }

        setTrades(combined);
        setAnalysis(generateDummyAnalysis(combined));
      } else {
        setTrades(local);
        setAnalysis(generateDummyAnalysis(local));
      }
    } catch (err) {
      console.error('Error merging remote and local trades:', err);
      if (remoteData) {
        setTrades(remoteData as Trade[]);
        setAnalysis(generateDummyAnalysis(remoteData as Trade[]));
      }
    }
  }, []);

  const loadSessions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('upload_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sessions from supabase:', error);
        return;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }, []);

  const handleLoadSession = async (sess: UploadSession) => {
    const loadingStartedAt = Date.now();
    setDataLoadingMessage('Opening saved data...');
    setDataLoading(true);
    try {
      if (!sess?.path) return;
      const { data, error } = await supabase.storage.from('uploads').download(sess.path);
      if (error) {
        console.error('Error downloading session CSV:', error);
        alert('Unable to download selected session.');
        return;
      }

      const text = await new Response(data).text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const tradesParsed = lines.slice(1).map((line, index) => {
        const values = line.split(',').map((v) => v.trim());
        const tradeData: Record<string, string> = {};
        headers.forEach((header, i) => {
          tradeData[header] = values[i] || '';
        });

        const tags: string[] = [];
        const nameHint = (sess.name || '').toLowerCase();
        if (nameHint.includes('overtrader') || nameHint.includes('overtrade')) tags.push('Overtrading');
        if (nameHint.includes('loss') || nameHint.includes('loss_averse') || nameHint.includes('loss-averse')) tags.push('LossAversion');
        if (nameHint.includes('revenge')) tags.push('RevengeTrading');

        return {
          id: `session-${sess.id}-${index}`,
          timestamp: tradeData.timestamp || new Date().toISOString(),
          asset: tradeData.asset || '',
          side: (tradeData.side?.toLowerCase() === 'buy' ? 'buy' : 'sell') as 'buy' | 'sell',
          quantity: parseFloat(tradeData.quantity || '0'),
          entry_price: parseFloat(tradeData.entry_price || tradeData.entryprice || '0'),
          exit_price: parseFloat(tradeData.exit_price || tradeData.exitprice || '0'),
          profit_loss: parseFloat(tradeData.profit_loss || tradeData.profitloss || tradeData.p_l || tradeData.pl || '0'),
          balance: parseFloat(tradeData.balance || '0'),
          biasTags: tags,
        };
      });

      setTrades(tradesParsed);
      setAnalysis(generateDummyAnalysis(tradesParsed));
      setCurrentPage('analysis');
    } catch (err) {
      console.error('Error loading session:', err);
      alert('Error loading session CSV.');
    } finally {
      const elapsed = Date.now() - loadingStartedAt;
      const minVisibleMs = 450;
      if (elapsed < minVisibleMs) {
        await new Promise((resolve) => setTimeout(resolve, minVisibleMs - elapsed));
      }
      setDataLoading(false);
    }
  };

  const handleDeleteSession = async (sess: UploadSession) => {
    if (!session?.user?.id || !sess?.id) return;

    try {
      if (sess.path) {
        const { error: removeError } = await supabase.storage.from('uploads').remove([sess.path]);
        if (removeError) {
          console.warn('Could not remove storage object:', removeError.message);
        }
      }

      const { error } = await supabase.from('upload_sessions').delete().eq('id', sess.id).eq('user_id', session.user.id);
      if (error) {
        console.error('Error deleting upload session:', error);
        alert('Could not delete upload session.');
        return;
      }

      await loadSessions(session.user.id);
    } catch (err) {
      console.error('Error deleting upload session:', err);
      alert('Could not delete upload session.');
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      if (!mounted) return;
      setSession(res.data.session ?? null);
      setAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event: string, currentSession: Session | null) => {
      setSession(currentSession ?? null);
      setAuthLoading(false);
      setAuthError(null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      loadLocalTrades();
      return;
    }

    loadRemoteTrades(session.user.id);
    loadSessions(session.user.id);
  }, [session?.user?.id, loadLocalTrades, loadRemoteTrades, loadSessions]);

  const handleSignIn = async (email: string, password: string) => {
    setAuthSubmitLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setAuthSubmitLoading(false);

    if (error) setAuthError(error.message);
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
    setDataLoadingMessage('Processing your trades...');
    setDataLoading(true);
    try {
      try {
        await saveTradesLocal(newTrades);
        setTrades(newTrades);
        setAnalysis(generateDummyAnalysis(newTrades));
      } catch (e) {
        console.error('Error saving trades locally:', e);
        alert('Error saving trades locally. Please try again.');
        return;
      }

      if (session?.user?.id) {
        try {
          // Prepare rows for insertion to Supabase (exclude local-only `id`)
          const rows = newTrades.map((t) => ({
            timestamp: t.timestamp,
            asset: (t.asset || '').trim(),
            side: t.side === 'buy' || t.side === 'sell' ? t.side : 'sell',
            quantity: Number(t.quantity),
            entry_price: Number(t.entry_price),
            exit_price: Number(t.exit_price),
            profit_loss: Number(t.profit_loss),
            balance: Math.max(0, Number(t.balance)),
          }));

          // Filter out invalid rows that would violate DB constraints
          const validRows = rows.filter(
            (r) =>
              r.timestamp &&
              r.asset &&
              (r.side === 'buy' || r.side === 'sell') &&
              Number.isFinite(r.quantity) &&
              Number.isFinite(r.entry_price) &&
              Number.isFinite(r.exit_price) &&
              Number.isFinite(r.profit_loss) &&
              Number.isFinite(r.balance) &&
              r.quantity > 0 &&
              r.entry_price > 0 &&
              r.exit_price > 0 &&
              r.balance >= 0
          );

          if (validRows.length < rows.length) {
            console.warn(`Skipped ${rows.length - validRows.length} invalid row(s) before Supabase insert.`);
          }

          const { error: deleteError } = await supabase
            .from('trades')
            .delete()
            .eq('user_id', session.user.id);

          if (deleteError) {
            console.error('Error clearing previous trades in supabase:', deleteError);
          }

          if (validRows.length > 0) {
            const { error } = await supabase.from('trades').insert(validRows);
            if (error) {
              console.error('Error inserting trades to supabase:', error);
            }
          } else {
            console.warn('No valid rows available for Supabase insert after normalization.');
          }
        } catch (err) {
          console.error('Error uploading trades to supabase:', err);
        }

        await loadRemoteTrades(session.user.id);
        await loadSessions(session.user.id);
      }

      setCurrentPage('analysis');
    } finally {
      setDataLoading(false);
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
      <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} loading={authSubmitLoading} error={authError} />
    );
  }

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSignOut={handleSignOut}
        userEmail={session.user.email || ''}
      >
        {currentPage === 'dashboard' ? (
          <div className="space-y-8">
            <div className="w-full max-w-3xl mx-auto">
              <UploadTrades
                onTradesUploaded={handleTradesUploaded}
                sessions={sessions}
                onOpenSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          </div>
        ) : currentPage === 'analysis' ? (
          <div className="space-y-8">
            <div className="w-full max-w-3xl mx-auto">
              <UploadTrades
                onTradesUploaded={handleTradesUploaded}
                sessions={sessions}
                onOpenSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
              />
            </div>
            <AnalysisPage trades={trades} analysis={analysis} />
          </div>
        ) : (
          <FAQPage />
        )}
      </Layout>

      {dataLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/85 shadow-2xl p-7 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
            <p className="text-gray-900 font-semibold">{dataLoadingMessage}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
