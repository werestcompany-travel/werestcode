'use client'

import { useState } from 'react'

interface PayNowButtonProps {
  bookingId: string
  amount: number
  paymentStatus?: string | null
}

export default function PayNowButton({ bookingId, amount, paymentStatus }: PayNowButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayNow = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/transfer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
      })
      const json = await res.json()
      if (!json.success || !json.data?.paymentUrl) {
        window.alert(json.error ?? 'Failed to create payment. Please try again.')
        return
      }
      window.location.href = json.data.paymentUrl
    } catch {
      window.alert('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (paymentStatus === 'PAID') {
    return (
      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-2xl py-4 px-6 text-sm font-semibold">
        <span>✅</span>
        <span>Payment Complete</span>
      </div>
    )
  }

  if (paymentStatus === 'AWAITING_PAYMENT') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-800 text-sm font-semibold">
          <span>⏳</span>
          <span>Payment Pending</span>
        </div>
        <button
          onClick={handlePayNow}
          disabled={loading}
          className="text-xs text-yellow-700 underline underline-offset-2 hover:text-yellow-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Check Status / Pay Again'}
        </button>
      </div>
    )
  }

  // null / 'UNPAID' / undefined — show Pay Now button
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <button
      onClick={handlePayNow}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 px-6 text-white text-sm font-bold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: '#2534ff' }}
    >
      {loading ? (
        <span>Redirecting to payment…</span>
      ) : (
        <>
          <span>💳</span>
          <span>Pay Online Now — ฿{formatted}</span>
        </>
      )}
    </button>
  )
}
