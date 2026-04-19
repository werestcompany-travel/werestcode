import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  Star, Clock, Users, Globe2, CheckCircle2, X as XIcon,
  MapPin, Info, ChevronRight, Quote,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourBookingPanel from '@/components/tours/TourBookingPanel'
import { getTourBySlug, TOURS, formatTHB } from '@/lib/tours'

// ─── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return TOURS.map(t => ({ slug: t.slug }))
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tour = getTourBySlug(params.slug)
  if (!tour) return { title: 'Tour Not Found' }
  return {
    title: `${tour.title} | Werest Travel`,
    description: tour.subtitle,
    openGraph: {
      title: tour.title,
      description: tour.subtitle,
      images: tour.images[0] ? [{ url: tour.images[0] }] : [],
    },
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STAR_COLOURS = ['text-gray-300', 'text-amber-400', 'text-amber-400', 'text-amber-400', 'text-amber-400', 'text-amber-400']

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug)
  if (!tour) notFound()

  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-16">

        {/* ══ GALLERY ═══════════════════════════════════════════════════════════ */}
        <section aria-label="Tour photos" className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] sm:h-[480px] rounded-2xl overflow-hidden">
              {/* Main large image */}
              <div className="col-span-4 sm:col-span-3 row-span-2 relative">
                <Image
                  src={tour.images[0] ?? ''}
                  alt={tour.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 75vw"
                />
              </div>
              {/* Right thumbnail column */}
              {[1, 2].map((i) => (
                <div key={i} className="hidden sm:block relative col-span-1 row-span-1">
                  {tour.images[i] ? (
                    <Image
                      src={tour.images[i]}
                      alt={`${tour.title} photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200" />
                  )}
                  {/* "View all" overlay on last thumbnail */}
                  {i === 2 && tour.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                      <span className="text-white text-sm font-semibold">+{tour.images.length - 3} photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BREADCRUMB ════════════════════════════════════════════════════════ */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/tours" className="hover:text-gray-700 transition-colors">Experiences</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-gray-600 font-medium line-clamp-1">{tour.title}</span>
            </nav>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* ─ LEFT: scrollable content ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Title block */}
              <div>
                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {tour.badge && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                      ${tour.badge === 'Best Seller' ? 'bg-amber-400 text-white' :
                        tour.badge === 'Top Rated' ? 'bg-green-500 text-white' :
                        'bg-brand-600 text-white'}`}>
                      {tour.badge}
                    </span>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {tour.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                  {tour.title}
                </h1>
                <p className="text-gray-500 text-base mb-4">{tour.subtitle}</p>

                {/* Rating + meta row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <StarRating rating={tour.rating} />
                    <span className="font-bold text-gray-900">{tour.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({tour.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {tour.location}
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    {tour.duration}
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Globe2 className="w-3.5 h-3.5 text-brand-500" />
                    {tour.languages.join(', ')}
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {['Free cancellation', 'Instant confirmation', 'Small group'].map(badge => (
                    <div key={badge} className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {badge}
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <section aria-labelledby="highlights-heading">
                <h2 id="highlights-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Highlights
                </h2>
                <ul className="space-y-3">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Description */}
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  About this activity
                </h2>
                <div className="prose prose-sm prose-gray max-w-none">
                  {tour.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </section>

              {/* Includes / Excludes */}
              <section aria-labelledby="incexc-heading">
                <h2 id="incexc-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  What's included
                </h2>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Included ✓</p>
                    <ul className="space-y-2">
                      {tour.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 sm:mt-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Not included ✗</p>
                    <ul className="space-y-2">
                      {tour.excludes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                          <XIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Itinerary */}
              <section aria-labelledby="itinerary-heading">
                <h2 id="itinerary-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Itinerary
                </h2>
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" aria-hidden="true" />
                  <div className="space-y-6">
                    {tour.itinerary.map((item, i) => (
                      <div key={i} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white shadow-sm" aria-hidden="true" />
                        <div className="flex items-start gap-3">
                          {item.step && (
                            <span className="shrink-0 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100 mt-0.5">
                              {item.step}
                            </span>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Meeting point */}
              <section aria-labelledby="meeting-heading">
                <h2 id="meeting-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Meeting point
                </h2>
                <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{tour.meetingPoint}</p>
                </div>
              </section>

              {/* Important info */}
              <section aria-labelledby="info-heading">
                <h2 id="info-heading" className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Important information
                </h2>
                <ul className="space-y-2.5">
                  {tour.importantInfo.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Reviews */}
              {tour.reviews.length > 0 && (
                <section aria-labelledby="reviews-heading">
                  <h2 id="reviews-heading" className="text-xl font-bold text-gray-900 mb-2 pb-3 border-b border-gray-100">
                    Customer reviews
                  </h2>
                  {/* Summary bar */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-gray-900 leading-none">{tour.rating.toFixed(1)}</p>
                      <StarRating rating={tour.rating} />
                      <p className="text-xs text-gray-400 mt-1">{tour.reviewCount.toLocaleString()} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3].map(n => {
                        const pct = n === 5 ? 72 : n === 4 ? 22 : 6
                        return (
                          <div key={n} className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 w-4">{n}★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-gray-400 w-7 text-right">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {tour.reviews.map((rev, i) => (
                      <article key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <Quote className="w-6 h-6 text-brand-100 mb-3" />
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">"{rev.text}"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {rev.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{rev.name}</p>
                              <p className="text-xs text-gray-400">{rev.country}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={rev.rating} />
                            <span className="text-xs text-gray-400">{rev.date}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ─ RIGHT: sticky booking panel ──────────────────────────────────── */}
            <div className="lg:col-span-1" id="booking-panel">
              <div className="sticky top-24">
                <Suspense fallback={
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 h-96 animate-pulse" />
                }>
                  <TourBookingPanel tour={tour} />
                </Suspense>
              </div>
            </div>

          </div>
        </div>

        {/* ── Mobile sticky bottom bar ──────────────────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">From</p>
            <p className="text-xl font-extrabold text-gray-900">{formatTHB(minPrice)}<span className="text-xs font-normal text-gray-400 ml-1">/ person</span></p>
          </div>
          <a
            href="#booking-panel"
            className="bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Book Now
          </a>
        </div>
        <div className="lg:hidden h-20" />

      </main>

      <Footer />
    </>
  )
}
