'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

const BADGE_BG: Record<string, string> = {
  'Best Seller': 'bg-orange-500',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-blue-600',
}

interface Props {
  label: string
  tours: Tour[]
}

export default function KlookCategorySection({ label, tours }: Props) {
  const trackRef           = useRef<HTMLDivElement>(null)
  const [showLeft,  setShowLeft]  = useState(false)
  const [showRight, setShowRight] = useState(false)

  /* ─── Sync arrow visibility ─────────────────────────────────────────── */
  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    /* ResizeObserver fires once layout is complete — more reliable than setTimeout */
    const ro = new ResizeObserver(sync)
    ro.observe(el)

    el.addEventListener('scroll', sync, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', sync)
    }
  }, [sync, tours]) /* re-run when tours list changes (city filter) */

  /* ─── Scroll handler ────────────────────────────────────────────────── */
  const scrollTrack = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    /* scroll 2 cards at a time */
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="mb-10">
      {/* Category label */}
      <h3 className="text-[15px] font-bold text-gray-800 mb-3">{label}</h3>

      <div className="relative">

        {/* ── Left fade + arrow ── */}
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-14 bg-gradient-to-r from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none flex items-center">
            <button
              type="button"
              onClick={() => scrollTrack(-1)}
              className="pointer-events-auto ml-1 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
              aria-label={`Scroll ${label} left`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Card track ── */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
        >
          {tours.map((tour) => {
            const minPrice = tour.options.length
              ? Math.min(...tour.options.map(o => o.pricePerPerson))
              : (tour.priceFrom ?? 0)

            const city     = tour.location.split(',')[0].trim()
            const catLabel = tour.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            const tags     = tour.highlights?.slice(0, 2) ?? []

            return (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="group shrink-0 w-[44vw] max-w-[200px] md:w-[25vw] md:max-w-[252px] flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-[160px] shrink-0 overflow-hidden">
                  {tour.images[0] ? (
                    <Image
                      src={tour.images[0]}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 768px) 44vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700" />
                  )}

                  {tour.badge && (
                    <span
                      className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow ${BADGE_BG[tour.badge] ?? 'bg-gray-600'}`}
                    >
                      {tour.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 gap-1">
                  <p className="text-gray-400 text-[11px] font-medium">{catLabel} · {city}</p>

                  <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                    {tour.title}
                  </p>

                  <p className="text-[11px] text-green-600 font-semibold">Book now for today</p>

                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
                    <span className="text-[11px] text-gray-400">({tour.reviewCount.toLocaleString()})</span>
                  </div>

                  {minPrice > 0 && (
                    <p className="font-bold text-gray-900 text-[16px] mt-auto pt-1">
                      {formatTHB(minPrice)}
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Right fade + arrow ── */}
        {showRight && (
          <div className="absolute right-0 top-0 bottom-2 w-14 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent z-10 pointer-events-none flex items-center justify-end">
            <button
              type="button"
              onClick={() => scrollTrack(1)}
              className="pointer-events-auto mr-1 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
              aria-label={`Scroll ${label} right`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
