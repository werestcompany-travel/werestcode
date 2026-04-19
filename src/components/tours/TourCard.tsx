'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, CheckCircle2, Plus, Check } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

interface TourCardProps {
  tour: Tour
  /** When provided, the card shows an "Add to trip" toggle */
  selected?: boolean
  onToggle?: (slug: string) => void
  /** Optional extra URL params to carry through to the tour page */
  bookingParams?: string
}

const BADGE_COLOUR: Record<string, string> = {
  'Best Seller': 'bg-amber-400 text-white',
  'Top Rated':   'bg-green-500 text-white',
  'New':         'bg-brand-600 text-white',
}

const CATEGORY_LABEL: Record<string, string> = {
  'day-trip':  'Day Trip',
  'cultural':  'Cultural',
  'adventure': 'Adventure',
  'food':      'Food & Drink',
  'nature':    'Nature',
  'water':     'Water Activity',
}

export default function TourCard({ tour, selected = false, onToggle, bookingParams }: TourCardProps) {
  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))
  const href = bookingParams
    ? `/tours/${tour.slug}?${bookingParams}`
    : `/tours/${tour.slug}`

  return (
    <article className={`group flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-200
      ${selected
        ? 'border-brand-500 shadow-[0_0_0_2px_#2534ff40,0_8px_32px_rgba(37,52,255,0.15)]'
        : 'border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.13)] hover:-translate-y-0.5'
      }`}
    >
      {/* Image */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden shrink-0">
        {tour.images[0] ? (
          <Image
            src={tour.images[0]}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-indigo-700" />
        )}
        {/* Badge */}
        {tour.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${BADGE_COLOUR[tour.badge] ?? 'bg-gray-700 text-white'}`}>
            {tour.badge}
          </span>
        )}
        {/* Category chip */}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
          {CATEGORY_LABEL[tour.category] ?? tour.category}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-sm font-bold text-gray-900">{tour.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({tour.reviewCount.toLocaleString()})</span>
        </div>

        {/* Title */}
        <Link href={href}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
            {tour.title}
          </h3>
        </Link>

        {/* Duration + group size */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-auto">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Max {tour.maxGroupSize}
          </span>
        </div>

        {/* Price + CTA row */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100 mt-1">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
            <p className="text-base font-extrabold text-brand-600 leading-tight">{formatTHB(minPrice)}</p>
            <p className="text-[10px] text-gray-400">per person</p>
          </div>

          {onToggle ? (
            <button
              onClick={() => onToggle(tour.slug)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                selected
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              {selected
                ? <><Check className="w-3.5 h-3.5" /> Added</>
                : <><Plus className="w-3.5 h-3.5" /> Add to trip</>
              }
            </button>
          ) : (
            <Link
              href={href}
              className="flex items-center gap-1 text-xs font-semibold bg-brand-600 text-white px-3.5 py-2 rounded-xl hover:bg-brand-700 transition-colors"
            >
              View
            </Link>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 border-t border-brand-100">
          <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
          <span className="text-xs font-medium text-brand-700">Added to your trip</span>
        </div>
      )}
    </article>
  )
}
