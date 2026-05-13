import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourGrid from '@/components/tours/TourGrid'
import TripHeroSearch from '@/components/tours/TripHeroSearch'
import KlookCategorySection from '@/components/tours/KlookCategorySection'
import { tours as TOURS, type Tour } from '@/lib/tours'
import { prisma } from '@/lib/db'


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

const CATEGORY_CONFIGS = [
  { key: 'day-trip',  label: 'Day trips',   emoji: '🗓',  iconBg: '#FF5722', bg: '#FFF3EC' },
  { key: 'cultural',  label: 'Cultural',    emoji: '🏛️',  iconBg: '#7C3AED', bg: '#F3E5F5' },
  { key: 'adventure', label: 'Adventure',   emoji: '⛺',  iconBg: '#16A34A', bg: '#ECFDF5' },
  { key: 'food',      label: 'Food & Drink',emoji: '🍽️',  iconBg: '#D97706', bg: '#FFFBEB' },
  { key: 'nature',    label: 'Nature',      emoji: '🌿',  iconBg: '#15803D', bg: '#F0FDF4' },
  { key: 'water',     label: 'Water',       emoji: '🌊',  iconBg: '#1D4ED8', bg: '#EFF6FF' },
] as const

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

  // Group all tours by category for Klook sections
  const categoryGroups = new Map<string, Tour[]>()
  allTours.forEach(t => {
    const arr = categoryGroups.get(t.category) ?? []
    arr.push(t)
    categoryGroups.set(t.category, arr)
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

        {/* ── Trip.com-style Hero ───────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ minHeight: 355 }}>

          {/* Mountain landscape background */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?w=1920&q=80"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Dark gradient overlay — heavier on left for text legibility */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, rgba(15,10,55,0.72) 0%, rgba(30,20,80,0.55) 45%, rgba(60,40,120,0.28) 100%)' }}
            />
          </div>

          {/* Hero content */}
          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pb-12"
            style={{ paddingTop: 112 }}
          >
            {/* Title with orange dot */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 drop-shadow">
              Attractions &amp; Tours
              <span style={{ color: '#FF6D00' }}>.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/80 text-base sm:text-lg font-normal mb-6">
              Discover places and things to do
            </p>

            {/* Trip.com-style search bar */}
            <Suspense fallback={
              <div
                className="flex items-center bg-white rounded-xl overflow-hidden shadow-xl"
                style={{ height: 56, maxWidth: 780 }}
              >
                <div className="flex-1 h-5 mx-5 rounded bg-gray-100" />
                <div className="w-28 h-full shrink-0" style={{ background: '#1677FF' }} />
              </div>
            }>
              <TripHeroSearch />
            </Suspense>
          </div>

          {/* White curved bottom — slides content up smoothly */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white"
            style={{ height: 32, borderRadius: '32px 32px 0 0' }}
          />
        </section>

        {/* ── Tour listing ──────────────────────────────────────────────────── */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {hasFilters ? (
              /* ── Filtered view ── */
              <div className="py-8 pb-24">
                {/* Result count */}
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
              </div>
            ) : (
              /* ── Klook grouped sections view ── */
              <div className="py-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Unmissable experiences</h2>

                {/* Category panels */}
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

                {/* Explore all button */}
                <div className="flex justify-center mt-4 mb-10">
                  <Link
                    href="/tours?sort=popular"
                    className="flex items-center gap-2 border border-gray-300 rounded-full px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Explore all experiences
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Promo codes section */}
                <div className="border border-gray-100 rounded-2xl p-5 mb-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-[15px]">
                        <span className="mr-1.5">⚡</span>Promo codes
                      </p>
                      <p className="text-gray-400 text-[13px] mt-0.5">Redeem and save on bookings</p>
                    </div>
                    <Link
                      href="/tours"
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      View all
                    </Link>
                  </div>

                  {/* Promo pills */}
                  <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {[
                      { top: '10% off',   bottom: 'No min. spend' },
                      { top: '6% off',    bottom: 'Min. ฿3,000' },
                      { top: '5% off',    bottom: 'Min. ฿1,500' },
                      { top: 'Free cancel', bottom: 'On select tours' },
                      { top: '฿200 off',  bottom: 'Min. ฿5,000' },
                    ].map((pill) => (
                      <div
                        key={pill.top + pill.bottom}
                        className="border border-red-200 rounded-lg px-3 py-2 text-center shrink-0 w-[110px]"
                      >
                        <p className="text-red-500 font-bold text-sm">{pill.top}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">{pill.bottom}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browse by destination */}
                <div className="mt-4 pt-10 border-t border-gray-200 mb-8">
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
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
