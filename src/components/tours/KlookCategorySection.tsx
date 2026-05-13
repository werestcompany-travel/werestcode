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

export default function KlookCategorySection({ category, tours }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  const sync = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const t = setTimeout(sync, 80)
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync, { passive: true })
    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="mb-8 relative">

      {/* ── Left arrow ── */}
      {canLeft && (
        <div className="absolute left-0 top-0 bottom-1 w-14 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 flex items-center pointer-events-none">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto ml-1 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Card row ── */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {tours.map((tour) => {
          const minPrice = tour.options.length
            ? Math.min(...tour.options.map(o => o.pricePerPerson))
            : (tour.priceFrom ?? 0)

          const city     = tour.location.split(',')[0].trim()
          const catLabel = tour.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          const dealTags = tour.highlights?.slice(0, 2) ?? []

          return (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              className="group shrink-0 w-[44vw] max-w-[200px] md:w-[25vw] md:max-w-[252px] flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300"
            >
              {/* ── Image ── */}
              <div className="relative h-[190px] overflow-hidden shrink-0">
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

                {/* Badge */}
                {tour.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full text-white shadow ${BADGE_STYLES[tour.badge] ?? 'bg-gray-700'}`}>
                      {tour.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Content ── */}
              <div className="p-3.5 flex flex-col flex-1 gap-1">

                {/* Category · Location */}
                <p className="text-gray-400 text-[11px] font-medium">
                  {catLabel} · {city}
                </p>

                {/* Title */}
                <p className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                  {tour.title}
                </p>

                {/* Book now */}
                <p className="text-[12px] text-green-600 font-semibold">
                  Book now for today
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="text-[12px] font-bold text-gray-800">{tour.rating.toFixed(1)}</span>
                  <span className="text-[12px] text-gray-400">({tour.reviewCount.toLocaleString()})</span>
                </div>

                {/* Price */}
                {minPrice > 0 && (
                  <p className="font-bold text-gray-900 text-[17px] mt-0.5">
                    {formatTHB(minPrice)}
                  </p>
                )}

                {/* Tags */}
                {dealTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {dealTags.map(tag => (
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

      {/* ── Right arrow ── */}
      {canRight && (
        <div className="absolute right-0 top-0 bottom-1 w-14 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 flex items-center justify-end pointer-events-none">
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto mr-1 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  )
}
