'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Star, Shield, Clock, Plane, AlertCircle, CheckCircle2,
  Users, Car, ChevronDown, ArrowRight, MapPin, ChevronRight,
  MessageCircle, Phone, Luggage,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrivateRideForm from '@/components/search/PrivateRideForm';

/* ── Guarantee badges ───────────────────────────────────────────────────── */
const GUARANTEES = [
  {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Driver running late? We\'ll compensate you!',
    desc: 'If your driver is more than 15 minutes late, we\'ll compensate you automatically.',
  },
  {
    icon: Shield,
    color: 'text-green-600',
    bg: 'bg-green-50',
    title: 'Free cancellation up to 24 hours',
    desc: 'Cancel for free up to 24 hours before your pickup time — no questions asked.',
  },
  {
    icon: Plane,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'Flight delayed? We\'ll wait for you!',
    desc: 'We monitor your flight in real time. Your driver adjusts automatically at no extra cost.',
  },
  {
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Compensation for no-show',
    desc: 'In the rare case a driver doesn\'t show, you\'ll receive a full refund plus compensation.',
  },
];

/* ── Vehicle types ──────────────────────────────────────────────────────── */
const VEHICLES = [
  {
    name: 'Standard Sedan',
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/14png/w=600,h=400,fit=contain',
    pax: 'Max 3 passengers',
    bags: 'Up to 3 bags',
    price: 'From ฿600',
    example: 'Toyota Camry or similar',
    href: '/results',
  },
  {
    name: 'SUV',
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/13png/w=600,h=400,fit=contain',
    pax: 'Max 4 passengers',
    bags: 'Up to 6 bags',
    price: 'From ฿800',
    example: 'Toyota Fortuner or similar',
    href: '/results',
  },
  {
    name: 'Minivan',
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/10-1png/w=600,h=400,fit=contain',
    pax: 'Max 10 passengers',
    bags: 'Up to 10 bags',
    price: 'From ฿1,200',
    example: 'Toyota HiAce or similar',
    href: '/results',
  },
  {
    name: 'Luxury MPV',
    image: 'https://eu2.contabostorage.com/fd5fb40e53894be8a861ffc261151838:cbs-webapi-test/c0f0b52e-1b54-4588-a98f-9a987bc6dd0b.png',
    pax: 'Max 6 passengers',
    bags: 'Up to 6 bags',
    price: 'From ฿1,800',
    example: 'Toyota Alphard or similar',
    href: '/results',
  },
];

/* ── Popular airport routes ─────────────────────────────────────────────── */
const ROUTES = [
  {
    from: 'Suvarnabhumi Airport', fromShort: 'BKK',
    to: 'Bangkok City', toShort: 'City',
    price: '฿1,200', time: '~45 min',
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    href: '/results?pickup_address=Suvarnabhumi+Airport&dropoff_address=Bangkok',
  },
  {
    from: 'Don Mueang Airport', fromShort: 'DMK',
    to: 'Bangkok City', toShort: 'City',
    price: '฿1,200', time: '~40 min',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    href: '/results?pickup_address=Don+Mueang+Airport&dropoff_address=Bangkok',
  },
  {
    from: 'Phuket Airport', fromShort: 'HKT',
    to: 'Patong Beach', toShort: 'Patong',
    price: '฿1,200', time: '~45 min',
    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80',
    href: '/results?pickup_address=Phuket+Airport&dropoff_address=Patong+Beach',
  },
  {
    from: 'Bangkok Airport', fromShort: 'BKK',
    to: 'Pattaya', toShort: 'Pattaya',
    price: '฿1,800', time: '~1h 45m',
    img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=600&q=80',
    href: '/results?pickup_address=Suvarnabhumi+Airport&dropoff_address=Pattaya',
  },
  {
    from: 'Chiang Mai Airport', fromShort: 'CNX',
    to: 'Chiang Mai City', toShort: 'CNX City',
    price: '฿400', time: '~15 min',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    href: '/results?pickup_address=Chiang+Mai+Airport&dropoff_address=Chiang+Mai',
  },
  {
    from: 'Krabi Airport', fromShort: 'KBV',
    to: 'Ao Nang Beach', toShort: 'Ao Nang',
    price: '฿800', time: '~30 min',
    img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
    href: '/results?pickup_address=Krabi+Airport&dropoff_address=Ao+Nang',
  },
];

