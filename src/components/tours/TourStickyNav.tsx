'use client'

import { useState, useEffect } from 'react'

const NAV_TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'highlights',     label: 'Highlights' },
  { id: 'whats-included', label: "What's Included" },
  { id: 'itinerary',      label: 'Itinerary' },
  { id: 'reviews',        label: 'Reviews' },
]

export default function TourStickyNav() {
  const [visible,   setVisible]   = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500)

      // Determine active section
      const threshold = 120
      const active = NAV_TABS
        .map(tab => {
          const el = document.getElementById(tab.id)
          return { id: tab.id, top: el ? el.getBoundingClientRect().top : Infinity }
        })
        .filter(s => s.top <= threshold)
        .sort((a, b) => b.top - a.top)[0]

      if (active) setActiveTab(active.id)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 72
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
    setActiveTab(id)
  }

  if (!visible) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-0">
          {/* Tab links */}
          <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`relative shrink-0 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-[#2534ff]'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2534ff] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Book Now CTA */}
          <div className="shrink-0 py-2 pl-4 hidden sm:block">
            <button
              onClick={() => {
                const el = document.getElementById('booking-panel')
                if (!el) return
                window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
              }}
              className="bg-[#2534ff] hover:bg-[#1a27e0] text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
