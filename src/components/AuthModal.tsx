'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';

interface AuthUser { id: string; name: string; email: string; }

interface Props {
  open:          boolean;
  onClose:       () => void;
  onSuccess?:    (user: AuthUser) => void;
  initialStep?:  'email' | 'register';
}

type Step = 'landing' | 'email' | 'password' | 'register';

export default function AuthModal({ open, onClose, onSuccess, initialStep = 'email' }: Props) {
  const [step,     setStep]     = useState<Step>('landing');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [mounted,  setMounted]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      setStep(initialStep === 'register' ? 'register' : 'landing');
      setMounted(true);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        setEmail(''); setPassword(''); setName(''); setPhone('');
        setError(''); setShowPw(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open, initialStep]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  /* ── Handlers ── */
  const handleContinueEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.'); return;
    }
    setError(''); setStep('password');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/user/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Incorrect email or password.'); return; }
      onSuccess?.(data.user);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/user/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return; }
      onSuccess?.(data.user);
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = '/api/user/auth/google';
  };

  const handleApple = () => {
    window.location.href = '/api/user/auth/apple';
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* ── Full-page white modal (Klook style) ── */}
      <div
        className={`absolute inset-0 bg-white flex flex-col transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-4'
        } sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-[420px] sm:rounded-2xl sm:shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <button type="button" onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700">
            <X className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center" onClick={onClose}>
            <Image src="/images/logo.png" alt="Werest Travel" width={90} height={26} className="object-contain" />
          </Link>
          <div className="w-9" />
        </div>

        {/* ── Body ── */}
        <div className="flex-1 px-6 pb-6">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* ── LANDING — Google / Email / Apple ── */}
          {step === 'landing' && (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Log in or sign up</h2>

              {/* Google */}
              <button type="button" onClick={handleGoogle}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors mb-3 text-sm font-semibold text-gray-800">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              {/* Email */}
              <button type="button" onClick={() => setStep('email')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-900 bg-white hover:bg-gray-50 transition-colors mb-3 text-sm font-semibold text-gray-900">
                <Mail className="w-5 h-5" />
                Email
              </button>

              {/* Apple */}
              <button type="button" onClick={handleApple}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black hover:bg-gray-900 transition-colors mb-6 text-sm font-semibold text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>

              <button type="button" onClick={() => setStep('email')}
                className="w-full text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors">
                More options
              </button>
            </>
          )}

          {/* ── EMAIL STEP ── */}
          {step === 'email' && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => { setStep('landing'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-xl font-extrabold text-gray-900">Continue with Email</h2>
              </div>
              <form onSubmit={handleContinueEmail} className="space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                <button type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#2534ff] hover:bg-[#1a27e0] transition-colors">
                  Continue
                </button>
              </form>
            </>
          )}

          {/* ── PASSWORD ── */}
          {step === 'password' && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Welcome back</h2>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              </div>
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required autoFocus
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#2534ff] hover:bg-[#1a27e0] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Sign in
                </button>
                <div className="flex items-center justify-between text-sm pt-1">
                  <a href="/auth/forgot" className="text-[#2534ff] hover:underline font-medium text-xs">Forgot password?</a>
                  <button type="button" onClick={() => { setStep('register'); setError(''); }}
                    className="text-xs text-gray-500 hover:text-gray-700">
                    New? <span className="text-[#2534ff] font-semibold">Create account</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── REGISTER ── */}
          {step === 'register' && (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => { setStep('landing'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-xl font-extrabold text-gray-900">Create account</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-3">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full name" required autoFocus
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min 8 characters)" required minLength={8}
                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]" />
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#2534ff] hover:bg-[#1a27e0] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Create account
                </button>
                <button type="button" onClick={() => { setStep('password'); setError(''); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 text-center">
                  Already have an account? <span className="text-[#2534ff] font-semibold">Sign in</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Footer legal ── */}
        <div className="px-6 pb-8 pt-2 shrink-0">
          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            By signing in or registering, you acknowledge and agree to Werest Travel&apos;s{' '}
            <a href="/legal/terms" className="underline hover:text-gray-600" onClick={onClose}>Terms of Use</a>
            {' '}and{' '}
            <a href="/legal/privacy" className="underline hover:text-gray-600" onClick={onClose}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Backdrop for desktop */}
      <div className="hidden sm:block absolute inset-0 -z-10 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
}

