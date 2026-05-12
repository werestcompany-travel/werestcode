'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface NotifyMeModalProps {
  tourSlug:  string
  tourTitle: string
  onClose:   () => void
}

export default function NotifyMeModal({ tourSlug, tourTitle, onClose }: NotifyMeModalProps) {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/tours/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tourSlug }),
      })
    } catch {
      // ignore — treat as success
    }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">You&apos;re on the list!</h3>
            <p className="text-sm text-gray-500">
              We&apos;ll email you as soon as spots open up for <span className="font-medium">{tourTitle}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full bg-[#2534ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Notify me when available</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium text-gray-700">{tourTitle}</span> is currently sold out. Enter your email and we&apos;ll let you know when spots open up.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30 focus:border-[#2534ff] transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2534ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Notify me when available'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
