import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Star, Clock, CheckCircle2, X as XIcon, MapPin, ChevronRight,
  AlertCircle, Shield, Zap, Globe2, Car, Users, Plane,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TransferGallery from '@/components/airport-transfers/TransferGallery'
import PromoCodeSection from '@/components/airport-transfers/PromoCodeSection'
import ReviewSection from '@/components/reviews/ReviewSection'
import FaqItem from '@/components/tours/FaqItem'
import { getAirportService, AIRPORT_SERVICES } from '@/lib/airport-services'
import { prisma } from '@/lib/db'

// ─── Static params ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Object.keys(AIRPORT_SERVICES).map(slug => ({ slug }))
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const s = getAirportService(params.slug)
  if (!s) return { title: 'Transfer Not Found' }
  return {
    title:       `${s.name} | Werest Travel`,
    description: s.tagline,
    openGraph: {
      title:       s.name,
      description: s.tagline,
      images:      s.images[0] ? [{ url: s.images[0] }] : [],
    },
  }
}

// ─── Coordinate lookup for popular-route deep links ─────────────────────────
// These are approximate centre-point coords for common origins/destinations.

const COORDS: Record<string, { lat: number; lng: number }> = {
  // Airports
  'Suvarnabhumi Airport':   { lat: 13.6900, lng: 100.7501 },
  'Don Mueang Airport':     { lat: 13.9126, lng: 100.6068 },
  'Phuket Airport':         { lat: 8.1122,  lng: 98.3160  },
  'Chiang Mai Airport':     { lat: 18.7680, lng: 98.9623  },
  // Bangkok zones
  Sukhumvit:                { lat: 13.7295, lng: 100.5813 },
  'Silom / Sathorn':        { lat: 13.7244, lng: 100.5308 },
  'Khao San Road':          { lat: 13.7575, lng: 100.4975 },
  // Inter-city
  Pattaya:                  { lat: 12.9236, lng: 100.8825 },
  'Hua Hin':                { lat: 12.5682, lng: 99.9580  },
  'Don Mueang Airport (DMK)': { lat: 13.9126, lng: 100.6068 },
  'Suvarnabhumi (BKK)':     { lat: 13.6900, lng: 100.7501 },
  Ayutthaya:                { lat: 14.3532, lng: 100.5618 },
  // Phuket zones
  'Patong Beach':           { lat: 7.8975,  lng: 98.2969  },
  'Bang Tao':               { lat: 8.0676,  lng: 98.2926  },
  'Kata Beach':             { lat: 7.8197,  lng: 98.2981  },
  'Karon Beach':            { lat: 7.8456,  lng: 98.2990  },
  Rawai:                    { lat: 7.7810,  lng: 98.3124  },
  'Khao Lak':               { lat: 8.6310,  lng: 98.2700  },
  // Chiang Mai
  'Old City':               { lat: 18.7887, lng: 98.9853  },
  'Nimman Road':            { lat: 18.7985, lng: 98.9719  },
  'Chiang Rai':             { lat: 19.9105, lng: 99.8406  },
  Pai:                      { lat: 19.3588, lng: 98.4415  },
}

function routeHref(from: string, to: string) {
  const p = COORDS[from]
  const d = COORDS[to]
  const base = '/results'
  const qs = new URLSearchParams({
    pickup_address:  from,
    dropoff_address: to,
    passengers: '2',
    luggage:    '1',
    ...(p && { pickup_lat:  String(p.lat), pickup_lng:  String(p.lng) }),
    ...(d && { dropoff_lat: String(d.lat), dropoff_lng: String(d.lng) }),
  })
  return `${base}?${qs.toString()}`
}

