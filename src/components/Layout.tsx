import { ReactNode, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: 'dashboard' | 'faq' | 'analysis') => void;
  currentPage: 'dashboard' | 'faq' | 'analysis';
  userEmail?: string;
  onSignOut?: () => void | Promise<void>;
  sessions?: any[];
  onSelectSession?: (s: any) => void;
}

export default function Layout({ children, onNavigate, currentPage, userEmail, onSignOut, sessions = [], onSelectSession }: LayoutProps) {
  const [sessionsOpen, setSessionsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center backdrop-blur-lg shadow-lg shadow-red-500/50">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bias Detector</h1>
                <p className="text-sm text-red-200">Trading Psychology Analysis</p>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('analysis')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'analysis'
                    ? 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Analysis
              </button>
              <div className="relative">
                <button
                  onClick={() => setSessionsOpen((v) => !v)}
                  className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-all"
                >
                  Sessions
                </button>

                {sessionsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/90 border border-white/10 rounded-lg shadow-lg p-2 z-50">
                    {sessions.length === 0 ? (
                      <div className="p-3 text-sm text-white/60">No previous sessions</div>
                    ) : (
                      sessions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSessionsOpen(false);
                            onSelectSession && onSelectSession(s);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-md text-sm text-white/80"
                        >
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-white/50">{new Date(s.created_at).toLocaleString()}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => onNavigate('faq')}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
              >
                Learn More
              </button>
              {userEmail ? <span className="text-sm text-white/70 hidden xl:inline">{userEmail}</span> : null}
              {onSignOut ? (
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-all"
                >
                  Sign Out
                </button>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
