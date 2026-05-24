'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, AlertCircle, Loader2 } from 'lucide-react';

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+66');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authed, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('driver_token');
    if (token) router.replace('/driver');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim() === '+66') {
      setError('Please enter your phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/driver/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Login failed');
      }

      localStorage.setItem('driver_token', json.data.token);
      localStorage.setItem('driver_name', json.data.driverName);
      router.replace('/driver');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#2534ff] flex flex-col items-center justify-center px-6">
      {/* Logo mark */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-4 shadow-lg">
          <span className="text-4xl font-black text-white">W</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome, Driver</h1>
        <p className="text-blue-200 text-sm mt-1">Log in with your registered phone number</p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-5"
      >
        {/* Phone input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+66 81 234 5678"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2534ff] focus:border-transparent placeholder:text-gray-400"
              inputMode="tel"
              autoComplete="tel"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Thai format: +66 8X XXX XXXX</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a24e0] active:bg-[#1520c0] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Logging in…
            </>
          ) : (
            'Login'
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your account is set up by Werest admin.
          <br />
          Contact support if you cannot log in.
        </p>
      </form>
    </main>
  );
}