// ─── Star helper ────────────────────────────────────────────────────────────

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${sz} ${n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function AirportTransferServicePage(
  { params }: { params: { slug: string } },
) {
  const service = getAirportService(params.slug)
  if (!service) notFound()

  // ── Promo codes (server-side) ────────────────────────────────────────────
  interface RawCode {
    code: string; type: string; value: number;
    description: string | null; expiresAt: Date;
  }
  let promoCodes: RawCode[] = []
  try {
    const now  = new Date()
    const rows = await prisma.discountCode.findMany({
      where:   { isActive: true, newUserOnly: false, expiresAt: { gt: now } },
      select:  { code: true, type: true, value: true, description: true, expiresAt: true, maxUses: true, usedCount: true },
      orderBy: { createdAt: 'desc' },
    })
    promoCodes = rows
      .filter(r => r.maxUses == null || r.usedCount < r.maxUses)
      .filter((r): r is typeof r & { expiresAt: Date } => r.expiresAt != null)
      .map(({ maxUses: _m, usedCount: _u, ...rest }) => rest)
  } catch { /* DB unavailable in static export */ }

  // Serialise Date → string for client component
  const promoCodesSerial = promoCodes.map(c => ({
    ...c,
    expiresAt: c.expiresAt.toISOString(),
  }))

  // ── Reviews summary (server-side for SEO) ────────────────────────────────
  let reviewMeta: { count: number; avg: number | null } = { count: 0, avg: null }
  try {
    const rows = await prisma.review.findMany({
      where:  { entityType: 'TRANSFER', entityId: params.slug, isPublished: true },
      select: { rating: true },
    })
    if (rows.length > 0) {
      reviewMeta = {
        count: rows.length,
        avg:   rows.reduce((s, r) => s + r.rating, 0) / rows.length,
      }
    }
  } catch { /* ignore */ }

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">

        {/* ══ GALLERY ═══════════════════════════════════════════════════════════ */}
        <TransferGallery images={service.images} title={service.name} />

        {/* ══ BREADCRUMB ════════════════════════════════════════════════════════ */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/"                  className="hover:text-gray-700 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/airport-transfers" className="hover:text-gray-700 transition-colors">Airport Transfers</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-gray-600 font-medium line-clamp-1">{service.shortName}</span>
            </nav>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* ─ LEFT COLUMN ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-0">

              {/* ── Title block ───────────────────────────────────────────────── */}
              <section id="overview" className="pb-8">

                {/* IATA + city badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#2534ff] text-white">
                    <Plane className="w-3 h-3" />
                    {service.iataCode}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-[#2534ff] border border-blue-100">
                    <MapPin className="w-3 h-3" />
                    {service.city}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                  {service.name}
                </h1>
                <p className="text-gray-500 text-base sm:text-lg mb-5 leading-relaxed">{service.tagline}</p>

                {/* Rating row */}
                {reviewMeta.count > 0 && reviewMeta.avg !== null && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
                    <a href="#reviews" className="flex items-center gap-2 group">
                      <Stars rating={reviewMeta.avg} />
                      <span className="font-extrabold text-gray-900">{reviewMeta.avg.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm group-hover:text-[#2534ff] transition-colors underline underline-offset-2">
                        ({reviewMeta.count.toLocaleString()} reviews)
                      </span>
                    </a>
                  </div>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Fixed price — no surprises
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    Instant confirmation
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
                    <Plane className="w-3.5 h-3.5 shrink-0" />
                    Live flight tracking
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    Free cancellation 24h
                  </div>
                </div>

                {/* Quick info pills */}
                <div className="flex flex-wrap gap-3 bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span><span className="font-semibold">Duration:</span> {service.duration}</span>
                  </div>
                  <span className="text-gray-200 self-center hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Car className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span><span className="font-semibold">Vehicle:</span> Sedan, SUV or Minivan</span>
                  </div>
                  <span className="text-gray-200 self-center hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span><span className="font-semibold">Group:</span> Up to 10 passengers</span>
                  </div>
                  <span className="text-gray-200 self-center hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Globe2 className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span><span className="font-semibold">Language:</span> English &amp; Thai</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  {service.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{para}</p>
                  ))}
                </div>
              </section>

              {/* ── Highlights ────────────────────────────────────────────────── */}
              <section id="highlights" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Highlights</h2>
                <ul className="space-y-3">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-[#2534ff] shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* ── What's included ───────────────────────────────────────────── */}
              <section id="whats-included" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">{"What's included"}</h2>
                <div className="bg-gray-50 rounded-2xl p-5 grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Included
                    </p>
                    <ul className="space-y-2.5">
                      {service.included.map((item, i) => (
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
                      {service.notIncluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                          <XIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* ── Meeting point ─────────────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Meeting point</h2>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#2534ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Driver meets you in arrivals</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.meetingPoint}</p>
                  </div>
                </div>
              </section>

              {/* ── Popular routes ────────────────────────────────────────────── */}
              <section id="routes" className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Popular routes</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Fixed prices for the most-booked routes from {service.shortName}. Click any route to see all vehicle options.
                </p>

                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Est. time</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">From</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Book</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {service.popularRoutes.map((route, i) => (
                        <tr key={i} className="group hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-gray-900">{route.from}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <ChevronRight className="w-3 h-3" />{route.to}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                            <span className="text-gray-500 flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              {service.duration}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="font-bold text-gray-900 text-base">
                              ฿{route.price.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Link
                              href={routeHref(route.from, route.to)}
                              className="inline-flex items-center gap-1 bg-[#2534ff] hover:bg-[#1a27e0] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Book <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  All prices are fixed — no metering, surge fees, or hidden charges.
                </p>
              </section>

              {/* ── Important information ─────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Important information</h2>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <ul className="space-y-3">
                    {service.importantInfo.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* ── Cancellation policy ───────────────────────────────────────── */}
              <section className="py-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Cancellation policy</h2>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800 mb-1">Free cancellation</p>
                    <p className="text-sm text-green-700 leading-relaxed">
                      Cancel up to 24 hours before your scheduled pickup for a full refund. No questions asked.
                      Cancellations within 24 hours are subject to a 50% fee.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── Promo codes (client island) ───────────────────────────────── */}
              {promoCodesSerial.length > 0 && (
                <PromoCodeSection codes={promoCodesSerial} />
              )}

              {/* ── FAQ ───────────────────────────────────────────────────────── */}
              {service.faq.length > 0 && (
                <section id="faq" className="py-8 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently asked questions</h2>
                  <div className="space-y-3">
                    {service.faq.map((item, i) => (
                      <FaqItem key={i} q={item.q} a={item.a} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Reviews (client island) ───────────────────────────────────── */}
              <section id="reviews" className="py-8 border-t border-gray-100">
                <ReviewSection
                  entityType="TRANSFER"
                  entityId={params.slug}
                  entityName={service.name}
                />
              </section>

            </div>

            {/* ─ RIGHT COLUMN: sticky booking widget ───────────────────────── */}
            <div id="booking-panel" className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Booking card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                  <div className="mb-4">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Private transfer from</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      ฿{service.fromPrice.toLocaleString()}
                      <span className="text-sm font-normal text-gray-400 ml-1">/ sedan</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Fixed price — no meters, no surge</p>
                  </div>

                  {/* Key info */}
                  <div className="bg-gray-50 rounded-xl p-3.5 mb-4 space-y-2">
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-[#2534ff] shrink-0" />
                      <span>Duration: <span className="font-semibold">{service.duration}</span></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Plane className="w-4 h-4 text-[#2534ff] shrink-0" />
                      <span>Live flight tracking</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Car className="w-4 h-4 text-[#2534ff] shrink-0" />
                      <span>Sedan, SUV &amp; Minivan options</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>Free cancellation — 24h before</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/?airport=${encodeURIComponent(service.shortName)}`}
                    className="block w-full bg-[#2534ff] hover:bg-[#1a27e0] text-white font-bold text-sm py-3.5 rounded-xl transition-colors text-center shadow-md hover:shadow-lg"
                  >
                    Book This Transfer
                  </Link>

                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    Instant confirmation · No card fees
                  </p>
                </div>

                {/* Trust indicators */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="font-medium">Secure booking — 256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Fixed price — all tolls &amp; parking included</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Plane className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span>Driver adjusts for delays automatically</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Globe2 className="w-4 h-4 text-[#2534ff] shrink-0" />
                    <span>Available 24/7 — any day of the year</span>
                  </div>
                </div>

                {/* WhatsApp help */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Have a question?</p>
                  <p className="text-xs text-gray-500 mb-3">Our team replies within minutes on WhatsApp</p>
                  <a
                    href={`https://wa.me/${whatsapp}`}
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
              Trusted by travelers from 80+ countries. Every transfer is professionally chauffeured,
              flight-tracked, and backed by our fixed-price guarantee.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-white/80 text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Verified drivers</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Fixed-price guarantee</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Instant booking</span>
              <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-blue-300" /> 24/7 availability</span>
            </div>
          </div>
        </div>

        {/* ══ MOBILE STICKY BOTTOM BAR ══════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">From</p>
            <p className="text-xl font-extrabold text-gray-900">
              ฿{service.fromPrice.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-1">/ sedan</span>
            </p>
          </div>
          <Link
            href={`/?airport=${encodeURIComponent(service.shortName)}`}
            className="bg-[#2534ff] text-white font-bold text-sm px-7 py-3 rounded-xl hover:bg-[#1a27e0] transition-colors shadow-md shrink-0"
          >
            Book Now
          </Link>
        </div>
        <div className="lg:hidden h-20" />

      </main>
      <Footer />
    </>
  )
}
