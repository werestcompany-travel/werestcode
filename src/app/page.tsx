'use client';

import Script from 'next/script';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchTabs from '@/components/search/SearchTabs';
import {
  ShieldCheck, Star, Clock, MapPin, CheckCircle2, ChevronDown,
  Car, Plane, Users, CreditCard, Bell, ArrowRight, Quote,
  ArrowLeftRight, BookOpen,
} from 'lucide-react';

/* ─── Stats ─────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '50+',    label: 'Routes across Thailand' },
  { value: '10K+',  label: 'Happy travellers'        },
  { value: '4.9★',  label: 'Average rating'          },
  { value: '24 / 7', label: 'Customer support'       },
];

/* ─── Benefits ───────────────────────────────────────────────────────────── */
const BENEFITS = [
  { icon: <Plane      className="w-6 h-6" />, title: 'Real-time Flight Tracking',    desc: 'We monitor your flight and adjust pickup time automatically — no extra charge.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Verified Professional Drivers', desc: 'All drivers are background-checked, licensed, and trained to Thai standards.'    },
  { icon: <CreditCard  className="w-6 h-6" />, title: 'Fixed, Transparent Pricing',   desc: 'The price you see is the price you pay. No surge, no hidden fees, ever.'        },
  { icon: <Bell        className="w-6 h-6" />, title: 'Instant Confirmation',          desc: 'Get your booking confirmation and driver details immediately after booking.'      },
  { icon: <Users       className="w-6 h-6" />, title: 'Meet & Greet Service',          desc: 'Your driver meets you inside the terminal with a name sign — stress-free.'       },
  { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Free Cancellation',            desc: 'Cancel or reschedule for free up to 24 hours before your pickup time.'           },
];

/* ─── Gradient route cards ───────────────────────────────────────────────── */
const ROUTES = [
  { from: 'Suvarnabhumi (BKK)', to: 'Bangkok City',  fromPrice: '฿1,200', time: '45 min', gradient: 'from-brand-600 to-indigo-700',   emoji: '🏙️' },
  { from: 'Don Mueang (DMK)',   to: 'Bangkok City',  fromPrice: '฿1,200', time: '40 min', gradient: 'from-emerald-500 to-teal-700',   emoji: '✈️' },
  { from: 'Bangkok City',       to: 'Pattaya',        fromPrice: '฿1,800', time: '1h 45m', gradient: 'from-cyan-500 to-blue-700',     emoji: '🏖️' },
  { from: 'Bangkok City',       to: 'Hua Hin',        fromPrice: '฿1,800', time: '2h 30m', gradient: 'from-amber-500 to-orange-700',  emoji: '🌊' },
  { from: 'Phuket Airport',     to: 'Patong Beach',   fromPrice: '฿1,200', time: '45 min', gradient: 'from-pink-500 to-rose-700',     emoji: '🏝️' },
  { from: 'Chiang Mai City',    to: 'Chiang Rai',     fromPrice: '฿2,500', time: '3h 00m', gradient: 'from-green-600 to-emerald-800', emoji: '🌿' },
];

/* ─── Destination photo route cards ──────────────────────────────────────── */
const DEST_TABS = ['From Bangkok', 'From Phuket', 'From Chiang Mai', 'Beach Routes'] as const;
type DestTab = typeof DEST_TABS[number];

const DEST_ROUTES: Record<DestTab, Array<{
  fromCode: string; fromCity: string; toCode: string; toCity: string; price: string; image: string;
}>> = {
  'From Bangkok': [
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'PTY', toCity: 'Pattaya',    price: '฿1,800', image: 'photo-1544551763-77ef2d0cfc6c' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'HHN', toCity: 'Hua Hin',    price: '฿1,800', image: 'photo-1559592413-7cbb3aa3b08e' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'CNX', toCity: 'Chiang Mai', price: '฿5,500', image: 'photo-1558618666-fcd25c85cd64' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'KBI', toCity: 'Krabi',      price: '฿3,200', image: 'photo-1467003909585-2f8a72700288' },
  ],
  'From Phuket': [
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'PTG', toCity: 'Patong',   price: '฿800',   image: 'photo-1537956965359-7573183d1f57' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KLK', toCity: 'Khao Lak', price: '฿2,200', image: 'photo-1596895111956-bf1cf0599ce5' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KBI', toCity: 'Krabi',    price: '฿2,800', image: 'photo-1467003909585-2f8a72700288' },
    { fromCode: 'HKT', fromCity: 'Phuket', toCode: 'KSK', toCity: 'Khao Sok', price: '฿2,500', image: 'photo-1606041008023-472dfb5e530f' },
  ],
  'From Chiang Mai': [
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'CEI', toCity: 'Chiang Rai', price: '฿2,500', image: 'photo-1546567668-bf2e45fb7e87' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'PAI', toCity: 'Pai',         price: '฿2,200', image: 'photo-1606041008023-472dfb5e530f' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'SKH', toCity: 'Sukhothai',   price: '฿3,500', image: 'photo-1552465011-b4e21bf6e79a' },
    { fromCode: 'CNX', fromCity: 'Chiang Mai', toCode: 'LPG', toCity: 'Lampang',     price: '฿1,800', image: 'photo-1599576439791-3c9bdafb4d60' },
  ],
  'Beach Routes': [
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'KSM', toCity: 'Koh Samui', price: '฿3,500', image: 'photo-1589394815804-964ed0be2eb5' },
    { fromCode: 'KBI', fromCity: 'Krabi',   toCode: 'AON', toCity: 'Ao Nang',   price: '฿800',   image: 'photo-1535083783855-aaab7ebfd4f5' },
    { fromCode: 'HKT', fromCity: 'Phuket',  toCode: 'KRC', toCity: 'Karon',     price: '฿500',   image: 'photo-1537956965359-7573183d1f57' },
    { fromCode: 'BKK', fromCity: 'Bangkok', toCode: 'RYG', toCity: 'Rayong',    price: '฿2,000', image: 'photo-1488646953014-85cb44e25828' },
  ],
};

