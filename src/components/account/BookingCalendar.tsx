'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnifiedBooking {
  id: string
  bookingRef: string
  serviceType: 'transfer' | 'tour' | 'attraction'
  serviceName: string
  date: string
  status: string
  price: number
  viewUrl?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_COLORS: Record<string, string> = {
  transfer:   'bg-blue-500',
  tour:       'bg-green-500',
  attraction: 'bg-orange-500',
}

const LABEL_COLORS: Record<string, string> = {
  transfer:   'text-blue-700 bg-blue-50 border-blue-200',
  tour:       'text-green-700 bg-green-50 border-green-200',
  attraction: 'text-orange-700 bg-orange-50 border-orange-200',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:        'bg-green-50 text-green-700 border-green-200',
  DRIVER_CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  DRIVER_STANDBY:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  DRIVER_PICKED_UP: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED:        'bg-green-50 text-green-700 border-green-200',
  CANCELLED:        'bg-red-50 text-red-700 border-red-200',
  USED:             'bg-gray-50 text-gray-600 border-gray-200',
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

/** Returns a grid of Date | null for the month containing the given year/month (0-indexed). */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const grid: (Date | null)[] = []

  // Pad with nulls for days before the 1st
  for (let i = 0; i < firstDay.getDay(); i++) grid.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d))
  }

  // Pad tail so the grid is a multiple of 7
  while (grid.length % 7 !== 0) grid.push(null)

  return grid
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BookingCalendarProps {
  bookings: UnifiedBooking[]
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const grid = buildMonthGrid(year, month)

  // Map date-string keys to booking arrays
  const bookingsByDay = bookings.reduce<Record<string, UnifiedBooking[]>>((acc, bk) => {
    // Normalise: parse as local date (date string is "YYYY-MM-DD" or ISO)
    const d = new Date(bk.date)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!acc[key]) acc[key] = []
    acc[key].push(bk)
    return acc
  }, {})

  function dayKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedBookingId(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedBookingId(null)
  }

  const selectedBooking = bookings.find(b => b.id === selectedBookingId) ?? null

  return (
    <div className="space-y-5">
      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Transfer</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Tour</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />Attraction</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* ── Month header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-gray-900 text-base">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ── Day headers ── */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        <div className="grid grid-cols-7">
          {grid.map((date, idx) => {
            const isToday = date ? isSameDay(date, today) : false
            const dayBookings = date ? (bookingsByDay[dayKey(date)] ?? []) : []
            const hasBookings = dayBookings.length > 0

            return (
              <div
                key={idx}
                className={`min-h-[72px] p-1.5 border-b border-r border-gray-50 last:border-r-0 ${
                  date ? 'bg-white' : 'bg-gray-50/40'
                }`}
              >
                {date && (
                  <>
                    {/* Date number */}
                    <div className="flex items-center justify-end mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-brand-600 text-white'
                          : hasBookings
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Booking dots */}
                    <div className="space-y-0.5">
                      {dayBookings.slice(0, 2).map(bk => (
                        <button
                          key={bk.id}
                          onClick={() => setSelectedBookingId(prev => prev === bk.id ? null : bk.id)}
                          className={`w-full flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-semibold truncate transition-colors hover:opacity-80 border ${LABEL_COLORS[bk.serviceType]}`}
                          title={bk.serviceName}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[bk.serviceType]}`} />
                          <span className="truncate">{bk.serviceName}</span>
                        </button>
                      ))}
                      {dayBookings.length > 2 && (
                        <p className="text-[9px] font-bold text-gray-400 pl-1">
                          +{dayBookings.length - 2} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Selected booking detail card ── */}
      {selectedBooking && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mr-2 ${LABEL_COLORS[selectedBooking.serviceType]}`}>
                {selectedBooking.serviceType.charAt(0).toUpperCase() + selectedBooking.serviceType.slice(1)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedBooking.status] ?? STATUS_COLORS.PENDING}`}>
                {selectedBooking.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedBookingId(null)}
              className="text-gray-300 hover:text-gray-500 text-lg leading-none font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <h3 className="font-extrabold text-gray-900 mb-1">{selectedBooking.serviceName}</h3>

          <div className="text-sm text-gray-500 space-y-1 mb-3">
            <p>
              <span className="font-semibold text-gray-700">Ref:</span>{' '}
              <span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                {selectedBooking.bookingRef}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-700">Date:</span>{' '}
              {new Date(selectedBooking.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Price:</span>{' '}
              ฿{selectedBooking.price.toLocaleString()}
            </p>
          </div>

          {selectedBooking.viewUrl && (
            <Link
              href={selectedBooking.viewUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              View booking <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {bookings.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          No bookings to display. Book a tour or transfer to see them here.
        </p>
      )}
    </div>
  )
}
