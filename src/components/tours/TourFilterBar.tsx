'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import PriceRangeSlider from './PriceRangeSlider'

const DURATION_PILLS = [
  { key: '',          label: '⏱ All Durations' },
  { key: 'half-day',  label: '🌅 Half Day (< 5h)' },
  { key: 'full-day',  label: '☀️ Full Day (5–10h)' },
  { key: 'multi-day', label: '📅 Multi-Day' },
]

const GROUP_SIZE_PILLS = [
  { key: '',   label: 'Any group' },
  { key: '1',  label: 'Solo' },
  { key: '2',  label: 'Couple' },
  { key: '6',  label: 'Small Group' },
  { key: '7',  label: 'Large Group' },
]

const LANGUAGE_PILLS = [
  { key: '',         label: 'All languages' },
  { key: 'English',  label: '🇬🇧 English' },
  { key: 'Thai',     label: '🇹🇭 Thai' },
  { key: 'Chinese',  label: '🇨🇳 Chinese' },
  { key: 'Japanese', label: '🇯🇵 Japanese' },
  { key: 'French',   label: '🇫🇷 French' },
  { key: 'German',   label: '🇩🇪 German' },
  { key: 'Russian',  label: '🇷🇺 Russian' },
]

function buildUrl(sp: URLSearchParams, overrides: Record<string, string>) {
  const p = new URLSearchParams(sp.toString())
  Object.entries(overrides).forEach(([k, v]) => {
    if (v) p.set(k, v)
    else p.delete(k)
  })
  const s = p.toString()
  return `/tours${s ? `?${s}` : ''}`
}

function FilterBarInner() {
  const sp = useSearchParams()
  const currentDuration  = sp.get('duration')  ?? ''
  const currentGroupSize = sp.get('groupSize')  ?? ''
  const currentLanguage  = sp.get('language')   ?? ''
  const currentDate      = sp.get('date')        ?? ''

  const todayActive    = currentDate === 'today'
  const tomorrowActive = currentDate === 'tomorrow'

  return (
    <div className="space-y-4">
      {/* ── Row 1: Available today/tomorrow quick filters ─────────────── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl(sp, { date: todayActive ? '' : 'today' })}
          className={[
            'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            todayActive
              ? 'bg-[#2534ff] text-white border-[#2534ff]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
          ].join(' ')}
        >
          ✅ Available Today
        </Link>
        <Link
          href={buildUrl(sp, { date: tomorrowActive ? '' : 'tomorrow' })}
          className={[
            'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            tomorrowActive
              ? 'bg-[#2534ff] text-white border-[#2534ff]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
          ].join(' ')}
        >
          📆 Available Tomorrow
        </Link>
      </div>

      {/* ── Row 2: Duration pills ─────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duration</p>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PILLS.map(pill => {
            const active = currentDuration === pill.key
            return (
              <Link
                key={pill.key}
                href={buildUrl(sp, { duration: pill.key })}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  active
                    ? 'text-[#2534ff] border-[#2534ff] underline underline-offset-2'
                    : 'text-gray-600 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff] bg-white',
                ].join(' ')}
              >
                {pill.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Row 3: Group size pills ───────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Group size</p>
        <div className="flex flex-wrap gap-1.5">
          {GROUP_SIZE_PILLS.map(pill => {
            const active = currentGroupSize === pill.key
            return (
              <Link
                key={pill.key}
                href={buildUrl(sp, { groupSize: pill.key })}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  active
                    ? 'bg-[#2534ff] text-white border-[#2534ff]'
                    : 'text-gray-600 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff] bg-white',
                ].join(' ')}
              >
                {pill.label === 'Solo' ? 'Solo (1)' :
                 pill.label === 'Couple' ? 'Couple (2)' :
                 pill.label === 'Small Group' ? 'Small Group (3–6)' :
                 pill.label === 'Large Group' ? 'Large Group (7+)' :
                 pill.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Row 4: Language pills ─────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Language</p>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_PILLS.map(pill => {
            const active = currentLanguage === pill.key
            return (
              <Link
                key={pill.key}
                href={buildUrl(sp, { language: pill.key })}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  active
                    ? 'bg-[#2534ff] text-white border-[#2534ff]'
                    : 'text-gray-600 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff] bg-white',
                ].join(' ')}
              >
                {pill.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Row 5: Price range slider ─────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Price per person</p>
        <Suspense>
          <PriceRangeSlider />
        </Suspense>
      </div>
    </div>
  )
}

export default function TourFilterBar() {
  return (
    <Suspense>
      <FilterBarInner />
    </Suspense>
  )
}
