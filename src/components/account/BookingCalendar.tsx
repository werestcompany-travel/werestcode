'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react'
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

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const grid: (Date | null)[] = []
  for (let i = 0; i < firstDay.getDay(); i++) grid.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

// ─── Year range for the picker ────────────────────────────────────────────────

function buildYearRange(center: number, span = 6): number[] {
  const start = center - Math.floor(span / 2)
  return Array.from({ length: span }, (_, i) => start + i)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BookingCalendarProps {
  bookings: UnifiedBooking[]
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const today = new Date()

  const [year,              setYear]              = useState(today.getFullYear())
  const [month,             setMonth]             = useState(today.getMonth())
  const [pickerOpen,        setPickerOpen]        = useState(false)
  const [pickerYear,        setPickerYear]        = useState(today.getFullYear())
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    if (!pickerOpen) return
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [pickerOpen])

  const grid = buildMonthGrid(year, month)
  const years = buildYearRange(pickerYear)

  // Map date-string keys → booking arrays
  const bookingsByDay = bookings.reduce<Record<string, UnifiedBooking[]>>((acc, bk) => {
    const d   = new Date(bk.date)
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

  function selectMonthYear(m: number, y: number) {
    setMonth(m)
    setYear(y)
    setPickerOpen(false)
    setSelectedBookingId(null)
  }

  function goToToday() {
    setMonth(today.getMonth())
    setYear(today.getFullYear())
    setPickerYear(today.getFullYear())
    setPickerOpen(false)
    setSelectedBookingId(null)
  }

  const selectedBooking = bookings.find(b => b.id === selectedBookingId) ?? null

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <div className="space-y-4">

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
        {[
          { color: 'bg-blue-500',   label: 'Transfer'   },
          { color: 'bg-green-500',  label: 'Tour'       },
          { color: 'bg-orange-500', label: 'Attraction' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${l.color}`} />
            {l.label}
          </span>
        ))}
        {!isCurrentMonth && (
          <button
            onClick={goToToday}
            className="ml-auto text-[#2534ff] font-bold hover:underline"
          >
            Today
          </button>
        )}
      </div>

      {/* ── Calendar card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-visible">

        {/* ── Month / Year header with picker ── */}
        <div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-100" ref={pickerRef}>

          {/* Prev month */}
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Month + year button → opens picker */}
          <button
            onClick={() => { setPickerYear(year); setPickerOpen(o => !o) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
            aria-label="Choose month and year"
          >
            <span className="font-extrabold text-gray-900 text-base">
              {MONTH_NAMES[month]} {year}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Next month */}
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* ── Dropdown picker ── */}
          {pickerOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72">

              {/* Year row */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setPickerYear(y => y - 6)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Earlier years"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1.5 flex-wrap justify-center">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setPickerYear(y)}
                      className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors ${
                        y === pickerYear
                          ? 'bg-[#2534ff] text-white'
                          : y === today.getFullYear()
                          ? 'border border-[#2534ff] text-[#2534ff]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPickerYear(y => y + 6)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Later years"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mb-3" />

              {/* Month grid — 4 × 3 */}
              <div className="grid grid-cols-4 gap-1.5">
                {MONTH_SHORT.map((name, m) => {
                  const isSelected  = m === month && pickerYear === year
                  const isThisMonth = m === today.getMonth() && pickerYear === today.getFullYear()
                  return (
                    <button
                      key={name}
                      onClick={() => selectMonthYear(m, pickerYear)}
                      className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#2534ff] text-white'
                          : isThisMonth
                          ? 'border border-[#2534ff] text-[#2534ff]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>

              {/* Today shortcut */}
              <button
                onClick={goToToday}
                className="mt-3 w-full py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Go to Today
              </button>
            </div>
          )}
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
            const isToday    = date ? isSameDay(date, today) : false
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
                    <div className="flex items-center justify-end mb-1">
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                        isToday
                          ? 'bg-[#2534ff] text-white'
                          : hasBookings
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>

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

      {/* ── Selected booking card ── */}
      {selectedBooking && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LABEL_COLORS[selectedBooking.serviceType]}`}>
                {selectedBooking.serviceType.charAt(0).toUpperCase() + selectedBooking.serviceType.slice(1)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedBooking.status] ?? STATUS_COLORS.PENDING}`}>
                {selectedBooking.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedBookingId(null)}
              className="text-gray-300 hover:text-gray-500 transition-colors p-0.5"
              aria-label="Close"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <h3 className="font-extrabold text-gray-900 mb-2">{selectedBooking.serviceName}</h3>

          <div className="text-sm text-gray-500 space-y-1.5 mb-4">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 w-10 shrink-0">Ref</span>
              <span className="font-mono text-xs bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200 text-gray-700">
                {selectedBooking.bookingRef}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 w-10 shrink-0">Date</span>
              <span>{new Date(selectedBooking.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 w-10 shrink-0">Price</span>
              <span className="font-semibold text-gray-900">฿{selectedBooking.price.toLocaleString()}</span>
            </p>
          </div>

          {selectedBooking.viewUrl && (
            <Link
              href={selectedBooking.viewUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2534ff] hover:underline transition-colors"
            >
              View booking <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {bookings.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          No bookings yet. Book a tour or transfer to see them here.
        </p>
      )}
    </div>
  )
}
