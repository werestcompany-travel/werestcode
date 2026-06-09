import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getToursForDestination, formatTHB } from '@/lib/tours'
import { MapPin, Star, ArrowRight, Clock, Users, ChevronRight, Shield, Phone, Smile, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Private Transfers & Tours in Thailand — Werest Travel',
  description: 'Book private car transfers and curated day trips across Thailand. Bangkok, Phuket, Chiang Mai, Pattaya, Krabi and more — fixed prices, professional drivers, instant confirmation.',
  openGraph: {
    title: 'Private Transfers & Tours in Thailand — Werest Travel',
    description: 'Travel Thailand your way. Fixed-price private transfers and hand-picked experiences in every major destination.',
    images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80' }],
  },
}

/* ── City cards ─────────────────────────────────────────────────────────────── */
const CITIES = [
  {
    name: 'Bangkok',
    slug: 'bangkok',
    transfers: '240+ transfers',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Phuket',
    slug: 'phuket',
    transfers: '180+ transfers',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chiang Mai',
    slug: 'chiang-mai',
    transfers: '120+ transfers',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pattaya',
    slug: 'pattaya',
    transfers: '95+ transfers',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Krabi',
    slug: 'krabi',
    transfers: '80+ transfers',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Koh Samui',
    slug: 'koh-samui',
    transfers: '70+ transfers',
    image: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Hua Hin',
    slug: 'hua-hin',
    transfers: '55+ transfers',
    image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Ayutthaya',
    slug: 'ayutthaya',
    transfers: '40+ transfers',
    image: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=600&q=80',
  },
]