/* ─── Blog posts ─────────────────────────────────────────────────────────── */
const BLOG_POSTS = [
  {
    title:    'Top 5 Day Trips from Bangkok You Can Book Today',
    location: 'Bangkok',
    image:    'photo-1508009603885-50cf7c579365',
    accentFrom: 'from-brand-900',
    accentTo:   'to-indigo-700',
  },
  {
    title:    'How to Get from Suvarnabhumi Airport to Pattaya',
    location: 'Pattaya',
    image:    'photo-1544551763-77ef2d0cfc6c',
    accentFrom: 'from-teal-900',
    accentTo:   'to-teal-600',
  },
  {
    title:    'Chiang Mai to Chiang Rai: The Perfect Day Trip Route',
    location: 'Chiang Mai',
    image:    'photo-1552465011-b4e21bf6e79a',
    accentFrom: 'from-green-900',
    accentTo:   'to-emerald-600',
  },
  {
    title:    'Phuket vs Krabi: Which Beach Destination Is for You?',
    location: 'Phuket',
    image:    'photo-1537956965359-7573183d1f57',
    accentFrom: 'from-blue-900',
    accentTo:   'to-cyan-600',
  },
  {
    title:    '10 Tips for a Stress-Free Arrival at Bangkok Airport',
    location: 'All Thailand',
    image:    'photo-1469854523086-cc02fe5d8800',
    accentFrom: 'from-gray-900',
    accentTo:   'to-gray-600',
  },
];

