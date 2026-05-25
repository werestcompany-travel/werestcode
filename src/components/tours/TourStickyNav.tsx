'use client'

import { useState, useEffect, useRef } from 'react'

const NAV_TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'highlights',     label: 'Highlights' },
  { id: 'whats-included', label: "What's Included" },
  { id: 'itinerary',      label: 'Itinerary' },
  { id: 'reviews',        label: 'Reviews' },
]

// Height of the main navbar + this sticky bar (used for scroll offset)
const NAVBAR_H     = 64   // px — matches Tailwind top-16 / pt-16
const STICKY_NAV_H = 49   // px — py-4 tab row

export default function TourStickyNav() {
  const [visible,      setVisible]      = useState(false)
  const [activeTab,    setActiveTab]    = useState('overview')
  const [navbarHidden, setNavbarHidden] = useState(false)
  const lastScrollY = useRef(0)

  /* ── Show/hide based on gallery leaving viewport ── */
  useEffect(() => {
    // Trigger when the gallery / overview section scrolls above the navbar
    const trigger = document.getElementById('overview')
    if (!trigger) return

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      {
        rootMargin: `-${NAVBAR_H}px 0px 0px 0px`, // account for fixed navbar
        threshold: 0,
      },
    )
    obs.observe(trigger)
    return () => obs.disconnect()
  }, [])

  /* ── Mirror main navbar hide/show so top never leaves a gap ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 80) setNavbarHidden(true)
      else if (y < lastScrollY.current)      setNavbarHidden(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Track active section while scrolling ── */
  useEffect(() => {
    const onScroll = () => {
      const threshold = NAVBAR_H + STICKY_NAV_H + 8

      const hit = NAV_TABS
        .map(tab => {
          const el = document.getElementById(tab.id)
          return { id: tab.id, top: el ? el.getBoundingClientRect().top : Infinity }
        })
        .filter(s => s.top <= threshold)
        .sort((a, b) => b.top - a.top)[0]

      if (hit) setActiveTab(hit.id)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Smooth-scroll to a section accounting for both fixed bars ── */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = NAVBAR_H + STICKY_NAV_H + 4
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    })
    setActiveTab(id)
  }

  return (
    /* Always in DOM — slide in/out with translateY so fixed works reliably */
    <div
      className={`fixed left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm
                  transition-all duration-300 ease-in-out will-change-transform
                  ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{ top: navbarHidden ? '0px' : `${NAVBAR_H}px` }}
      aria-hidden={!visible}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">

          {/* Tab links */}
          <div className="flex items-center flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className={`relative shrink-0 px-4 py-3.5 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-[#2534ff]'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2534ff] rounded-full" />
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
                window.scrollTo({
                  top: el.getBoundingClientRect().top + window.scrollY - (NAVBAR_H + STICKY_NAV_H),
                  behavior: 'smooth',
                })
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
