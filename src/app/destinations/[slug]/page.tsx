import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getToursForDestination, formatTHB } from '@/lib/tours'
import DestinationPageClient from '@/components/destinations/DestinationPageClient'

// ─── Destination config ───────────────────────────────────────────────────────

interface DestinationConfig {
  name:         string
  tagline:      string
  description:  string
  heroImage:    string
  searchTerms:  string[]   // used to query attractions by location
  highlights:   { emoji: string; label: string }[]
  tips:         string[]
}

const DESTINATIONS: Record<string, DestinationConfig> = {
  'bangkok': {
    name:        'Bangkok',
    tagline:     'The City of Angels',
    description: 'A dazzling metropolis of ornate temples, legendary street food, sky-high rooftop bars and one of Asia\'s greatest shopping scenes. Bangkok is a city that never stops surprising.',
    heroImage:   'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Bangkok', 'BKK', 'Suvarnabhumi'],
    highlights: [
      { emoji: '🛕', label: 'Grand Palace & Temples' },
      { emoji: '🌊', label: 'Chao Phraya River' },
      { emoji: '🛒', label: 'Chatuchak Weekend Market' },
      { emoji: '🍜', label: 'World-class Street Food' },
      { emoji: '🌆', label: 'Rooftop Bars & Nightlife' },
      { emoji: '🚤', label: 'Floating Markets Day Trips' },
    ],
    tips: [
      'Take the BTS Skytrain to avoid Bangkok\'s notorious traffic.',
      'Dress modestly when visiting temples — shoulders and knees covered.',
      'Best visited November to February for cooler weather.',
      'Tuk-tuks are iconic but always agree on a price before getting in.',
    ],
  },
  'phuket': {
    name:        'Phuket',
    tagline:     'Thailand\'s Pearl Island',
    description: 'Crystal-clear waters, powdery white sand beaches, lush jungle interiors and vibrant beach towns. Phuket delivers the quintessential Thailand beach experience with world-class resorts and diving.',
    heroImage:   'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Phuket', 'HKT'],
    highlights: [
      { emoji: '🏖️', label: 'Patong & Kata Beaches' },
      { emoji: '🤿', label: 'Scuba Diving & Snorkelling' },
      { emoji: '🏝️', label: 'Phi Phi Island Day Trips' },
      { emoji: '🐘', label: 'Elephant Sanctuary' },
      { emoji: '🌅', label: 'Phang Nga Bay' },
      { emoji: '🦑', label: 'Seafood & Sunset Dining' },
    ],
    tips: [
      'High season is November to April — book accommodation early.',
      'Rent a motorbike or hire a driver to explore beyond Patong.',
      'The west coast has the best beaches; east coast suits families.',
      'Island-hop to Phi Phi Islands or James Bond Island for a full-day experience.',
    ],
  },
  'chiang-mai': {
    name:        'Chiang Mai',
    tagline:     'Rose of the North',
    description: 'A cultural treasure in northern Thailand surrounded by misty mountains, ancient temples and lush countryside. Chiang Mai is famous for its elephant sanctuaries, night markets, cooking classes and trekking.',
    heroImage:   'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Chiang Mai', 'CNX'],
    highlights: [
      { emoji: '🐘', label: 'Ethical Elephant Sanctuaries' },
      { emoji: '🛕', label: 'Doi Suthep Temple' },
      { emoji: '🍛', label: 'Thai Cooking Classes' },
      { emoji: '🏔️', label: 'Mountain Trekking' },
      { emoji: '🌙', label: 'Sunday & Night Bazaars' },
      { emoji: '💆', label: 'Traditional Thai Massage' },
    ],
    tips: [
      'November to February is the best time — cool and dry.',
      'The Old City moat area has the most temples and atmosphere.',
      'March and April can bring smoky haze from burning season.',
      'Book elephant sanctuaries in advance — ethical ones fill quickly.',
    ],
  },
  'pattaya': {
    name:        'Pattaya',
    tagline:     'More than you expect',
    description: 'Thailand\'s most visited seaside resort city has transformed dramatically. Beyond the beaches, discover world-class go-kart tracks, vibrant culture shows, water parks, golf courses and a surprisingly great food scene.',
    heroImage:   'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Pattaya', 'Jomtien'],
    highlights: [
      { emoji: '🏖️', label: 'Jomtien & Naklua Beaches' },
      { emoji: '🎭', label: 'Alcazar Cabaret Show' },
      { emoji: '🛥️', label: 'Coral Island Boat Trips' },
      { emoji: '🏎️', label: 'Go-Kart & Karting Track' },
      { emoji: '🐬', label: 'Nong Nooch Tropical Garden' },
      { emoji: '⛳', label: 'World-class Golf Courses' },
    ],
    tips: [
      'North Pattaya and Naklua area are calmer and family-friendly.',
      'Hire a baht bus (songthaew) for cheap transport around the city.',
      'Coral Island (Koh Larn) is just a 30-minute ferry ride away.',
      'Early morning or late afternoon visits to attractions avoid the heat.',
    ],
  },
  'krabi': {
    name:        'Krabi',
    tagline:     'Limestone Cliffs & Emerald Waters',
    description: 'Dramatic limestone karsts, pristine national park beaches, world-famous rock climbing and island-hopping adventures make Krabi one of Thailand\'s most photogenic destinations.',
    heroImage:   'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Krabi', 'KBV', 'Ao Nang', 'Railay'],
    highlights: [
      { emoji: '🧗', label: 'Rock Climbing at Railay' },
      { emoji: '🏝️', label: 'Four Islands Tour' },
      { emoji: '🌊', label: 'Ao Nang Beach' },
      { emoji: '🦈', label: 'Tiger Cave Temple Hike' },
      { emoji: '🚣', label: 'Kayaking & Sea Caves' },
      { emoji: '🐠', label: 'Snorkelling & Diving' },
    ],
    tips: [
      'Stay in Ao Nang for convenience; Railay Beach for isolation (boat access only).',
      'November to April is ideal — avoid May–October monsoon season.',
      'Long-tail boat taxis connect the beaches.',
      'Book the Four Islands tour directly at the beach for best rates.',
    ],
  },
  'koh-samui': {
    name:        'Koh Samui',
    tagline:     'Tropical Island Paradise',
    description: 'Thailand\'s second-largest island combines luxury resorts, crystal waters, a vibrant beach party scene and serene wellness retreats. Perfect for honeymoons, family holidays and adventure alike.',
    heroImage:   'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1600&q=80',
    searchTerms: ['Koh Samui', 'Samui', 'USM'],
    highlights: [
      { emoji: '🏖️', label: 'Chaweng & Lamai Beaches' },
      { emoji: '🌊', label: 'Ang Thong Marine Park' },
      { emoji: '🐘', label: 'Elephant Trekking' },
      { emoji: '💆', label: 'Wellness & Spa Retreats' },
      { emoji: '🛥️', label: 'Koh Tao Dive Trips' },
      { emoji: '🌙', label: 'Full Moon Party (Koh Phangan)' },
    ],
    tips: [
      'December to April is peak season; book flights and hotels early.',
      'Rent a motorbike or hire a driver — taxis can be expensive.',
      'Big Buddha temple and Grandfather Rock are free to visit.',
      'Take a day trip to the Ang Thong Marine Park — truly stunning.',
    ],
  },
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = DESTINATIONS[params.slug]
  if (!dest) return {}
  return {
    title:       `${dest.name}, Thailand — Tours, Attractions & Travel Guide`,
    description: dest.description,
    openGraph: {
      title:       `${dest.name} Travel Guide — Werest Travel`,
      description: dest.description,
      images:      [{ url: dest.heroImage }],
    },
  }
}

