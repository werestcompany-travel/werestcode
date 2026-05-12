import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  Star, Clock, Users, Globe2, CheckCircle2, X as XIcon,
  MapPin, ChevronRight, Quote, AlertCircle, Shield, Zap, Smartphone,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReviewSection from '@/components/reviews/ReviewSection'
import TourBookingPanel from '@/components/tours/TourBookingPanel'
import TourCard from '@/components/tours/TourCard'
import FaqItem from '@/components/tours/FaqItem'
import TourWishlistButton from '@/components/tours/TourWishlistButton'
import GalleryLightbox from '@/components/tours/GalleryLightbox'
import TourStickyNav from '@/components/tours/TourStickyNav'
import QuickInfoBar from '@/components/tours/QuickInfoBar'
import ItineraryItem from '@/components/tours/ItineraryItem'
import JsonLd from '@/components/seo/JsonLd'
import { tourProductSchema } from '@/lib/seo/schema'
import { getTourBySlug, getToursForDestination, TOURS, formatTHB, type Tour } from '@/lib/tours'
import { prisma } from '@/lib/db'

// ─── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return TOURS.map(t => ({ slug: t.slug }))
}

// ─── DB + fallback loader ──────────────────────────────────────────────────────

interface TourExtended extends Tour {
  faqs?:               unknown
  cancellationPolicy?: string | null
}

