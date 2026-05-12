'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function FooterNewsletter() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res  = await fetch('/api/newsletter/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('You\'re in! Check your inbox for 10% off.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Try again.');
    }
  }

  return (
    <div className="border-b border-gray-700 pb-10 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-base">Get exclusive deals &amp; travel tips</p>
          <p className="text-gray-400 text-sm mt-0.5">Subscribe and get 10% off your first booking.</p>
        </div>

        {status === 'success' ? (
          <p className="text-emerald-400 text-sm font-semibold">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 sm:w-56 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-400 transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 bg-[#2534ff] hover:bg-[#1e2ce6] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {status === 'loading' ? 'Sending…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}
    </div>
  );
}
