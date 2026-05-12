import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TourGrid from '@/components/tours/TourGrid'
import JsonLd from '@/components/seo/JsonLd'
import { searchTours } from '@/lib/tours'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  'cultural':  'Cultural',
  'day-trip':  'Day Trip',
  'food':      'Food & Drink',
  'adventure': 'Adventure',
  'nature':    'Nature',
  'water':     'Water Activities',
}

const CATEGORY_ICONS: Record<string, string> = {
  'cultural':  '🏛️',
  'day-trip':  '🌅',
  'food':      '🍜',
  'adventure': '🧗',
  'nature':    '🌿',
  'water':     '🏄',
}

const RELATED_CATEGORIES = [
  { key: 'cultural',  label: 'Cultural',         icon: '🏛️' },
  { key: 'day-trip',  label: 'Day Trips',         icon: '🌅' },
  { key: 'food',      label: 'Food & Drink',      icon: '🍜' },
  { key: 'adventure', label: 'Adventure',         icon: '🧗' },
  { key: 'nature',    label: 'Nature',            icon: '🌿' },
  { key: 'water',     label: 'Water Activities',  icon: '🏄' },
]

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return [
    { category: 'cultural' },
    { category: 'day-trip' },
    { category: 'food' },
    { category: 'adventure' },
    { category: 'nature' },
    { category: 'water' },
  ]
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const label = CATEGORY_LABELS[params.category] ?? params.category
  return {
    title:       `${label} Tours in Thailand | Werest Travel`,
    description: `Discover the best ${label.toLowerCase()} experiences in Thailand. Book instantly with free cancellation.`,
    alternates:  { canonical: `https://www.werest.com/tours/c/${params.category}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const { category } = params
  const label        = CATEGORY_LABELS[category] ?? category
  const icon         = CATEGORY_ICONS[category] ?? '🗺️'
  const results      = searchTours({ category })
  const related      = RELATED_CATEGORIES.filter(c => c.key !== category)

  const jsonLd = {
    '@context':    'https://schema.org',
    '@type':       'Service',
    name:          `${label} Tours in Thailand`,
    description:   `Discover the best ${label.toLowerCase()} experiences in Thailand.`,
    provider: {
      '@type': 'TravelAgency',
      name:    'Werest Travel',
      url:     'https://www.werest.com',
    },
    areaServed: {
      '@type': 'Country',
      name:    'Thailand',
    },
    url: `https://www.werest.com/tours/c/${category}`,
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <Navbar />

      <main className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#2534ff] to-indigo-700 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              {label} Tours in Thailand
            </h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Discover the best {label.toLowerCase()} experiences in Thailand.
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

          {/* ── Activity count ──────────────────────────────────────────────── */}
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-900">{results.length}</span>{' '}
            {label.toLowerCase()} experience{results.length !== 1 ? 's' : ''} in Thailand
          </p>

          {/* ── Tour grid ───────────────────────────────────────────────────── */}
          {results.length > 0 ? (
            <TourGrid tours={results} />
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-4">🗺️</p>
              <p className="text-lg font-semibold text-gray-600">No tours found</p>
              <p className="text-sm mt-1">Check back soon — we&apos;re adding new experiences regularly.</p>
            </div>
          )}

          {/* ── Related categories ──────────────────────────────────────────── */}
          <section className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Explore other categories</h2>
            <div className="flex flex-wrap gap-3">
              {related.map(cat => (
                <Link
                  key={cat.key}
                  href={`/tours/c/${cat.key}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
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
