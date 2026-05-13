'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
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
  return (
    <div className="mb-8">

      {/* ── Horizontal card row ─────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {tours.map((tour) => {
          const minPrice = tour.options.length
            ? Math.min(...tour.options.map(o => o.pricePerPerson))
            : (tour.priceFrom ?? 0)

          const city = tour.location.split(',')[0].trim()
          const catLabel = tour.category.replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())

          // Use first 2 highlights as deal tags
          const dealTags = tour.highlights?.slice(0, 2) ?? []

          return (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              className="group shrink-0 w-[260px] flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-brand-100 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-[160px] overflow-hidden shrink-0">
                {tour.images[0] ? (
                  <Image
                    src={tour.images[0]}
                    alt={tour.title}
                    fill
                    sizes="260px"
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
    </div>
  )
}
