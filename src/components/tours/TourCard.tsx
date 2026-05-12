'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, Clock, MapPin, Play } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'
import NotifyMeModal from './NotifyMeModal'
import VideoModal from './VideoModal'

const BADGE_BG: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00]',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-brand-600',
}

const LANGUAGE_FLAGS: Record<string, string> = {
  'English':  '🇬🇧',
  'Thai':     '🇹🇭',
  'Chinese':  '🇨🇳',
  'Japanese': '🇯🇵',
  'French':   '🇫🇷',
  'German':   '🇩🇪',
  'Russian':  '🇷🇺',
  'Korean':   '🇰🇷',
  'Spanish':  '🇪🇸',
}

interface TourCardProps {
  tour:                 Tour
  bookingParams?:       string
  defaultWishlisted?:   boolean
  wishlisted?:          boolean          // controlled from parent (takes priority)
  onWishlistToggle?:    () => void       // parent-controlled toggle
  selected?:            boolean
  onToggle?:            (slug: string) => void
}

export default function TourCard({ tour, bookingParams, defaultWishlisted = false, wishlisted: wishlistedProp, onWishlistToggle, selected = false, onToggle }: TourCardProps) {
  // Use controlled prop if provided, otherwise fall back to local state
  const [localWishlisted, setLocalWishlisted] = useState(defaultWishlisted)
  const wishlisted = wishlistedProp !== undefined ? wishlistedProp : localWishlisted

  const [showNotify, setShowNotify] = useState(false)
  const [showVideo,  setShowVideo]  = useState(false)

  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))
  const href     = bookingParams ? `/tours/${tour.slug}?${bookingParams}` : `/tours/${tour.slug}`
  const city     = tour.location.split(',')[0]

  const hasFreeCancel = [...tour.highlights, ...tour.includes]
    .join(' ')
    .toLowerCase()
    .includes('free cancellation')

  // Feature 8 – Rating breakdown compact
  const breakdown = tour.ratingBreakdown
  const totalBreakdown = breakdown
    ? breakdown[5] + breakdown[4] + breakdown[3] + breakdown[2] + breakdown[1]
    : 0
  const top3Pct = breakdown && totalBreakdown > 0
    ? [5, 4, 3].map(star => ({
        star,
        pct: Math.round((breakdown[star as 5 | 4 | 3 | 2 | 1] / totalBreakdown) * 100),
      }))
    : null

  return (
    <>
      <article className={[
        'group bg-white rounded-xl overflow-hidden border shadow-sm hover:-translate-y-0.5 transition-all duration-200 flex flex-col',
        selected
          ? 'border-orange-400 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]'
          : 'border-gray-200 hover:shadow-xl',
        tour.soldOut ? 'opacity-80' : '',
      ].join(' ')}>

        {/* ── Image ──────────────────────────────────────────────── */}
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden shrink-0">
          {tour.images[0] ? (
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${tour.soldOut ? 'grayscale' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-indigo-700" />
          )}

          {/* Scrim for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Sold out overlay */}
          {tour.soldOut && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-20">
              <span className="text-white font-extrabold text-lg tracking-wide mb-2">Sold Out</span>
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setShowNotify(true) }}
                className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Notify Me
              </button>
            </div>
          )}

          {/* Feature 5 – Last X spots badge (top-left, shown above badge if both present) */}
          {!tour.soldOut && tour.spotsLeft !== undefined && tour.spotsLeft <= 5 && (
            <span className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 text-[11px] font-bold text-white bg-amber-500 px-2.5 py-1 rounded-md shadow-sm">
              ⚡ Last {tour.spotsLeft} spots
            </span>
          )}

          {/* Badge — top left (only when no spotsLeft badge) */}
          {tour.badge && !tour.spotsLeft && (
            <span className={`absolute top-2.5 left-2.5 z-10 text-[11px] font-bold text-white px-2.5 py-1 rounded-md shadow-sm ${BADGE_BG[tour.badge] ?? 'bg-gray-700'}`}>
              {tour.badge}
            </span>
          )}

          {/* Badge when spotsLeft is also shown — move badge below */}
          {tour.badge && tour.spotsLeft !== undefined && tour.spotsLeft <= 5 && !tour.soldOut && (
            <span className={`absolute top-9 left-2.5 z-10 text-[11px] font-bold text-white px-2.5 py-1 rounded-md shadow-sm ${BADGE_BG[tour.badge] ?? 'bg-gray-700'}`}>
              {tour.badge}
            </span>
          )}

          {/* Heart — top right */}
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save'}
            onClick={e => {
              e.preventDefault(); e.stopPropagation()
              if (onWishlistToggle) {
                onWishlistToggle()
              } else {
                setLocalWishlisted(w => !w)
              }
            }}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 fill-transparent'}`} />
          </button>

          {/* Feature 7 – Video preview button (bottom-right) */}
          {tour.videoUrl && !tour.soldOut && (
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowVideo(true) }}
              className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-md hover:bg-black/75 transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              Preview
            </button>
          )}

          {/* Free cancellation — bottom left */}
          {hasFreeCancel && !tour.videoUrl && (
            <span className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
              ✓ Free cancellation
            </span>
          )}
          {hasFreeCancel && tour.videoUrl && (
            <span className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
              ✓ Free cancellation
            </span>
          )}
        </Link>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-3 gap-1.5">

          {/* Location */}
          <p className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {city}
          </p>

          {/* Title */}
          <Link href={href}>
            <h3 className="text-[13.5px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
              {tour.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(tour.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-[12px] font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({tour.reviewCount.toLocaleString()})</span>
          </div>

          {/* Feature 8 – Compact rating breakdown */}
          {top3Pct && (
            <p className="text-[10px] text-gray-400 leading-none">
              {top3Pct.map(({ star, pct }) => `${star}★ ${pct}%`).join(' · ')}
            </p>
          )}

          {/* Duration */}
          <p className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="w-3 h-3 shrink-0" />
            {tour.duration}
          </p>

          {/* Feature 10 – Language flags */}
          {tour.languages.length > 0 && (
            <div className="flex flex-wrap gap-0.5">
              {tour.languages.slice(0, 5).map(lang => (
                <span key={lang} title={lang} className="text-[14px] leading-none">
                  {LANGUAGE_FLAGS[lang] ?? '🌐'}
                </span>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Feature 6 – Last booked */}
          {tour.lastBooked && (
            <p className="text-[10px] text-orange-500 font-semibold">
              🔥 Last booked {tour.lastBooked}
            </p>
          )}

          {/* Price */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">From</p>
            <p className="text-[19px] font-bold text-orange-500 leading-tight">
              {formatTHB(minPrice)}
            </p>
            <p className="text-[10px] text-gray-400">per person</p>
          </div>
        </div>

        {/* Selected strip */}
        {selected && onToggle && (
          <button
            onClick={() => onToggle(tour.slug)}
            className="w-full text-center text-xs font-semibold text-orange-600 bg-orange-50 border-t border-orange-100 py-2.5 hover:bg-orange-100 transition-colors"
          >
            ✓ Added — tap to remove
          </button>
        )}
      </article>

      {/* Modals */}
      {showNotify && (
        <NotifyMeModal
          tourSlug={tour.slug}
          tourTitle={tour.title}
          onClose={() => setShowNotify(false)}
        />
      )}
      {showVideo && tour.videoUrl && (
        <VideoModal
          videoUrl={tour.videoUrl}
          tourTitle={tour.title}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  )
}
