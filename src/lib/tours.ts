// ─── Tour types & helpers ─────────────────────────────────────────────────────

export interface TourOption {
  id: string
  time: string           // e.g. "07:00 AM"
  label?: string         // optional label e.g. "Morning departure"
  pricePerPerson: number // adult price in THB
  childPrice: number     // child (3–11) price in THB
  availability: 'available' | 'limited' | 'full'
}

export interface TourItineraryItem {
  step?: string
  title: string
  desc: string
}

export interface TourReview {
  name: string
  country: string
  rating: number
  date: string
  text: string
}

export interface Tour {
  slug: string
  title: string
  subtitle: string
  location: string
  cities: string[]      // destination keywords for matching
  duration: string
  maxGroupSize: number
  languages: string[]
  rating: number
  reviewCount: number
  category: 'day-trip' | 'cultural' | 'adventure' | 'food' | 'nature' | 'water'
  badge?: 'Best Seller' | 'New' | 'Top Rated'
  images: string[]
  highlights: string[]
  description: string
  includes: string[]
  excludes: string[]
  itinerary: TourItineraryItem[]
  options: TourOption[]
  meetingPoint: string
  importantInfo: string[]
  reviews: TourReview[]
  // Feature 5 – Spots & sold-out
  spotsLeft?: number
  soldOut?: boolean
  // Feature 6 – Last booked
  lastBooked?: string
  // Feature 7 – Video preview
  videoUrl?: string
  // Feature 8 – Rating breakdown
  ratingBreakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number }
  // Feature 9 – Frequently booked together
  frequentlyBookedWith?: string[]
  // New fields
  tags?: string[]
  primaryLocation?: string
  subLocation?: string
  priceFrom?: number
  discountPrice?: number
  isFeatured?: boolean
  isPopular?: boolean
  isTrending?: boolean
  instantConfirmation?: boolean
}

export interface TourSearchParams {
  q?:           string
  destination?: string
  category?:    string
  type?:        string
  sort?:        string
  duration?:    'half-day' | 'full-day' | 'multi-day' | string
  minPrice?:    number
  maxPrice?:    number
  groupSize?:   number
  language?:    string
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString('en-US')}`
}

// ─── DB mapper ────────────────────────────────────────────────────────────────

import { Tour as PrismaTour } from '@prisma/client'

export function mapDbTour(t: PrismaTour): Tour {
  return {
    slug:               t.slug,
    title:              t.title,
    subtitle:           t.subtitle ?? '',
    location:           t.location,
    cities:             t.cities,
    duration:           t.duration,
    maxGroupSize:       t.maxGroupSize,
    languages:          t.languages,
    rating:             t.rating,
    reviewCount:        t.reviewCount,
    category:           t.category as Tour['category'],
    badge:              t.badge as Tour['badge'],
    images:             t.images,
    highlights:         t.highlights,
    description:        t.description,
    includes:           t.includes,
    excludes:           t.excludes,
    itinerary:          (t.itinerary as unknown as Tour['itinerary']) ?? [],
    options:            (t.options   as unknown as Tour['options'])   ?? [],
    meetingPoint:       t.meetingPoint ?? '',
    importantInfo:      t.importantInfo,
    reviews:            (t.reviews   as unknown as Tour['reviews'])   ?? [],
    primaryLocation:    t.primaryLocation ?? undefined,
    tags:               t.tags,
    priceFrom:          t.priceFrom ?? undefined,
    isFeatured:         t.isFeatured,
    isPopular:          t.isPopular,
    instantConfirmation: t.instantConfirmation,
  }
}

// ─── DB-backed helpers ────────────────────────────────────────────────────────

import { prisma } from '@/lib/db'

export async function getAllTours(): Promise<Tour[]> {
  const rows = await prisma.tour.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(mapDbTour)
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const row = await prisma.tour.findUnique({ where: { slug, isActive: true } })
  return row ? mapDbTour(row) : null
}

export async function getToursForDestination(destination: string, limit?: number): Promise<Tour[]> {
  const lower = destination.toLowerCase()
  // Use DB full-text search via case-insensitive contains across cities array
  // Prisma doesn't support array element contains natively in a single filter
  // so we fetch all active tours and filter in JS (same as the old static approach)
  const rows = await prisma.tour.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  const tours = rows.map(mapDbTour)
  const filtered = tours.filter(t =>
    t.cities.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())) ||
    t.location.toLowerCase().includes(lower)
  )
  return limit ? filtered.slice(0, limit) : filtered
}

export async function searchTours(params: string | TourSearchParams): Promise<Tour[]> {
  const {
    q = '', destination = '', category = '', type = '', duration = '',
    minPrice, maxPrice, groupSize, language = '',
  } = typeof params === 'string' ? { q: params } : params

  const rows = await prisma.tour.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  let results = rows.map(mapDbTour)

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

  if (destination) {
    const lower = destination.toLowerCase()
    results = results.filter(t =>
      t.cities.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())) ||
      t.location.toLowerCase().includes(lower)
    )
  }

  if (category) {
    results = results.filter(t => t.category === category)
  }

  if (type && !category) {
    results = results.filter(t => t.category === type)
  }

  if (duration) {
    results = results.filter(t => {
      const dStr = t.duration.toLowerCase()
      const hourMatch = t.duration.match(/(\d+(?:\.\d+)?)\s*hour/i)
      const hours = hourMatch ? parseFloat(hourMatch[1]) : null
      if (duration === 'half-day') return dStr.includes('hour') && hours !== null && hours < 5
      if (duration === 'full-day') return (hours !== null && hours >= 5 && hours <= 10) || dStr.includes('full day')
      if (duration === 'multi-day') {
        const dayMatch = t.duration.match(/(\d+)\s*day/i)
        return !!(dayMatch && parseInt(dayMatch[1]) > 1)
      }
      return true
    })
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    results = results.filter(t => {
      const minP = t.priceFrom ?? (t.options.length > 0 ? Math.min(...t.options.map(o => o.pricePerPerson)) : 0)
      if (minPrice !== undefined && minP < minPrice) return false
      if (maxPrice !== undefined && minP > maxPrice) return false
      return true
    })
  }

  if (groupSize !== undefined && groupSize > 0) {
    results = results.filter(t => t.maxGroupSize >= groupSize)
  }

  if (language) {
    results = results.filter(t =>
      t.languages.some(l => l.toLowerCase() === language.toLowerCase())
    )
  }

  return results
}
