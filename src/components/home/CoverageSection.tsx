'use client'

import { useState } from 'react'
import { Car, MapPin, Shield, Clock } from 'lucide-react'
import Link from 'next/link'

/* ── Service cities with SVG coordinates ────────────────────────────────── */
const CITIES = [
  {
    id: 'bangkok',
    name: 'Bangkok',
    desc: 'City transfers, airport pickups & day trips',
    x: 190, y: 300,
    major: true,
    labelSide: 'right' as const,
  },
  {
    id: 'chonburi',
    name: 'Pattaya / Chonburi',
    desc: 'Beachfront resort transfers',
    x: 220, y: 318,
    major: false,
    labelSide: 'right' as const,
  },
  {
    id: 'huahin',
    name: 'Hua Hin',
    desc: 'Royal resort town transfers',
    x: 158, y: 355,
    major: false,
    labelSide: 'left' as const,
  },
  {
    id: 'trat',
    name: 'Trat',
    desc: 'Koh Chang ferry & island access',
    x: 298, y: 372,
    major: false,
    labelSide: 'right' as const,
  },
  {
    id: 'phangnga',
    name: 'Phang Nga',
    desc: 'Bay tours & airport connections',
    x: 92, y: 510,
    major: false,
    labelSide: 'right' as const,
  },
  {
    id: 'phuket',
    name: 'Phuket',
    desc: 'Island airport & beach transfers',
    x: 76, y: 538,
    major: true,
    labelSide: 'right' as const,
  },
  {
    id: 'krabi',
    name: 'Krabi',
    desc: 'Ao Nang, airport & ferry pier transfers',
    x: 112, y: 522,
    major: false,
    labelSide: 'right' as const,
  },
]

const FEATURES = [
  { icon: MapPin, title: '7 major destinations',   desc: 'Bangkok, Phuket, Krabi, Hua Hin & more'       },
  { icon: Car,    title: 'Private transfers only',  desc: 'No shared rides — your vehicle, your schedule' },
  { icon: Shield, title: 'Fixed price guarantee',   desc: 'No surge pricing, ever. Book with confidence'  },
  { icon: Clock,  title: 'Available 24 / 7',        desc: 'Instant confirmation, book for today'          },
]

/* ── Simplified Thailand SVG outline (viewBox 0 0 460 700) ──────────────── */
const THAILAND_PATH = `
  M 55,28
  C 80,5 160,0 220,18
  C 275,30 330,52 390,80
  L 435,155 440,220
  L 415,285 385,335 350,368
  L 295,395 245,430 205,460 185,488
  L 170,515 155,548 142,578 132,608 125,638
  L 108,645
  L 90,635 80,615 75,588 72,562 70,535
  L 76,508
  L 88,480 98,458 92,432 78,405 62,375
  L 45,340 35,300 28,255 35,210 45,165 52,115 55,65 55,28
  Z
`

export default function CoverageSection() {
  const [hovered, setHovered] = useState<string | null>(null)
  const hoveredCity = CITIES.find(c => c.id === hovered)

  return (
    <section className="py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Heading ── */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 max-w-2xl leading-tight">
          Plan your private transfer across Thailand
        </h2>
        <p className="text-gray-500 text-[15px] mb-10 max-w-lg">
          Professional drivers, fixed prices and instant booking in every major Thai destination.
        </p>

        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* ── Left: features + CTA ── */}
          <div className="lg:w-[360px] shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">{title}</p>
                    <p className="text-gray-500 text-[13px] mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/booking"
              className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md"
            >
              <Car className="w-4 h-4" />
              Book a Transfer Now
            </Link>
          </div>

          {/* ── Right: Interactive Thailand Map ── */}
          <div className="flex-1 flex flex-col items-center">

            {/* Map container */}
            <div className="relative w-full max-w-[400px] mx-auto select-none">

              {/* Floating tooltip */}
              {hoveredCity && (
                <div
                  className="absolute z-30 pointer-events-none transition-all duration-150"
                  style={{
                    left: `${(hoveredCity.x / 460) * 100}%`,
                    top:  `${(hoveredCity.y / 700) * 100}%`,
                    transform: 'translate(-50%, -135%)',
                  }}
                >
                  <div className="bg-gray-900 text-white rounded-xl px-3.5 py-2.5 shadow-2xl whitespace-nowrap">
                    <p className="font-bold text-[13px]">{hoveredCity.name}</p>
                    <p className="text-gray-300 text-[11px] mt-0.5">{hoveredCity.desc}</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
                </div>
              )}

              <svg
                viewBox="0 0 460 700"
                className="w-full h-auto"
                aria-label="Interactive map of Thailand showing Werest service cities"
              >
                {/* ── Drop shadow filter ── */}
                <defs>
                  <filter id="map-shadow" x="-10%" y="-5%" width="120%" height="115%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#2563eb" floodOpacity="0.15" />
                  </filter>
                  <radialGradient id="city-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0"   />
                  </radialGradient>
                </defs>

                {/* ── Thailand mainland ── */}
                <path
                  d={THAILAND_PATH}
                  fill="#dbeafe"
                  stroke="#93c5fd"
                  strokeWidth="1.5"
                  filter="url(#map-shadow)"
                />

                {/* ── Phuket island (small separate blob) ── */}
                <ellipse
                  cx="65" cy="556" rx="7" ry="11"
                  fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1"
                />

                {/* ── City markers ── */}
                {CITIES.map(city => {
                  const isHov = hovered === city.id
                  const r     = city.major ? 7 : 5.5
                  const lx    = city.labelSide === 'right' ? r + 5 : -(r + 5)
                  const anchor = city.labelSide === 'right' ? 'start' : 'end'

                  return (
                    <g
                      key={city.id}
                      transform={`translate(${city.x},${city.y})`}
                      onMouseEnter={() => setHovered(city.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Glow on hover */}
                      {isHov && (
                        <circle r={r * 3} fill="url(#city-glow)" />
                      )}
                      {/* Outer ring (always visible for major) */}
                      {city.major && (
                        <circle r={r + 4} fill="#2563EB" fillOpacity={isHov ? 0.2 : 0.12} />
                      )}
                      {/* Main dot */}
                      <circle
                        r={r}
                        fill={isHov ? '#1d4ed8' : '#2563EB'}
                        stroke="#fff"
                        strokeWidth={1.8}
                      />
                      {/* City name label */}
                      <text
                        x={lx}
                        y={3.5}
                        fontSize={city.major ? 10.5 : 9}
                        fontWeight={city.major ? '700' : '500'}
                        fill={isHov ? '#1e3a8a' : '#1e40af'}
                        textAnchor={anchor}
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                      >
                        {city.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* ── City chip row ── */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {CITIES.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onMouseEnter={() => setHovered(city.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                    hovered === city.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
