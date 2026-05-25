'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Admin2FAPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [useBackup]);

  function handleTokenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (!useBackup) {
      // Only allow digits for TOTP, max 6
      if (/^\d{0,6}$/.test(value)) setToken(value);
    } else {
      setToken(value.toUpperCase());
    }
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), useBackup }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error ?? 'Invalid code. Please try again.');
        setToken('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setUseBackup((prev) => !prev);
    setToken('');
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-gray-600">
            {useBackup
              ? 'Enter one of your backup codes to continue.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                {useBackup ? 'Backup code' : 'Authenticator code'}
              </label>
              <input
                ref={inputRef}
                id="token"
                type={useBackup ? 'text' : 'text'}
                inputMode={useBackup ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                value={token}
                onChange={handleTokenChange}
                placeholder={useBackup ? 'e.g. A1B2C3D4' : '000000'}
                maxLength={useBackup ? 8 : 6}
                className={`w-full px-4 py-3 rounded-xl border text-center text-xl font-mono tracking-widest
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                  ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!useBackup && token.length !== 6) || (useBackup && token.trim().length === 0)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl transition"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>

          {/* Toggle backup mode */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2 transition"
            >
              {useBackup
                ? 'Use authenticator app instead'
                : 'Use a backup code instead'}
            </button>
          </div>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/admin/login" className="text-gray-600 hover:text-gray-900 transition">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
