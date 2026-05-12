'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TourCard from './TourCard'
import { type Tour } from '@/lib/tours'

interface TourCarouselProps {
  tours: Tour[]
  bookingParams?: string
}

export default function TourCarousel({ tours, bookingParams }: TourCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector<HTMLElement>('[data-carousel-item]')
    const step = (card?.offsetWidth ?? 272) + 16
    scrollRef.current.scrollBy({ left: dir === 'right' ? step : -step, behavior: 'smooth' })
  }

  return (
    <div className="relative group/carousel">
      {/* Left arrow — visible on hover, desktop only */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10
          w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg
          items-center justify-center
          hidden md:flex
          opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200
          hover:bg-gray-50 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mb-2"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tours.map(tour => (
          <div
            key={tour.slug}
            data-carousel-item
            className="shrink-0 w-[calc(100vw-4rem)] sm:w-72"
            style={{ scrollSnapAlign: 'start' }}
          >
            <TourCard tour={tour} bookingParams={bookingParams} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10
          w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg
          items-center justify-center
          hidden md:flex
          opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200
          hover:bg-gray-50 active:scale-95"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  )
}