async function getTour(slug: string): Promise<TourExtended | null> {
  try {
    const dbTour = await prisma.tour.findUnique({ where: { slug, isActive: true } })
    if (dbTour) {
      return {
        slug:               dbTour.slug,
        title:              dbTour.title,
        subtitle:           dbTour.subtitle ?? '',
        location:           dbTour.location,
        cities:             dbTour.cities,
        duration:           dbTour.duration,
        maxGroupSize:       dbTour.maxGroupSize,
        languages:          dbTour.languages,
        rating:             dbTour.rating,
        reviewCount:        dbTour.reviewCount,
        category:           dbTour.category as Tour['category'],
        badge:              dbTour.badge as Tour['badge'] ?? undefined,
        images:             dbTour.images,
        highlights:         dbTour.highlights,
        description:        dbTour.description,
        includes:           dbTour.includes,
        excludes:           dbTour.excludes,
        itinerary:          (dbTour.itinerary as unknown as Tour['itinerary']) ?? [],
        options:            (dbTour.options as unknown as Tour['options']) ?? [],
        meetingPoint:       dbTour.meetingPoint ?? '',
        importantInfo:      dbTour.importantInfo,
        reviews:            (dbTour.reviews as unknown as Tour['reviews']) ?? [],
        faqs:               (dbTour as unknown as { faqs?: unknown }).faqs ?? null,
        cancellationPolicy: (dbTour as unknown as { cancellationPolicy?: string | null }).cancellationPolicy ?? null,
      }
    }
  } catch (err) {
    console.warn('[tours/slug] DB fetch failed, falling back to static data:', err)
  }
  return getTourBySlug(slug) ?? null
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tour = await getTour(params.slug)
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

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

const BADGE_STYLE: Record<string, string> = {
  'Best Seller': 'bg-amber-400 text-white',
  'Top Rated':   'bg-green-500 text-white',
  'New':         'bg-[#2534ff] text-white',
}

const CATEGORY_LABEL: Record<string, string> = {
  'day-trip':  'Day Trip',
  'cultural':  'Cultural',
  'adventure': 'Adventure',
  'food':      'Food & Drink',
  'nature':    'Nature',
  'water':     'Water Activity',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const tour = await getTour(params.slug)
  if (!tour) notFound()

  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))

  // ── Related tours ──────────────────────────────────────────────────────────
  let related: Tour[] = []
  try {
    const dbRelated = await prisma.tour.findMany({
      where: { isActive: true, NOT: { slug: tour.slug } },
      take: 3,
      orderBy: { sortOrder: 'asc' },
    })
    if (dbRelated.length > 0) {
      related = dbRelated.map(t => ({
        slug:          t.slug,
        title:         t.title,
        subtitle:      t.subtitle ?? '',
        location:      t.location,
        cities:        t.cities,
        duration:      t.duration,
        maxGroupSize:  t.maxGroupSize,
        languages:     t.languages,
        rating:        t.rating,
        reviewCount:   t.reviewCount,
        category:      t.category as Tour['category'],
        badge:         t.badge as Tour['badge'] ?? undefined,
        images:        t.images,
        highlights:    t.highlights,
        description:   t.description,
        includes:      t.includes,
        excludes:      t.excludes,
        itinerary:     (t.itinerary as unknown as Tour['itinerary']) ?? [],
        options:       (t.options as unknown as Tour['options']) ?? [],
        meetingPoint:  t.meetingPoint ?? '',
        importantInfo: t.importantInfo,
        reviews:       (t.reviews as unknown as Tour['reviews']) ?? [],
      }))
    } else {
      related = getToursForDestination(tour.location ?? '').filter(t => t.slug !== tour.slug).slice(0, 3)
    }
  } catch {
    related = getToursForDestination(tour.location ?? '').filter(t => t.slug !== tour.slug).slice(0, 3)
  }

  // ── Rating distribution ────────────────────────────────────────────────────
  const reviewsArr = Array.isArray(tour.reviews) ? tour.reviews as { rating: number }[] : []
  const reviewTotal = reviewsArr.length || 1
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    pct: Math.round((reviewsArr.filter(r => Math.round(r.rating) === star).length / reviewTotal) * 100),
  }))

  return (
    <>
      <JsonLd data={tourProductSchema(tour)} />
      <Navbar />

      <main className="min-h-screen bg-white pt-16">

        {/* ══ GALLERY ═══════════════════════════════════════════════════════════ */}
        <GalleryLightbox
          images={tour.images}
          title={tour.title}
          slug={tour.slug}
        />

        {/* ══ BREADCRUMB ════════════════════════════════════════════════════════ */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/tours" className="hover:text-gray-700 transition-colors">Experiences</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href={`/tours?destination=${encodeURIComponent(tour.location)}`} className="hover:text-gray-700 transition-colors">
                {tour.location}
              </Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-gray-600 font-medium line-clamp-1">{tour.title}</span>
            </nav>
          </div>
        </div>

        {/* ══ STICKY NAV (client island) ════════════════════════════════════════ */}
        <TourStickyNav />

        {/* ══ MAIN CONTENT GRID ═════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* ─ LEFT COLUMN ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-2">

              {/* ── Overview / Title block ────────────────────────────────────── */}
              <section id="overview" className="pb-8">

                {/* Badge + category row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {tour.badge && (
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${BADGE_STYLE[tour.badge] ?? 'bg-gray-700 text-white'}`}>
                      {tour.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-[#2534ff] border border-blue-100">
                    {CATEGORY_LABEL[tour.category] ?? tour.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                  {tour.title}
                </h1>
                <p className="text-gray-500 text-base sm:text-lg mb-5 leading-relaxed">{tour.subtitle}</p>

                {/* Rating + meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
                  <a href="#reviews" className="flex items-center gap-2 group">
                    <StarRating rating={tour.rating} />
                    <span className="font-extrabold text-gray-900">{tour.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm group-hover:text-[#2534ff] transition-colors underline underline-offset-2">
                      ({tour.reviewCount.toLocaleString()} reviews)
                    </span>
                  </a>
                  <span className="text-gray-200 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                    {tour.location}
                  </div>
                  <span className="text-gray-200 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                    {tour.duration}
                  </div>
                  <span className="text-gray-200 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Globe2 className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                    {tour.languages.join(', ')}
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Free cancellation
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    Instant confirmation
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    Small group — max {tour.maxGroupSize}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-3 py-1.5">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    Mobile ticket
                  </div>
                  <TourWishlistButton slug={tour.slug} title={tour.title} />
                </div>

                {/* Quick info pill bar */}
                <QuickInfoBar tour={tour} />

                {/* Description */}
                <div className="mt-8 space-y-4">
                  {tour.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{para}</p>
                  ))}
                </div>
              </section>

              {/* ── Highlights ────────────────────────────────────────────────── */}
              <section id="highlights" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Highlights</h2>
                <ul className="space-y-3">
                  {tour.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#2534ff] shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* ── What's Included ───────────────────────────────────────────── */}
              <section id="whats-included" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">{"What's included"}</h2>
                <div className="bg-gray-50 rounded-2xl p-5 grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Included
                    </p>
                    <ul className="space-y-2.5">
                      {tour.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <XIcon className="w-3.5 h-3.5 text-red-400" /> Not included
                    </p>
                    <ul className="space-y-2.5">
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

              {/* ── Itinerary ─────────────────────────────────────────────────── */}
              <section id="itinerary" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Itinerary</h2>
                <div className="relative pl-7">
                  <div
                    className="absolute left-[10px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="space-y-0">
                    {tour.itinerary.map((item, i) => (
                      <ItineraryItem
                        key={i}
                        step={item.step}
                        title={item.title}
                        desc={item.desc}
                        isLast={i === tour.itinerary.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* ── Meeting Point ─────────────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Meeting point</h2>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#2534ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Your starting location</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{tour.meetingPoint}</p>
                  </div>
                </div>
              </section>

              {/* ── Important Information ─────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Important information</h2>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <ul className="space-y-3">
                    {tour.importantInfo.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* ── Cancellation Policy ───────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Cancellation policy</h2>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800 mb-1">Free cancellation available</p>
                    <p className="text-sm text-green-700 leading-relaxed">
                      {(tour as TourExtended).cancellationPolicy
                        ?? 'Cancel up to 24 hours before the tour start time for a full refund. Cancellations within 24 hours are non-refundable.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* ── FAQ ───────────────────────────────────────────────────────── */}
              {Array.isArray((tour as TourExtended).faqs) && ((tour as TourExtended).faqs as unknown[]).length > 0 && (
                <section className="py-8 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently asked questions</h2>
                  <div className="space-y-3">
                    {((tour as TourExtended).faqs as { q: string; a: string }[]).map((faq, i) => (
                      <FaqItem key={i} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Customer Reviews ──────────────────────────────────────────── */}
              <section id="reviews" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer reviews</h2>

                {/* Rating overview */}
                {tour.reviews.length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center shrink-0">
                      <p className="text-6xl font-extrabold text-gray-900 leading-none mb-2">{tour.rating.toFixed(1)}</p>
                      <StarRating rating={tour.rating} size="lg" />
                      <p className="text-xs text-gray-400 mt-2">{tour.reviewCount.toLocaleString()} verified reviews</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      {ratingDist.map(({ star, pct }) => (
                        <div key={star} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500 w-4 text-right shrink-0">{star}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-8 text-right shrink-0">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review cards */}
                {tour.reviews.length > 0 && (
                  <div className="space-y-4 mb-8">
                    {tour.reviews.map((rev, i) => (
                      <article key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2534ff] to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {rev.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{rev.name}</p>
                              <p className="text-xs text-gray-400">{rev.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <StarRating rating={rev.rating} size="sm" />
                            <p className="text-xs text-gray-400 mt-1">{rev.date}</p>
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-blue-100 mb-2" />
                        <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{rev.text}&rdquo;</p>
                      </article>
                    ))}
                  </div>
                )}

                {/* User-submitted review section */}
                <ReviewSection
                  entityType="TOUR"
                  entityId={tour.slug}
                  entityName={tour.title}
                />
              </section>

              {/* ── Related Tours ─────────────────────────────────────────────── */}
              {related.length > 0 && (
                <section className="py-10 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">You might also like</h2>
                    <Link
                      href="/tours"
                      className="text-sm font-semibold text-[#2534ff] hover:text-[#1a27e0] flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map(t => (
                      <TourCard key={t.slug ?? (t as unknown as { id?: string }).id} tour={t as Tour} />
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* ─ RIGHT COLUMN: sticky booking panel ───────────────────────────── */}
            <div id="booking-panel" className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Suspense fallback={
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 h-96 animate-pulse" />
                }>
                  <TourBookingPanel tour={tour} />
                </Suspense>

                {/* Trust indicators */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-medium">Secure booking — 256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Free cancellation 24h before</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Instant confirmation on booking</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Globe2 className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span>WhatsApp support available 24/7</span>
                  </div>
                </div>

                {/* WhatsApp help card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Have a question?</p>
                  <p className="text-xs text-gray-500 mb-3">Our team replies within minutes on WhatsApp</p>
                  <a
                    href="https://wa.me/66000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ══ SOCIAL PROOF BANNER ═══════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-[#2534ff] to-indigo-700 py-12 mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Join 50,000+ happy travelers
            </h3>
            <p className="text-blue-200 text-sm sm:text-base max-w-xl mx-auto">
              Trusted by travelers from 80+ countries. Every experience is hand-picked, locally operated and backed by our satisfaction guarantee.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-white/80 text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Verified reviews</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Money-back guarantee</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Instant booking</span>
            </div>
          </div>
        </div>

        {/* ══ MOBILE STICKY BOTTOM BAR ══════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">From</p>
            <p className="text-xl font-extrabold text-gray-900">
              {formatTHB(minPrice)}
              <span className="text-xs font-normal text-gray-400 ml-1">/ person</span>
            </p>
          </div>
          <a
            href="#booking-panel"
            className="bg-[#2534ff] text-white font-bold text-sm px-7 py-3 rounded-xl hover:bg-[#1a27e0] transition-colors shadow-md shrink-0"
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