/* ─── Reviews ────────────────────────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Sarah M.',  origin: 'United Kingdom', rating: 5, text: 'Absolutely flawless experience. The driver was waiting at the arrival hall with a name sign, helped with all our bags, and got us to the hotel on time. Will book again!' },
  { name: 'James K.',  origin: 'Australia',      rating: 5, text: "Our flight was delayed by 90 minutes and the driver waited without any fuss. The car was clean and air-conditioned. Easily the best transfer service we've used in Thailand." },
  { name: 'Yuki T.',   origin: 'Japan',           rating: 5, text: 'Smooth booking, exact pickup, friendly driver. The price was clearly displayed, no surprises. Perfect start to our Phuket holiday.' },
];

/* ─── FAQs ───────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'How will I find my driver at the airport?',     a: 'Your driver will be waiting in the arrivals hall holding a name sign with your name on it. You will receive full driver details (name, photo, phone, vehicle plate) 24 hours before pickup.' },
  { q: 'What happens if my flight is delayed?',         a: 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time at no extra cost. No need to call or message us.' },
  { q: 'Can I cancel or change my booking?',            a: 'Yes — free cancellation and rescheduling up to 24 hours before your scheduled pickup. Changes within 24 hours are subject to availability.' },
  { q: 'Is payment required at the time of booking?',  a: 'No payment is needed when you book. You pay the driver directly on the day of transfer in cash (Thai Baht) or via bank transfer.' },
  { q: 'What vehicle types are available?',             a: 'We offer Sedan (up to 3 passengers), SUV (up to 6 passengers), and Minivan (up to 10 passengers). All vehicles are air-conditioned and include complimentary water.' },
  { q: 'Do you cover routes outside Bangkok?',          a: 'Yes — we cover all major airports and cities across Thailand including Phuket, Chiang Mai, Koh Samui, Krabi, Pattaya, Hua Hin, and more.' },
];

/* ─── SEO routes ─────────────────────────────────────────────────────────── */
const SEO_ROUTES = [
  [
    'Bangkok Airport to Bangkok', 'Bangkok to Pattaya', 'Phuket Airport to Bang Tao',
    'Don Mueang Airport to Bangkok', 'Karon to Khao Lak', 'Phuket to Krabi',
    'Chiang Mai to Golden Triangle', 'Ao Nang to Phuket', 'Bangkok Airport to Don Mueang',
    'Sukhothai to Bangkok', 'Bangkok to Chiang Mai', 'Chiang Mai to White Temple',
    'Chiang Mai to Lampang', 'Bangkok to Chumphon', 'Hat Yai to Penang',
    'Bangkok to Lopburi', 'Bangkok to Surat Thani', 'Karon to Krabi',
    'Laem Chabang Port to Don Mueang', 'Pattaya to Kanchanaburi',
    'Krabi to Trang', 'Bangkok to Buriram', 'Bangkok to Krabi',
    'Bangkok to Phitsanulok', 'Hua Hin to Surat Thani',
  ],
  [
    'Chiang Mai to Chiang Rai', 'Chiang Mai to Pai', 'Phuket Airport to Kamala Beach',
    'Chiang Mai to Sukhothai', 'Bangkok to Ayutthaya', 'Khao Lak to Krabi',
    'Bangkok Airport to Hua Hin', 'Phuket Airport to Nai Thon',
    'Kanchanaburi to Ayutthaya', 'Phuket Airport to Panwa', 'Chiang Rai to Sukhothai',
    'Khao Sok to Krabi', 'Phitsanulok to Chiang Mai', 'Bangkok Airport to Ban Phe Pier',
    'Nakhon Ratchasima to Bangkok', 'Bangkok to Chanthaburi', 'Phuket to Railay',
    'Amphawa to Bangkok', 'Bangkok to Ratchaburi', 'Bangkok to Sai Yok',
    'Phuket to Surat Thani', 'Bangkok Airport to Lopburi',
    'Chiang Mai to Hua Hin', 'Chiang Rai to Pai', 'Bangkok to Nakhon Pathom',
  ],
  [
    'Bangkok Airport to Pattaya', 'Phuket Airport to Patong', 'Bangkok to Hua Hin',
    'Phuket Airport to Kata Beach', 'Phuket Airport to Khao Lak',
    'Phuket Airport to Phuket Town', 'Phuket Airport to Karon', 'Phuket to Khao Lak',
    'Bangkok to Khao Yai', 'Khao Sok to Phuket', 'Phuket Airport to Rawai',
    'Krabi to Surat Thani', 'Pattaya to Hua Hin', 'Don Mueang Airport to Ayutthaya',
    'Phuket Airport to Chalong', 'Nakhon Ratchasima to Bangkok Airport',
    'Don Mueang Airport to Khao Yai', 'Pattaya to Ayutthaya',
    'Laem Chabang to Bangkok Airport', 'Bangkok Airport to Rayong',
    'Pattaya to Lopburi', 'Phuket to Hua Hin', 'Bangkok Airport to Chanthaburi',
    'Laem Chabang to Bangkok', 'Don Mueang Airport to Pattaya',
  ],
  [
    'Laem Chabang Port to Bangkok', 'Chiang Mai Airport to Chiang Rai',
    'Karon to Railay', 'Bangkok to Kanchanaburi', 'Phuket Airport to Mai Khao',
    'Chiang Rai Airport to Chiang Saen', 'Laem Chabang Port to Bangkok Airport',
    'Bangkok Airport to Kanchanaburi', 'Ayutthaya to Sukhothai',
    'Don Mueang Airport to Kanchanaburi', 'Bangkok Airport to Ayutthaya',
    'Phuket to Don Sak', 'Bangkok to Laem Sok', 'Bangkok Airport to Khao Yai',
    'Bangkok to Nakhon Sawan', 'Bangkok Airport to Nakhon Sawan',
    'Bangkok Airport to Laem Sok', 'Bangkok to Don Sak', 'Bangkok to Rayong',
    'Bangkok to Damnoen Saduak', 'Bangkok Airport to Surin', 'Krabi to Hua Hin',
    'Bangkok to Surin', 'Bangkok to Koh Chang', 'Bangkok Airport to Nakhon Ratchasima',
  ],
];

