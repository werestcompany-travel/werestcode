'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'duplicate'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data: { success?: boolean; error?: string } = await res.json()
      if (data.success) {
        setStatus('success')
      } else if (data.error === 'Already subscribed') {
        setStatus('duplicate')
      } else {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="py-16"
      style={{ background: 'linear-gradient(135deg, #2534ff 0%, #4338ca 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
          Exclusive Deals
        </p>
        <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Get Exclusive Thailand Travel Deals
        </h2>
        <p className="text-white/70 text-sm mb-2">
          Join 3,200+ travellers. Get deals, tips, and early access to new tours.
        </p>
        <p className="text-white font-semibold text-sm mb-8">
          Subscribe and get 10% off your first booking
        </p>

        {status === 'success' ? (
          <div className="bg-white/15 border border-white/30 rounded-2xl px-6 py-6 text-white">
            <p className="text-xl font-bold mb-1">You&apos;re subscribed!</p>
            <p className="text-white/80 text-sm mb-3">Check your email for your 10% off code.</p>
            <div className="inline-flex items-center gap-2 bg-white text-brand-700 font-extrabold text-lg px-6 py-2 rounded-xl">
              WELCOME10
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-white/60 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-70 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'duplicate' && (
          <p className="mt-3 text-yellow-300 text-sm font-medium">
            You&apos;re already subscribed — check your inbox for your discount code!
          </p>
        )}

        {status === 'error' && (
          <p className="mt-3 text-red-300 text-sm font-medium">{errorMsg}</p>
        )}
      </div>
    </section>
  )
}
