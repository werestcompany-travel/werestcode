'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AuthUser { id: string; name: string; email: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
  /** Which step the modal starts on when opened. Defaults to 'email'. */
  initialStep?: 'email' | 'register';
}

export default function AuthModal({ open, onClose, onSuccess, initialStep = 'email' }: Props) {
  const [step,     setStep]     = useState<'email' | 'password' | 'register'>(initialStep);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  /* ── Animation state ── */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const rafRef        = useRef<number>(0);
  // keep latest initialStep readable inside the effect without adding it as dep
  const initialStepRef = useRef(initialStep);
  initialStepRef.current = initialStep;

  useEffect(() => {
    if (open) {
      setStep(initialStepRef.current);
      setMounted(true);
      // double-RAF so CSS transition triggers after the element is painted
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(rafRef.current);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        // reset form fields after fade-out
        setEmail(''); setPassword(''); setName(''); setPhone('');
        setError(''); setShowPw(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]); // intentionally omit initialStep — read from ref

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ── Close on Escape ── */
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
    setError('');
    setStep('password');
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
      onClose();
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
      onClose();
    } finally { setLoading(false); }
  };

  if (!mounted) return null;

  return (
    /* ── Backdrop + centering container ── */
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* ── Modal card — scale + fade ── */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-[740px] flex overflow-hidden transition-all duration-300 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Left: form panel ── */}
        <div className="flex-1 px-9 py-9 min-w-0">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">
            {step === 'register' ? 'Create your account' : 'Sign in / Register'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span>🏆 Membership rewards</span>
            <span>✅ Manage bookings with ease</span>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Step 1 — Email */}
          {step === 'email' && (
            <form onSubmit={handleContinueEmail} className="space-y-3">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Please enter an email address"
                required autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#1a1f35] hover:bg-[#252b47] transition-colors">
                Continue with email
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <SocialBtn icon="google"   label="Continue with Google" />
              <SocialBtn icon="apple"    label="Continue with Apple" />
              <SocialBtn icon="facebook" label="Continue with Facebook" />
            </form>
          )}

          {/* Step 2 — Password */}
          {step === 'password' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium truncate">{email}</span>
              </div>

              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required autoFocus
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Sign in
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <a href="/auth/forgot" className="text-brand-600 hover:underline font-medium">
                  Forgot password?
                </a>
                <button type="button" onClick={() => { setStep('register'); setError(''); }}
                  className="text-gray-500 hover:text-gray-700">
                  New here?{' '}
                  <span className="text-brand-600 font-semibold">Create account</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Register */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">Back to sign in</span>
              </div>

              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" required autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)" required
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Create account
              </button>
            </form>
          )}

          <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
            By signing in or registering, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600">Terms &amp; Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>

        {/* ── Right: branding panel ── */}
        <div className="hidden sm:flex w-60 bg-[#f3f4f8] flex-col items-center justify-center px-7 py-10 gap-5 shrink-0 border-l border-gray-100">
          <Image src="/images/logo.png" alt="Werest Travel" width={110} height={34} className="object-contain" />
          <div className="w-full">
            <p className="text-sm font-bold text-gray-800 mb-3 text-center">Why join Werest?</p>
            <ul className="space-y-2.5">
              {[
                ['🎁', '10% off your first transfer'],
                ['🛡️', 'Free cancellation up to 24h'],
                ['⭐', 'Earn points on every trip'],
                ['💬', '24/7 WhatsApp support'],
                ['✈️', 'Airport pickups from ฿900'],
              ].map(([emoji, text]) => (
                <li key={text} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                  <span className="shrink-0">{emoji}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full h-px bg-gray-200" />
          <p className="text-[10px] text-gray-400 text-center leading-snug">
            10,000+ happy travellers<br />Thailand&apos;s #1 private transfer
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Social login placeholder button ─────────────────────────────────────── */

function SocialBtn({ icon, label }: { icon: 'google' | 'apple' | 'facebook'; label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {icon === 'google' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {icon === 'apple' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.33 3.1-2.53 4.08M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
        </svg>
      )}
      {icon === 'facebook' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {label}
      <span className="ml-auto text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
    </button>
  );
}
