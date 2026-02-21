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
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-attachment-fixed"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <header className="backdrop-blur-xl bg-white/75 border-b-2 border-white/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/BetterNBlogo.png" alt="Logo" className="h-12 w-auto drop-shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bias Detector</h1>
                <p className="text-sm text-red-700 font-medium">Trading Psychology Analysis</p>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-white/35 text-gray-900 backdrop-blur-md border-2 border-red-500 shadow-md'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/20 border-2 border-transparent'
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
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium font-semibold border-2 border-red-700 hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/40"
              >
                Learn More
              </button>
              {userEmail ? <span className="text-sm text-gray-700 hidden xl:inline font-medium">{userEmail}</span> : null}
              {onSignOut ? (
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 hover:bg-white/40 transition-all backdrop-blur-md bg-white/25 font-medium shadow-md hover:shadow-lg"
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
