'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, ChevronDown, ChevronUp, Shield, CheckCircle2, ArrowRight, X, Loader2 } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

interface TourBookingPanelProps {
  tour: Tour
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

export default function TourBookingPanel({ tour }: TourBookingPanelProps) {
  const router = useRouter()

  const today = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedOption, setSelectedOption] = useState(tour.options[0]?.id ?? '')
  const [adults,   setAdults]   = useState(2)
  const [children, setChildren] = useState(0)
  const [showPaxDropdown, setShowPaxDropdown] = useState(false)

  // Customer form state
  const [showForm,       setShowForm]       = useState(false)
  const [customerName,   setCustomerName]   = useState('')
  const [customerEmail,  setCustomerEmail]  = useState('')
  const [customerPhone,  setCustomerPhone]  = useState('')
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [submitError,    setSubmitError]    = useState<string | null>(null)

  const chosenOption = tour.options.find(o => o.id === selectedOption) ?? tour.options[0]
  const subtotal = useMemo(
    () => adults * (chosenOption?.pricePerPerson ?? 0) + children * (chosenOption?.childPrice ?? 0),
    [adults, children, chosenOption],
  )

  const calDays = generateCalendarDays(calYear, calMonth)
  const isToday = (d: number) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
  const isPast  = (d: number) => new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const selectedDate = selectedDay
    ? new Date(calYear, calMonth, selectedDay)
    : null

  const selectedDateStr = selectedDay
    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null

  const canBook = !!selectedDay && !!selectedOption && adults > 0

  const handleBook = () => {
    if (!canBook) return
    setSubmitError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDateStr || !chosenOption) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/tour-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourSlug:      tour.slug,
          tourTitle:     tour.title,
          optionLabel:   chosenOption.label ?? chosenOption.time,
          bookingDate:   selectedDateStr,
          adultQty:      adults,
          childQty:      children,
          adultPrice:    chosenOption.pricePerPerson,
          childPrice:    chosenOption.childPrice,
          totalPrice:    subtotal,
          customerName,
          customerEmail,
          customerPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error ?? 'Failed to create booking. Please try again.')
        return
      }

      router.push(`/tours/confirmation/${data.bookingRef}`)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Price header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">From</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatTHB(Math.min(...tour.options.map(o => o.pricePerPerson)))}
            </span>
            <span className="text-sm text-gray-400">/ person</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-green-600 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Free cancellation up to 24h before
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Date picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <Calendar className="w-4 h-4 text-brand-600" />
              Select Date
            </label>
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                ‹
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {MONTHS[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                ›
              </button>
            </div>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 text-center mb-1">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <span key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</span>
              ))}
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {calDays.map((d, i) => (
                <div key={i} className="flex items-center justify-center">
                  {d == null ? <span /> : (
                    <button
                      disabled={isPast(d)}
                      onClick={() => setSelectedDay(d)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors
                        ${isPast(d) ? 'text-gray-200 cursor-not-allowed' : ''}
                        ${d === selectedDay && !isPast(d) ? 'bg-brand-600 text-white font-bold' : ''}
                        ${isToday(d) && d !== selectedDay ? 'ring-2 ring-brand-400 text-brand-600 font-bold' : ''}
                        ${!isPast(d) && d !== selectedDay ? 'hover:bg-brand-50 hover:text-brand-700 text-gray-700' : ''}
                      `}
                    >
                      {d}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time / option selector */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">Select Time</label>
            <div className="space-y-2">
              {tour.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  disabled={opt.availability === 'full'}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-colors text-left
                    ${opt.id === selectedOption
                      ? 'border-brand-500 bg-brand-50'
                      : opt.availability === 'full'
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/40'
                    }
                  `}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{opt.time}</p>
                    {opt.label && <p className="text-xs text-gray-500">{opt.label}</p>}
                    {opt.availability === 'limited' && (
                      <p className="text-xs font-semibold text-amber-600 mt-0.5">Limited spots</p>
                    )}
                    {opt.availability === 'full' && (
                      <p className="text-xs font-semibold text-red-500 mt-0.5">Sold out</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">{formatTHB(opt.pricePerPerson)}</p>
                    <p className="text-[10px] text-gray-400">adult</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">Participants</label>
            <button
              onClick={() => setShowPaxDropdown(p => !p)}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 hover:border-brand-300 px-4 py-3 bg-white transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-brand-500" />
                <span>{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}</span>
              </div>
              {showPaxDropdown
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showPaxDropdown && (
              <div className="mt-2 rounded-xl border border-gray-200 bg-white shadow-lg p-4 space-y-3">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Adults</p>
                    <p className="text-xs text-gray-400">Age 12+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdults(a => Math.max(1, a - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-brand-500 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >−</button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-sm">{adults}</span>
                    <button
                      onClick={() => setAdults(a => Math.min(tour.maxGroupSize, a + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-brand-500 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
                {/* Children */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Children</p>
                    <p className="text-xs text-gray-400">
                      Age 3–11 · {formatTHB(chosenOption?.childPrice ?? 0)}/child
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChildren(c => Math.max(0, c - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-brand-500 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >−</button>
                    <span className="w-6 text-center font-semibold text-gray-900 text-sm">{children}</span>
                    <button
                      onClick={() => setChildren(c => Math.min(tour.maxGroupSize - adults, c + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-brand-500 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtotal */}
          {selectedDay && (
            <div className="rounded-xl bg-gray-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{adults} adult{adults !== 1 ? 's' : ''} × {formatTHB(chosenOption?.pricePerPerson ?? 0)}</span>
                <span>{formatTHB(adults * (chosenOption?.pricePerPerson ?? 0))}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>{children} child{children !== 1 ? 'ren' : ''} × {formatTHB(chosenOption?.childPrice ?? 0)}</span>
                  <span>{formatTHB(children * (chosenOption?.childPrice ?? 0))}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-gray-900 text-base border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-brand-600">{formatTHB(subtotal)}</span>
              </div>
            </div>
          )}

          {/* Book button */}
          <button
            onClick={handleBook}
            disabled={!canBook}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors
              ${canBook
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-[0_4px_16px_rgba(37,52,255,0.30)]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {canBook ? (
              <>Book Now <ArrowRight className="w-4 h-4" /></>
            ) : (
              'Select a date to continue'
            )}
          </button>

          {/* Inquiry link */}
          <Link
            href={`/inquiry?destination=${encodeURIComponent(tour.title)}&type=tour`}
            className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium mt-2"
          >
            Need a custom quote? Send an inquiry →
          </Link>

          {/* Trust chips */}
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Free cancellation up to 24 hours in advance
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Instant confirmation
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Pay on the day — no upfront payment required
            </div>
          </div>
        </div>
      </div>

      {/* Customer info modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Complete Your Booking</h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              {tour.title} · {chosenOption?.label ?? chosenOption?.time} ·{' '}
              {selectedDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp / Phone *</label>
                <input
                  type="tel"
                  required
                  minLength={8}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+66 81 234 5678"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-300"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <>Confirm Booking · {formatTHB(subtotal)}</>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">No payment now — pay on the day</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
