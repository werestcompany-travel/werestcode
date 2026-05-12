import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourGrid from '@/components/tours/TourGrid'
import TourSearchInput from '@/components/tours/TourSearchInput'
import TourFilterBar from '@/components/tours/TourFilterBar'
import TourFiltersClient from '@/components/tours/TourFiltersClient'
import TourSidebarStatic from '@/components/tours/TourSidebarStatic'
import { tours as TOURS, type Tour } from '@/lib/tours'
import { prisma } from '@/lib/db'
import { Sparkles } from 'lucide-react'
import type { FilterFacets } from '@/components/tours/TourFiltersClient'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Experiences & Day Trips in Thailand | Werest Travel',
  description:
    'Discover the best day trips, cultural tours, food experiences and adventures across Thailand. Book with confidence — free cancellation, instant confirmation.',
  alternates: { canonical: 'https://www.werest.com/tours' },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  'day-trip':  'Day Trips',
  'cultural':  'Cultural',
  'food':      'Food & Drink',
  'adventure': 'Adventure',
  'nature':    'Nature',
  'water':     'Water',
}

const LOCATION_MAP: Record<string, string> = {
  'bangkok':    'Bangkok',
  'chiang-mai': 'Chiang Mai',
  'phuket':     'Phuket',
  'krabi':      'Krabi',
  'pattaya':    'Pattaya',
  'chiang-rai': 'Chiang Rai',
}

// ─── DB fetch ─────────────────────────────────────────────────────────────────

async function getAllTours(): Promise<Tour[]> {
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (dbTours.length > 0) {
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
  return TOURS
}

// ─── Duration parser ──────────────────────────────────────────────────────────

function parseDurationHours(duration: string): number | null {
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*hour/i)
  if (hourMatch) return parseFloat(hourMatch[1])
  const dayMatch  = duration.match(/(\d+)\s*day/i)
  if (dayMatch)   return parseInt(dayMatch[1]) * 8
  return null
}

// ─── Filter function ──────────────────────────────────────────────────────────

interface FilterParams {
  q?:        string
  category?: string
  location?: string
  duration?: string
  minPrice?: string
  maxPrice?: string
  featured?: string
  rating?:   string
  sort?:     string
}

function filterTours(tours: Tour[], params: FilterParams): Tour[] {
  let results = [...tours]

  const { q, category, location, duration, minPrice, maxPrice, featured, rating, sort } = params

  // Text search
  if (q) {
    const lower = q.toLowerCase()
    results = results.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.subtitle.toLowerCase().includes(lower) ||
      t.location.toLowerCase().includes(lower) ||
      t.cities.some(c => c.toLowerCase().includes(lower)) ||
      t.category.toLowerCase().includes(lower) ||
      t.highlights.some(h => h.toLowerCase().includes(lower))
    )
  }

  // Category
  if (category) {
    results = results.filter(t => t.category === category)
  }

  // Location — match against cities[], location string, and known location aliases
  if (location) {
    const lower = location.toLowerCase()
    // Support both slug form (e.g. "chiang-mai") and plain name (e.g. "Chiang Mai")
    const normalized = lower.replace(/-/g, ' ')
    results = results.filter(t =>
      t.cities.some(c => c.toLowerCase().includes(normalized) || c.toLowerCase().includes(lower)) ||
      t.location.toLowerCase().includes(normalized) ||
      t.location.toLowerCase().includes(lower)
    )
  }

  // Duration
  if (duration) {
    results = results.filter(t => {
      const hours = parseDurationHours(t.duration)
      const dStr  = t.duration.toLowerCase()
      if (duration === 'half-day') return dStr.includes('hour') && hours !== null && hours < 5
      if (duration === 'full-day') return (hours !== null && hours >= 5 && hours <= 10) || dStr.includes('full day')
      if (duration === 'multi-day') {
        const dayMatch = t.duration.match(/(\d+)\s*day/i)
        return !!(dayMatch && parseInt(dayMatch[1]) > 1)
      }
      return true
    })
  }

  // Price range
  const minP = minPrice ? Number(minPrice) : undefined
  const maxP = maxPrice ? Number(maxPrice) : undefined
  if (minP !== undefined || maxP !== undefined) {
    results = results.filter(t => {
      if (t.options.length === 0) return true
      const minOptionPrice = Math.min(...t.options.map(o => o.pricePerPerson))
      if (minP !== undefined && minOptionPrice < minP) return false
      if (maxP !== undefined && minOptionPrice > maxP) return false
      return true
    })
  }

  // Featured
  if (featured === 'true') {
    results = results.filter(t => t.badge === 'Best Seller' || t.badge === 'Top Rated')
  }

  // Rating
  if (rating) {
    const minRating = parseFloat(rating)
    results = results.filter(t => t.rating >= minRating)
  }

  // Sort
  if (sort === 'price-asc') {
    results.sort((a, b) => {
      const aMin = a.options.length ? Math.min(...a.options.map(o => o.pricePerPerson)) : 0
      const bMin = b.options.length ? Math.min(...b.options.map(o => o.pricePerPerson)) : 0
      return aMin - bMin
    })
  } else if (sort === 'price-desc') {
    results.sort((a, b) => {
      const aMin = a.options.length ? Math.min(...a.options.map(o => o.pricePerPerson)) : 0
      const bMin = b.options.length ? Math.min(...b.options.map(o => o.pricePerPerson)) : 0
      return bMin - aMin
    })
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating)
  } else if (sort === 'popular') {
    results.sort((a, b) => b.reviewCount - a.reviewCount)
  } else if (sort === 'newest') {
    results.reverse()
  }

  return results
}

