'use client'

import Link from 'next/link'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import { tours as staticTours } from '@/lib/tours'
import KlookCategorySection from '@/components/tours/KlookCategorySection'

/* ── Category config — admin sets up tours; these labels/styles are the display layer ── */
const CATEGORY_CONFIGS = [
  { key: 'day-trip',  label: 'Day Trips',    emoji: '🗓',   iconBg: '#FF5722', bg: '#FFF3EC' },
  { key: 'cultural',  label: 'Cultural',     emoji: '🏛️',  iconBg: '#7C3AED', bg: '#F3E5F5' },
  { key: 'adventure', label: 'Adventure',    emoji: '⛺',  iconBg: '#16A34A', bg: '#ECFDF5' },
  { key: 'food',      label: 'Food & Drink', emoji: '🍽️',  iconBg: '#D97706', bg: '#FFFBEB' },
  { key: 'nature',    label: 'Nature',       emoji: '🌿',  iconBg: '#15803D', bg: '#F0FDF4' },
  { key: 'water',     label: 'Water',        emoji: '🌊',  iconBg: '#1D4ED8', bg: '#EFF6FF' },
] as const

/* ── Map destination id → city search term (matches tours[].cities[]) ── */
const DEST_TO_CITY: Record<string, string> = {
  anywhere:  '',
  bangkok:   'Bangkok',
  phuket:    'Phuket',
  chiangmai: 'Chiang Mai',
  krabi:     'Krabi',
  pattaya:   'Pattaya',
  huahin:    'Hua Hin',
  samui:     'Koh Samui',
  ayutthaya: 'Ayutthaya',
}

interface Props {
  selectedDest: string
  cityName: string
}

export default function DynamicTourSections({ selectedDest, cityName }: Props) {
  const cityFilter = DEST_TO_CITY[selectedDest] ?? ''

  /* Filter tours for selected city (empty = all tours) */
  const cityTours = cityFilter
    ? staticTours.filter(t =>
        t.cities.some(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
      )
    : staticTours

  /* Group by category — only categories that have at least 1 tour */
  const categoryGroups = new Map<string, typeof staticTours>()
  cityTours.forEach(t => {
    const arr = categoryGroups.get(t.category) ?? []
    arr.push(t)
    categoryGroups.set(t.category, arr)
  })

  const hasAnyTours = cityTours.length > 0

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Things to do in{' '}
              <span className="text-brand-600">{cityName}</span>
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Handpicked experiences — book instantly
            </p>
          </div>
          <Link
            href={cityFilter ? `/tours?location=${encodeURIComponent(cityFilter.toLowerCase())}` : '/tours'}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {hasAnyTours ? (
          <>
            {/* ── Per-category Klook-style rows ── */}
            {CATEGORY_CONFIGS.map(cat => {
              const tours = categoryGroups.get(cat.key) ?? []
              if (!tours.length) return null
              return (
                <KlookCategorySection
                  key={cat.key}
                  category={cat}
                  tours={tours.slice(0, 8)}
                />
              )
            })}

            {/* ── Explore all button ── */}
            <div className="flex justify-center mt-2 mb-4">
              <Link
                href={cityFilter ? `/tours?location=${encodeURIComponent(cityFilter.toLowerCase())}` : '/tours'}
                className="flex items-center gap-2 border border-gray-300 rounded-full px-7 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Explore all experiences in {cityName}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          /* ── Coming soon state for cities with no tours yet ── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">🗺️</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Coming soon to {cityName}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mb-6">
              We&apos;re curating the best experiences in {cityName}. In the meantime, explore our Bangkok tours.
            </p>
            <Link
              href="/tours"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Browse all experiences
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}
