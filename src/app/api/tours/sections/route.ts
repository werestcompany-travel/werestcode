import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tours as staticTours } from '@/lib/tours'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

interface LightTour {
  slug: string
  title: string
  location: string
  rating: number
  reviewCount: number
  images: string[]
  options: { pricePerPerson: number }[]
  duration: string
  badge?: string | null
  category: string
  primaryLocation?: string
  isFeatured?: boolean
}

interface TourSection {
  id: string
  title: string
  subtitle: string
  tours: LightTour[]
  seeAllHref: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLight(t: any): LightTour {
  const opts = Array.isArray(t.options) ? t.options : []
  return {
    slug:            t.slug,
    title:           t.title,
    location:        t.location,
    rating:          t.rating,
    reviewCount:     t.reviewCount,
    images:          Array.isArray(t.images) ? [t.images[0]].filter(Boolean) : [],
    options:         opts.map((o: { pricePerPerson?: number }) => ({ pricePerPerson: o.pricePerPerson ?? 0 })),
    duration:        t.duration,
    badge:           t.badge ?? null,
    category:        t.category,
    primaryLocation: t.primaryLocation ?? undefined,
    isFeatured:      t.isFeatured ?? false,
  }
}

export async function GET() {
  try {
    // Attempt to fetch from DB
    let rawTours: LightTour[]

    try {
      const dbTours = await prisma.tour.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      })
      rawTours = dbTours.map(toLight)
    } catch {
      // Fallback to static tour data
      rawTours = staticTours.map(toLight)
    }

    const SECTION_DEFS: {
      id: string
      title: string
      subtitle: string
      seeAllHref: string
      filter: (t: LightTour) => boolean
      sort?: (a: LightTour, b: LightTour) => number
    }[] = [
      {
        id: 'bangkok',
        title: 'Popular in Bangkok',
        subtitle: 'Top-rated experiences in the capital',
        seeAllHref: '/tours?location=bangkok',
        filter: (t) => t.location.toLowerCase().includes('bangkok'),
      },
      {
        id: 'phuket',
        title: 'Phuket Experiences',
        subtitle: 'Island adventures and beach escapes',
        seeAllHref: '/tours?location=phuket',
        filter: (t) => t.location.toLowerCase().includes('phuket'),
      },
      {
        id: 'cultural',
        title: 'Cultural Tours',
        subtitle: 'Immerse yourself in Thai history and tradition',
        seeAllHref: '/tours?category=cultural',
        filter: (t) => t.category === 'cultural',
      },
      {
        id: 'day-trip',
        title: 'Day Trips',
        subtitle: 'Explore beyond the city on a full-day adventure',
        seeAllHref: '/tours?category=day-trip',
        filter: (t) => t.category === 'day-trip',
      },
      {
        id: 'top-rated',
        title: 'Top Rated',
        subtitle: 'Highest-rated tours loved by travellers',
        seeAllHref: '/tours?sort=rating',
        filter: (t) => t.rating >= 4.8,
        sort: (a, b) => b.rating - a.rating,
      },
    ]

    const sections: TourSection[] = SECTION_DEFS
      .map((def): TourSection => {
        let filtered = rawTours.filter(def.filter)
        if (def.sort) filtered = filtered.sort(def.sort)
        return {
          id:         def.id,
          title:      def.title,
          subtitle:   def.subtitle,
          tours:      filtered.slice(0, 8),
          seeAllHref: def.seeAllHref,
        }
      })
      .filter(s => s.tours.length > 0)

    return NextResponse.json({ sections, total: sections.length })
  } catch (err) {
    console.error('[api/tours/sections]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
