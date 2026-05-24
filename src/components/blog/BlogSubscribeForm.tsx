'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

export default function BlogSubscribeForm() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [msg,    setMsg]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res  = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data: { success?: boolean; error?: string } = await res.json();
      if (data.success)                      setStatus('success');
      else if (data.error === 'Already subscribed') setStatus('duplicate');
      else { setMsg(data.error ?? 'Something went wrong.'); setStatus('error'); }
    } catch {
      setMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-[#2534ff] font-semibold text-sm">
        ✓ You&apos;re subscribed! Check your inbox for your 10% off code.
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 w-full sm:w-auto border border-gray-200 rounded-full px-5 py-3 text-sm text-gray-700 outline-none focus:border-[#2534ff] shadow-sm placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#2534ff] hover:bg-[#1e2ce6] disabled:opacity-70 text-white font-bold px-7 py-3 rounded-full text-sm transition-colors shadow-md whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {status === 'duplicate' && (
        <p className="mt-3 text-amber-600 text-sm font-medium">You&apos;re already subscribed — check your inbox!</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-red-500 text-sm font-medium">{msg}</p>
      )}
    </>
  );
}
