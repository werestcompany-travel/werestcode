'use client';

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatTHB } from '@/lib/tours'
import type { CityConfig } from '@/lib/destination-cities'
import { CITY_IMAGES } from '@/lib/destination-cities'
import DestinationHeroClient from '@/components/destinations/DestinationHeroClient'
import DestinationHeroOverlay from '@/components/destinations/DestinationHeroOverlay'
import {
  ChevronRight, ArrowRight, Clock, Star,
  MapPin, ChevronDown, Share2
} from 'lucide-react'

/* ── DB types ─────────────────────────────────────────────────────────────── */
interface DBTour {
  slug: string; title: string; images: string[]; duration: string;
  maxGroupSize: number; rating: number; badge?: string | null;
  options: { pricePerPerson: number }[];
}
interface DBAttraction {
  slug: string; name: string; featureImage: string | null;
  location: string; rating: number; price: number; badge: string | null;
}

/* ── Split image route card ─────────────────────────────────────────────────── */
function RouteCard({ route }: { route: { fromCity: string; toCity: string; price: number; duration: string; distance: string } }) {
  const fromImg = CITY_IMAGES[route.fromCity] ?? CITY_IMAGES['Bangkok']
  const toImg   = CITY_IMAGES[route.toCity]   ?? CITY_IMAGES['Bangkok']
  return (
    <Link
      href={`/?pickup=${encodeURIComponent(route.fromCity)}&dropoff=${encodeURIComponent(route.toCity)}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Split image */}
      <div className="relative h-36 overflow-hidden">
        {/* Left half — origin */}
        <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden">
          <Image src={fromImg} alt={route.fromCity} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        </div>
        {/* Right half — destination */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
          <Image src={toImg} alt={route.toCity} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        </div>
        {/* Centre divider + arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
            <ArrowRight className="w-4 h-4 text-[#2534ff]" />
          </div>
          {/* Subtle centre shadow lines */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-white/60" />
        </div>
        {/* Bottom gradient + route label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-white text-[12px] font-bold">
            {route.fromCity} → {route.toCity}
          </p>
        </div>
      </div>
      {/* Details */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-400 flex items-center gap-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{route.duration}</span>
          <span>{route.distance}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 leading-none">From</p>
          <p className="text-sm font-extrabold text-[#2534ff] leading-tight">฿{route.price.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  )
}

/* ── FAQ accordion item ─────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-100 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer select-none bg-white hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed bg-white border-t border-gray-100">
        <p className="pt-4">{a}</p>
      </div>
    </details>
  )
}

/* ── Drag-scroll hook ────────────────────────────────────────────────────── */
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current  = true
    startX.current    = e.pageX - (ref.current?.offsetLeft ?? 0)
    scrollLeft.current = ref.current?.scrollLeft ?? 0
    if (ref.current) ref.current.style.cursor = 'grabbing'
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current || !ref.current) return
    e.preventDefault()
    const x    = e.pageX - ref.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    ref.current.scrollLeft = scrollLeft.current - walk
  }, [])

  const stopDrag = useCallback(() => {
    dragging.current = false
    if (ref.current) ref.current.style.cursor = 'grab'
  }, [])

  return { ref, onMouseDown, onMouseMove, onMouseLeave: stopDrag, onMouseUp: stopDrag }
}

/* ══════════════════════════════════════════════════════════════════════════════ */

interface Props { city: CityConfig }

export default function DestinationCityPage({ city }: Props) {
  const tourScroll = useDragScroll()
  const [tours,       setTours]       = useState<DBTour[]>([])
  const [attractions, setAttractions] = useState<DBAttraction[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const name = city.name
    Promise.all([
      fetch(`/api/tours?destination=${encodeURIComponent(name)}&limit=6`).then(r => r.json()).catch(() => ({ tours: [] })),
      fetch(`/api/attractions?location=${encodeURIComponent(name)}&limit=6`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([tourData, attrData]) => {
      setTours(tourData.tours ?? tourData.data ?? [])
      setAttractions(attrData.data ?? attrData.listings ?? [])
    }).finally(() => setLoading(false))
  }, [city.name])

  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-white pt-16">

        {/* ════ BREADCRUMB — real path from city data ════ */}
        <nav aria-label="Breadcrumb" className="px-4 sm:px-5 py-2.5 border-b border-gray-100">
          <ol className="flex items-center gap-1 text-[13px] text-gray-500 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li className="shrink-0"><Link href="/" className="hover:text-gray-800 transition-colors">Home</Link></li>
            <li className="shrink-0"><ChevronRight className="w-3.5 h-3.5 text-gray-400" /></li>
            <li className="shrink-0"><Link href="/destinations/thailand" className="hover:text-gray-800 transition-colors">Thailand</Link></li>
            <li className="shrink-0"><ChevronRight className="w-3.5 h-3.5 text-gray-400" /></li>
            <li className="text-gray-400 truncate min-w-0">{city.name}</li>
          </ol>
        </nav>

        {/* ════ HERO IMAGE — title + description overlaid ════ */}
        <div className="relative w-full overflow-hidden rounded-none" style={{ height: 'clamp(260px, 52vw, 480px)' }}>
          <Image src={city.heroImage} alt={`Things to do in ${city.name}`} fill className="object-cover" priority sizes="100vw" />
          {/* Stronger gradient so text is always legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          {/* Share button — top right */}
          <button
            type="button"
            aria-label="Share"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>

          {/* Headline + description + see more — all overlaid bottom-left */}
          <DestinationHeroOverlay
            cityName={city.name}
            description={city.description}
            descriptionFull={city.descriptionFull}
          />
        </div>

        {/* ════ STICKY TABS (client) ════ */}
        <DestinationHeroClient
          destName={city.name}
          slug={city.slug}
        />

        {/* ════ STATS STRIP ════ */}
        <div className="bg-[#2534ff] text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { value: '50+',   label: 'Destinations' },
              { value: '24/7',  label: 'Support' },
              { value: '100%',  label: 'Fixed pricing' },
              { value: '5 min', label: 'Booking time' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════ ROUTES FROM ════ */}
        {city.routesFrom.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular transfers from {city.name}</h2>
              <p className="text-gray-500 text-sm mt-1">Private door-to-door · Professional driver · Fixed price</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {city.routesFrom.map(r => <RouteCard key={`${r.fromCity}-${r.toCity}`} route={r} />)}
            </div>
          </section>
        )}

        {/* ════ ROUTES TO ════ */}
        {city.routesTo.length > 0 && (
          <section className="bg-gray-50 py-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular transfers to {city.name}</h2>
                <p className="text-gray-500 text-sm mt-1">Arrive in comfort — private pickup from any address</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {city.routesTo.map(r => <RouteCard key={`${r.fromCity}-${r.toCity}`} route={r} />)}
              </div>
            </div>
          </section>
        )}

        {/* ════ ABOUT + HIGHLIGHTS + TIPS ════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Left: Highlights */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Why visit {city.name}?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {city.highlights.map(h => (
                  <div key={h.label} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center hover:border-[#2534ff]/30 hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-3xl block mb-2">{h.emoji}</span>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Travel tips */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Travel Tips</h2>
              <ul className="space-y-4">
                {city.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#2534ff]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#2534ff]">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ════ TOURS ════ */}
        {/* ════ TOURS FROM DB ════ */}
        <section className="bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Things to do in {city.name}</h2>
                <p className="text-gray-500 text-sm mt-1">Tours & experiences — just show up and enjoy</p>
              </div>
              <Link href={`/tours?destination=${encodeURIComponent(city.name)}`}
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shrink-0 w-[72vw] sm:w-[340px] lg:w-[360px] bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : tours.length > 0 ? (
              <div
                ref={tourScroll.ref}
                onMouseDown={tourScroll.onMouseDown}
                onMouseMove={tourScroll.onMouseMove}
                onMouseLeave={tourScroll.onMouseLeave}
                onMouseUp={tourScroll.onMouseUp}
                className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2 cursor-grab select-none"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {tours.map(tour => {
                  const minPrice = tour.options?.length ? Math.min(...tour.options.map(o => o.pricePerPerson)) : 0
                  return (
                    <Link key={tour.slug} href={`/tours/${tour.slug}`}
                      draggable={false}
                      className="group shrink-0 w-[72vw] sm:w-[300px] lg:w-[320px] bg-white rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                      <div className="relative h-44 overflow-hidden bg-gray-100 shrink-0">
                        {tour.images?.[0] && (
                          <Image src={tour.images[0]} alt={tour.title} fill sizes="320px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized draggable={false} />
                        )}
                        {tour.badge && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                            {tour.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#2534ff] transition-colors">
                          {tour.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tour.rating.toFixed(1)}</span>
                          </div>
                          {minPrice > 0 && (
                            <p className="text-sm font-extrabold text-[#2534ff]">
                              {formatTHB(minPrice)}<span className="text-[10px] font-normal text-gray-400">/pp</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
                <div className="shrink-0 w-1" aria-hidden />
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">No tours listed yet — check back soon.</p>
            )}
          </div>
        </section>

        {/* ════ ATTRACTIONS FROM DB ════ */}
        {(loading || attractions.length > 0) && (
          <section className="py-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Attraction Tickets in {city.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">Skip-the-line tickets & experiences</p>
                </div>
                <Link href={`/attractions?location=${encodeURIComponent(city.name)}`}
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-44 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {attractions.map(a => (
                    <Link key={a.slug} href={`/attractions/${a.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                      <div className="relative h-44 bg-gray-100 overflow-hidden">
                        {a.featureImage && (
                          <Image src={a.featureImage} alt={a.name} fill sizes="400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                        )}
                        {a.badge && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                            {a.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{a.location}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#2534ff] transition-colors">
                          {a.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{a.rating.toFixed(1)}
                          </span>
                          <p className="text-sm font-extrabold text-[#2534ff]">{formatTHB(a.price)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ════ WHY WEREST ════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">Why choose Werest Travel?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '💰', title: 'Fixed prices, no surprises', desc: 'What you see is what you pay — no surge pricing, no hidden fees.' },
              { emoji: '📞', title: '24/7 support',              desc: 'Our team is available around the clock via WhatsApp, Line and phone.' },
              { emoji: '😊', title: 'Local expert drivers',      desc: 'Vetted professionals who know Thailand inside out.' },
              { emoji: '⚡', title: 'Instant confirmation',      desc: 'Your booking confirmed in seconds with voucher sent immediately.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-[#2534ff]/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">{emoji}
                  {/* emoji rendered by parent div */}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ FAQ ════ */}
        {city.faqs.length > 0 && (
          <section className="bg-gray-50 py-14">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {city.faqs.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
              </div>
            </div>
          </section>
        )}

        {/* ════ CTA ════ */}
        <section className="bg-[#2534ff] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to travel in {city.name}?
            </h2>
            <p className="text-white/75 mb-8 text-base max-w-xl mx-auto">
              Book your private transfer in seconds. Free cancellation, instant voucher, professional local driver.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/"
                className="bg-white text-[#2534ff] font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-lg">
                Book a Transfer <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={`/tours?destination=${encodeURIComponent(city.name)}`}
                className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm">
                Browse Experiences
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
