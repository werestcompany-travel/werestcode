import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tours as staticTours, Tour } from '@/lib/tours'

export const dynamic = 'force-dynamic'

// ─── Label maps ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  'cultural':  'Cultural',
  'day-trip':  'Day Trips',
  'food':      'Food & Drink',
  'adventure': 'Adventure',
  'nature':    'Nature',
  'water':     'Water',
}

const LOCATION_LABELS: Record<string, string> = {
  'bangkok':     'Bangkok',
  'phuket':      'Phuket',
  'chiang-mai':  'Chiang Mai',
  'pattaya':     'Pattaya',
  'krabi':       'Krabi',
  'chiang-rai':  'Chiang Rai',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDurationHours(duration: string): number | null {
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*hour/i)
  if (hourMatch) return parseFloat(hourMatch[1])
  const dayMatch = duration.match(/(\d+(?:\.\d+)?)\s*day/i)
  if (dayMatch) return parseFloat(dayMatch[1]) * 24
  return null
}

function getDurationBucket(duration: string): 'half-day' | 'full-day' | 'multi-day' | null {
  const hours = parseDurationHours(duration)
  const dStr  = duration.toLowerCase()
  if (dStr.includes('day') && /(\d+)\s*day/i.test(duration)) {
    const dayMatch = duration.match(/(\d+)\s*day/i)
    if (dayMatch && parseInt(dayMatch[1]) > 1) return 'multi-day'
  }
  if (hours !== null && hours < 5)  return 'half-day'
  if (hours !== null && hours >= 5 && hours <= 10) return 'full-day'
  if (dStr.includes('full day')) return 'full-day'
  return null
}

function normalizeLocation(loc: string): string {
  return loc.toLowerCase().replace(/\s+/g, '-')
}

function matchesLocation(tour: Tour, locationKey: string): boolean {
  const loc = locationKey.toLowerCase()
  const primaryNorm = (tour.primaryLocation ?? '').toLowerCase().replace(/\s+/g, '-')
  if (primaryNorm === loc) return true
  return tour.cities.some(c => c.toLowerCase().replace(/\s+/g, '-') === loc || loc.includes(c.toLowerCase()))
}

function getMinPrice(tour: Tour): number {
  if (tour.priceFrom != null && tour.priceFrom > 0) return tour.priceFrom
  if (tour.options && tour.options.length > 0) {
    return Math.min(...tour.options.map((o: { pricePerPerson: number }) => o.pricePerPerson))
  }
  return 0
}

