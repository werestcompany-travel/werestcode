'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Luggage, ChevronDown, Clock, Search } from 'lucide-react'
import PassengerSheet, { type PassengerState } from './PassengerSheet'
import { cn } from '@/lib/utils'
import { PlaceResult } from '@/types'
import CalendarPicker from './CalendarPicker'
import { useLocale } from '@/context/LocaleContext'

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
  const { t } = useLocale()

  const [pickup,      setPickup]      = useState<PlaceResult | null>(null)
  const [pickupInput, setPickupInput] = useState('')
  const [date,        setDate]        = useState(today)
  const [time,        setTime]        = useState('09:00')
  const [duration,    setDuration]    = useState('4')
  const [pax, setPax] = useState<PassengerState>({ adults: 2, children: 0, extraBags: 0 })
  const [showCal,     setShowCal]     = useState(false)
  const [showPax,     setShowPax]     = useState(false)
  const [showDur,     setShowDur]     = useState(false)
  const [error,       setError]       = useState('')

  /* Mobile refs */
  const pickupRefMob  = useRef<HTMLInputElement>(null)
  const pickupACMob   = useRef<google.maps.places.Autocomplete | null>(null)
  const calTriggerMob = useRef<HTMLDivElement>(null)
  const durRefMob     = useRef<HTMLDivElement>(null)

  /* Desktop refs */
  const pickupRefDesk  = useRef<HTMLInputElement>(null)
  const pickupACDesk   = useRef<google.maps.places.Autocomplete | null>(null)
  const calTriggerDesk = useRef<HTMLDivElement>(null)
  const durRefDesk     = useRef<HTMLDivElement>(null)

  const initAC = useCallback(() => {
    if (!window.google) return
    const opts = {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'TH' },
    }
    if (pickupRefMob.current && !pickupACMob.current) {
      pickupACMob.current = new google.maps.places.Autocomplete(pickupRefMob.current, opts)
      pickupACMob.current.addListener('place_changed', () => {
        const p = pickupACMob.current!.getPlace()
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? pickupRefMob.current!.value
          setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() })
          setPickupInput(addr)
        }
      })
    }
    if (pickupRefDesk.current && !pickupACDesk.current) {
      pickupACDesk.current = new google.maps.places.Autocomplete(pickupRefDesk.current, opts)
      pickupACDesk.current.addListener('place_changed', () => {
        const p = pickupACDesk.current!.getPlace()
        if (p.geometry?.location) {
          const addr = p.formatted_address ?? pickupRefDesk.current!.value
          setPickup({ address: addr, lat: p.geometry.location.lat(), lng: p.geometry.location.lng() })
          setPickupInput(addr)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (window.google) { initAC(); return }
    const iv = setInterval(() => { if (window.google) { clearInterval(iv); initAC() } }, 300)
    return () => clearInterval(iv)
  }, [initAC])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const outside = (ref: React.RefObject<HTMLDivElement | null>) =>
        ref.current && !ref.current.contains(e.target as Node)
      if (outside(durRefMob) && outside(durRefDesk)) setShowDur(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    if (!pickup) { setError(t('form.errPickup')); return }
    setError('')
    router.push(`/results?${new URLSearchParams({
      pickup_address: pickup.address,
      pickup_lat:     String(pickup.lat),
      pickup_lng:     String(pickup.lng),
      date, time,
      duration_hours: duration,
      passengers:     String(pax.adults + pax.children),
      luggage:        String(pax.extraBags),
      hourly:         'true',
    })}`)
  }

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : ''

  const selectedDur = DURATION_OPTIONS.find(o => o.value === duration)

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  MOBILE / TABLET vertical layout  (< lg)                               */
  /* ─────────────────────────────────────────────────────────────────────── */
  const MobileForm = (
    <div className="lg:hidden">

      {/* Row 1: Duration | Passengers */}
      <div className="flex border-b border-gray-100">

        {/* Duration */}
        <div ref={durRefMob} className="relative flex-1 border-r border-gray-100">
          <button
            type="button"
            onClick={() => { setShowDur(s => !s); setShowCal(false); setShowPax(false) }}
            className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 shrink-0" />
              <span className={cn('text-sm font-medium', selectedDur ? 'text-gray-800' : 'text-gray-400')}>
                {selectedDur?.label ?? 'Duration'}
              </span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showDur && 'rotate-180')} />
          </button>

          {showDur && (
            <div className="absolute top-full left-0 z-50 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 mt-1">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setDuration(opt.value); setShowDur(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    duration === opt.value
                      ? 'text-[#2534ff] font-semibold'
                      : 'text-[#2534ff] hover:bg-blue-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => { setShowPax(true); setShowCal(false); setShowDur(false) }}
            className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-800">{pax.adults + pax.children}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Luggage className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-800">{pax.extraBags}</span>
              </div>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showPax && 'rotate-180')} />
          </button>
        </div>

        {/* Mobile bottom sheet */}
        {showPax && (
          <PassengerSheet
            value={pax}
            onChange={setPax}
            onClose={() => setShowPax(false)}
            mode="sheet"
          />
        )}
      </div>

      {/* From field */}
      <div className="border-b border-gray-100 flex items-center gap-3 px-4 py-3.5">
        <div className="w-3 h-3 rounded-full border-2 border-gray-400 shrink-0" />
        <input
          ref={pickupRefMob}
          type="text"
          value={pickupInput}
          onChange={e => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null) }}
          placeholder={t('form.fromPlaceholder')}
          className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
        />
        {pickupInput && (
          <button type="button" onClick={() => { setPickupInput(''); setPickup(null) }}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0">×</button>
        )}
      </div>

      {/* Date and time */}
      <div ref={calTriggerMob} className="relative border-b border-gray-100">
        <button
          type="button"
          onClick={() => { setShowCal(s => !s); setShowPax(false); setShowDur(false) }}
          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={cn('text-sm', date ? 'text-gray-800 font-medium' : 'text-gray-400')}>
            {date ? `${fmtDate(date)} · ${fmtTime(time)}` : t('hourly.dateTime')}
          </span>
        </button>
        {showCal && (
          <CalendarPicker
            label={t('hourly.pickupDate')}
            date={date}
            time={time}
            minDate={today}
            triggerRef={calTriggerMob}
            onChange={(d, t) => { setDate(d); setTime(t) }}
            onClose={() => setShowCal(false)}
            align="left"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pt-2">
          <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">⚠ {error}</p>
        </div>
      )}

      {/* Search button */}
      <div className="px-4 py-4">
        <button
          type="button"
          onClick={handleSearch}
          className="w-full bg-[#2534ff] hover:bg-[#1420cc] active:bg-[#0f18a8] text-white font-bold text-base py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {t('form.search')}
        </button>
      </div>

    </div>
  )

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  DESKTOP horizontal layout  (lg+)                                      */
  /* ─────────────────────────────────────────────────────────────────────── */
  const Divider = () => <div className="w-px self-stretch bg-gray-200 shrink-0 my-3" />

  const DesktopForm = (
    <>
      <div className="hidden lg:flex items-stretch h-[72px] px-2">

        {/* PICKUP */}
        <div className="flex items-center gap-2.5 flex-[3] min-w-0 px-4">
          <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('hourly.pickupLocation')}</p>
            <input
              ref={pickupRefDesk}
              type="text"
              value={pickupInput}
              onChange={e => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null) }}
              placeholder={t('hourly.hotelAirport')}
              className="text-sm font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal bg-transparent outline-none w-full truncate"
            />
          </div>
        </div>

        <Divider />

        {/* DATE */}
        <div ref={calTriggerDesk} className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => { setShowCal(s => !s); setShowPax(false); setShowDur(false) }}
            className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('hourly.dateTime')}</p>
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {fmtDate(date) || <span className="font-normal text-gray-300">{t('hourly.selectDate')}</span>}
              </p>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">{fmtTime(time)}</p>
            </div>
          </button>
          {showCal && (
            <CalendarPicker
              label={t('hourly.pickupDate')}
              date={date}
              time={time}
              minDate={today}
              triggerRef={calTriggerDesk}
              onChange={(d, t) => { setDate(d); setTime(t) }}
              onClose={() => setShowCal(false)}
              align="left"
            />
          )}
        </div>

        <Divider />

        {/* DURATION */}
        <div className="relative flex items-center shrink-0" ref={durRefDesk}>
          <button
            type="button"
            onClick={() => { setShowDur(s => !s); setShowCal(false); setShowPax(false) }}
            className="flex items-center gap-2.5 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
          >
            <Clock className="w-4 h-4 text-[#2534ff] shrink-0" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('hourly.duration')}</p>
              <p className="text-sm font-semibold text-gray-900">{selectedDur?.label}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showDur ? 'rotate-180' : ''}`} />
          </button>
          {showDur && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2">
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
        <div className="relative flex items-center shrink-0">
          <button
            type="button"
            onClick={() => { setShowPax(!showPax); setShowCal(false); setShowDur(false) }}
            className="flex items-center gap-2 px-4 h-full hover:bg-gray-50 rounded-xl transition-colors whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-[#2534ff]" />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">{t('hourly.passengers')}</p>
              <p className="text-sm font-semibold text-gray-900">
                {pax.adults + pax.children} {t('form.paxSummary')} · {pax.extraBags} {t('form.extraBags')}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ml-1 ${showPax ? 'rotate-180' : ''}`} />
          </button>
          {showPax && (
            <PassengerSheet
              value={pax}
              onChange={setPax}
              onClose={() => setShowPax(false)}
              mode="dropdown"
            />
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
            {t('form.search')}
          </button>
        </div>
      </div>

      {error && (
        <div className="hidden lg:block px-6 pb-3 -mt-1">
          <p className="text-red-500 text-sm flex items-center gap-1.5 font-medium">⚠ {error}</p>
        </div>
      )}
    </>
  )

  const inner = (
    <>
      {MobileForm}
      {DesktopForm}
    </>
  )

  if (noCard) return inner

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-visible">
        {inner}
      </div>
    </div>
  )
}
