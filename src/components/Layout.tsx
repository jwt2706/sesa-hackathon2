import { ReactNode } from 'react';
import FlickeringGrid from './Background';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: 'dashboard' | 'faq' | 'analysis') => void;
  currentPage: 'dashboard' | 'faq' | 'analysis';
  userEmail?: string;
  onSignOut?: () => void | Promise<void>;
}

export default function Layout({ children, onNavigate, currentPage, userEmail, onSignOut }: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      <FlickeringGrid className="absolute inset-0 -z-10" />
      <header className="backdrop-blur-xl bg-white/75 border-b-2 border-white/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/BetterNBlogo.png" alt="Logo" className="h-12 w-auto drop-shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">National Bank Bias Detector</h1>
                <p className="text-sm text-red-700 font-medium">Trading Psychology Analysis</p>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate(currentPage === 'faq' ? 'dashboard' : 'faq')}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium font-semibold border-2 border-red-700 hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/40"
              >
                {currentPage === 'faq' ? 'Dashboard' : 'Learn More'}
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
