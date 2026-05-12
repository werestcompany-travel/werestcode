'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface BannerConfig {
  message: string
  bg: string
  href: string
}

function getBannerForMonth(month: number): BannerConfig {
  if (month === 2) {
    return {
      message: '🎉 Songkran Special — Use code SONGKRAN15 for 15% off!',
      bg: 'bg-orange-500',
      href: '/tours',
    }
  }
  if (month === 3) {
    return {
      message: '🌸 Summer Deals — Beat the heat with our island tours',
      bg: 'bg-teal-600',
      href: '/tours',
    }
  }
  if (month >= 4 && month <= 8) {
    return {
      message: '🌧️ Green Season — Lower prices, fewer crowds',
      bg: 'bg-green-600',
      href: '/tours',
    }
  }
  if (month === 9) {
    return {
      message: '🏮 Loy Krathong Festival — Book your Bangkok experience',
      bg: 'bg-purple-700',
      href: '/tours',
    }
  }
  // Nov–Feb (peak season): months 10, 11, 0, 1
  return {
    message: '☀️ Peak Season — Book early, availability is limited!',
    bg: 'bg-brand-600',
    href: '/tours',
  }
}

const DISMISS_KEY = 'werest_seasonal_banner_dismissed'
const DISMISS_TTL = 24 * 60 * 60 * 1000 // 24 hours in ms

export default function SeasonalBanner() {
  const [visible, setVisible] = useState(false)
  const [config, setConfig] = useState<BannerConfig | null>(null)

  useEffect(() => {
    // Check if dismissed within the last 24 h
    try {
      const stored = localStorage.getItem(DISMISS_KEY)
      if (stored) {
        const ts = parseInt(stored, 10)
        if (!isNaN(ts) && Date.now() - ts < DISMISS_TTL) return
      }
    } catch {
      // ignore
    }
    const month = new Date().getMonth() // 0-indexed
    setConfig(getBannerForMonth(month))
    setVisible(true)
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible || !config) return null

  return (
    <div className={`${config.bg} text-white`} role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <Link
          href={config.href}
          className="flex-1 text-sm font-semibold text-center hover:underline"
        >
          {config.message}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
