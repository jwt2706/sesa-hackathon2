import { FormEvent, useState } from 'react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function AuthForm({ onSignIn, onSignUp, loading, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    if (mode === 'signin') {
      await onSignIn(email, password);
      return;
    }

    await onSignUp(email, password);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center px-6"
      style={{
        backgroundImage: 'url(/bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-8 shadow-2xl shadow-black/30">
        <div className="mb-6 text-center">
          <img src="/BetterNBlogo.png" alt="BetterNB Logo" className="h-28 w-auto mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-gray-900">National Bank</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Bias Detector</h2>
          <p className="text-red-700 mt-1 font-semibold">Sign in to continue</p>
        </div>

        <div className="flex rounded-lg bg-white/20 p-1 mb-6 border-2 border-gray-300">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white/40 text-gray-900 border-2 border-red-500 shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white/40 text-gray-900 border-2 border-red-500 shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-800 mb-1 font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/30 border-2 border-gray-300 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-800 mb-1 font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg bg-white/30 border-2 border-gray-300 text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm"
              placeholder="At least 6 characters"
            />
          </div>

          {error ? <p className="text-sm text-red-700 font-semibold">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold border-2 border-red-700 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}