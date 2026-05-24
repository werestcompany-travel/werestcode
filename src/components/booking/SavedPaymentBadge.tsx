'use client'

import { useEffect, useState } from 'react'
import { Zap, CheckCircle2 } from 'lucide-react'

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Credit Card',
  PROMPTPAY:   'PromptPay',
  QR_CODE:     'QR Code',
}

interface PaymentPreferenceResponse {
  preferredPaymentMethod: string | null
  lastPaymentAt: string | null
}

/**
 * Displays a "Quick checkout with [method]" badge when the logged-in user
 * has a saved payment preference. Shows nothing if not logged in or no preference.
 */
export default function SavedPaymentBadge() {
  const [method, setMethod] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    fetch('/api/user/payment-preference')
      .then(r => r.ok ? r.json() as Promise<PaymentPreferenceResponse> : null)
      .then(data => {
        if (data?.preferredPaymentMethod) setMethod(data.preferredPaymentMethod)
      })
      .catch(() => {/* not logged in or network error — silently hide */})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !method) return null

  const label = METHOD_LABELS[method] ?? method

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setShowTip(prev => !prev)}
        className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
        aria-label={`Quick checkout with ${label}`}
      >
        <Zap className="w-3.5 h-3.5 text-green-500 fill-green-500" />
        Quick checkout with {label}
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      </button>

      {showTip && (
        <div
          className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs text-gray-600 z-10"
          role="tooltip"
        >
          <p className="font-semibold text-gray-800 mb-1">Saved payment method</p>
          <p>
            Your preferred payment method is <span className="font-bold text-green-700">{label}</span>.
            It will be pre-selected at checkout automatically.
          </p>
          <button
            onClick={() => setShowTip(false)}
            className="mt-2 text-brand-600 font-semibold hover:underline"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
