'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Suspense } from 'react'
import type { FilterFacets } from './TourFiltersClient'
import PriceRangeSlider from './PriceRangeSlider'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TourSidebarStaticProps {
  facets: FilterFacets
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { key: '',          label: 'Any Duration' },
  { key: 'half-day',  label: 'Half Day (< 5h)' },
  { key: 'full-day',  label: 'Full Day (5–10h)' },
  { key: 'multi-day', label: 'Multi-Day' },
]

const RATING_OPTIONS = [
  { key: '',    label: 'Any Rating' },
  { key: '4.5', label: '4.5+ ★' },
  { key: '4.0', label: '4.0+ ★' },
  { key: '3.5', label: '3.5+ ★' },
]

// ─── Section wrapper ───────────────────────────────────────────────────────────

interface SectionProps {
  title:    string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 group"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors">
          {title}
        </span>
        <ChevronDown className={['w-3.5 h-3.5 text-gray-400 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  )
}

// ─── Filter row ────────────────────────────────────────────────────────────────

interface RowProps {
  label:    string
  count?:   number
  active:   boolean
  onClick:  () => void
}

function FilterRow({ label, count, active, onClick }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors group',
        active ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <span className={['w-2 h-2 rounded-full flex-shrink-0 transition-colors', active ? 'bg-[#2534ff]' : 'bg-transparent border border-gray-300 group-hover:border-[#2534ff]'].join(' ')} />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </button>
  )
}

// ─── Inner component (uses hooks) ──────────────────────────────────────────────

function SidebarInner({ facets }: TourSidebarStaticProps) {
  const router = useRouter()
  const sp     = useSearchParams()

  const category = sp.get('category')  ?? ''
  const location = sp.get('location')  ?? ''
  const duration = sp.get('duration')  ?? ''
  const featured = sp.get('featured')  ?? ''
  const rating   = sp.get('rating')    ?? ''

  const hasFilters = !!(category || location || duration || featured || rating ||
    sp.get('minPrice') || sp.get('maxPrice'))

  const navigate = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString())
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else   p.delete(k)
    })
    router.push(`/tours${p.toString() ? `?${p.toString()}` : ''}`, { scroll: false })
  }

  const toggle = (key: string, current: string, value: string) =>
    navigate({ [key]: current === value ? '' : value })

  return (
    <div className="space-y-4">

      {/* ── Category ─────────────────────────────────────────────────────── */}
      <Section title="Category">
        <FilterRow
          label="All Experiences"
          count={facets.total}
          active={!category}
          onClick={() => navigate({ category: '' })}
        />
        {facets.categories.map(c => (
          <FilterRow
            key={c.key}
            label={c.label}
            count={c.count}
            active={category === c.key}
            onClick={() => toggle('category', category, c.key)}
          />
        ))}
      </Section>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      <Section title="Location">
        <FilterRow
          label="All Locations"
          active={!location}
          onClick={() => navigate({ location: '' })}
        />
        {facets.locations.map(l => (
          <FilterRow
            key={l.key}
            label={l.label}
            count={l.count}
            active={location === l.key}
            onClick={() => toggle('location', location, l.key)}
          />
        ))}
      </Section>

      {/* ── Duration ─────────────────────────────────────────────────────── */}
      <Section title="Duration">
        {DURATION_OPTIONS.map(d => (
          <FilterRow
            key={d.key}
            label={d.label}
            active={duration === d.key}
            onClick={() => toggle('duration', duration, d.key)}
          />
        ))}
      </Section>

      {/* ── Price Range ───────────────────────────────────────────────────── */}
      <Section title="Price Range (THB)">
        <div className="px-2.5 py-1">
          <Suspense>
            <PriceRangeSlider />
          </Suspense>
        </div>
      </Section>

      {/* ── Rating ───────────────────────────────────────────────────────── */}
      <Section title="Rating">
        {RATING_OPTIONS.map(r => (
          <FilterRow
            key={r.key}
            label={r.label}
            active={rating === r.key}
            onClick={() => toggle('rating', rating, r.key)}
          />
        ))}
      </Section>

      {/* ── Special ──────────────────────────────────────────────────────── */}
      <Section title="Special">
        <button
          type="button"
          onClick={() => navigate({ featured: featured === 'true' ? '' : 'true' })}
          className={[
            'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm transition-colors',
            featured === 'true' ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50',
          ].join(' ')}
        >
          <span className={['w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            featured === 'true' ? 'bg-[#2534ff] border-[#2534ff]' : 'border-gray-300'].join(' ')}>
            {featured === 'true' && <span className="text-white text-[10px] leading-none">✓</span>}
          </span>
          Featured Only
        </button>
        <button
          type="button"
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0" />
          Instant Confirmation
        </button>
      </Section>

      {/* ── Clear All ─────────────────────────────────────────────────────── */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push('/tours', { scroll: false })}
          className="flex items-center gap-1.5 w-full justify-center py-2.5 mt-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      )}
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function TourSidebarStatic({ facets }: TourSidebarStaticProps) {
  return (
    <Suspense>
      <SidebarInner facets={facets} />
    </Suspense>
  )
}
