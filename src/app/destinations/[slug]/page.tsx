import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/db'
import { getToursForDestination, formatTHB } from '@/lib/tours'
import { MapPin, Star, ArrowRight, Clock, Users, Globe2, Ticket } from 'lucide-react'

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
          <Image src={dest.heroImage} alt={dest.name} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-4 text-center">
            <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-2">{dest.tagline}</p>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4">{dest.name}</h1>
            <p className="text-white/85 text-base sm:text-lg max-w-2xl leading-relaxed">{dest.description}</p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Link href={`/tours?destination=${dest.name}`}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> Explore Tours
              </Link>
              <Link href={`/attractions?location=${dest.name}`}
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm border border-white/30 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Browse Attractions
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

          {/* ── Highlights ── */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Why visit {dest.name}?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {dest.highlights.map(h => (
                <div key={h.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center hover:border-brand-300 hover:shadow-sm transition-all">
                  <span className="text-3xl block mb-2">{h.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{h.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tours ── */}
          {tours.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Tours in {dest.name}</h2>
                <Link href={`/tours?destination=${dest.name}`}
                  className="text-sm font-semibold text-brand-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tours.map(tour => (
                  <Link key={tour.slug} href={`/tours/${tour.slug}`}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all overflow-hidden group">
                    <div className="relative h-44">
                      {tour.images[0] && (
                        <Image src={tour.images[0]} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="500px" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {tour.badge && (
                        <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tour.badge}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{tour.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Max {tour.maxGroupSize}</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{tour.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">From</span>
                        <span className="text-base font-extrabold text-brand-600">
                          {formatTHB(Math.min(...tour.options.map(o => o.pricePerPerson)))}
                          <span className="text-xs font-normal text-gray-400">/person</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Attractions ── */}
          {attractions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Attractions in {dest.name}</h2>
                <Link href={`/attractions?location=${dest.name}`}
                  className="text-sm font-semibold text-brand-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {attractions.map(a => (
                  <Link key={a.slug} href={`/attractions/${a.slug}`}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all overflow-hidden group">
                    <div className="relative h-44 bg-gray-100">
                      {a.featureImage
                        ? <Image src={a.featureImage} alt={a.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="500px" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">{a.emoji}</div>
                      }
                      {a.badge && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{a.badge}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</p>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">{a.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-xs font-semibold text-gray-700">{a.rating}</span></div>
                        <span className="text-sm font-extrabold text-brand-600">{formatTHB(a.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Travel tips ── */}
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Travel Tips for {dest.name}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {dest.tips.map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 text-sm font-bold text-brand-600">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-brand-600 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to explore {dest.name}?</h2>
            <p className="text-white/80 mb-8 text-sm sm:text-base">Book your tours and transfers with Werest Travel — free cancellation, instant confirmation.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={`/tours?destination=${dest.name}`}
                className="bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> Browse Tours <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/"
                className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm">
                Book a Transfer
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
