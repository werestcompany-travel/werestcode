'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

export default function NewsletterSection() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 800)
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center bg-brand-600 rounded-3xl px-8 py-12 shadow-blue-glow relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #a5abff, transparent)' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-15 blur-2xl"
          style={{ background: 'radial-gradient(circle, #7c85ff, transparent)' }} />

        <div className="relative z-10">
          <p className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-3">Stay inspired</p>
          <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">
            Get Thailand travel tips in your inbox
          </h2>
          <p className="text-brand-100/80 text-sm mb-8">
            Weekly guides, hidden gems and exclusive deals — straight from our travel experts.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 bg-white/15 border border-white/25 rounded-2xl px-6 py-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <p className="text-white font-semibold">You&apos;re subscribed! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors shrink-0 disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}

          <p className="text-brand-200/60 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
