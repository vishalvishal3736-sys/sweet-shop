// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';      // Using @ alias for cleaner imports
import { SHOP_CONFIG } from '@/lib/config';
import { AuthError } from '@supabase/supabase-js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // On mobile: always require fresh login (sign out any stale session)
  // On desktop: auto-redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Always sign out on mobile so admin must re-enter credentials
        await supabase.auth.signOut();
        return;
      }

      // Desktop: check if already logged in and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/admin/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-5 sm:p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Admin Login</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Sign in to manage {SHOP_CONFIG.name}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="admin@girishsweets.in"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-white font-bold rounded-lg transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
            style={{ backgroundColor: SHOP_CONFIG.themeColor }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Optional hint for demo purposes – remove in production */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Use your admin email and Supabase password.
        </p>
      </div>
    </div>
  );
}