'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  X, Star, Clock, MapPin, Check, Users,
  ChevronLeft, ChevronRight, Zap, ChevronDown,
} from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00] text-white',
  'Top Rated':   'bg-emerald-500 text-white',
  'New':         'bg-[#2534ff] text-white',
}

interface Props {
  tour: Tour
  selected: boolean
  onToggle: (slug: string) => void
  onClose: () => void
  bookingParams?: string
}

export default function TourQuickViewModal({ tour, selected, onToggle, onClose }: Props) {
  const [imgIdx, setImgIdx]                   = useState(0)
  const [showAllHighlights, setShowAllHighlights] = useState(false)

  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))
  const images   = tour.images.length ? tour.images : ['']

  const prevImg = () => setImgIdx(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIdx(i => (i + 1) % images.length)

  const hasFreeCancel = [...tour.highlights, ...tour.includes]
    .join(' ').toLowerCase().includes('free cancellation')

  const visibleHighlights = showAllHighlights
    ? tour.highlights
    : tour.highlights.slice(0, 4)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — slides up on mobile, centred on desktop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none">
        <div
          className="pointer-events-auto bg-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh]
                     rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl
                     animate-slide-up sm:animate-fade-in"
          onClick={e => e.stopPropagation()}
        >

          {/* ── Image carousel ── */}
          <div className="relative aspect-[16/9] shrink-0">
            {images[imgIdx] ? (
              <Image
                src={images[imgIdx]}
                alt={tour.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 576px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2534ff] to-indigo-700" />
            )}

            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90
                         backdrop-blur-sm flex items-center justify-center shadow-md
                         hover:bg-white transition-colors"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>

            {/* Badge */}
            {tour.badge && (
              <span className={`absolute top-3 left-3 z-10 text-[11px] font-bold px-2.5 py-1
                               rounded-full shadow-sm ${BADGE_STYLES[tour.badge] ?? 'bg-gray-700 text-white'}`}>
                {tour.badge}
              </span>
            )}

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                             bg-white/80 backdrop-blur-sm flex items-center justify-center
                             shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                             bg-white/80 backdrop-blur-sm flex items-center justify-center
                             shadow hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`h-1.5 rounded-full transition-all bg-white ${
                        i === imgIdx ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 space-y-4">

              {/* Title + subtitle */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{tour.title}</h2>
                {tour.subtitle && (
                  <p className="text-sm text-gray-500 mt-1 leading-snug">{tour.subtitle}</p>
                )}
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-1 font-bold text-gray-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {tour.rating.toFixed(1)}
                  <span className="font-normal text-gray-400 text-xs">
                    ({tour.reviewCount.toLocaleString()})
                  </span>
                </span>
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {tour.duration}
                </span>
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {tour.location.split(',')[0]}
                </span>
                {tour.maxGroupSize > 0 && (
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    Max {tour.maxGroupSize}
                  </span>
                )}
              </div>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3 fill-green-600 text-green-600" /> Instant confirmation
                </span>
                {hasFreeCancel && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> Free cancellation
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">{tour.description}</p>

              {/* Highlights */}
              {tour.highlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Highlights</h3>
                  <ul className="space-y-2">
                    {visibleHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#2534ff] shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {tour.highlights.length > 4 && (
                    <button
                      onClick={() => setShowAllHighlights(s => !s)}
                      className="flex items-center gap-1 text-xs text-[#2534ff] font-semibold mt-2 hover:underline"
                    >
                      {showAllHighlights
                        ? 'Show less'
                        : `Show ${tour.highlights.length - 4} more`}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllHighlights ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}

              {/* What's included */}
              {tour.includes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">What&apos;s included</h3>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                    {tour.includes.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tour options / time slots */}
              {tour.options.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Available options</h3>
                  <div className="space-y-2">
                    {tour.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                          opt.availability === 'full'
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : opt.availability === 'limited'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{opt.time}</p>
                          {opt.label && (
                            <p className="text-xs text-gray-500 mt-0.5">{opt.label}</p>
                          )}
                          {opt.availability === 'limited' && (
                            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Limited availability</p>
                          )}
                          {opt.availability === 'full' && (
                            <p className="text-[11px] text-red-500 font-semibold mt-0.5">Sold out</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-base font-extrabold text-gray-900">{formatTHB(opt.pricePerPerson)}</p>
                          <p className="text-[10px] text-gray-400">per person</p>
                          {opt.childPrice > 0 && (
                            <p className="text-[10px] text-gray-400">Child: {formatTHB(opt.childPrice)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom padding so content clears the sticky footer */}
              <div className="h-2" />
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-5 py-4 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0">
            <div className="shrink-0">
              <p className="text-[10px] text-gray-400 leading-none">from</p>
              <p className="text-2xl font-extrabold text-gray-900 leading-tight">{formatTHB(minPrice)}</p>
            </div>
            <button
              onClick={() => { onToggle(tour.slug); onClose(); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                selected
                  ? 'bg-green-50 text-green-700 border-2 border-green-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                  : 'bg-[#2534ff] text-white hover:bg-[#1e2ce6] shadow-md'
              }`}
            >
              {selected ? '✓ Added — tap to remove' : '+ Add to Trip'}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
