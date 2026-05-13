'use client'

import Link from 'next/link'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import { tours as allTours } from '@/lib/tours'
import KlookCategorySection from '@/components/tours/KlookCategorySection'

/* ── Category display config ─────────────────────────────────────────────── */
const CATEGORIES = [
  { key: 'day-trip',  label: 'Day Trips'    },
  { key: 'cultural',  label: 'Cultural'     },
  { key: 'adventure', label: 'Adventure'    },
  { key: 'food',      label: 'Food & Drink' },
  { key: 'nature',    label: 'Nature'       },
  { key: 'water',     label: 'Water'        },
] as const

/* ── Destination → city filter term ─────────────────────────────────────── */
const DEST_CITY: Record<string, string> = {
  bangkok:   'Bangkok',
  phuket:    'Phuket',
  chiangmai: 'Chiang Mai',
  krabi:     'Krabi',
  pattaya:   'Pattaya',
}

interface Props {
  selectedDest: string
  cityName:     string
}

export default function DynamicTourSections({ selectedDest, cityName }: Props) {
  const cityFilter = DEST_CITY[selectedDest] ?? ''

  /* Filter tours for the selected city */
  const cityTours = cityFilter
    ? allTours.filter(t =>
        t.cities.some(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
      )
    : allTours

  /* Group by category — only categories that have ≥ 1 tour */
  const grouped = new Map<string, typeof allTours>()
  for (const tour of cityTours) {
    const list = grouped.get(tour.category) ?? []
    list.push(tour)
    grouped.set(tour.category, list)
  }

  const hasAny = cityTours.length > 0
  const toursHref = cityFilter
    ? `/tours?location=${encodeURIComponent(cityFilter.toLowerCase())}`
    : '/tours'

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
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
            href={toursHref}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {hasAny ? (
          <>
            {CATEGORIES.map(({ key, label }) => {
              const tours = grouped.get(key)
              if (!tours?.length) return null
              return (
                <KlookCategorySection
                  key={key}
                  label={label}
                  tours={tours.slice(0, 10)}
                />
              )
            })}

            {/* ── Explore all button ── */}
            <div className="flex justify-center mt-2 mb-4">
              <Link
                href={toursHref}
                className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-7 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Explore all experiences in {cityName}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          /* ── No tours yet ── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">🗺️</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Coming soon to {cityName}
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mb-6">
              We&apos;re curating the best experiences in {cityName}. In the
              meantime, explore our Bangkok tours.
            </p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
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
