'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ChevronRight } from 'lucide-react'
import { formatTHB, type Tour } from '@/lib/tours'
import { useLocale } from '@/context/LocaleContext'

const BADGE_BG: Record<string, string> = {
  'Best Seller': 'bg-orange-500',
  'Top Rated':   'bg-emerald-500',
  'New':         'bg-blue-600',
}

const DEST_CITY: Record<string, string> = {
  bangkok:   'Bangkok',
  phuket:    'Phuket',
  chiangmai: 'Chiang Mai',
  krabi:     'Krabi',
  pattaya:   'Pattaya',
}

interface Props {
  selectedDest: string
  cityName:     string
}

export default function DynamicTourSections({ selectedDest, cityName }: Props) {
  const { t } = useLocale()
  const cityFilter = DEST_CITY[selectedDest] ?? ''
  const [visibleTours, setVisibleTours] = useState<Tour[]>([])

  useEffect(() => {
    const q = cityFilter ? `&location=${encodeURIComponent(cityFilter.toLowerCase())}` : ''
    fetch(`/api/tours?limit=8${q}`)
      .then(r => r.json())
      .then(d => setVisibleTours(d.tours ?? []))
      .catch(() => {})
  }, [cityFilter])

  const toursHref = cityFilter
    ? `/tours?location=${encodeURIComponent(cityFilter.toLowerCase())}`
    : '/tours'

  /* ── drag-scroll ── */
  const scrollRef  = useRef<HTMLDivElement>(null)
  const dragging   = useRef(false)
  const startX     = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current   = true
    startX.current     = e.pageX - (scrollRef.current?.offsetLeft ?? 0)
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !scrollRef.current) return
    e.preventDefault()
    const x    = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }, [])

  const stopDrag = useCallback(() => {
    dragging.current = false
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab'
  }, [])

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-5 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('tours.thingsToDo')}{' '}
              <span className="text-brand-600">{cityName}</span>
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {t('tours.handpicked')}
            </p>
          </div>
          <Link
            href={toursHref}
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            {t('tours.seeAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Drag-scroll carousel ── */}
        {visibleTours.length > 0 ? (
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseLeave={stopDrag}
            onMouseUp={stopDrag}
            className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6 lg:px-8 pb-2 cursor-grab select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {visibleTours.map((tour) => {
              const minPrice = tour.options.length
                ? Math.min(...tour.options.map(o => o.pricePerPerson))
                : (tour.priceFrom ?? 0)
              const city     = tour.location.split(',')[0].trim()
              const catLabel = tour.category
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase())
              const tags = tour.highlights?.slice(0, 2) ?? []

              return (
                <Link
                  key={tour.slug}
                  href={`/tours/${tour.slug}`}
                  draggable={false}
                  className="group shrink-0 w-[72vw] sm:w-[260px] lg:w-[280px] flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-[160px] shrink-0 overflow-hidden">
                    {tour.images[0] ? (
                      <Image
                        src={tour.images[0]}
                        alt={tour.title}
                        fill
                        sizes="280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                        draggable={false}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700" />
                    )}
                    {tour.badge && (
                      <span className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white shadow ${BADGE_BG[tour.badge] ?? 'bg-gray-600'}`}>
                        {tour.badge}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3.5 flex flex-col flex-1 gap-1">
                    <p className="text-gray-400 text-[11px] font-medium">
                      {catLabel} · {city}
                    </p>
                    <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                      {tour.title}
                    </p>
                    <p className="text-[11px] text-green-600 font-semibold">{t('tours.availableNow')}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-800">
                        {tour.rating.toFixed(1)}
                      </span>
                      {tour.reviewCount > 0 && (
                        <span className="text-[11px] text-gray-400">{t('tours.reviews')}</span>
                      )}
                    </div>
                    {minPrice > 0 && (
                      <p className="font-bold text-gray-900 text-[16px] mt-auto pt-1">
                        {formatTHB(minPrice)}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag} className="text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
            <div className="shrink-0 w-1" aria-hidden />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center px-4">
            <p className="text-5xl mb-4">🗺️</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('tours.comingSoon')} {cityName}
            </h3>
            <p className="text-gray-600 text-sm max-w-xs mb-6">
              {t('tours.comingSoonDesc1')} {cityName}. {t('tours.comingSoonDesc2')}
            </p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {t('tours.browseAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
