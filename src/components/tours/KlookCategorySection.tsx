'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { type Tour, formatTHB } from '@/lib/tours'

interface CategoryConfig {
  key: string
  label: string
  emoji: string
  iconBg: string
  bg: string
}

interface Props {
  category: CategoryConfig
  tours: Tour[]
}

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00]',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-[#2534ff]',
}

const GAP = 12 // gap-3 in px

function cardsToShow(containerW: number): number {
  if (containerW >= 900) return 4
  if (containerW >= 640) return 3
  if (containerW >= 400) return 2
  return 1
}

export default function KlookCategorySection({ category, tours }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(260)   // initial SSR-safe default
  const [canLeft,  setCanLeft]    = useState(false)
  const [canRight, setCanRight]   = useState(false)

  /* ── Measure container → derive exact card width ── */
  useEffect(() => {
    if (!wrapperRef.current) return
    const update = () => {
      const w = wrapperRef.current?.clientWidth ?? 0
      if (!w) return
      const n = cardsToShow(w)
      setCardWidth(Math.floor((w - (n - 1) * GAP) / n))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  /* ── Arrow visibility ── */
  const sync = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync, { passive: true })
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync, cardWidth])   // re-sync after cardWidth changes

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div ref={wrapperRef} className="mb-8 relative">

      {/* ── Left fade + arrow ── */}
      {canLeft && (
        <div className="absolute left-0 top-0 bottom-1 w-14 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 flex items-center pointer-events-none">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto ml-1 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Horizontal card row ─────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {tours.map((tour) => {
          const minPrice = tour.options.length
            ? Math.min(...tour.options.map(o => o.pricePerPerson))
            : (tour.priceFrom ?? 0)

          const city = tour.location.split(',')[0].trim()
          const catLabel = tour.category.replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())

          const dealTags = tour.highlights?.slice(0, 2) ?? []

          return (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              style={{ width: cardWidth, minWidth: cardWidth }}
              className="group shrink-0 flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-brand-100 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-[160px] overflow-hidden shrink-0">
                {tour.images[0] ? (
                  <Image
                    src={tour.images[0]}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
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

                {/* Category · Location */}
                <p className="text-gray-400 text-[11px] mb-1.5">
                  {catLabel} · {city}
                </p>

                {/* Title */}
                <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors mb-1.5 flex-1">
                  {tour.title}
                </p>

                {/* Book now */}
                <p className="text-[11px] text-green-600 font-medium mb-1.5">
                  Book now for today
                </p>

                {/* Rating row */}
                <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5 mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-gray-400">({tour.reviewCount.toLocaleString()})</span>
                </div>

                {/* Price */}
                {minPrice > 0 && (
                  <div className="flex items-baseline gap-1.5 mb-2">
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
          )
        })}
      </div>

      {/* ── Right fade + arrow ── */}
      {canRight && (
        <div className="absolute right-0 top-0 bottom-1 w-14 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 flex items-center justify-end pointer-events-none">
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto mr-1 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  )
}
