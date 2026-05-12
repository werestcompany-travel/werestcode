import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourGrid from '@/components/tours/TourGrid'
import TourSearchInput from '@/components/tours/TourSearchInput'
import TourSortSelect from '@/components/tours/TourSortSelect'
import TourFilterBar from '@/components/tours/TourFilterBar'
import { searchTours, tours as TOURS, type Tour } from '@/lib/tours'
import { prisma } from '@/lib/db'
import { Sparkles, X } from 'lucide-react'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Experiences & Day Trips in Thailand | Werest Travel',
  description:
    'Discover the best day trips, cultural tours, food experiences and adventures across Thailand. Book with confidence — free cancellation, instant confirmation.',
  alternates: { canonical: 'https://www.werest.com/tours' },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: '',          label: 'All Experiences' },
  { key: 'day-trip',  label: 'Day Trips' },
  { key: 'cultural',  label: 'Cultural' },
  { key: 'food',      label: 'Food & Drink' },
  { key: 'nature',    label: 'Nature' },
  { key: 'water',     label: 'Water' },
  { key: 'adventure', label: 'Adventure' },
]

const POPULAR_DESTINATIONS = [
  'Bangkok', 'Chiang Mai', 'Phuket', 'Krabi', 'Pattaya',
]

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ToursPageProps {
  searchParams: {
    q?: string
    destination?: string
    category?: string
    date?: string
    type?: string
    sort?: string
    duration?: string
    minPrice?: string
    maxPrice?: string
    groupSize?: string
    language?: string
  }
}

