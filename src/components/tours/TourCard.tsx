'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, Clock, MapPin, Play, Zap } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'
import NotifyMeModal from './NotifyMeModal'
import VideoModal from './VideoModal'
import TourCardSkeleton from './TourCardSkeleton'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00] text-white',
  'Top Rated':   'bg-emerald-500 text-white',
  'New':         'bg-[#2534ff] text-white',
}

const BADGE_BG: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00]',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-brand-600',
}

interface TourCardProps {
  tour:                 Tour
  bookingParams?:       string
  defaultWishlisted?:   boolean
  wishlisted?:          boolean          // controlled from parent (takes priority)
  onWishlistToggle?:    () => void       // parent-controlled toggle
  selected?:            boolean
  onToggle?:            (slug: string) => void
  showSkeleton?:        boolean
}

export default function TourCard({
  tour,
  bookingParams,
  defaultWishlisted = false,
  wishlisted: wishlistedProp,
  onWishlistToggle,
  selected = false,
  onToggle,
  showSkeleton = false,
}: TourCardProps) {
  const [localWishlisted, setLocalWishlisted] = useState(defaultWishlisted)
  const wishlisted = wishlistedProp !== undefined ? wishlistedProp : localWishlisted

  const [showNotify, setShowNotify] = useState(false)
  const [showVideo,  setShowVideo]  = useState(false)

  if (showSkeleton) return <TourCardSkeleton />

  const minPrice     = Math.min(...tour.options.map(o => o.pricePerPerson))
  const href         = bookingParams ? `/tours/${tour.slug}?${bookingParams}` : `/tours/${tour.slug}`
  // primaryLocation not in Tour interface — fall back gracefully
  const primaryLocation = (tour as unknown as Record<string, unknown>).primaryLocation as string | undefined
  const city         = primaryLocation ?? tour.location.split(',')[0]

  const hasFreeCancel = [...tour.highlights, ...tour.includes]
    .join(' ')
    .toLowerCase()
    .includes('free cancellation')

  // Discount price (optional field not yet in interface)
  const discountPrice = (tour as unknown as Record<string, unknown>).discountPrice as number | undefined

  const spotsAlert = !tour.soldOut && tour.spotsLeft !== undefined && tour.spotsLeft < 5

  return (
    <>
      <article className={[
        'group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm',
        'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col',
        selected ? 'ring-2 ring-[#2534ff] ring-offset-1' : '',
        tour.soldOut ? 'opacity-80' : '',
      ].filter(Boolean).join(' ')}>

        {/* ── Image ──────────────────────────────────────────────── */}
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden shrink-0">
          {tour.images[0] ? (
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              className={`object-cover w-full transition-transform duration-500 group-hover:scale-[1.04] ${tour.soldOut ? 'grayscale' : ''}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2534ff] to-indigo-700" />
          )}

          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

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

          {/* Badge — top left */}
          {tour.badge && (
            <span className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLES[tour.badge] ?? 'bg-gray-700 text-white'}`}>
              {tour.badge}
            </span>
          )}

          {/* Heart — top right */}
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={e => {
              e.preventDefault(); e.stopPropagation()
              if (onWishlistToggle) {
                onWishlistToggle()
              } else {
                setLocalWishlisted(w => !w)
              }
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 fill-transparent'}`} />
          </button>

          {/* Video preview button — bottom right */}
          {tour.videoUrl && !tour.soldOut && (
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowVideo(true) }}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-lg hover:bg-black/75 transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              Preview
            </button>
          )}
        </Link>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* Location + category */}
          <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {city}
            {tour.category && (
              <>
                <span className="text-gray-300">·</span>
                <span className="capitalize">{tour.category.replace('-', ' ')}</span>
              </>
            )}
          </p>

          {/* Title */}
          <Link href={href}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2534ff] transition-colors">
              {tour.title}
            </h3>
          </Link>

          {/* Rating + duration */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(tour.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({tour.reviewCount.toLocaleString()})</span>
            </div>
            <span className="text-gray-200">·</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3 shrink-0" />
              {tour.duration}
            </div>
          </div>

          {/* Instant confirmation chip */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-green-500 fill-green-500" />
            <span className="text-[11px] text-green-600 font-medium">Instant confirmation</span>
          </div>

          {/* Free cancellation */}
          {hasFreeCancel && (
            <p className="text-[11px] text-green-600 font-medium">
              ✓ Free cancellation
            </p>
          )}

          {/* Spots left alert */}
          {spotsAlert && (
            <p className="text-[11px] font-bold text-red-500">
              🔥 Only {tour.spotsLeft} left
            </p>
          )}

          {/* Last booked */}
          {tour.lastBooked && !spotsAlert && (
            <p className="text-[11px] text-orange-500 font-semibold">
              🔥 Last booked {tour.lastBooked}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price + CTA */}
          <div className="pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">from</p>
              {discountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-gray-900 leading-tight">
                    {formatTHB(discountPrice)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatTHB(minPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-extrabold text-gray-900 leading-tight">
                  {formatTHB(minPrice)}
                </span>
              )}
            </div>

            <Link
              href={href}
              className="shrink-0 bg-[#2534ff] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1e2ce6] transition-colors"
            >
              Book Now →
            </Link>
          </div>
        </div>

        {/* Selected strip */}
        {selected && onToggle && (
          <button
            onClick={() => onToggle(tour.slug)}
            className="w-full text-center text-xs font-semibold text-[#2534ff] bg-blue-50 border-t border-blue-100 py-2.5 hover:bg-blue-100 transition-colors"
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