function buildFacets(tourList: Tour[]) {
  const catCounts: Record<string, number> = {}
  const locCounts: Record<string, number> = {}
  const durCounts: Record<string, number> = { 'half-day': 0, 'full-day': 0, 'multi-day': 0 }
  let priceMin = Infinity
  let priceMax = 0

  for (const tour of tourList) {
    const cat = tour.category
    catCounts[cat] = (catCounts[cat] ?? 0) + 1

    const primary = tour.primaryLocation ?? tour.location.split(',')[0].trim()
    const locKey  = normalizeLocation(primary)
    locCounts[locKey] = (locCounts[locKey] ?? 0) + 1

    const bucket = getDurationBucket(tour.duration)
    if (bucket) durCounts[bucket]++

    const minP = getMinPrice(tour)
    if (minP > 0) {
      if (minP < priceMin) priceMin = minP
      if (minP > priceMax) priceMax = minP
    }
  }

  const categories = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, count: catCounts[key] ?? 0 }))
    .filter(c => c.count > 0)

  const locations = Object.entries(LOCATION_LABELS)
    .map(([key, label]) => ({ key, label, count: locCounts[key] ?? 0 }))
    .filter(l => l.count > 0)

  const durations = [
    { key: 'half-day',  label: 'Half Day (< 5h)',  count: durCounts['half-day']  },
    { key: 'full-day',  label: 'Full Day (5–10h)', count: durCounts['full-day']  },
    { key: 'multi-day', label: 'Multi-Day',         count: durCounts['multi-day'] },
  ].filter(d => d.count > 0)

  return {
    categories,
    locations,
    durations,
    priceRange: {
      min: priceMin === Infinity ? 0 : priceMin,
      max: priceMax === 0 ? 5000 : priceMax,
    },
    total: tourList.length,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbTour(t: any): Tour {
  return {
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle ?? '',
    location: t.location,
    cities: t.cities,
    duration: t.duration,
    maxGroupSize: t.maxGroupSize,
    languages: t.languages,
    rating: t.rating,
    reviewCount: t.reviewCount,
    category: t.category as Tour['category'],
    badge: t.badge as Tour['badge'],
    images: t.images,
    highlights: t.highlights,
    description: t.description,
    includes: t.includes,
    excludes: t.excludes,
    itinerary: (t.itinerary as unknown as Tour['itinerary']) ?? [],
    options: (t.options as unknown as Tour['options']) ?? [],
    meetingPoint: t.meetingPoint ?? '',
    importantInfo: t.importantInfo,
    reviews: (t.reviews as unknown as Tour['reviews']) ?? [],
    primaryLocation: t.primaryLocation as string | undefined,
    tags: t.tags as string[] | undefined,
    priceFrom: t.priceFrom as number | undefined,
    isFeatured: t.isFeatured as boolean | undefined,
    isPopular: t.isPopular as boolean | undefined,
    instantConfirmation: t.instantConfirmation as boolean | undefined,
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const q         = searchParams.get('q')         ?? ''
  const category  = searchParams.get('category')  ?? ''
  const location  = searchParams.get('location')  ?? ''
  const duration  = searchParams.get('duration')  ?? ''
  const minPrice  = searchParams.get('minPrice')  ? Number(searchParams.get('minPrice'))  : undefined
  const maxPrice  = searchParams.get('maxPrice')  ? Number(searchParams.get('maxPrice'))  : undefined
  const sort      = searchParams.get('sort')      ?? 'recommended'
  const featured  = searchParams.get('featured')  ?? ''
  const page      = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
  const limit     = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)))

  let allTours: Tour[] = []
  let useDb = false

  // 1. Try Prisma DB
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (dbTours.length > 0) {
      allTours = dbTours.map(mapDbTour)
      useDb = true
    }
  } catch {
    // DB unavailable
  }

  // 2. Fall back to static data
  if (!useDb) {
    allTours = [...staticTours]
  }

  // ── Build facets on unfiltered set ──────────────────────────────────────────
  const facets = buildFacets(allTours)

  // ── Apply filters ───────────────────────────────────────────────────────────
  let filtered = allTours

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.subtitle.toLowerCase().includes(lower) ||
      t.location.toLowerCase().includes(lower) ||
      t.cities.some(c => c.toLowerCase().includes(lower)) ||
      t.category.toLowerCase().includes(lower) ||
      t.highlights.some(h => h.toLowerCase().includes(lower)) ||
      (t.tags ?? []).some(tag => tag.toLowerCase().includes(lower))
    )
  }

  if (location) {
    const loc = location.toLowerCase()
    filtered = filtered.filter(t => matchesLocation(t, loc))
  }

  if (category) {
    filtered = filtered.filter(t => t.category === category)
  }

  if (duration) {
    filtered = filtered.filter(t => getDurationBucket(t.duration) === duration)
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filtered = filtered.filter(t => {
      const p = getMinPrice(t)
      if (minPrice !== undefined && p < minPrice) return false
      if (maxPrice !== undefined && p > maxPrice) return false
      return true
    })
  }

  if (featured === 'true' || featured === '1') {
    filtered = filtered.filter(t => t.isFeatured === true)
  }

  // ── Sort ────────────────────────────────────────────────────────────────────
  switch (sort) {
    case 'popular':
      filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount)
      break
    case 'price-asc':
      filtered = [...filtered].sort((a, b) => getMinPrice(a) - getMinPrice(b))
      break
    case 'price-desc':
      filtered = [...filtered].sort((a, b) => getMinPrice(b) - getMinPrice(a))
      break
    case 'rating':
      filtered = [...filtered].sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      // Static data has no createdAt; for DB tours sort by createdAt handled below
      // For static fallback keep current order (already ordered by sortOrder)
      break
    case 'recommended':
    default:
      // Static: keep sortOrder (index order); DB already sorted by sortOrder
      break
  }

  // ── Paginate ────────────────────────────────────────────────────────────────
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const offset = (page - 1) * limit
  const paginated = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    tours: paginated,
    total,
    page,
    pages,
    facets,
  })
}
