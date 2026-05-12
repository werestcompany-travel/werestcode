'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type PaymentState = 'loading' | 'success' | 'failed' | 'pending'

function PaymentResultInner() {
  const params  = useSearchParams()
  const router  = useRouter()
  const [state,           setState]           = useState<PaymentState>('loading')
  const [bookingRef,      setBookingRef]      = useState<string | null>(null)
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null)

  // Payso returns query params on frontendReturnUrl
  // Common params: orderId, status, txnId, amount
  const orderId = params.get('orderId') ?? params.get('order_id') ?? params.get('ref')
  const status  = params.get('status')  ?? params.get('paymentStatus')

  useEffect(() => {
    if (!orderId) { setState('failed'); return }

    // Poll our API to get the latest payment status (webhook may arrive before redirect)
    const checkStatus = async () => {
      try {
        const res  = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`)
        const json = await res.json()
        if (!json.success) { setState('failed'); return }

        setBookingRef(json.data.bookingRef)
        setConfirmationUrl(json.data.confirmationUrl ?? null)

        const ps = json.data.paymentStatus
        if (ps === 'PAID')              setState('success')
        else if (ps === 'FAILED')       setState('failed')
        else if (status === 'SUCCESS')  setState('success')
        else if (status === 'FAILED')   setState('failed')
        else                            setState('pending')
      } catch {
        // Fall back to query-param status from Payso redirect
        if (status === 'SUCCESS')     setState('success')
        else if (status === 'FAILED') setState('failed')
        else                          setState('pending')
      }
    }

    checkStatus()
  }, [orderId, status])

  // Auto-redirect to confirmation on success
  useEffect(() => {
    if (state === 'success' && confirmationUrl) {
      const timer = setTimeout(() => router.push(confirmationUrl), 2500)
      return () => clearTimeout(timer)
    }
  }, [state, confirmationUrl, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full">

          {state === 'loading' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <RefreshCw className="w-8 h-8 text-[#2534ff] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying payment…</h1>
              <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Payso.</p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
              <p className="text-gray-500 text-sm mb-2">
                Your booking <span className="font-semibold text-gray-800">{bookingRef ?? orderId}</span> is confirmed.
              </p>
              <p className="text-gray-400 text-xs mb-8">Redirecting to your booking details…</p>
              {confirmationUrl && (
                <Link
                  href={confirmationUrl}
                  className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1e2ce6] transition-colors"
                >
                  View booking details <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}

          {state === 'failed' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment failed</h1>
              <p className="text-gray-500 text-sm mb-8">
                Your card was not charged. Please try again or choose a different payment method.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
                >
                  ← Go back
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl bg-[#2534ff] text-white text-sm font-semibold hover:bg-[#1e2ce6] transition-colors"
                >
                  Start new booking
                </Link>
              </div>
            </div>
          )}

          {state === 'pending' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment pending</h1>
              <p className="text-gray-500 text-sm mb-8">
                We&apos;re waiting for payment confirmation. You&apos;ll receive a confirmation email once it&apos;s verified.
              </p>
              <p className="text-xs text-gray-400">Reference: <span className="font-semibold">{orderId}</span></p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense>
      <PaymentResultInner />
    </Suspense>
  )
}
