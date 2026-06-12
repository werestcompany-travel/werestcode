'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void
  }
}

const STORAGE_KEY = 'werest_cookie_consent'

interface ConsentChoices {
  analytics: boolean
  marketing: boolean
}

function loadGA(gaId: string) {
  if (document.getElementById('ga4-script')) return
  const s = document.createElement('script')
  s.id = 'ga4-script'
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  s.async = true
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gtag(...args: any[]) { window.dataLayer.push(args) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', gaId, { page_path: window.location.pathname })
}

function loadMetaPixel(pixelId: string) {
  if (document.getElementById('meta-pixel-script')) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = window as any
  if (f.fbq) return
  const n = (f.fbq = function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments)
  }) as any
  f._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  const s = document.createElement('script')
  s.id = 'meta-pixel-script'
  s.async = true
  s.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(s)
  f.fbq('init', pixelId)
  f.fbq('track', 'PageView')
}

function loadClarity(clarityId: string) {
  if (document.getElementById('ms-clarity-script')) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = window as any
  c.clarity = c.clarity || function () { (c.clarity.q = c.clarity.q || []).push(arguments) }
  const t = document.createElement('script')
  t.id = 'ms-clarity-script'
  t.async = true
  t.src = `https://www.clarity.ms/tag/${clarityId}`
  document.head.appendChild(t)
}

function applyConsent(choices: ConsentChoices) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  if (choices.analytics && gaId) loadGA(gaId)
  if (choices.analytics && clarityId) loadClarity(clarityId)
  if (choices.marketing && pixelId) loadMetaPixel(pixelId)
}

export default function ConsentAwareTracking() {
  useEffect(() => {
    // Load scripts if consent was already given in a previous session
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const choices: ConsentChoices = JSON.parse(stored)
        applyConsent(choices)
      }
    } catch {
      // ignore
    }

    // Listen for consent updates from CookieConsent banner
    function onConsentUpdate(e: Event) {
      const choices = (e as CustomEvent<ConsentChoices>).detail
      applyConsent(choices)
    }
    window.addEventListener('werest:consent-updated', onConsentUpdate)
    return () => window.removeEventListener('werest:consent-updated', onConsentUpdate)
  }, [])

  return null
}
