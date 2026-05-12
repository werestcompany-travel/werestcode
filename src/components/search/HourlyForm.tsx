'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Luggage, ChevronDown, Clock, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceResult } from '@/types'
import CalendarPicker from './CalendarPicker'

declare global { interface Window { google: typeof google } }

const today = new Date().toISOString().split('T')[0]

const DURATION_OPTIONS = [
  { value: '4',  label: '4 hours'  },
  { value: '6',  label: '6 hours'  },
  { value: '8',  label: '8 hours'  },
  { value: '10', label: '10 hours' },
]

function fmtTime(t: string) {
  if (!t) return ''
  const [hh, mm] = t.split(':').map(Number)
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
  return `${h12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`
}

export default function HourlyForm({ noCard = false }: { noCard?: boolean }) {
  const router = useRouter()

  const [pickup,      setPickup]      = useState<PlaceResult | null>(null)
  const [pickupInput, setPickupInput] = useState('')
  const [date,        setDate]        = useState(today)
  const [time,        setTime]        = useState('09:00')
  const [duration,    setDuration]    = useState('6')
  const [passengers,  setPassengers]  = useState(2)
  const [luggage,     setLuggage]     = useState(2)
  const [showCal,     setShowCal]     = useState(false)
  const [showPax,     setShowPax]     = useState(false)
  const [showDur,     setShowDur]     = useState(false)
  const [error,       setError]       = useState('')

  const pickupRef  = useRef<HTMLInputElement>(null)
  const pickupAC   = useRef<google.maps.places.Autocomplete | null>(null)
  const calTrigger = useRef<HTMLDivElement>(null)
  const paxRef     = useRef<HTMLDivElement>(null)
  const durRef     = useRef<HTMLDivElement>(null)

  const initAC = useCallback(() => {
    if (!window.google || !pickupRef.current) return
    pickupAC.current = new google.maps.places.Autocomplete(pickupRef.current, {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'TH' },
    })
    pickupAC.current.addListener('place_changed', () => {
      const p = pickupAC.current!.getPlace()
      if (p.geometry?.location) {
        const addr = p.formatted_address ?? pickupRef.current!.value
        setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() })
        setPickupInput(addr)
      }
    })
  }, [])

  useEffect(() => {
    if (window.google) { initAC(); return }
    const iv = setInterval(() => { if (window.google) { clearInterval(iv); initAC() } }, 300)
    return () => clearInterval(iv)
  }, [initAC])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) setShowPax(false)
      if (durRef.current && !durRef.current.contains(e.target as Node)) setShowDur(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    if (!pickup) { setError('Please enter a pickup location'); return }
    setError('')
    router.push(`/results?${new URLSearchParams({
      pickup_address: pickup.address,
      pickup_lat:     String(pickup.lat),
      pickup_lng:     String(pickup.lng),
      date, time,
      duration_hours: duration,
      passengers:     String(passengers),
      luggage:        String(luggage),
      hourly:         'true',
    })}`)
  }

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : ''

  const Divider = () => <div className="w-px self-stretch bg-gray-200 shrink-0 my-3" />
  const selectedDur = DURATION_OPTIONS.find(o => o.value === duration)

  const inner = (
    <>
      {/* Single row */}
      <div className="flex items-stretch h-[72px] px-2">

          {/* PICKUP */}
          <div className="flex items-center gap-2.5 flex-[3] min-w-0 px-4">
            <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Pickup location</p>
              <input
                ref={pickupRef}
                type="text"
                value={pickupInput}
                onChange={e => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null) }}
                placeholder="Hotel, airport, address…"
                className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
              />
            </div>
          </div>

          <Divider />

          {/* DATE */}
          <div ref={calTrigger} className="relative flex items-center shrink-0">
            <button
              type="button"
              onClick={() => { setShowCal(s => !s); setShowPax(false); setShowDur(false) }}
              className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#2534ff] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Date &amp; time</p>
                <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {fmtDate(date) || <span className="font-normal text-gray-300">Select date</span>}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{fmtTime(time)}</p>
              </div>
            </button>
            {showCal && (
              <CalendarPicker
                label="Pick-up date"
                date={date}
                time={time}
                minDate={today}
                triggerRef={calTrigger}
                onChange={(d, t) => { setDate(d); setTime(t) }}
                onClose={() => setShowCal(false)}
                align="left"
              />
            )}
          </div>

          <Divider />

          {/* DURATION */}
          <div className="relative flex items-center shrink-0" ref={durRef}>
            <button
              type="button"
              onClick={() => { setShowDur(s => !s); setShowCal(false); setShowPax(false) }}
              className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
            >
              <Clock className="w-4 h-4 text-[#2534ff] shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Duration</p>
                <p className="text-sm font-semibold text-gray-900">{selectedDur?.label}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showDur ? 'rotate-180' : ''}`} />
            </button>
            {showDur && (
              <div className="absolute bottom-full left-0 mb-3 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setDuration(opt.value); setShowDur(false) }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      duration === opt.value
                        ? 'bg-[#2534ff] text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Divider />

          {/* PASSENGERS */}
          <div className="relative flex items-center shrink-0" ref={paxRef}>
            <button
              type="button"
              onClick={() => { setShowPax(!showPax); setShowCal(false); setShowDur(false) }}
              className="flex items-center gap-2 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
            >
              <Users className="w-4 h-4 text-[#2534ff]" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">Passengers</p>
                <p className="text-sm font-semibold text-gray-900">{passengers} pax · {luggage} bags</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showPax ? 'rotate-180' : ''}`} />
            </button>
            {showPax && (
              <div className="absolute bottom-full right-0 mb-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                <CounterRow label="Passengers" icon={<Users className="w-4 h-4 text-gray-400" />}
                  value={passengers} min={1} max={10} onChange={setPassengers} />
                <CounterRow label="Luggage" icon={<Luggage className="w-4 h-4 text-gray-400" />}
                  value={luggage} min={0} max={15} onChange={setLuggage} />
                <button type="button" onClick={() => setShowPax(false)}
                  className="w-full text-xs font-bold text-[#2534ff] bg-blue-50 rounded-xl py-2 hover:bg-blue-100 transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="flex items-center pl-2 pr-3 shrink-0">
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1420cc] text-white font-bold text-sm px-6 h-11 rounded-xl transition-colors shadow-md whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

      {error && (
        <div className="px-6 pb-3 -mt-1">
          <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">⚠ {error}</p>
        </div>
      )}
    </>
  )

  if (noCard) return inner

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-visible">
        {inner}
      </div>
      <p className="text-xs text-white/60">
        Hourly hire — your driver stays with you for the selected duration. Ideal for city tours, shopping runs, or multi-stop days.
      </p>
    </div>
  )
}

function CounterRow({ icon, label, value, min, max, onChange }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-700">{icon} {label}</div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className={cn('w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-lg leading-none transition-colors',
            value <= min ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-[#2534ff] hover:border-blue-300')}>
          −
        </button>
        <span className="text-sm font-bold w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className={cn('w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 text-lg leading-none transition-colors',
            value >= max ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-[#2534ff] hover:border-blue-300')}>
          +
        </button>
      </div>
    </div>
  )
}
