'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChevronDown, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FilterFacets {
  categories: { key: string; label: string; count: number }[]
  locations:  { key: string; label: string; count: number }[]
  durations:  { key: string; label: string; count: number }[]
  priceRange: { min: number; max: number }
  total:      number
}

interface TourFiltersClientProps {
  facets:       FilterFacets
  totalResults: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: '',           label: 'Recommended' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'newest',    label: 'Newest' },
]

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

// ─── Helper ────────────────────────────────────────────────────────────────────

function buildUrl(sp: URLSearchParams, overrides: Record<string, string>): string {
  const p = new URLSearchParams(sp.toString())
  Object.entries(overrides).forEach(([k, v]) => {
    if (v) p.set(k, v)
    else   p.delete(k)
  })
  const s = p.toString()
  return `/tours${s ? `?${s}` : ''}`
}

// ─── Dropdown wrapper ──────────────────────────────────────────────────────────

interface DropdownProps {
  label:    string
  active?:  boolean
  children: React.ReactNode
}

function Dropdown({ label, active, children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap',
          active
            ? 'bg-[#2534ff] text-white border-[#2534ff]'
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
        ].join(' ')}
      >
        {label}
        <ChevronDown className={['w-3.5 h-3.5 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg p-2">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Mobile Filter Drawer ──────────────────────────────────────────────────────

interface DrawerProps {
  open:     boolean
  onClose:  () => void
  facets:   FilterFacets
  totalResults: number
}

function MobileFilterDrawer({ open, onClose, facets, totalResults }: DrawerProps) {
  const router = useRouter()
  const sp     = useSearchParams()

  const category  = sp.get('category')  ?? ''
  const location  = sp.get('location')  ?? ''
  const duration  = sp.get('duration')  ?? ''
  const minPrice  = sp.get('minPrice')  ?? ''
  const maxPrice  = sp.get('maxPrice')  ?? ''
  const featured  = sp.get('featured')  ?? ''
  const rating    = sp.get('rating')    ?? ''

  // Local draft state — applied on "Show results"
  const [draft, setDraft] = useState({
    category, location, duration, minPrice, maxPrice, featured, rating,
  })

  const apply = () => {
    const p = new URLSearchParams(sp.toString())
    const setOrDel = (k: string, v: string) => v ? p.set(k, v) : p.delete(k)
    setOrDel('category', draft.category)
    setOrDel('location',  draft.location)
    setOrDel('duration',  draft.duration)
    setOrDel('minPrice',  draft.minPrice)
    setOrDel('maxPrice',  draft.maxPrice)
    setOrDel('featured',  draft.featured)
    setOrDel('rating',    draft.rating)
    router.push(`/tours${p.toString() ? `?${p.toString()}` : ''}`)
    onClose()
  }

  if (!open) return null

  const set = (k: keyof typeof draft, v: string) => setDraft(d => ({ ...d, [k]: v === d[k] ? '' : v }))

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">

          {/* Category */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Category</p>
            <div className="space-y-1">
              {facets.categories.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => set('category', c.key)}
                  className={[
                    'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors',
                    draft.category === c.key
                      ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span>{c.label}</span>
                  <span className="text-xs text-gray-400 ml-2">({c.count})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Location */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Location</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setDraft(d => ({ ...d, location: '' }))}
                className={['flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors', !draft.location ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
              >
                <span>All Locations</span>
              </button>
              {facets.locations.map(l => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => set('location', l.key)}
                  className={[
                    'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors',
                    draft.location === l.key
                      ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span>{l.label}</span>
                  <span className="text-xs text-gray-400 ml-2">({l.count})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Duration */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Duration</p>
            <div className="space-y-1">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, duration: prev.duration === d.key ? '' : d.key }))}
                  className={[
                    'flex w-full items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    draft.duration === d.key
                      ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          {/* Price */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Price Range (THB)</p>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min"
                value={draft.minPrice}
                onChange={e => setDraft(d => ({ ...d, minPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30"
              />
              <input
                type="number"
                placeholder="Max"
                value={draft.maxPrice}
                onChange={e => setDraft(d => ({ ...d, maxPrice: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30"
              />
            </div>
          </section>

          {/* Rating */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Rating</p>
            <div className="space-y-1">
              {RATING_OPTIONS.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, rating: prev.rating === r.key ? '' : r.key }))}
                  className={[
                    'flex w-full items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    draft.rating === r.key
                      ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          {/* Special */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Special</p>
            <button
              type="button"
              onClick={() => setDraft(d => ({ ...d, featured: d.featured === 'true' ? '' : 'true' }))}
              className={[
                'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                draft.featured === 'true'
                  ? 'bg-[#2534ff]/10 text-[#2534ff] font-semibold'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className={['w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                draft.featured === 'true' ? 'bg-[#2534ff] border-[#2534ff]' : 'border-gray-300'].join(' ')}>
                {draft.featured === 'true' && <span className="text-white text-[10px] leading-none">✓</span>}
              </span>
              Featured Only
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setDraft({ category: '', location: '', duration: '', minPrice: '', maxPrice: '', featured: '', rating: '' })
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 py-2.5 rounded-xl bg-[#2534ff] text-white text-sm font-semibold hover:bg-[#1e2ce6] transition-colors"
          >
            Show {totalResults} result{totalResults !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Sort Drawer ────────────────────────────────────────────────────────

interface SortDrawerProps {
  open:    boolean
  onClose: () => void
}

function MobileSortDrawer({ open, onClose }: SortDrawerProps) {
  const router = useRouter()
  const sp     = useSearchParams()
  const current = sp.get('sort') ?? ''

  const select = (v: string) => {
    const p = new URLSearchParams(sp.toString())
    if (v) p.set('sort', v)
    else   p.delete('sort')
    router.push(`/tours${p.toString() ? `?${p.toString()}` : ''}`)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Sort by</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-4 py-3 space-y-1">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => select(o.value)}
              className={[
                'flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm transition-colors',
                current === o.value
                  ? 'text-[#2534ff] font-semibold'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span>{o.label}</span>
              {current === o.value && (
                <span className="w-2 h-2 rounded-full bg-[#2534ff]" />
              )}
            </button>
          ))}
        </div>
        <div className="h-safe-bottom pb-4" />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TourFiltersClient({ facets, totalResults }: TourFiltersClientProps) {
  const router = useRouter()
  const sp     = useSearchParams()

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [sortDrawerOpen,   setSortDrawerOpen]   = useState(false)

  // URL param values
  const category = sp.get('category')  ?? ''
  const location = sp.get('location')  ?? ''
  const duration = sp.get('duration')  ?? ''
  const minPrice = sp.get('minPrice')  ?? ''
  const maxPrice = sp.get('maxPrice')  ?? ''
  const sort     = sp.get('sort')      ?? ''
  const featured = sp.get('featured')  ?? ''
  const rating   = sp.get('rating')    ?? ''

  const activeFilterCount = [category, location, duration, minPrice, maxPrice, featured, rating]
    .filter(Boolean).length

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Recommended'

  const navigate = useCallback((overrides: Record<string, string>) => {
    router.push(buildUrl(sp, overrides), { scroll: false })
  }, [router, sp])

  return (
    <>
      {/* ── Desktop Horizontal Filter Bar ──────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        {/* Category dropdown */}
        <Dropdown label={category ? (facets.categories.find(c => c.key === category)?.label ?? 'Category') : 'Category'} active={!!category}>
          <div className="space-y-0.5">
            <button
              onClick={() => navigate({ category: '' })}
              className={['w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !category ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
            >
              All Categories
            </button>
            {facets.categories.map(c => (
              <button
                key={c.key}
                onClick={() => navigate({ category: c.key === category ? '' : c.key })}
                className={['flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', category === c.key ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
              >
                <span>{c.label}</span>
                <span className="text-xs text-gray-400 ml-3">({c.count})</span>
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Location dropdown */}
        <Dropdown label={location ? (facets.locations.find(l => l.key === location)?.label ?? 'Location') : 'Location'} active={!!location}>
          <div className="space-y-0.5">
            <button
              onClick={() => navigate({ location: '' })}
              className={['w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', !location ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
            >
              All Locations
            </button>
            {facets.locations.map(l => (
              <button
                key={l.key}
                onClick={() => navigate({ location: l.key === location ? '' : l.key })}
                className={['flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', location === l.key ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
              >
                <span>{l.label}</span>
                <span className="text-xs text-gray-400 ml-3">({l.count})</span>
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Duration dropdown */}
        <Dropdown label={duration ? (DURATION_OPTIONS.find(d => d.key === duration)?.label ?? 'Duration') : 'Duration'} active={!!duration}>
          <div className="space-y-0.5">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d.key}
                onClick={() => navigate({ duration: d.key === duration ? '' : d.key })}
                className={['flex w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', duration === d.key ? 'text-[#2534ff] font-semibold bg-[#2534ff]/5' : 'text-gray-700 hover:bg-gray-50'].join(' ')}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Price dropdown */}
        <Dropdown
          label={minPrice || maxPrice ? `฿${minPrice || '0'} – ฿${maxPrice || '10k'}` : 'Price'}
          active={!!(minPrice || maxPrice)}
        >
          <div className="p-2 space-y-2 w-52">
            <p className="text-xs font-semibold text-gray-500 mb-1">Price range (THB)</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={e => navigate({ minPrice: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={e => navigate({ maxPrice: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/30"
              />
            </div>
          </div>
        </Dropdown>

        {/* All Filters button with count badge */}
        <button
          type="button"
          className={[
            'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap',
            activeFilterCount > 0
              ? 'bg-[#2534ff] text-white border-[#2534ff]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
          ].join(' ')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-white text-[#2534ff] rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort — desktop right side */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Sort by</label>
          <div className="relative">
            <select
              value={sort}
              onChange={e => navigate({ sort: e.target.value })}
              className="appearance-none border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] transition-all"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ───────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex divide-x divide-gray-200">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-[#2534ff] text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSortDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort: {sortLabel}
          </button>
        </div>
      </div>

      {/* ── Drawers ────────────────────────────────────────────────────────── */}
      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        facets={facets}
        totalResults={totalResults}
      />
      <MobileSortDrawer
        open={sortDrawerOpen}
        onClose={() => setSortDrawerOpen(false)}
      />
    </>
  )
}
