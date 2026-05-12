import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tours as staticTours, Tour } from '@/lib/tours'

export const dynamic = 'force-dynamic'
export const revalidate = 300

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
  // also check cities array
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
  // Categories
  const catCounts: Record<string, number> = {}
  const locCounts: Record<string, number> = {}
  const durCounts: Record<string, number> = { 'half-day': 0, 'full-day': 0, 'multi-day': 0 }
  let priceMin = Infinity
  let priceMax = 0

  for (const tour of tourList) {
    // category
    const cat = tour.category
    catCounts[cat] = (catCounts[cat] ?? 0) + 1

    // location — use primaryLocation first, fall back to location string
    const primary = tour.primaryLocation ?? tour.location.split(',')[0].trim()
    const locKey  = normalizeLocation(primary)
    locCounts[locKey] = (locCounts[locKey] ?? 0) + 1

    // duration
    const bucket = getDurationBucket(tour.duration)
    if (bucket) durCounts[bucket]++

    // price
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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') ?? ''
  const category = searchParams.get('category') ?? ''

  let tourList: Tour[] = []

  // 1. Try DB
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isActive: true },
    })
    if (dbTours.length > 0) {
      // Map Prisma records to Tour shape (subset sufficient for facets)
      tourList = dbTours.map((t) => ({
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
        primaryLocation: t.primaryLocation,
        tags: t.tags,
        priceFrom: t.priceFrom,
        isFeatured: t.isFeatured,
        isPopular: t.isPopular,
        instantConfirmation: t.instantConfirmation,
      }))
    }
  } catch {
    // DB unavailable — use static data
  }

  // 2. Fall back to static data
  if (tourList.length === 0) {
    tourList = staticTours
  }

  // 3. Apply pre-filters
  if (location) {
    const loc = location.toLowerCase()
    tourList = tourList.filter(t => matchesLocation(t, loc))
  }
  if (category) {
    tourList = tourList.filter(t => t.category === category)
  }

  const facets = buildFacets(tourList)

  return NextResponse.json(facets)
}
