'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';

  const [email,             setEmail]             = useState('');
  const [password,          setPassword]          = useState('');
  const [showPw,            setShowPw]            = useState(false);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState('');
  const [unverifiedEmail,   setUnverifiedEmail]   = useState('');
  const [resendLoading,     setResendLoading]      = useState(false);
  const [resendSent,        setResendSent]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(email);
          setError('');
        } else {
          setError(data.error ?? 'Login failed.');
        }
        return;
      }
      router.push(redirect);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      await fetch('/api/user/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex pt-16">
      {/* â”€â”€ Left panel: hero image (hidden on mobile) â”€â”€ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"
          alt="Thailand travel"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-brand-800/60 to-black/50" />
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/">
            <span className="text-white font-extrabold text-2xl tracking-tight drop-shadow">Werest Travel</span>
          </Link>
          <div>
            <p className="text-white/90 text-xl font-semibold leading-snug mb-3">
              &ldquo;Every journey begins with a single step â€” let us make yours unforgettable.&rdquo;
            </p>
            <p className="text-white/60 text-sm">Discover Thailand with confidence</p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Right panel: form â”€â”€ */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to access your wishlist and bookings</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {unverifiedEmail && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-amber-800 text-sm font-semibold mb-1">Email not verified</p>
                  <p className="text-amber-700 text-xs leading-relaxed mb-2">
                    Please verify <strong>{unverifiedEmail}</strong> before signing in. Check your inbox (and spam folder).
                  </p>
                  {resendSent ? (
                    <p className="text-green-700 text-xs font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Verification email sent!
                    </p>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={resendLoading}
                      className="text-xs font-semibold text-amber-800 underline hover:text-amber-900 disabled:opacity-50">
                      {resendLoading ? 'Sendingâ€¦' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/auth/forgot" className="text-xs text-brand-600 font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.25)]">
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : <LogIn className="w-4 h-4" />}
                {loading ? 'Signing inâ€¦' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