// ─── Build facets ─────────────────────────────────────────────────────────────

function buildFacets(allTours: Tour[], activeFilters: { category?: string; location?: string }): FilterFacets {
  // For cross-filtering: if location is active, category counts reflect only those tours
  // If category is active, location counts reflect only those tours

  const baseForCategories = activeFilters.location
    ? filterTours(allTours, { location: activeFilters.location })
    : allTours

  const baseForLocations = activeFilters.category
    ? filterTours(allTours, { category: activeFilters.category })
    : allTours

  // Category facets
  const categoryCounts = new Map<string, number>()
  baseForCategories.forEach(t => {
    categoryCounts.set(t.category, (categoryCounts.get(t.category) ?? 0) + 1)
  })
  const categories = Object.entries(CATEGORY_MAP)
    .map(([key, label]) => ({ key, label, count: categoryCounts.get(key) ?? 0 }))
    .filter(c => c.count > 0)

  // Location facets — match against cities[]
  const locationCounts = new Map<string, number>()
  const locationKeys   = Object.keys(LOCATION_MAP)
  baseForLocations.forEach(t => {
    locationKeys.forEach(locKey => {
      const normalized = locKey.replace(/-/g, ' ')
      if (
        t.cities.some(c => c.toLowerCase().includes(normalized) || c.toLowerCase().includes(locKey)) ||
        t.location.toLowerCase().includes(normalized) ||
        t.location.toLowerCase().includes(locKey)
      ) {
        locationCounts.set(locKey, (locationCounts.get(locKey) ?? 0) + 1)
      }
    })
  })
  const locations = Object.entries(LOCATION_MAP)
    .map(([key, label]) => ({ key, label, count: locationCounts.get(key) ?? 0 }))
    .filter(l => l.count > 0)

  // Duration facets
  const durationCounts = { 'half-day': 0, 'full-day': 0, 'multi-day': 0 }
  allTours.forEach(t => {
    const hours = parseDurationHours(t.duration)
    const dStr  = t.duration.toLowerCase()
    if (dStr.includes('hour') && hours !== null && hours < 5)             durationCounts['half-day']++
    else if ((hours !== null && hours >= 5 && hours <= 10) || dStr.includes('full day')) durationCounts['full-day']++
    else {
      const dayMatch = t.duration.match(/(\d+)\s*day/i)
      if (dayMatch && parseInt(dayMatch[1]) > 1) durationCounts['multi-day']++
    }
  })
  const durations = [
    { key: 'half-day',  label: 'Half Day (< 5h)',  count: durationCounts['half-day'] },
    { key: 'full-day',  label: 'Full Day (5–10h)', count: durationCounts['full-day'] },
    { key: 'multi-day', label: 'Multi-Day',         count: durationCounts['multi-day'] },
  ]

  // Price range
  let min = Infinity, max = 0
  allTours.forEach(t => {
    t.options.forEach(o => {
      if (o.pricePerPerson < min) min = o.pricePerPerson
      if (o.pricePerPerson > max) max = o.pricePerPerson
    })
  })

  return {
    categories,
    locations,
    durations,
    priceRange: { min: min === Infinity ? 0 : min, max: max === 0 ? 10000 : max },
    total: allTours.length,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ToursPageProps {
  searchParams: {
    q?:        string
    category?: string
    location?: string
    sort?:     string
    duration?: string
    minPrice?: string
    maxPrice?: string
    featured?: string
    rating?:   string
    // Legacy params (kept for backwards compat)
    destination?: string
    type?:     string
    groupSize?: string
    language?: string
    date?:     string
  }
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const {
    q        = '',
    category = '',
    location = '',
    sort     = '',
    duration = '',
    minPrice = '',
    maxPrice = '',
    featured = '',
    rating   = '',
    // Legacy: map destination → location, type → category
    destination = '',
    type        = '',
  } = searchParams

  // Resolve location/category from legacy params
  const resolvedLocation = location || destination
  const resolvedCategory = category || type

  const allTours = await getAllTours()

  const filteredTours = filterTours(allTours, {
    q,
    category: resolvedCategory,
    location: resolvedLocation,
    sort,
    duration,
    minPrice,
    maxPrice,
    featured,
    rating,
  })

  const facets = buildFacets(allTours, {
    category: resolvedCategory,
    location: resolvedLocation,
  })

  const locationLabel = resolvedLocation
    ? (LOCATION_MAP[resolvedLocation.toLowerCase()] ?? resolvedLocation)
    : ''
  const categoryLabel = resolvedCategory
    ? (CATEGORY_MAP[resolvedCategory] ?? resolvedCategory)
    : ''

  const hasFilters = !!(q || resolvedCategory || resolvedLocation || duration || minPrice || maxPrice || featured || rating)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="bg-[#2534ff] pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-6">
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

          </div>
        </section>

        {/* ── Sticky Filter Bar (Klook-style pill row) ─────────────────────── */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Suspense>
              <TourFilterBar />
            </Suspense>
          </div>
        </div>

        {/* ── Desktop Horizontal Dropdown Filter Bar ────────────────────────── */}
        <div className="hidden lg:block bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <Suspense>
              <TourFiltersClient facets={facets} totalResults={filteredTours.length} />
            </Suspense>
          </div>
        </div>

        {/* ── 2-Column Layout ───────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          <div className="flex gap-8">

            {/* Left sidebar — desktop only */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-40 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Filter Results</h2>
                <Suspense>
                  <TourSidebarStatic facets={facets} />
                </Suspense>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* Result count + active context */}
              <p className="text-sm text-gray-600 mb-5">
                {filteredTours.length > 0 ? (
                  <>
                    <strong className="text-gray-900">{filteredTours.length}</strong>{' '}
                    experience{filteredTours.length !== 1 ? 's' : ''}
                    {locationLabel && (
                      <> in <strong className="text-[#2534ff]">{locationLabel}</strong></>
                    )}
                    {categoryLabel && (
                      <> · <strong>{categoryLabel}</strong></>
                    )}
                    {q && (
                      <> matching &ldquo;<strong className="text-[#2534ff]">{q}</strong>&rdquo;</>
                    )}
                  </>
                ) : (
                  <strong className="text-gray-900">No experiences found</strong>
                )}
              </p>

              {/* Tour grid or empty state */}
              {filteredTours.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">{q ? '🔍' : '🗺️'}</p>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">No experiences found</h2>
                  <p className="text-gray-500 mb-6">
                    {q
                      ? `We couldn't find experiences matching "${q}". Try different keywords.`
                      : resolvedLocation
                      ? `No experiences available in "${locationLabel}" yet.`
                      : 'No experiences match these filters.'}
                  </p>
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors text-sm"
                  >
                    Browse all experiences
                  </Link>
                </div>
              ) : (
                <TourGrid tours={filteredTours} />
              )}

              {/* Popular destination shortcuts — only when no filters active */}
              {!hasFilters && filteredTours.length > 0 && (
                <div className="mt-12 pt-10 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Browse by destination</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(LOCATION_MAP).map(([key, label]) => (
                      <Link
                        key={key}
                        href={`/tours?location=${encodeURIComponent(key)}`}
                        className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors shadow-sm"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
