'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  Building2,
  Flag,
  Ship,
  Camera,
  UtensilsCrossed,
  Mountain,
  Leaf,
  Landmark,
  Waves,
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

const CATEGORIES = [
  { id: 'attractions',  label: 'Attractions',        icon: Building2,        href: '/attractions' },
  { id: 'day-trip',     label: 'Day tours',           icon: Flag,             href: '/tours?category=day-trip' },
  { id: 'water',        label: 'Boat experiences',    icon: Ship,             href: '/tours?category=water' },
  { id: 'photography',  label: 'Travel photography',  icon: Camera,           href: '/tours' },
  { id: 'food',         label: 'Food & Drink',        icon: UtensilsCrossed,  href: '/tours?category=food' },
  { id: 'adventure',    label: 'Adventure',           icon: Mountain,         href: '/tours?category=adventure' },
  { id: 'cultural',     label: 'Cultural',            icon: Landmark,         href: '/tours?category=cultural' },
  { id: 'nature',       label: 'Nature',              icon: Leaf,             href: '/tours?category=nature' },
  { id: 'water-sports', label: 'Water sports',        icon: Waves,            href: '/tours?category=water' },
  { id: 'top-rated',    label: 'Top rated',           icon: Star,             href: '/tours?rating=4.5' },
]

const ICON_COLOR = '#0D9488' // teal-600 — matches Trip.com's teal icon palette

export default function TourCategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 420 : -420, behavior: 'smooth' })
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth pb-1 sm:px-6"
      >
        {CATEGORIES.map(({ id, label, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            className="flex flex-col items-center justify-start gap-3 w-[120px] sm:w-[130px] shrink-0 bg-white border border-gray-200 rounded-2xl pt-5 pb-4 px-3 hover:border-teal-300 hover:shadow-md transition-all duration-200 group"
          >
            {/* Icon container */}
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Icon className="w-6 h-6" style={{ color: ICON_COLOR }} />
            </div>
            {/* Label */}
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>

    </div>
  )
}
