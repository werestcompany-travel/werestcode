'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error   = searchParams.get('error');

  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [resendError, setResendError] = useState('');

  async function handleResend() {
    setResendState('loading');
    setResendError('');
    try {
      const res = await fetch('/api/user/resend-verification', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setResendError(data.error ?? 'Failed to send email. Please try again.');
        setResendState('error');
        return;
      }
      setResendState('sent');
    } catch {
      setResendError('Network error. Please try again.');
      setResendState('error');
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar transparent />

      <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md">

          {/* ── Success state ── */}
          {success === '1' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Email verified!</h1>
              <p className="text-gray-500 text-sm mb-8">
                Your account is now active. You can book tours and transfers and receive confirmation emails.
              </p>
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.25)]"
              >
                Continue to Account →
              </Link>
            </div>
          )}

          {/* ── Error state ── */}
          {!success && error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-9 h-9 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verification failed</h1>
              <p className="text-gray-500 text-sm mb-6">
                {decodeURIComponent(error)}
              </p>

              {resendState === 'sent' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
                  A new verification email has been sent. Please check your inbox.
                </div>
              ) : (
                <>
                  {resendState === 'error' && resendError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                      {resendError}
                    </div>
                  )}
                  <button
                    onClick={handleResend}
                    disabled={resendState === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.25)]"
                  >
                    {resendState === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    Resend verification email
                  </button>
                </>
              )}

              <p className="text-center text-sm text-gray-400 mt-5">
                Need help?{' '}
                <Link href="/" className="text-brand-600 font-semibold hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          )}

          {/* ── Default: "check your inbox" state ── */}
          {!success && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Mail className="w-9 h-9 text-brand-500" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                We sent a verification link to your email address. Click it to activate your account.
                The link expires in 24 hours.
              </p>

              {resendState === 'sent' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                  A new verification email has been sent. Please check your inbox.
                </div>
              ) : (
                <>
                  {resendState === 'error' && resendError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                      {resendError}
                    </div>
                  )}
                  <button
                    onClick={handleResend}
                    disabled={resendState === 'loading'}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                  >
                    {resendState === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {resendState === 'loading' ? 'Sending…' : 'Resend verification email'}
                  </button>
                </>
              )}

              <p className="text-center text-sm text-gray-400 mt-6">
                Wrong account?{' '}
                <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">
                  Sign in with a different email
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
