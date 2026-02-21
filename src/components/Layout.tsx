import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: 'dashboard' | 'faq' | 'analysis') => void;
  currentPage: 'dashboard' | 'faq' | 'analysis';
}

export default function Layout({ children, onNavigate, currentPage }: LayoutProps) {
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
              <button
                onClick={() => onNavigate('faq')}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
              >
                Learn More
              </button>
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