/* ── Popular routes ──────────────────────────────────────────────────────────── */
const ROUTES = [
  { from: 'Bangkok', to: 'Pattaya',    price: 1800, duration: '1h 45m', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80' },
  { from: 'Bangkok', to: 'Hua Hin',   price: 2400, duration: '2h 30m', image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=400&q=80' },
  { from: 'Bangkok Airport', to: 'Bangkok City', price: 900, duration: '45m', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=400&q=80' },
  { from: 'Phuket', to: 'Krabi',      price: 2200, duration: '2h',     image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80' },
  { from: 'Chiang Mai', to: 'Chiang Rai', price: 1600, duration: '3h', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80' },
  { from: 'Bangkok', to: 'Ayutthaya', price: 1400, duration: '1h 30m', image: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=400&q=80' },
]

/* ── Trust benefits ──────────────────────────────────────────────────────────── */
const BENEFITS = [
  { Icon: Shield, title: 'Fixed prices, no surprises', desc: 'What you see is what you pay. No surge pricing, no hidden fees, ever.' },
  { Icon: Phone,  title: '24/7 support you can count on', desc: 'Our team is available around the clock via WhatsApp, Line, or phone.' },
  { Icon: Smile,  title: 'Local experts behind the wheel', desc: 'Vetted professional drivers who know Thailand inside out.' },
  { Icon: Zap,    title: 'Instant confirmation', desc: 'Your booking is confirmed in seconds with voucher sent immediately.' },
]

/* ── All top transfer links ──────────────────────────────────────────────────── */
const TOP_TRANSFERS = [
  'Bangkok Airport → Bangkok City', 'Bangkok → Pattaya', 'Bangkok → Hua Hin',
  'Bangkok → Ayutthaya', 'Bangkok → Kanchanaburi', 'Bangkok → Rayong',
  'Pattaya → Bangkok', 'Pattaya → Bangkok Airport', 'Pattaya → Koh Chang',
  'Phuket Airport → Phuket Town', 'Phuket → Krabi', 'Phuket → Khao Lak',
  'Phuket → Koh Samui', 'Krabi → Phuket', 'Krabi Airport → Ao Nang',
  'Chiang Mai → Chiang Rai', 'Chiang Mai → Pai', 'Chiang Mai → Lampang',
  'Koh Samui → Surat Thani', 'Koh Samui Airport → Beach Hotels',
  'Hua Hin → Bangkok', 'Hua Hin → Pranburi', 'Koh Chang → Bangkok',
  'Ayutthaya → Bangkok', 'Ayutthaya → Lopburi',
]

/* ═══════════════════════════════════════════════════════════════════════════════ */

export default async function ThailandPage() {
  const tours = await getToursForDestination('Bangkok', 6)

  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-white">

        {/* ════════ HERO ════════ */}
        <div className="relative h-[70vh] min-h-[480px] max-h-[680px]">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80"
            alt="Thailand"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">Thailand</span>
            </nav>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Private Transfers &amp;<br className="hidden sm:block" /> Experiences in Thailand
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
              Travel at your own pace with a trusted local driver. Fixed prices, no surge, instant confirmation — across 50+ destinations.
            </p>

            {/* Quick CTA */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="bg-[#2534ff] hover:bg-[#1a27e0] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm shadow-lg"
              >
                Book a Transfer
              </Link>
              <Link
                href="/tours"
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm border border-white/30"
              >
                Explore Experiences
              </Link>
            </div>

            {/* Trust badge */}
            <div className="mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span className="text-white/90 text-xs font-medium">Excellent · Tripadvisor Travelers&#39; Choice 2026</span>
            </div>
          </div>
        </div>

        {/* ════════ STATS STRIP ════════ */}
        <div className="bg-[#2534ff] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { value: '50+',    label: 'Destinations' },
              { value: '5,000+', label: 'Happy travellers' },
              { value: '24/7',   label: 'Customer support' },
              { value: '100%',   label: 'Fixed pricing' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ POPULAR CITIES ════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Most Popular Destinations</h2>
              <p className="text-gray-500 text-sm mt-1">Choose your starting point across Thailand</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/destinations/${city.slug}`}
                className="group relative rounded-2xl overflow-hidden shrink-0 w-56 sm:w-64 h-44 shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-extrabold text-base sm:text-lg leading-tight">{city.name}</p>
                  <p className="text-white/70 text-[11px] mt-0.5">{city.transfers}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════ POPULAR ROUTES ════════ */}
        <section className="bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular Transfer Routes</h2>
                <p className="text-gray-500 text-sm mt-1">Fixed prices · Professional driver · Door to door</p>
              </div>
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline"
              >
                All routes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ROUTES.map(route => (
                <Link
                  key={`${route.from}-${route.to}`}
                  href={`/?pickup=${encodeURIComponent(route.from)}&dropoff=${encodeURIComponent(route.to)}`}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Route image */}
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={route.image}
                      alt={`${route.from} to ${route.to}`}
                      fill
                      sizes="400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 text-white text-sm font-bold">
                        <span>{route.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{route.to}</span>
                      </div>
                    </div>
                  </div>
                  {/* Route details */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.duration}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">From</p>
                      <p className="text-base font-extrabold text-[#2534ff]">฿{route.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ TRUST BENEFITS ════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">Why choose Werest?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#2534ff]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#2534ff]" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ POPULAR TOURS ════════ */}
        {tours.length > 0 && (
          <section className="bg-gray-50 py-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular Experiences in Thailand</h2>
                  <p className="text-gray-500 text-sm mt-1">Hand-picked tours — just show up and enjoy</p>
                </div>
                <Link
                  href="/tours"
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tours.map(tour => {
                  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson))
                  return (
                    <Link
                      key={tour.slug}
                      href={`/tours/${tour.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <div className="relative h-44 overflow-hidden">
                        {tour.images[0] && (
                          <Image
                            src={tour.images[0]}
                            alt={tour.title}
                            fill
                            sizes="400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {tour.badge && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                            {tour.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-[11px] text-gray-400 mb-1">
                          {tour.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · {tour.location.split(',')[0]}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-[#2534ff] transition-colors">
                          {tour.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tour.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-sm font-extrabold text-[#2534ff]">
                            {formatTHB(minPrice)}<span className="text-[10px] font-normal text-gray-400">/pp</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ════════ TOP TRANSFERS LINK LIST ════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">Top private transfers in Thailand</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-2.5">
            {TOP_TRANSFERS.map(route => (
              <Link
                key={route}
                href={`/?pickup=${encodeURIComponent(route.split(' → ')[0])}&dropoff=${encodeURIComponent(route.split(' → ')[1] ?? '')}`}
                className="text-[13px] text-[#2534ff] hover:underline flex items-start gap-1"
              >
                <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
                {route}
              </Link>
            ))}
          </div>
        </section>

        {/* ════════ CTA BANNER ════════ */}
        <section className="bg-[#2534ff] py-16">
          <div className="max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to explore Thailand?</h2>
            <p className="text-white/75 mb-8 text-base max-w-xl mx-auto">
              Book your private transfer or experience in seconds. Free cancellation, instant voucher, professional driver.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/"
                className="bg-white text-[#2534ff] font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-lg"
              >
                Book a Transfer <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tours"
                className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm"
              >
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