async function getAllTours(): Promise<Tour[]> {
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (dbTours.length > 0) {
      // Map DB Tour fields to the Tour interface shape
      return dbTours.map(t => ({
        slug:          t.slug,
        title:         t.title,
        subtitle:      t.subtitle ?? '',
        location:      t.location,
        cities:        t.cities,
        duration:      t.duration,
        maxGroupSize:  t.maxGroupSize,
        languages:     t.languages,
        rating:        t.rating,
        reviewCount:   t.reviewCount,
        category:      t.category as Tour['category'],
        badge:         t.badge as Tour['badge'] ?? undefined,
        images:        t.images,
        highlights:    t.highlights,
        description:   t.description,
        includes:      t.includes,
        excludes:      t.excludes,
        itinerary:     (t.itinerary as unknown as Tour['itinerary']) ?? [],
        options:       (t.options as unknown as Tour['options']) ?? [],
        meetingPoint:  t.meetingPoint ?? '',
        importantInfo: t.importantInfo,
        reviews:       (t.reviews as unknown as Tour['reviews']) ?? [],
      }))
    }
  } catch (err) {
    console.warn('[tours/page] DB fetch failed, falling back to static data:', err)
  }
  // Fall back to hardcoded seed data
  return TOURS
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const {
    q = '', destination = '', category = '', date = '', type = '', sort = '',
    duration = '', minPrice = '', maxPrice = '', groupSize = '', language = '',
  } = searchParams

  const allTours = await getAllTours()
  const tours = searchTours({
    q, destination, category, type, sort, duration,
    minPrice:   minPrice  ? Number(minPrice)  : undefined,
    maxPrice:   maxPrice  ? Number(maxPrice)  : undefined,
    groupSize:  groupSize ? Number(groupSize) : undefined,
    language,
  }, allTours)
  const hasFilters = !!(q || destination || category || duration || minPrice || maxPrice || groupSize || language)

  // Build a URL with the current params except what you want to change
  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams()
    const base = { q, destination, category, date, type, sort, duration, minPrice, maxPrice, groupSize, language }
    const merged = { ...base, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const s = p.toString()
    return `/tours${s ? `?${s}` : ''}`
  }

  const clearAllUrl = '/tours'

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-[#2534ff] pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Title row + search input */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-white/70" />
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Curated Experiences</p>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                  Experiences & Day Trips
                </h1>
                <p className="text-white/70 text-base mt-2 max-w-xl">
                  Hand-picked tours across Thailand — expert guides, free cancellation, instant confirmation.
                </p>
              </div>

              {/* Search input */}
              <div className="sm:w-72 shrink-0">
                <Suspense>
                  <TourSearchInput />
                </Suspense>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const isActive = category === cat.key
                const href = buildUrl({ category: cat.key })
                return (
                  <Link
                    key={cat.key}
                    href={href}
                    className={[
                      'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                      isActive
                        ? 'bg-white text-[#2534ff] border-white'
                        : 'bg-white/15 text-white border-white/30 hover:bg-white/25',
                    ].join(' ')}
                  >
                    {cat.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Filter bar ───────────────────────────────────────────────── */}
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Suspense>
              <TourFilterBar />
            </Suspense>
          </div>
        </section>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Sort dropdown */}
          <div className="flex items-center justify-end mb-4">
            <label className="text-xs text-gray-500 mr-2 shrink-0">Sort by</label>
            <Suspense>
              <TourSortSelect />
            </Suspense>
          </div>

          {/* Active filter chips + result summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {/* Result count */}
              <p className="text-sm text-gray-600">
                {tours.length > 0 ? (
                  <><span className="font-semibold text-gray-900">{tours.length}</span> experience{tours.length !== 1 ? 's' : ''}</>
                ) : (
                  <span className="font-semibold text-gray-900">No experiences found</span>
                )}
                {destination && <> near <span className="font-semibold text-[#2534ff]">{destination}</span></>}
                {q && <> for &quot;<span className="font-semibold text-[#2534ff]">{q}</span>&quot;</>}
              </p>

              {/* Active filter chips */}
              {destination && (
                <Link
                  href={buildUrl({ destination: '' })}
                  className="flex items-center gap-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2.5 py-1 hover:bg-brand-100 transition-colors"
                >
                  📍 {destination}
                  <X className="w-3 h-3" />
                </Link>
              )}
              {category && (
                <Link
                  href={buildUrl({ category: '' })}
                  className="flex items-center gap-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-2.5 py-1 hover:bg-brand-100 transition-colors"
                >
                  🏷 {CATEGORIES.find(c => c.key === category)?.label ?? category}
                  <X className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Clear all */}
            {hasFilters && (
              <Link
                href={clearAllUrl}
                className="text-sm text-[#2534ff] hover:underline font-medium shrink-0"
              >
                Clear all filters
              </Link>
            )}
          </div>

          {/* Tour grid */}
          {tours.length === 0 ? (

            <div className="text-center py-20">
              <p className="text-5xl mb-4">{q ? '🔍' : '🗺️'}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No experiences found</h2>
              <p className="text-gray-500 mb-6">
                {q
                  ? `We couldn't find experiences matching "${q}". Try different keywords.`
                  : destination
                  ? `No experiences available near "${destination}" yet. Check back soon!`
                  : 'No experiences available in this category yet.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <p className="w-full text-xs text-gray-400 mb-1">Try one of these destinations:</p>
                {POPULAR_DESTINATIONS.map(d => (
                  <Link
                    key={d}
                    href={buildUrl({ destination: d, q: '', category: '' })}
                    className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#2534ff] hover:text-[#2534ff] bg-white transition-colors"
                  >
                    {d}
                  </Link>
                ))}
              </div>
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors text-sm"
              >
                Browse all experiences
              </Link>
            </div>
          ) : (
            <TourGrid tours={tours} />
          )}

          {/* Popular destination shortcuts — only when no filters active */}
          {!hasFilters && tours.length > 0 && (
            <div className="mt-12 pt-10 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Browse by destination</p>
              <div className="flex flex-wrap gap-3">
                {POPULAR_DESTINATIONS.map(d => (
                  <Link
                    key={d}
                    href={`/tours?destination=${encodeURIComponent(d)}`}
                    className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors shadow-sm"
                  >
                    {d}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  )
}
