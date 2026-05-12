import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import {
  Shield, Clock, Star, CheckCircle2, Car, Users, Plane,
  MapPin, ArrowRight, ChevronRight, Phone, MessageCircle,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TransferSearchBox from '@/components/transfers/TransferSearchBox'

export const metadata: Metadata = {
  title: 'Private Airport Transfers in Thailand — Fixed Price, No Surprises | Werest',
  description:
    'Book fixed-price private airport transfers across Thailand. Verified professional drivers, meet & greet at arrivals, free flight tracking, and free cancellation. Bangkok, Phuket, Pattaya, Chiang Mai & more.',
  alternates: { canonical: 'https://www.werest.com/transfers' },
  keywords: [
    'private airport transfer Thailand',
    'Bangkok airport taxi fixed price',
    'Phuket airport transfer',
    'Thailand private car hire',
    'airport pickup Thailand',
    'hourly car hire Bangkok',
  ],
  openGraph: {
    type: 'website',
    title: 'Private Airport Transfers in Thailand — Fixed Price | Werest',
    description: 'Fixed-price private transfers with verified drivers. Instant confirmation, free cancellation, 24/7 support.',
    url: 'https://www.werest.com/transfers',
  },
}

const FEATURES = [
  { icon: Shield,       title: 'Fixed price — no surprises',  desc: 'Your price is locked at booking. No meters, no surge, no hidden fees at the airport.' },
  { icon: Plane,        title: 'Flight tracking included',    desc: 'We monitor your flight in real time. Delays don\'t cost you extra — your driver adjusts automatically.' },
  { icon: CheckCircle2, title: 'Instant confirmation',        desc: 'Booking confirmed in seconds. Driver details sent 24 hours before pickup.' },
  { icon: Clock,        title: 'Free cancellation',           desc: 'Plans change. Cancel or reschedule free of charge up to 24 hours before pickup.' },
  { icon: Users,        title: 'Verified professional drivers', desc: 'Every driver is vetted, licensed, and rated. English-speaking available on all routes.' },
  { icon: Car,          title: 'All vehicle types',           desc: 'Sedan, SUV, or Minivan — pick the right size for your group and luggage.' },
]

const POPULAR_ROUTES = [
  {
    from: 'Suvarnabhumi Airport', fromCode: 'BKK',
    to: 'Bangkok City Centre', toCode: 'BKK',
    price: '฿1,200', duration: '45 min',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Suvarnabhumi+Airport&dropoff_address=Bangkok+City+Centre',
  },
  {
    from: 'Don Mueang Airport', fromCode: 'DMK',
    to: 'Bangkok City Centre', toCode: 'BKK',
    price: '฿1,200', duration: '40 min',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Don+Mueang+Airport&dropoff_address=Bangkok+City+Centre',
  },
  {
    from: 'Phuket Airport', fromCode: 'HKT',
    to: 'Patong Beach', toCode: 'PKT',
    price: '฿1,200', duration: '45 min',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Phuket+Airport&dropoff_address=Patong+Beach',
  },
  {
    from: 'Bangkok City', fromCode: 'BKK',
    to: 'Pattaya', toCode: 'PTV',
    price: '฿1,800', duration: '1h 45m',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828a2bb?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Bangkok+City+Centre&dropoff_address=Pattaya',
  },
  {
    from: 'Chiang Mai Airport', fromCode: 'CNX',
    to: 'Chiang Rai', toCode: 'CEI',
    price: '฿2,500', duration: '3h 00m',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Chiang+Mai+Airport&dropoff_address=Chiang+Rai',
  },
  {
    from: 'Krabi Airport', fromCode: 'KBV',
    to: 'Ao Nang', toCode: 'KBI',
    price: '฿800', duration: '30 min',
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&h=400&fit=crop',
    href: '/results?pickup_address=Krabi+Airport&dropoff_address=Ao+Nang',
  },
]

const FLEET = [
  {
    type: 'Sedan',
    pax: 'Up to 3 passengers',
    bags: 'Up to 3 bags',
    example: 'Toyota Camry, Honda Accord',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
  },
  {
    type: 'SUV',
    pax: 'Up to 6 passengers',
    bags: 'Up to 6 bags',
    example: 'Toyota Fortuner, Ford Everest',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop',
  },
  {
    type: 'Minivan',
    pax: 'Up to 10 passengers',
    bags: 'Up to 10 bags',
    example: 'Toyota HiAce, Hyundai H1',
    image: 'https://images.unsplash.com/photo-1624438532989-e13d61daff39?w=600&h=400&fit=crop',
  },
]

const STEPS = [
  { num: '1', title: 'Enter your route',     desc: 'Type your pickup and drop-off. Works for airports, hotels, addresses, attractions.' },
  { num: '2', title: 'Choose your vehicle',  desc: 'Select Sedan, SUV, or Minivan based on your group size and luggage.' },
  { num: '3', title: 'Confirm your booking', desc: 'No payment now — pay the driver on the day. Instant confirmation by email and SMS.' },
  { num: '4', title: 'Meet your driver',     desc: 'Your driver waits in arrivals with a name sign. Flight delays? We track your flight automatically.' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Private Airport Transfer — Thailand',
  provider: { '@type': 'Organization', name: 'Werest Travel', url: 'https://www.werest.com' },
  description: 'Fixed-price private airport transfers in Thailand. Verified drivers, instant confirmation, free cancellation.',
  areaServed: { '@type': 'Country', name: 'Thailand' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'THB',
    description: 'Fixed-price private transfers starting from ฿800',
  },
}

export default function TransfersPage() {
  return (
    <>
      <Script id="transfers-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-[#0a0e2e] text-white overflow-hidden min-h-[600px] flex items-center">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&h=900&fit=crop"
              alt="Bangkok cityscape at night"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e2e]/60 via-[#0a0e2e]/70 to-[#0a0e2e]/90" />
          </div>

          {/* Trust strip */}
          <div className="absolute top-0 left-0 right-0 bg-[#2534ff]/90 backdrop-blur-sm border-b border-white/10 z-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs font-medium text-white/90">
                {['✓ Fixed prices', '✓ Verified drivers', '✓ Flight tracking', '✓ Free cancellation'].map(s => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span className="font-bold text-white">4.9</span>
                <span>· 10,000+ transfers</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="max-w-2xl mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Available 24/7 across Thailand</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                Private Transfers<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c85ff] to-[#4ade80]">
                  Fixed Price
                </span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                No meters. No surge pricing. No waiting. Book a private car with a professional driver and know exactly what you&apos;ll pay before you arrive.
              </p>
            </div>

            {/* Search box — Transfer + Hourly tabs */}
            <TransferSearchBox />
          </div>
        </section>

        {/* ── Why choose us ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Why Werest</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                The smarter way to travel Thailand
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#2534ff]/5 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#2534ff]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Simple process</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Book in under 2 minutes</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2534ff] text-white text-sm font-black flex items-center justify-center shrink-0">
                      {num}
                    </div>
                    {num !== '4' && (
                      <div className="hidden lg:block flex-1 h-px bg-gray-200" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular routes ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Routes</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Popular transfers</h2>
              </div>
              <Link href="/results" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#2534ff] hover:opacity-80">
                See all routes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {POPULAR_ROUTES.map(route => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                      src={route.image}
                      alt={`${route.from} to ${route.to}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center gap-1.5 text-sm font-bold">
                        <span>{route.fromCode}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                        <span>{route.toCode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{route.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 shrink-0 text-[#2534ff]" />
                          <span className="truncate">{route.to}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-gray-900">{route.price}</p>
                        <p className="text-xs text-gray-400">{route.duration}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">from / sedan</span>
                      <span className="text-xs font-semibold text-[#2534ff] flex items-center gap-1">
                        Book now <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fleet ──────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Our vehicles</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Choose your ride</h2>
              <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto">
                All vehicles are air-conditioned, clean, and include complimentary water. Select what fits your group and luggage.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {FLEET.map(car => (
                <div key={car.type} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <Image
                      src={car.image}
                      alt={car.type}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-3">{car.type}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-[#2534ff] shrink-0" />
                        {car.pax}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#2534ff] shrink-0" />
                        {car.bags}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{car.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-4">
              {[
                { q: 'How will I find my driver at the airport?',
                  a: 'Your driver will be waiting in the arrivals hall holding a name board with your name. You\'ll receive the driver\'s name, photo, and vehicle plate 24 hours before pickup.' },
                { q: 'What if my flight is delayed?',
                  a: 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time at no extra cost.' },
                { q: 'Can I book for a group of 8?',
                  a: 'Yes — select Minivan (up to 10 passengers) when booking. If your group is larger, contact us to arrange multiple vehicles.' },
                { q: 'Do I need to pay when I book?',
                  a: 'No payment upfront. You pay the driver directly on the day, in cash (Thai Baht) or bank transfer.' },
                { q: 'What is hourly hire?',
                  a: 'Hourly hire means your driver stays with you for the full duration — ideal for city tours, shopping, or multi-stop days. You can book 4, 6, 8, or 10 hours.' },
                { q: 'Is the price really fixed?',
                  a: 'Yes. The price you see at checkout is the final price — no meters, no hidden tolls, no airport surcharges.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-gray-100 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900 text-sm">{q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg leading-none">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                    <p className="pt-3">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA strip ──────────────────────────────────────────────────────── */}
        <section className="bg-[#2534ff] py-16 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold mb-3">Ready to book your transfer?</h2>
            <p className="text-white/70 mb-8">Fixed price. No surprises. Instant confirmation.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/results"
                className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-base"
              >
                <Car className="w-5 h-5" />
                Book a transfer
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp us
              </a>
              <a
                href="tel:+66621871392"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                <Phone className="w-5 h-5" />
                Call us
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