/* ── Reviews ────────────────────────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Sarah M.',    flag: '🇬🇧', rating: 5, text: 'Driver was waiting with my name board right at arrivals. Spotless car, very professional. Will definitely book again for my next trip to Bangkok.', route: 'BKK Airport → Sukhumvit' },
  { name: 'Kiatisak P.', flag: '🇹🇭', rating: 5, text: 'บริการดีมากครับ คนขับสุภาพ รถสะอาด ราคาตรงตามที่แจ้ง ไม่มีค่าใช้จ่ายเพิ่มเติม แนะนำเลย', route: 'Phuket Airport → Kata Beach' },
  { name: 'James L.',    flag: '🇦🇺', rating: 5, text: 'Flight was delayed 2 hours and the driver still waited. No extra charge. That\'s the kind of service that builds loyalty. Highly recommend Werest.', route: 'DMK Airport → Bangkok City' },
  { name: 'Chen W.',     flag: '🇨🇳', rating: 5, text: '非常好的服务！司机准时到达，车辆干净舒适，价格公道。下次来泰国还会继续使用。', route: 'CNX Airport → Chiang Mai' },
  { name: 'Maria R.',    flag: '🇩🇪', rating: 5, text: 'Punctual, clean, friendly driver who spoke good English. The fixed price was a huge relief after reading about taxi scams. Booking was easy.', route: 'BKK Airport → Pattaya' },
];

/* ── FAQ ────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'How will I find my driver at the airport?', a: 'Your driver will be waiting in the arrivals hall holding a name board with your name. You\'ll receive the driver\'s name, photo, and vehicle plate number 24 hours before your pickup.' },
  { q: 'What if my flight is delayed?', a: 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time — at no extra cost. No need to call or update us.' },
  { q: 'Do I need to pay when I book?', a: 'No upfront payment is required to confirm your booking. You pay the driver directly on the day, in cash (Thai Baht) or by bank transfer.' },
  { q: 'Can I cancel or change my booking?', a: 'Yes — free cancellation up to 24 hours before your scheduled pickup. Changes to date, time, or route can be made at no charge with sufficient notice.' },
  { q: 'Is the price really fixed?', a: 'Absolutely. The price you see at checkout is the final price — no meters, no hidden tolls, no airport surcharges. What you see is what you pay.' },
  { q: 'Can I book a child seat?', a: 'Yes, please mention your child seat requirement in the special notes field when booking. We\'ll arrange it at no extra cost, subject to availability.' },
  { q: 'How far in advance should I book?', a: 'We recommend booking at least 48 hours in advance to guarantee availability, especially during peak season. Last-minute bookings may be possible — contact us via WhatsApp.' },
  { q: 'What is included in the price?', a: 'The price includes the driver, vehicle, fuel, tolls, parking at the airport, and complimentary waiting time (60 min for international flights, 30 min for domestic).' },
];

/* ── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  { num: '1', title: 'Enter your route', desc: 'Type your airport pickup and destination. Works for hotels, addresses, and attractions.' },
  { num: '2', title: 'Choose your vehicle', desc: 'Select Sedan, SUV, Minivan or Luxury MPV based on your group size and luggage.' },
  { num: '3', title: 'Confirm your booking', desc: 'No payment now. Instant confirmation sent to your email with all driver details.' },
  { num: '4', title: 'Meet your driver', desc: 'Your driver waits at arrivals with your name sign. Flight delayed? We track it automatically.' },
];

/* ── FAQ Item component ─────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function AirportTransfersClient() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ════════ HERO ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#05091a]" style={{ minHeight: 560 }}>
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
              alt="Airport transfer"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,9,26,0.75) 0%, rgba(5,9,26,0.88) 60%, rgba(5,9,26,0.97) 100%)' }} />
          </div>

          {/* Top trust strip */}
          <div className="absolute top-0 left-0 right-0 bg-[#2534ff] z-10 py-2">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4 lg:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden text-xs font-semibold text-white/90">
                {['✓ Fixed price', '✓ Verified drivers', '✓ Flight tracking', '✓ Free cancellation 24h'].map(s => (
                  <span key={s} className="whitespace-nowrap">{s}</span>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/80 shrink-0 ml-4">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">4.9</span>
                <span className="whitespace-nowrap">· 10,000+ transfers</span>
              </div>
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Available 24/7 across Thailand</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3">
                Airport Transfers
              </h1>
              <p className="text-white/65 text-base sm:text-lg max-w-xl">
                Fixed-price private transfers from every major airport in Thailand. Meet & greet service, flight tracking, no hidden fees.
              </p>
            </div>

            {/* Search box — no tab wrapper, just the form */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl">
              <div className="px-5 pt-5 pb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Book your airport transfer</p>
              </div>
              <PrivateRideForm />
            </div>
          </div>
        </section>

        {/* ════════ GUARANTEES ══════════════════════════════════════════════ */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GUARANTEES.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-snug mb-1">{title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ VEHICLE OPTIONS ═════════════════════════════════════════ */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Our fleet</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Choose your vehicle</h2>
              <p className="text-gray-500 text-sm mt-2">All vehicles are air-conditioned with complimentary water</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VEHICLES.map(v => (
                <div key={v.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group">
                  {/* Vehicle image */}
                  <div className="relative h-[160px] bg-gray-50 flex items-center justify-center px-4 py-4">
                    <Image
                      src={v.image}
                      alt={v.name}
                      width={280}
                      height={160}
                      className="object-contain w-full h-full drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 border-t border-gray-50">
                    <h3 className="font-extrabold text-gray-900 text-base mb-2">{v.name}</h3>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                        {v.pax}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Luggage className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                        {v.bags}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-3">{v.example}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
                        <p className="text-lg font-extrabold text-gray-900">{v.price}</p>
                      </div>
                      <Link
                        href={v.href}
                        className="bg-[#2534ff] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1825cc] transition-colors"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ POPULAR ROUTES ══════════════════════════════════════════ */}
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Routes</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Popular airport transfers</h2>
              </div>
              <Link href="/results" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:opacity-80">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Destination chips */}
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 mb-6">
              {['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin'].map(city => (
                <Link
                  key={city}
                  href={`/results?dropoff_address=${city}`}
                  className="shrink-0 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors whitespace-nowrap"
                >
                  {city}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROUTES.map(r => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="relative h-[140px] overflow-hidden bg-gray-100">
                    <Image
                      src={r.img}
                      alt={`${r.from} to ${r.to}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2.5 left-3">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span>{r.fromShort}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                        <span>{r.toShort}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                          <span className="truncate">{r.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 shrink-0 text-[#2534ff]" />
                          <span className="truncate">{r.to}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-extrabold text-gray-900">{r.price}</p>
                        <p className="text-xs text-gray-400">{r.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
                      <span className="text-xs text-gray-400">from / sedan</span>
                      <span className="text-xs font-semibold text-[#2534ff] flex items-center gap-1">
                        Book now <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="sm:hidden mt-6 text-center">
              <Link href="/results" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2534ff]">
                See all routes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════════════════════════════════════════ */}
        <section className="py-14 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Simple process</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Book in under 2 minutes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ num, title, desc }, idx) => (
                <div key={num} className="relative flex gap-4 lg:flex-col lg:gap-0">
                  <div className="flex items-center gap-3 lg:mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2534ff] text-white text-base font-black flex items-center justify-center shrink-0">
                      {num}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="hidden lg:block flex-1 h-px bg-gray-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 lg:mt-0">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ REVIEWS ═════════════════════════════════════════════════ */}
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">Reviews</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What our customers say</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-extrabold text-gray-900">5.0</span>
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
              {REVIEWS.map(r => (
                <div key={r.name} className="shrink-0 w-[80vw] max-w-[300px] sm:w-auto sm:max-w-none bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2534ff]/10 flex items-center justify-center text-base">
                        {r.flag}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{r.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 text-right">{r.route}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ FAQ ═════════════════════════════════════════════════════ */}
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-2">FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Frequently asked questions</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map(faq => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA ═════════════════════════════════════════════════════ */}
        <section className="py-16 bg-[#2534ff] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to book your airport transfer?</h2>
            <p className="text-white/70 mb-8 text-sm">Fixed price · No surprises · Instant confirmation</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/results"
                className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                <Car className="w-4 h-4" />
                Book a transfer
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp us
              </a>
              <a
                href="tel:+66621871392"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call us
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
