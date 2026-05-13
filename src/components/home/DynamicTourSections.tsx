'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Star, Heart } from 'lucide-react'
import { tours as staticTours, type Tour, formatTHB } from '@/lib/tours'
import { useWishlist } from '@/context/WishlistContext'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00]',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-[#2534ff]',
}

interface TourSection {
  title: string
  subtitle: string
  filterType: 'location' | 'category' | 'featured'
  filterValue: string
  seeAllHref: string
  tours: Tour[]
}

function buildSections(): TourSection[] {
  const defs: Omit<TourSection, 'tours'>[] = [
    {
      title: 'Popular in Bangkok',
      subtitle: 'Top-rated experiences in the capital',
      filterType: 'location',
      filterValue: 'Bangkok',
      seeAllHref: '/tours?location=bangkok',
    },
    {
      title: 'Day Trips & Excursions',
      subtitle: 'Explore beyond the city on a full-day adventure',
      filterType: 'category',
      filterValue: 'day-trip',
      seeAllHref: '/tours?category=day-trip',
    },
    {
      title: 'Food & Drink Experiences',
      subtitle: 'Bangkok\'s street food, cooking classes & dinner cruises',
      filterType: 'category',
      filterValue: 'food',
      seeAllHref: '/tours?category=food',
    },
    {
      title: 'Cultural Tours',
      subtitle: 'Temples, history, and local life',
      filterType: 'category',
      filterValue: 'cultural',
      seeAllHref: '/tours?category=cultural',
    },
  ]

  return defs
    .map((def): TourSection => {
      let filtered: Tour[]
      if (def.filterType === 'location') {
        filtered = staticTours
          .filter(t => t.cities.some(c => c.toLowerCase().includes(def.filterValue.toLowerCase())))
          .sort((a, b) => b.reviewCount - a.reviewCount)
          .slice(0, 4)
      } else if (def.filterType === 'category') {
        filtered = staticTours
          .filter(t => t.category === def.filterValue)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)
      } else {
        filtered = [...staticTours]
          .filter(t => t.rating >= 4.8)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)
      }
      return { ...def, tours: filtered }
    })
    .filter(s => s.tours.length >= 2)
}

/* ── Compact tour card — matches "Things to do in [City]" style ── */
function TourCompactCard({ tour }: { tour: Tour }) {
  const { isWishlisted, toggle } = useWishlist()
  const wishlisted = isWishlisted(`tour:${tour.slug}`)

  const minPrice = tour.options.length
    ? Math.min(...tour.options.map(o => o.pricePerPerson))
    : (tour.priceFrom ?? 0)

  const city = tour.location.split(',')[0].trim()
  const catLabel = tour.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const dealTags = tour.highlights?.slice(0, 2) ?? []

  return (
    <div className="relative group flex flex-col shrink-0 w-[72vw] max-w-[260px] sm:w-auto sm:max-w-none snap-start">
      <Link
        href={`/tours/${tour.slug}`}
        className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-brand-100 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-40 lg:h-48 overflow-hidden shrink-0">
          {tour.images[0] ? (
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700" />
          )}

          {/* Badge — top left */}
          {tour.badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm ${BADGE_STYLES[tour.badge] ?? 'bg-gray-700'}`}>
                {tour.badge}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {/* Category · City */}
          <p className="text-gray-400 text-[11px] mb-1.5">{catLabel} · {city}</p>

          {/* Title */}
          <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors mb-1.5 flex-1">
            {tour.title}
          </p>

          {/* Book now */}
          <p className="text-[11px] text-green-600 font-medium mb-1.5">Book now for today</p>

          {/* Rating */}
          <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5 mb-2">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({tour.reviewCount.toLocaleString()})</span>
          </div>

          {/* Price */}
          {minPrice > 0 && (
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[10px] text-gray-400 leading-none">from</span>
              <span className="font-bold text-gray-900 text-[15px]">{formatTHB(minPrice)}</span>
            </div>
          )}

          {/* Deal tags */}
          {dealTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dealTags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Heart button — outside <Link> to prevent nesting */}
      <button
        type="button"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        onClick={async () => {
          await toggle({
            itemId:    `tour:${tour.slug}`,
            itemName:  tour.title,
            itemUrl:   `/tours/${tour.slug}`,
            itemType:  'tour',
            itemImage: tour.images?.[0],
          })
        }}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
      >
        <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
      </button>
    </div>
  )
}

export default function DynamicTourSections() {
  const sections = buildSections()
  if (sections.length === 0) return null

  return (
    <div className="bg-white">
      {sections.map((section, idx) => (
        <div key={section.filterType + section.filterValue}>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{section.subtitle}</p>
              </div>
              <Link
                href={section.seeAllHref}
                className="flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline shrink-0"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cards — horizontal scroll on mobile, 4-col grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {section.tours.map(tour => (
                <TourCompactCard key={tour.slug} tour={tour} />
              ))}
            </div>
          </section>

          {idx < sections.length - 1 && (
            <div className="border-t border-gray-100 mx-4" />
          )}
        </div>
      ))}
    </div>
  )
}
