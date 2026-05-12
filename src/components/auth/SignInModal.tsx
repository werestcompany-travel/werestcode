'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SignInModal({ open, onClose }: Props) {
  const router = useRouter();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Focus input when modal opens */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleContinueEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const encoded = encodeURIComponent(email.trim());
    router.push(`/auth/login?email=${encoded}`);
    onClose();
  };

  const handleGoogle = () => {
    router.push('/auth/login?provider=google');
    onClose();
  };

  const handleApple = () => {
    router.push('/auth/login?provider=apple');
    onClose();
  };

  const handleFacebook = () => {
    router.push('/auth/login?provider=facebook');
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[820px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ═══════════════════════════════════
            LEFT PANEL — Sign in form
        ═══════════════════════════════════ */}
        <div className="flex-1 px-8 py-9 flex flex-col">

          {/* Title */}
          <h2 className="text-[22px] font-bold text-gray-900 mb-3 text-center">
            Sign in/register
          </h2>

          {/* Benefit pills */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
              <span className="text-base">🏅</span> Membership rewards
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
              <span className="text-base">📋</span> Manage bookings with ease
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleContinueEmail} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter an email address"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#006aff] focus:ring-1 focus:ring-[#006aff] transition"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full py-3 rounded-lg text-sm font-bold transition-colors ${
                email.trim()
                  ? 'bg-[#006aff] text-white hover:bg-[#0055d4]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue with email
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-3">

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#1a73e8] hover:bg-[#1669d0] text-white text-sm font-bold transition-colors"
            >
              {/* Google G icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 text-sm font-bold transition-colors"
            >
              {/* Apple icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continue with Apple
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 text-sm font-bold transition-colors"
            >
              {/* Facebook icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </div>

          {/* Fine print */}
          <p className="mt-6 text-[11px] text-gray-400 leading-relaxed text-center">
            By signing in or registering, you are deemed to have agreed to the{' '}
            <a href="/terms" className="underline hover:text-gray-600">Terms and Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-gray-600">Privacy Statement</a>.
          </p>
        </div>

        {/* ═══════════════════════════════════
            RIGHT PANEL — Benefits / branding
        ═══════════════════════════════════ */}
        <div className="hidden md:flex flex-col items-center justify-center w-[300px] shrink-0 bg-[#f0f4ff] px-8 py-10 text-center">

          {/* Werest logo mark */}
          <div className="w-16 h-16 bg-[#2534ff] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
            <span className="text-white font-black text-2xl">W</span>
          </div>

          <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-snug">
            Welcome to<br />Werest Travel
          </h3>
          <p className="text-[12px] text-gray-500 mb-7 leading-relaxed">
            Your trusted partner for transfers, tours & attractions across Thailand
          </p>

          {/* Perks list */}
          <ul className="w-full text-left space-y-3">
            {[
              { icon: '🏅', text: 'Earn points on every booking' },
              { icon: '📋', text: 'Manage all bookings in one place' },
              { icon: '💰', text: 'Exclusive member-only discounts' },
              { icon: '⚡', text: 'Fast 30-second customer support' },
              { icon: '🔒', text: 'Secure, encrypted payments' },
            ].map((perk) => (
              <li key={perk.text} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2534ff]/10 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-[#2534ff]" />
                </span>
                <span className="text-[12px] text-gray-600 leading-snug">{perk.text}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
