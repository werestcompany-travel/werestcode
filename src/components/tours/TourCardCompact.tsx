'use client'

import Image from 'next/image'
import { Star, Clock, Eye } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00] text-white',
  'Top Rated':   'bg-emerald-500 text-white',
  'New':         'bg-[#2534ff] text-white',
}

interface Props {
  tour:           Tour
  selected:       boolean
  onToggle:       (slug: string) => void
  onQuickView:    (tour: Tour) => void
}

export default function TourCardCompact({ tour, selected, onToggle, onQuickView }: Props) {
  const minPrice    = Math.min(...tour.options.map(o => o.pricePerPerson))
  const spotsAlert  = !tour.soldOut && tour.spotsLeft !== undefined && tour.spotsLeft < 5

  return (
    <article
      className={[
        'group bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col h-full',
        'hover:shadow-lg hover:-translate-y-0.5',
        selected
          ? 'border-[#2534ff] shadow-[0_0_0_3px_rgba(37,52,255,0.12)] shadow-md'
          : 'border-gray-100 shadow-sm',
        tour.soldOut ? 'opacity-70' : '',
      ].filter(Boolean).join(' ')}
    >

      {/* ── Image ── */}
      <button
        type="button"
        onClick={() => onQuickView(tour)}
        className="relative block aspect-[16/9] overflow-hidden shrink-0 w-full text-left"
        aria-label={`Quick view ${tour.title}`}
      >
        {tour.images[0] ? (
          <Image
            src={tour.images[0]}
            alt={tour.title}
            fill
            className={`object-cover w-full transition-transform duration-500 group-hover:scale-[1.04] ${
              tour.soldOut ? 'grayscale' : ''
            }`}
            sizes="(max-width: 640px) 210px, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2534ff] to-indigo-700" />
        )}

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Sold-out overlay */}
        {tour.soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-white font-extrabold text-sm tracking-wide px-3 py-1 rounded-full bg-black/50">
              Sold Out
            </span>
          </div>
        )}

        {/* Badge */}
        {tour.badge && (
          <span className={`absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5
                            rounded-full shadow-sm ${BADGE_STYLES[tour.badge] ?? 'bg-gray-700 text-white'}`}>
            {tour.badge}
          </span>
        )}

        {/* Quick View pill — appears on hover (desktop) or always (mobile) */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2
                        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <span className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-800
                           text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
            <Eye className="w-3 h-3" />
            Quick View
          </span>
        </div>
      </button>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Title */}
        <button
          type="button"
          onClick={() => onQuickView(tour)}
          className="text-left"
        >
          <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug
                         group-hover:text-[#2534ff] transition-colors">
            {tour.title}
          </h3>
        </button>

        {/* Rating + duration */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
          <span className="flex items-center gap-0.5 font-semibold text-gray-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {tour.rating.toFixed(1)}
            <span className="font-normal text-gray-400">({tour.reviewCount > 999 ? `${Math.round(tour.reviewCount / 100) / 10}k` : tour.reviewCount})</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3 shrink-0" />
            {tour.duration}
          </span>
        </div>

        {/* Spots alert */}
        {spotsAlert && (
          <p className="text-[10px] font-bold text-red-500">🔥 Only {tour.spotsLeft} spots left</p>
        )}
        {tour.lastBooked && !spotsAlert && (
          <p className="text-[10px] text-orange-500 font-semibold">🔥 {tour.lastBooked}</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Add/Remove */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 leading-none">from</p>
            <p className="text-base font-extrabold text-gray-900 leading-tight">{formatTHB(minPrice)}</p>
          </div>
          <button
            type="button"
            disabled={tour.soldOut}
            onClick={() => onToggle(tour.slug)}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              tour.soldOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : selected
                  ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'bg-[#2534ff] text-white hover:bg-[#1e2ce6]'
            }`}
          >
            {selected ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>

    </article>
  )
}