export function generateStaticParams() {
  return Object.keys(DESTINATIONS).map(slug => ({ slug }))
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = DESTINATIONS[params.slug]
  if (!dest) notFound()

  // Tours relevant to this destination
  const tours = getToursForDestination(dest.name).slice(0, 6)

  // Attractions from DB
  let attractions: { slug: string; name: string; location: string; price: number; rating: number; featureImage: string | null; emoji: string; badge: string | null }[] = []
  try {
    const rows = await prisma.attractionListing.findMany({
      where: {
        isActive: true,
        OR: dest.searchTerms.map(term => ({ location: { contains: term, mode: 'insensitive' as const } })),
      },
      select: { slug: true, name: true, location: true, price: true, rating: true, featureImage: true, emoji: true, badge: true },
      take: 6,
      orderBy: { sortOrder: 'asc' },
    })
    attractions = rows
  } catch {
    // DB unavailable
  }

  // Shape attractions for client component
  const shapedAttractions = attractions.map((a: { slug: string; name: string; location: string; price: number; rating: number; featureImage: string | null }) => ({
    slug: a.slug,
    name: a.name,
    location: a.location,
    rating: a.rating,
    featureImage: a.featureImage ?? undefined,
    packages: [{ adultPrice: a.price }],
  }))

  return (
    <DestinationPageClient
      dest={dest}
      tours={tours}
      attractions={shapedAttractions}
      formatTHB={formatTHB}
    />
  )
}
