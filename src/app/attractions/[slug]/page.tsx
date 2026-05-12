import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Star, Clock, MapPin, CheckCircle2, AlertCircle, ChevronRight, Tag,
  ExternalLink, Users,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import JsonLd from '@/components/seo/JsonLd'
import { touristAttractionSchema } from '@/lib/seo/schema'
import { prisma } from '@/lib/db'
import type { AttractionListing, AttractionPackage } from '@prisma/client'

// Render on every request — prevents build-time DB connection exhaustion
// and ensures attraction data is always fresh
export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type AttractionWithPackages = AttractionListing & {
  packages: AttractionPackage[]
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const attraction = await prisma.attractionListing.findUnique({
    where: { slug: params.slug, isActive: true },
  })
  if (!attraction) return { title: 'Attraction Not Found' }

  return {
    title: `${attraction.name} | Werest Travel`,
    description: attraction.overview ?? `Book ${attraction.name} tickets online. Instant confirmation.`,
    openGraph: {
      title: attraction.name,
      description: attraction.overview ?? `Book ${attraction.name} tickets online. Instant confirmation.`,
      images: attraction.featureImage ? [{ url: attraction.featureImage }] : [],
    },
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatTHB(amount: number) {
  return `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AttractionDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const attraction = await prisma.attractionListing.findUnique({
    where: { slug: params.slug, isActive: true },
    include: { packages: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  }) as AttractionWithPackages | null

  if (!attraction) notFound()

  // Parse JSON fields
  const highlights = Array.isArray(attraction.highlights)
    ? (attraction.highlights as unknown as string[])
    : typeof attraction.highlights === 'object' && attraction.highlights !== null
    ? (attraction.highlights as unknown as string[])
    : null

  const infoItems = Array.isArray(attraction.infoItems)
    ? (attraction.infoItems as unknown as string[])
    : typeof attraction.infoItems === 'object' && attraction.infoItems !== null
    ? (attraction.infoItems as unknown as string[])
    : null

  const minPrice = attraction.packages.length > 0
    ? Math.min(...attraction.packages.map(p => p.adultPrice))
    : attraction.price

  const mapsQuery = encodeURIComponent(attraction.name + ' ' + attraction.location)

  return (
    <>
      <Navbar />
      <JsonLd data={touristAttractionSchema({
        slug: params.slug,
        name: attraction.name,
        location: attraction.location,
        overview: attraction.overview,
        rating: attraction.rating,
        reviewCount: attraction.reviewCount,
        price: minPrice,
        featureImage: attraction.featureImage,
        category: attraction.category,
      })} />

      <main className="min-h-screen bg-white pt-16">

        {/* ══ HERO IMAGE ════════════════════════════════════════════════════════ */}
        <div className="relative w-full h-72 sm:h-96 lg:h-[480px] overflow-hidden bg-gray-900">
          {attraction.featureImage ? (
            <Image
              src={attraction.featureImage}
              alt={attraction.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${attraction.gradient}`} />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
            {/* Category badge */}
            <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-[#2534ff] text-white mb-3">
              {attraction.category}
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2">
              {attraction.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
                {attraction.location}
              </div>
              {attraction.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={attraction.rating} />
                  <span className="font-bold text-white">{attraction.rating.toFixed(1)}</span>
                  {attraction.reviewCount > 0 && (
                    <span className="text-white/70">({attraction.reviewCount} reviews)</span>
                  )}
                </div>
              )}
              {attraction.badge && (
                <span className="bg-amber-400 text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {attraction.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ══ BREADCRUMB ════════════════════════════════════════════════════════ */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/attractions" className="hover:text-gray-700 transition-colors">Attractions</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="text-gray-600 font-medium line-clamp-1">{attraction.name}</span>
            </nav>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* ─ LEFT COLUMN ──────────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-12">

              {/* ── Quick Info Bar ────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: <Tag className="w-5 h-5 text-[#2534ff]" />,
                    label: 'From',
                    value: formatTHB(minPrice),
                  },
                  {
                    icon: <MapPin className="w-5 h-5 text-[#2534ff]" />,
                    label: 'Location',
                    value: attraction.location,
                  },
                  {
                    icon: <Users className="w-5 h-5 text-[#2534ff]" />,
                    label: 'Category',
                    value: attraction.category,
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-[#2534ff]" />,
                    label: 'Tickets',
                    value: attraction.packages.length > 0
                      ? `${attraction.packages.length} package${attraction.packages.length > 1 ? 's' : ''}`
                      : 'Available',
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center gap-1.5"
                  >
                    {icon}
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
                  </div>
                ))}
              </div>

              {/* ── About ─────────────────────────────────────────────────────── */}
              {(attraction.overview) && (
                <section id="about">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <div className="space-y-4">
                    {attraction.overview.split('\n\n').map((para, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{para}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Packages ──────────────────────────────────────────────────── */}
              {attraction.packages.length > 0 && (
                <section id="packages">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">
                    Available Packages
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {attraction.packages.map(pkg => (
                      <div
                        key={pkg.id}
                        className={`relative bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 ${
                          pkg.popular
                            ? 'border-[#2534ff] ring-2 ring-[#2534ff]/20'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Popular / badge ribbon */}
                        {(pkg.popular || pkg.badge) && (
                          <span className="absolute -top-3 left-4 bg-[#2534ff] text-white text-xs font-bold px-3 py-0.5 rounded-full">
                            {pkg.badge ?? 'Most Popular'}
                          </span>
                        )}

                        <div>
                          <h3 className="font-bold text-gray-900 text-base mb-1">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-sm text-gray-500 leading-relaxed">{pkg.description}</p>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-gray-400 font-medium">Adult</span>
                            <div className="flex items-baseline gap-1.5">
                              {pkg.adultOriginal && pkg.adultOriginal > pkg.adultPrice && (
                                <span className="text-xs text-gray-400 line-through">{formatTHB(pkg.adultOriginal)}</span>
                              )}
                              <span className="text-lg font-extrabold text-gray-900">{formatTHB(pkg.adultPrice)}</span>
                            </div>
                          </div>
                          {pkg.childPrice > 0 && (
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-gray-400 font-medium">Child</span>
                              <div className="flex items-baseline gap-1.5">
                                {pkg.childOriginal && pkg.childOriginal > pkg.childPrice && (
                                  <span className="text-xs text-gray-400 line-through">{formatTHB(pkg.childOriginal)}</span>
                                )}
                                <span className="text-base font-bold text-gray-700">{formatTHB(pkg.childPrice)}</span>
                              </div>
                            </div>
                          )}
                          {pkg.infantPrice === 0 && (
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-gray-400 font-medium">Infant</span>
                              <span className="text-sm font-semibold text-green-600">Free</span>
                            </div>
                          )}
                        </div>

                        {/* Includes list */}
                        {Array.isArray(pkg.includes) && (pkg.includes as string[]).length > 0 && (
                          <ul className="space-y-1.5">
                            {(pkg.includes as string[]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        <Link
                          href={`/attractions/checkout?attractionId=${attraction.id}&packageId=${pkg.id}`}
                          className="mt-auto inline-flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a27e0] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors w-full"
                        >
                          Book Now
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Highlights ────────────────────────────────────────────────── */}
              {highlights && highlights.length > 0 && (
                <section id="highlights">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Highlights</h2>
                  <ul className="space-y-3">
                    {highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#2534ff] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── Important Info ────────────────────────────────────────────── */}
              {infoItems && infoItems.length > 0 && (
                <section id="important-info">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Important Information</h2>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <ul className="space-y-3">
                      {infoItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* ── Getting There ─────────────────────────────────────────────── */}
              <section id="getting-there">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Getting There</h2>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-[#2534ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{attraction.name}</p>
                    <p className="text-sm text-gray-600 mb-3">{attraction.location}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2534ff] hover:text-[#1a27e0] transition-colors"
                    >
                      Open in Google Maps
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </section>

            </div>

            {/* ─ RIGHT COLUMN: sticky booking CTA ─────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Booking card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">From</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {formatTHB(minPrice)}
                      <span className="text-sm font-normal text-gray-400 ml-1">/ person</span>
                    </p>
                    {attraction.originalPrice && attraction.originalPrice > attraction.price && (
                      <p className="text-sm text-gray-400 line-through mt-0.5">{formatTHB(attraction.originalPrice)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={attraction.rating} />
                    <span className="text-sm font-bold text-gray-900">{attraction.rating.toFixed(1)}</span>
                    {attraction.reviewCount > 0 && (
                      <span className="text-sm text-gray-400">({attraction.reviewCount})</span>
                    )}
                  </div>

                  {/* Package quick links */}
                  {attraction.packages.length > 0 ? (
                    <div className="space-y-2.5 mb-5">
                      {attraction.packages.slice(0, 3).map(pkg => (
                        <Link
                          key={pkg.id}
                          href={`/attractions/checkout?attractionId=${attraction.id}&packageId=${pkg.id}`}
                          className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#2534ff]/30 rounded-xl px-4 py-3 transition-colors group"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-[#2534ff] transition-colors line-clamp-1">
                            {pkg.name}
                          </span>
                          <span className="text-sm font-bold text-gray-900 shrink-0">{formatTHB(pkg.adultPrice)}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  <Link
                    href={
                      attraction.packages.length > 0
                        ? `#packages`
                        : `/attractions/checkout?attractionId=${attraction.id}`
                    }
                    className="block w-full text-center bg-[#2534ff] hover:bg-[#1a27e0] text-white font-bold text-sm px-5 py-3.5 rounded-xl transition-colors shadow-md"
                  >
                    {attraction.packages.length > 0 ? 'View All Packages' : 'Book Now'}
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  {[
                    { icon: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />, text: 'Instant confirmation' },
                    { icon: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />, text: 'Mobile e-ticket accepted' },
                    { icon: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />, text: 'Secure payment — 256-bit SSL' },
                    { icon: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />, text: 'WhatsApp support 24/7' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                      {icon}
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp help */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Have a question?</p>
                  <p className="text-xs text-gray-500 mb-3">Chat with us on WhatsApp — replies within minutes</p>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
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

      </main>

      {/* ══ MOBILE STICKY BOTTOM BAR ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">From</p>
          <p className="text-xl font-extrabold text-gray-900">
            {formatTHB(minPrice)}
            <span className="text-xs font-normal text-gray-400 ml-1">/ person</span>
          </p>
        </div>
        <Link
          href={
            attraction.packages.length > 0
              ? `#packages`
              : `/attractions/checkout?attractionId=${attraction.id}`
          }
          className="bg-[#2534ff] text-white font-bold text-sm px-7 py-3 rounded-xl hover:bg-[#1a27e0] transition-colors shadow-md shrink-0"
        >
          Book Now
        </Link>
      </div>
      <div className="lg:hidden h-20" />

      <Footer />
    </>
  )
}
