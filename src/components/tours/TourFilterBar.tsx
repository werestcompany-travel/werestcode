'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { X } from 'lucide-react'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_PILLS = [
  { key: '',          label: 'All' },
  { key: 'cultural',  label: 'Cultural' },
  { key: 'day-trip',  label: 'Day Trips' },
  { key: 'food',      label: 'Food & Drink' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nature',    label: 'Nature' },
  { key: 'water',     label: 'Water' },
]

const SORT_OPTIONS = [
  { value: '',           label: 'Recommended' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'newest',    label: 'Newest' },
]

// ─── Inner (uses hooks) ────────────────────────────────────────────────────────

function FilterBarInner() {
  const router = useRouter()
  const sp     = useSearchParams()

  const category = sp.get('category')  ?? ''
  const sort     = sp.get('sort')      ?? ''
  const location = sp.get('location')  ?? ''
  const duration = sp.get('duration')  ?? ''
  const featured = sp.get('featured')  ?? ''
  const minPrice = sp.get('minPrice')  ?? ''
  const maxPrice = sp.get('maxPrice')  ?? ''
  const rating   = sp.get('rating')    ?? ''
  const q        = sp.get('q')         ?? ''

  const navigate = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString())
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else   p.delete(k)
    })
    router.push(`/tours${p.toString() ? `?${p.toString()}` : ''}`, { scroll: false })
  }

  // Active filter chips (excluding sort and q — those have dedicated UIs)
  const activeChips: { label: string; clear: Record<string, string> }[] = []
  if (location) activeChips.push({ label: `📍 ${location}`, clear: { location: '' } })
  if (duration) activeChips.push({ label: `⏱ ${duration.replace('-', ' ')}`, clear: { duration: '' } })
  if (minPrice || maxPrice) activeChips.push({
    label: `฿${minPrice || '0'}–${maxPrice || '∞'}`,
    clear: { minPrice: '', maxPrice: '' },
  })
  if (featured === 'true') activeChips.push({ label: '⭐ Featured', clear: { featured: '' } })
  if (rating) activeChips.push({ label: `${rating}+ ★`, clear: { rating: '' } })

  const hasActiveChips = activeChips.length > 0

  return (
    <div className="space-y-3">
      {/* ── Row 1: Category quick-filter pills + Sort (right) ─────────────── */}
      <div className="flex items-center gap-2">
        {/* Horizontally scrollable pill row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 pb-0.5">
          {CATEGORY_PILLS.map(pill => {
            const active = category === pill.key
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => navigate({ category: pill.key })}
                className={[
                  'px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap flex-shrink-0',
                  active
                    ? 'bg-[#2534ff] text-white border-[#2534ff]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
                ].join(' ')}
              >
                {pill.label}
              </button>
            )
          })}
        </div>

        {/* Sort — always visible on right */}
        <div className="relative flex-shrink-0 hidden lg:block">
          <select
            value={sort}
            onChange={e => navigate({ sort: e.target.value })}
            className="appearance-none border border-gray-200 rounded-xl px-3 py-1.5 pr-7 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] transition-all"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
        </div>
      </div>

      {/* ── Row 2: Active filter chips ────────────────────────────────────── */}
      {(hasActiveChips || q) && (
        <div className="flex flex-wrap items-center gap-2">
          {q && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full px-2.5 py-1">
              🔍 &quot;{q}&quot;
              <button
                type="button"
                onClick={() => navigate({ q: '' })}
                className="ml-0.5 hover:text-red-500 transition-colors"
                aria-label="Remove search"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeChips.map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={() => navigate(chip.clear)}
              className="flex items-center gap-1 text-xs font-semibold bg-[#2534ff]/10 text-[#2534ff] rounded-full px-2.5 py-1 hover:bg-[#2534ff]/20 transition-colors"
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          {(hasActiveChips || q) && (
            <button
              type="button"
              onClick={() => router.push('/tours', { scroll: false })}
              className="text-xs text-gray-500 hover:text-[#2534ff] font-medium transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function TourFilterBar() {
  return (
    <Suspense>
      <FilterBarInner />
    </Suspense>
  )
}
