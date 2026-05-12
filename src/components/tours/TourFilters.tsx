'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'

const CATEGORIES = [
  { key: 'day-trip',  label: 'Day Trips' },
  { key: 'cultural',  label: 'Cultural' },
  { key: 'food',      label: 'Food & Drink' },
  { key: 'nature',    label: 'Nature' },
  { key: 'water',     label: 'Water Activities' },
  { key: 'adventure', label: 'Adventure' },
]

const DURATIONS = [
  { key: 'half', label: 'Half day (up to 5 hrs)' },
  { key: 'full', label: 'Full day (5+ hrs)' },
]

const RATINGS = [
  { key: '4.5', label: '4.5 & above' },
  { key: '4.0', label: '4.0 & above' },
]

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 text-sm font-semibold text-gray-800 hover:text-gray-900"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-3.5 space-y-2">{children}</div>}
    </div>
  )
}

interface FilterCheckboxProps {
  label:    string
  checked:  boolean
  onChange: () => void
}
function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400'
        }`}
        onClick={onChange}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none" onClick={onChange}>
        {label}
      </span>
    </label>
  )
}

export default function TourFilters() {
  const router = useRouter()
  const sp     = useSearchParams()

  const currentCategory = sp.get('category') ?? ''
  const currentDuration = sp.get('duration') ?? ''
  const currentRating   = sp.get('rating')   ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/tours?${params.toString()}`, { scroll: false })
  }, [router, sp])

  const toggleCategory = (key: string) => update('category', currentCategory === key ? '' : key)
  const toggleDuration = (key: string) => update('duration', currentDuration === key ? '' : key)
  const toggleRating   = (key: string) => update('rating',   currentRating   === key ? '' : key)

  const hasFilters = !!(currentCategory || currentDuration || currentRating)

  const clearAll = () => {
    const params = new URLSearchParams(sp.toString())
    params.delete('category')
    params.delete('duration')
    params.delete('rating')
    const q = params.toString()
    router.push(q ? `/tours?${q}` : '/tours', { scroll: false })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <h2 className="text-[15px] font-bold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-4">
        {/* Category */}
        <Section title="Category">
          {CATEGORIES.map(c => (
            <FilterCheckbox
              key={c.key}
              label={c.label}
              checked={currentCategory === c.key}
              onChange={() => toggleCategory(c.key)}
            />
          ))}
        </Section>

        {/* Duration */}
        <Section title="Duration">
          {DURATIONS.map(d => (
            <FilterCheckbox
              key={d.key}
              label={d.label}
              checked={currentDuration === d.key}
              onChange={() => toggleDuration(d.key)}
            />
          ))}
        </Section>

        {/* Rating */}
        <Section title="Rating">
          {RATINGS.map(r => (
            <FilterCheckbox
              key={r.key}
              label={r.label}
              checked={currentRating === r.key}
              onChange={() => toggleRating(r.key)}
            />
          ))}
        </Section>
      </div>
    </div>
  )
}