/* ─── FAQ item ───────────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span className={`font-semibold text-sm sm:text-base transition-colors ${open ? 'text-brand-600' : 'text-gray-900 group-hover:text-brand-600'}`}>{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-brand-600' : ''}`} />
      </button>
      {open && (
        <p className="pb-5 text-sm text-gray-600 leading-relaxed -mt-1 animate-fade-in">{a}</p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeDestTab, setActiveDestTab] = useState<DestTab>('From Bangkok');

  return (
    <>
      {mapsKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      )}

      <Navbar transparent />

      {/* ════════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col justify-center overflow-hidden" style={{ minHeight: '92vh' }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85"
            alt="Private transfers in Thailand"
            fill priority
            className="object-cover object-center scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center gap-5 text-center">
          <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">
            Private Transfers &amp; Tours · Thailand
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl">
            Transfers and Day Trips<br className="hidden sm:block" /> in Thailand
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-lg">
            Explore Thailand with our private car transfers and curated day trips.
            Travel at your own pace with a trusted local driver by your side.
          </p>
          <div className="w-full max-w-3xl mt-2">
            <SearchTabs />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/75 text-xs font-medium mt-1">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Cancel for free 24 hours before departure</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />No payment required now</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Flight delay monitoring included</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 mt-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">Excellent</p>
              <p className="text-white/60 text-[10px] mt-0.5">4.9 · 2,000+ traveller reviews</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 72L1440 72L1440 20C1200 72 720 0 0 52L0 72Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. STATS BAR
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-100">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center px-6 py-2">
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. WHY CHOOSE WEREST
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Why Werest Travel</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Every journey, taken care of</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">We handle every detail so you can focus on what matters — enjoying your trip.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_24px_rgba(37,52,255,0.08)] transition-all duration-200 bg-white">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200">
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Simple Booking</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Book in under 2 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(16.66% + 24px)' }} />
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(49.99% + 24px)' }} />
            {[
              { n: '01', icon: <MapPin className="w-5 h-5" />,        title: 'Enter your route',     desc: 'Type your pickup and drop-off address, select date, time, and number of passengers.' },
              { n: '02', icon: <Car    className="w-5 h-5" />,        title: 'Choose your ride',     desc: 'Compare Sedan, SUV, and Minivan. Add extras like child seat or meet & greet.'        },
              { n: '03', icon: <CheckCircle2 className="w-5 h-5" />,  title: 'Instant confirmation', desc: 'Fill in your details and get confirmed immediately. No payment until your trip.'    },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,52,255,0.25)] z-10 relative"
                    style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-600 text-brand-700 text-[10px] font-black flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. POPULAR ROUTES (gradient cards)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Most Booked</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Popular routes</h2>
              <p className="text-gray-500 mt-2 text-sm">Fixed prices — no surge, no surprises</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROUTES.map((r) => (
              <div key={r.from + r.to} className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ minHeight: 200 }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} transition-all duration-300 group-hover:scale-[1.02]`} />
                <div className="absolute inset-0 opacity-[0.08]"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
                <div className="absolute top-3 right-4 text-6xl opacity-20 select-none group-hover:opacity-30 transition-opacity">{r.emoji}</div>
                <div className="relative z-10 p-6 flex flex-col justify-between h-full" style={{ minHeight: 200 }}>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
                      <Clock className="w-3 h-3" /> ~{r.time}
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                      <span className="truncate">{r.from.split(' (')[0]}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 opacity-70" />
                      <span className="truncate">{r.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <div>
                      <p className="text-white/60 text-[10px]">Starting from</p>
                      <p className="text-white font-extrabold text-xl">{r.fromPrice}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                      Book <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. BOOK BY DESTINATION (photo route cards — like flight cards)
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Book Your Transfer</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Popular destinations</h2>
            </div>
            <a href="/results" className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
              See all routes <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-none pb-1">
            {DEST_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveDestTab(tab)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                  activeDestTab === tab
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DEST_ROUTES[activeDestTab].map((route, i) => (
              <div key={i}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 cursor-pointer">

                {/* Photo */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <Image
                    src={`https://images.unsplash.com/${route.image}?auto=format&fit=crop&w=400&q=80`}
                    alt={route.toCity}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Vehicle type */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 bg-brand-50 rounded flex items-center justify-center">
                      <Car className="w-3 h-3 text-brand-600" />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Private Transfer</span>
                  </div>

                  {/* Route codes */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-extrabold text-gray-900">{route.fromCode}</span>
                    <ArrowLeftRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-lg font-extrabold text-gray-900">{route.toCode}</span>
                  </div>

                  {/* City names */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 flex-1">{route.fromCity}</span>
                    <span className="text-xs text-gray-400 shrink-0">→</span>
                    <span className="text-xs text-gray-500 flex-1 text-right">{route.toCity}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">One way</span>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block leading-none">Starting from</span>
                      <span className="text-base font-extrabold text-brand-600">{route.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7. TRUST / SAFETY SPLIT SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 420 }}>
              <Image
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80"
                alt="Safe road travel" fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-2xl font-extrabold text-gray-900">4.9 / 5</p>
                <div className="flex gap-0.5 my-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-gray-500">From 2,000+ verified reviews</p>
              </div>
            </div>
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">Your Safety First</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Every detail handled,<br />so you travel worry-free.
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                From the moment you land to your hotel door, we make sure everything goes smoothly.
                Our drivers, vehicles, and support team are always ready.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Plane className="w-5 h-5 text-brand-600" />,       title: 'Live flight monitoring',    desc: 'Your driver tracks your flight and adjusts in real time.' },
                  { icon: <ShieldCheck className="w-5 h-5 text-brand-600" />, title: 'Background-checked drivers', desc: 'Every driver is vetted, licensed, and rated by past customers.' },
                  { icon: <Car className="w-5 h-5 text-brand-600" />,         title: 'Modern, clean vehicles',     desc: 'Air-conditioned cars refreshed every trip — water included.' },
                  { icon: <Bell className="w-5 h-5 text-brand-600" />,        title: '24 / 7 customer support',    desc: 'Reach us by WhatsApp, phone, or email at any time.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. TESTIMONIALS
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">What Travellers Say</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Loved by travellers worldwide</h2>
            <div className="flex justify-center items-center gap-1 mt-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2 text-sm text-gray-600 font-medium">4.9 out of 5 — 2,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_24px_rgba(37,52,255,0.07)] transition-all duration-200">
                <Quote className="w-8 h-8 text-brand-200 mb-3" />
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.origin}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          9. TRAVEL BLOG
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest">Travel Guides</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Travel tips &amp; guides</h2>
            </div>
            <a href="/blog" className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
              See all <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Cards — horizontal scroll on mobile, 5-col grid on desktop */}
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {BLOG_POSTS.map((post, i) => (
              <div key={i}
                className="shrink-0 w-52 lg:w-auto group cursor-pointer">

                {/* Image with gradient overlay (title inside for first 4, plain for last) */}
                <div className="relative rounded-2xl overflow-hidden mb-3" style={{ height: 220 }}>
                  <Image
                    src={`https://images.unsplash.com/${post.image}?auto=format&fit=crop&w=400&q=80`}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 208px, 20vw"
                  />
                  {/* Dark gradient for text overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${post.accentFrom} ${post.accentTo} opacity-70`} />

                  {/* Title overlay (short version) */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <p className="text-white font-extrabold text-sm leading-snug line-clamp-3 drop-shadow-sm">
                      {post.title}
                    </p>
                  </div>
                </div>

                {/* Meta below card */}
                <p className="text-xs font-medium text-gray-700 leading-snug mb-1.5 line-clamp-2 group-hover:text-brand-600 transition-colors">
                  {post.title}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin className="w-3 h-3" /> {post.location}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          10. CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 60%, #0d1266 100%)' }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Ready to travel?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Book your transfer today</h2>
          <p className="text-white/65 mb-8 max-w-xl mx-auto">Fixed prices, no hidden fees, instant confirmation. Start with your route above or scroll up to search.</p>
          <a href="#top"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-7 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Search your route <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          11. FAQ
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Got Questions?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl px-6 shadow-sm">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          12. SEO ROUTE KEYWORD GRID
      ════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top private transfers in Thailand</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0">
            {SEO_ROUTES.map((col, ci) => (
              <ul key={ci} className="space-y-0">
                {col.map((route) => (
                  <li key={route}>
                    <a
                      href={`/?pickup_address=${encodeURIComponent(route.split(' to ')[0])}&dropoff_address=${encodeURIComponent(route.split(' to ')[1] ?? '')}`}
                      className="block text-sm text-brand-700 hover:text-brand-900 hover:underline py-1.5 leading-snug"
                    >
                      {route}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
