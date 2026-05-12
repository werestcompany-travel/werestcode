'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ConsentChoices {
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'werest_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      // ignore
    }
  }, [])

  function save(choices: ConsentChoices) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choices))
    } catch {
      // ignore
    }
    setVisible(false)
  }

  function acceptAll() {
    save({ analytics: true, marketing: true })
  }

  function rejectNonEssential() {
    save({ analytics: false, marketing: false })
  }

  function savePreferences() {
    save({ analytics, marketing })
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-500 ease-out translate-y-0"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
        {/* Main row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          {/* Text */}
          <p className="text-sm text-gray-600 flex-1">
            <span className="mr-1.5" aria-hidden="true">🍪</span>
            We use cookies to improve your experience, analyse site traffic, and personalise content.{' '}
            <Link href="/privacy-policy" className="underline text-gray-800 hover:text-brand-600 transition-colors">
              Learn more
            </Link>
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="px-2 py-2 text-sm text-gray-500 hover:text-gray-800 underline transition-colors"
            >
              Manage Preferences
            </button>
          </div>
        </div>

        {/* Expanded preferences panel */}
        {expanded && (
          <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
            {/* Necessary — always on */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Necessary</p>
                <p className="text-xs text-gray-500">Required for the site to function. Cannot be disabled.</p>
              </div>
              <div
                className="w-10 h-6 rounded-full bg-brand-600 flex items-center justify-end px-1 cursor-not-allowed opacity-70"
                aria-label="Always on"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Analytics</p>
                <p className="text-xs text-gray-500">Helps us understand how visitors use the site (Google Analytics 4).</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(a => !a)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${analytics ? 'bg-brand-600 justify-end' : 'bg-gray-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Marketing</p>
                <p className="text-xs text-gray-500">Used for personalised ads and promotions (optional).</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={marketing}
                onClick={() => setMarketing(m => !m)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${marketing ? 'bg-brand-600 justify-end' : 'bg-gray-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>

            <button
              type="button"
              onClick={savePreferences}
              className="self-start mt-1 px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
