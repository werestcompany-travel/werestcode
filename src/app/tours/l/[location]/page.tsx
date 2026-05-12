import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourGrid from '@/components/tours/TourGrid'
import JsonLd from '@/components/seo/JsonLd'
import { tours as ALL_TOURS } from '@/lib/tours'

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATION_LABELS: Record<string, string> = {
  'bangkok':    'Bangkok',
  'phuket':     'Phuket',
  'chiang-mai': 'Chiang Mai',
  'pattaya':    'Pattaya',
  'krabi':      'Krabi',
  'chiang-rai': 'Chiang Rai',
}

const CATEGORY_PILLS = [
  { key: 'cultural',  label: 'Cultural' },
  { key: 'day-trip',  label: 'Day Trips' },
  { key: 'food',      label: 'Food & Drink' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nature',    label: 'Nature' },
  { key: 'water',     label: 'Water' },
]

const RELATED_DESTINATIONS = [
  { key: 'bangkok',    label: 'Bangkok' },
  { key: 'phuket',     label: 'Phuket' },
  { key: 'chiang-mai', label: 'Chiang Mai' },
  { key: 'pattaya',    label: 'Pattaya' },
  { key: 'krabi',      label: 'Krabi' },
  { key: 'chiang-rai', label: 'Chiang Rai' },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function filterByLocation(locationKey: string, locationLabel: string) {
  const lowerKey   = locationKey.toLowerCase().replace('-', '')
  const lowerLabel = locationLabel.toLowerCase()

  return ALL_TOURS.filter(tour =>
    tour.cities.some(c =>
      c.toLowerCase().includes(lowerKey) ||
      c.toLowerCase().includes(lowerLabel)
    ) ||
    tour.location.toLowerCase().includes(lowerLabel)
  )
}

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return [
    { location: 'bangkok' },
    { location: 'phuket' },
    { location: 'chiang-mai' },
    { location: 'pattaya' },
    { location: 'krabi' },
    { location: 'chiang-rai' },
  ]
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { location: string }
}): Promise<Metadata> {
  const label = LOCATION_LABELS[params.location] ?? params.location
  return {
    title:       `Things to Do in ${label} | Werest Travel`,
    description: `Explore the best tours, day trips, and experiences in ${label}, Thailand. Book instantly with free cancellation.`,
    alternates:  { canonical: `https://www.werest.com/tours/l/${params.location}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocationPage({
  params,
}: {
  params: { location: string }
}) {
  const { location } = params
  const label        = LOCATION_LABELS[location] ?? location
  const results      = filterByLocation(location, label)
  const related      = RELATED_DESTINATIONS.filter(d => d.key !== location)

  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'TouristDestination',
    name:         label,
    description:  `Explore the best tours and experiences in ${label}, Thailand.`,
    url:          `https://www.werest.com/tours/l/${location}`,
    containedInPlace: {
      '@type': 'Country',
      name:    'Thailand',
    },
    touristType: ['Cultural tourist', 'Adventure tourist', 'Food tourist'],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      <main className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#2534ff] to-indigo-700 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Things to Do in {label}
            </h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Explore the best tours, day trips, and experiences in {label}.
              Book instantly with free cancellation.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#2534ff] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tours" className="hover:text-[#2534ff] transition-colors">Tours</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{label}</span>
          </nav>

          {/* ── Category filter pills ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORY_PILLS.map(cat => (
              <Link
                key={cat.key}
                href={`/tours?destination=${encodeURIComponent(label)}&category=${cat.key}`}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* ── Activity count ──────────────────────────────────────────────── */}
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-900">{results.length}</span>{' '}
            thing{results.length !== 1 ? 's' : ''} to do in {label}
          </p>

          {/* ── Popular section heading ──────────────────────────────────────── */}
          {results.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Popular in {label}
            </h2>
          )}

          {/* ── Tour grid ───────────────────────────────────────────────────── */}
          {results.length > 0 ? (
            <TourGrid tours={results} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">🗺️</p>
              <p className="text-lg font-semibold text-gray-600">No tours found in {label}</p>
              <p className="text-sm mt-1">Check back soon — we&apos;re adding new experiences regularly.</p>
            </div>
          )}

          {/* ── Related destinations ─────────────────────────────────────────── */}
          <section className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Explore other destinations</h2>
            <div className="flex flex-wrap gap-3">
              {related.map(dest => (
                <Link
                  key={dest.key}
                  href={`/tours/l/${dest.key}`}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors"
                >
                  {dest.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
