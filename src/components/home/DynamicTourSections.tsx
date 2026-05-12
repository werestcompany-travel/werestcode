'use client'

import Link from 'next/link'
import TourCard from '@/components/tours/TourCard'
import { tours as staticTours, type Tour } from '@/lib/tours'
import { ChevronRight } from 'lucide-react'

interface TourSection {
  title: string
  subtitle: string
  filterKey: string
  filterValue: string
  filterType: 'location' | 'category' | 'featured'
  tours: Tour[]
  seeAllHref: string
}

function buildSections(): TourSection[] {
  const raw: Omit<TourSection, 'tours'>[] = [
    {
      title: 'Popular in Bangkok',
      subtitle: 'Top-rated experiences in the capital',
      filterKey: 'location',
      filterValue: 'bangkok',
      filterType: 'location',
      seeAllHref: '/tours?location=bangkok',
    },
    {
      title: 'Phuket Experiences',
      subtitle: 'Island adventures and beach escapes',
      filterKey: 'location',
      filterValue: 'phuket',
      filterType: 'location',
      seeAllHref: '/tours?location=phuket',
    },
    {
      title: 'Cultural Tours',
      subtitle: 'Immerse yourself in Thai history and tradition',
      filterKey: 'category',
      filterValue: 'cultural',
      filterType: 'category',
      seeAllHref: '/tours?category=cultural',
    },
    {
      title: 'Day Trips & Excursions',
      subtitle: 'Explore beyond the city on a full-day adventure',
      filterKey: 'category',
      filterValue: 'day-trip',
      filterType: 'category',
      seeAllHref: '/tours?category=day-trip',
    },
    {
      title: 'Top Rated Experiences',
      subtitle: 'Highest-rated tours loved by travellers',
      filterKey: 'sort',
      filterValue: 'rating',
      filterType: 'featured',
      seeAllHref: '/tours?sort=rating',
    },
  ]

  return raw
    .map((def): TourSection => {
      let filtered: Tour[]

      if (def.filterType === 'location') {
        filtered = staticTours
          .filter(t => t.cities.includes(def.filterValue))
          .slice(0, 4)
      } else if (def.filterType === 'category') {
        filtered = staticTours
          .filter(t => t.category === def.filterValue)
          .slice(0, 4)
      } else {
        // featured / top-rated
        filtered = [...staticTours]
          .filter(t => t.rating >= 4.8)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4)
      }

      return { ...def, tours: filtered }
    })
    .filter(s => s.tours.length >= 2)
}

export default function DynamicTourSections() {
  const sections = buildSections()

  if (sections.length === 0) return null

  return (
    <div className="bg-white">
      {sections.map((section, idx) => (
        <div key={section.filterKey + section.filterValue}>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">{section.title}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{section.subtitle}</p>
              </div>
              <Link
                href={section.seeAllHref}
                className="flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible scrollbar-hide">
              {section.tours.map(tour => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          </section>
          {idx < sections.length - 1 && (
            <div className="border-t border-gray-100 mx-4" />
          )}
        </div>
      ))}
    </div>
  )
}
