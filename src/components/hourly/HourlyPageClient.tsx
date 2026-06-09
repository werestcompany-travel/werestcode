'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HourlySearchWidget, { HourlyTab } from '@/components/search/HourlySearchWidget';
import {
  CheckCircle2, MapPin, Navigation, Clock, Users, Star,
  ChevronRight, ArrowRight, Plane, Car, Anchor, Calendar,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════════════
   HOURLY CONTENT DATA
═══════════════════════════════════════════════════════════════════════════ */
const HOURLY_BENEFITS = [
  { emoji: '🗺️', title: 'Ideal for multiple stops',        desc: 'Move between meetings, sightseeing spots, markets, or events—all on your own schedule.' },
  { emoji: '🚗', title: 'No route planning required',       desc: 'You decide where to go and when to stop. Your driver adapts in real time—no need to book separate rides.' },
  { emoji: '⏰', title: 'Full freedom, full flexibility',   desc: 'Keep the car and driver for 4–10 hours. Add stops, change routes, and adjust your trip as you go.' },
];

const HOURLY_HOW = [
  { step: '1', title: 'Choose your city and hours',       desc: 'Select a starting point and the number of hours you need. Decide the rest as you go.',        img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80' },
  { step: '2', title: 'Get matched with a local driver',  desc: 'We assign a vetted, English-speaking professional driver who knows the local area.',           img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
  { step: '3', title: 'Keep your hands free',             desc: 'Leave your shopping bags, luggage, or extra gear safely in the car and move lightly.',         img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80' },
  { step: '4', title: 'Travel between your stops smoothly', desc: 'Your driver stays with you the entire time, waits between stops, and adapts to changes.',   img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
];

const HOURLY_DURATIONS = [
  { hours: 4, label: 'Half day',  popular: false },
  { hours: 6, label: 'City tour', popular: true  },
  { hours: 8, label: 'Full day',  popular: false },
  { hours: 10, label: 'Extended', popular: false },
];

const HOURLY_FAQS = [
  { q: 'What does hourly driver hire include?',  a: 'You get a private vehicle with a professional English-speaking driver for your chosen duration (4–10 hours). The driver stays with you the entire time, waits at each stop, and adapts the route as needed. Fuel, tolls, and parking are not included unless noted.' },
  { q: 'Can I add stops during my trip?',        a: 'Absolutely. One of the biggest advantages of hourly hire is flexibility—you can add, remove, or change stops freely throughout your booking without rebooking or paying extra per stop.' },
  { q: 'How many passengers can travel?',        a: 'Our standard hourly vehicles accommodate up to 3 passengers (sedan) or up to 6 passengers (van/minivan). Select your passenger count when searching.' },
  { q: 'Can I book for a half day?',             a: 'Yes. Our minimum hourly booking is 4 hours, which covers a solid half-day of exploring. We also offer 6, 8, and 10-hour options.' },
];

/* ════════════════════════════════════════════════════════════════════════════
   TRANSFERS CONTENT DATA
═══════════════════════════════════════════════════════════════════════════ */
const TRANSFER_TYPES = [
  { Icon: Plane,  emoji: '✈️', title: 'Airport transfers',    desc: 'Direct rides to and from any airport in Thailand. Meet & greet, flight tracking included.',   href: '/airport-transfers' },
  { Icon: Car,    emoji: '🚗', title: 'City-to-city transfers', desc: 'Private intercity rides tailored to your plans. Add sightseeing stops along the way.',      href: '/transfers'          },
  { Icon: Anchor, emoji: '🚢', title: 'Port transfers',        desc: 'Start and end your cruise with a private ride to Laem Chabang or other Thai cruise ports.',   href: '#'                   },
];

const TRANSFER_HOW = [
  { step: '1', title: 'Book your ride',      desc: 'Choose your pickup and drop-off locations, select your vehicle, add stops, and book in minutes.',                        img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80' },
  { step: '2', title: 'Meet your driver',    desc: 'Your English-speaking driver will meet you at your pickup point with a name board and help you with luggage.',          img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
  { step: '3', title: 'Enjoy the ride',      desc: 'Relax in a comfortable, air-conditioned private vehicle. Request stops anytime for sightseeing, breaks, or photos.',   img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
];

const POPULAR_ROUTES = [
  { from: 'Suvarnabhumi Airport', to: 'Bangkok',      time: '45 min' },
  { from: 'Bangkok',              to: 'Pattaya',      time: '1.5 hrs' },
  { from: 'Phuket Airport',       to: 'Patong Beach', time: '45 min' },
  { from: 'Bangkok',              to: 'Hua Hin',      time: '3 hrs' },
  { from: 'Don Mueang Airport',   to: 'Bangkok',      time: '40 min' },
  { from: 'Phuket',               to: 'Krabi',        time: '2.5 hrs' },
  { from: 'Chiang Mai',           to: 'Chiang Rai',   time: '3 hrs' },
  { from: 'Bangkok',              to: 'Chiang Mai',   time: '9 hrs' },
];

const TRANSFER_BENEFITS = [
  { emoji: '🛋️', title: 'Door-to-door comfort',        desc: 'Your driver picks you up exactly where you are and drops you at your destination—no terminals, no hassle.' },
  { emoji: '🗺️', title: 'Add sightseeing stops',       desc: 'Unlike shuttle buses, our private transfers let you stop at temples, viewpoints, or markets along the way.' },
  { emoji: '💬', title: 'English-speaking drivers',    desc: 'All our drivers speak English and know the local area. Ask for restaurant tips, local knowledge, anything.' },
];

/* ════════════════════════════════════════════════════════════════════════════
   SEO LINK LISTS
═══════════════════════════════════════════════════════════════════════════ */
const POPULAR_TRANSFERS_LIST = [
  'Bangkok Airport to Bangkok City',         'Don Mueang Airport to Bangkok',
  'Phuket Airport to Patong Beach',          'Phuket Airport to Kata Beach',
  'Bangkok to Pattaya',                       'Bangkok to Hua Hin',
  'Phuket Airport to Khao Lak',              'Phuket Airport to Karon Beach',
  'Phuket Airport to Phuket Town',           'Bangkok Airport to Pattaya',
  'Chiang Mai Airport to Chiang Rai',        'Bangkok to Chiang Mai',
  'Phuket to Krabi',                          'Bangkok to Ayutthaya',
  'Bangkok to Kanchanaburi',                  'Laem Chabang Port to Bangkok',
  'Bangkok Airport to Hua Hin',              'Phuket Airport to Bang Tao',
  'Krabi Airport to Ao Nang',                'Bangkok to Khao Yai',
  'Phuket Airport to Rawai',                  'Chiang Mai to Pai',
  'Bangkok Airport to Rayong',               'Surat Thani Airport to Khao Sok',
  'Phuket Airport to Chalong',               'Don Mueang Airport to Ayutthaya',
  'Bangkok to Surat Thani',                   'Krabi to Phuket',
  'Hat Yai to Penang',                        'Bangkok Airport to Kanchanaburi',
  'Phuket Airport to Nai Thon',              'Bangkok Airport to Don Mueang',
  'Chiang Rai Airport to Chiang Saen',       'Ao Nang to Phuket Airport',
  'Pattaya to Bangkok Airport',              'Hua Hin to Bangkok Airport',
  'Phuket Airport to Kamala Beach',          'Khao Lak to Phuket Airport',
  'Bangkok to Koh Chang',                     'Phuket Airport to Mai Khao',
  'Bangkok to Damnoen Saduak',               'Chiang Mai to Chiang Saen',
  'Bangkok Airport to Ayutthaya',            'Phuket Airport to Panwa',
  'Bangkok to Lopburi',                       'Rayong to Bangkok Airport',
  'Sukhothai to Chiang Mai',                  'Bangkok to Amphawa',
  'Surat Thani to Khao Sok',                 'Bangkok to Nakhon Pathom',
  'Phuket to Khao Lak',                       'Chiang Mai to Lampang',
  'Bangkok to Phitsanulok',                   'Don Sak to Surat Thani',
  'Chumphon to Surat Thani',                  'Bangkok Airport to Surin',
  'Bangkok to Golden Triangle',              'Phuket to Ao Nang',
  'Bangkok Airport to Nakhon Ratchasima',   'Pattaya to Laem Chabang Port',
];

const POPULAR_HOURLY_LIST = [
  'Hourly driver in Bangkok · 6 hours',       'Hourly driver in Phuket · 6 hours',
  'Hourly driver in Chiang Mai · 6 hours',    'Hourly driver in Pattaya · 4 hours',
  'Hourly driver in Krabi · 4 hours',          'Hourly driver in Hua Hin · 4 hours',
  'Bangkok city tour · 8 hours',               'Phuket island tour · 8 hours',
  'Chiang Mai temples tour · 6 hours',         'Bangkok shopping tour · 4 hours',
  'Phuket beach hopping · 8 hours',            'Chiang Mai day trip · 8 hours',
  'Bangkok markets & temples · 6 hours',      'Pattaya city tour · 4 hours',
  'Krabi island hopping · 6 hours',            'Hua Hin beach tour · 4 hours',
  'Bangkok Floating Market · 6 hours',         'Phuket sunset tour · 4 hours',
  'Chiang Mai Night Bazaar · 4 hours',         'Bangkok Grand Palace · 4 hours',
  'Phuket Old Town tour · 4 hours',            'Bangkok Chinatown · 4 hours',
  'Chiang Mai Doi Suthep · 6 hours',           'Pattaya Nong Nooch · 6 hours',
  'Bangkok Ratchada Night Market · 4 hours',  'Phuket Phang Nga Bay · 8 hours',
  'Chiang Mai Elephant Sanctuary · 8 hours',  'Bangkok Chatuchak Market · 4 hours',
  'Hua Hin wineries & vineyards · 6 hours',   'Krabi Four Islands · 6 hours',
  'Bangkok Ayutthaya day trip · 8 hours',      'Phuket viewpoints tour · 4 hours',
  'Chiang Mai cooking & crafts · 6 hours',     'Bangkok art galleries · 4 hours',
  'Pattaya floating market · 4 hours',         'Chiang Rai White Temple · 8 hours',
  'Bangkok canal tour · 4 hours',              'Phuket Cape Promthep · 4 hours',
  'Hua Hin Sam Roi Yot · 6 hours',             'Bangkok Jim Thompson House · 4 hours',
  'Chiang Mai hill tribes · 8 hours',          'Phuket Big Buddha · 4 hours',
  'Bangkok wine & dine · 4 hours',             'Krabi Railay Beach · 6 hours',
  'Pattaya Coral Island · 6 hours',            'Chiang Mai Night Safari · 4 hours',
  'Bangkok Khaosan Road · 4 hours',            'Phuket Kata Viewpoint · 4 hours',
  'Chiang Mai street food tour · 4 hours',     'Bangkok Lumpini Park · 4 hours',
  'Hua Hin Cicada Market · 4 hours',           'Bangkok Damnoen Saduak · 6 hours',
  'Phuket Promthep Cave · 4 hours',            'Chiang Mai Sunday Market · 4 hours',
  'Bangkok Thonburi canals · 6 hours',         'Pattaya viewpoint & temples · 4 hours',
  'Krabi Tiger Cave Temple · 4 hours',         'Bangkok hidden gems tour · 6 hours',
];

const TRANSFER_FAQS = [
  { q: 'What is included in a private transfer?',     a: 'All private transfers include a dedicated vehicle, an English-speaking driver, meet & greet service, and door-to-door pickup and drop-off. Tolls and parking fees may be added at checkout depending on the route.' },
  { q: 'Can I add stops on the way?',                 a: 'Yes! Unlike taxis or shuttles, you can request sightseeing stops, meal breaks, or detours when booking. Just add them to your itinerary or ask your driver on the day.' },
  { q: 'How far in advance should I book?',           a: 'We recommend booking at least 24 hours in advance to guarantee your preferred vehicle type. For airport transfers, booking as early as possible is advised, especially during peak travel season.' },
  { q: 'Is the price per person or per vehicle?',     a: 'All prices are per vehicle, not per person—so the more people in your group, the better value you get. Prices are fixed with no hidden fees or surge pricing.' },
];

/* ════════════════════════════════════════════════════════════════════════════
   SHARED CONTENT DATA
═══════════════════════════════════════════════════════════════════════════ */
const CITIES = [
  { name: 'Bangkok',    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=75' },
  { name: 'Phuket',     img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=75' },
  { name: 'Chiang Mai', img: 'https://images.unsplash.com/photo-1512923927402-a9867a68ca3a?w=400&q=75' },
  { name: 'Pattaya',    img: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&q=75' },
  { name: 'Krabi',      img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=75' },
  { name: 'Hua Hin',    img: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&q=75' },
];

const TRUST_ITEMS = [
  { Icon: CheckCircle2, label: 'Free cancellation up to 24 hours before' },
  { Icon: Users,        label: 'English-speaking professional drivers'    },
  { Icon: Star,         label: '4.9 ★ average rating across 3,000+ rides' },
  { Icon: Navigation,   label: 'All destinations in Thailand covered'     },
];

/* ════════════════════════════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-200 rounded-2xl overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
        {q}
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{a}</div>
    </details>
  );
}

function HowItWorksCard({ step, title, desc, img }: { step: string; title: string; desc: string; img: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 overflow-hidden">
        <Image src={img} alt={title} fill className="object-cover" />
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#2534ff] flex items-center justify-center">
          <span className="text-white text-sm font-bold">{step}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   HERO CONFIG per tab
═══════════════════════════════════════════════════════════════════════════ */
const HERO_CONFIG = {
  hourly: {
    title:   'Private hourly rides with a professional driver.',
    subtitle:'Book an English-speaking driver for 4–10 hours. Add stops as you go, and get around Thailand with one booking.',
    img:     'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80',
    imgAlt:  'Private hourly driver service in Thailand',
  },
  transfers: {
    title:   'Private, city-to-city rides with sightseeing stops.',
    subtitle:'Travel in comfort with professional drivers. Fully tailored to your plans — airport pickups, intercity rides, and more.',
    img:     '/images/hero-transfers.png',
    imgAlt:  'Bangkok private transfer service in Thailand',
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function HourlyPageClient({ defaultTab = 'hourly' }: { defaultTab?: HourlyTab }) {
  const [activeTab, setActiveTab] = useState<HourlyTab>(defaultTab);

  const hero = HERO_CONFIG[activeTab];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar transparent />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative -mt-16 min-h-[610px] lg:min-h-[650px] flex flex-col overflow-hidden">
        <Image
          src={hero.img}
          alt={hero.imgAlt}
          fill
          className="object-cover object-center transition-opacity duration-500"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75" />
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,transparent 100%)' }}
        />

        {/* Spacer: h-32 on mobile clears the -mt-16 offset (-64px) + full navbar height (64px).
             On desktop h-16 is enough because justify-end floats content to the bottom anyway. */}
        <div className="h-[168px] lg:h-16 shrink-0" />

        {/* Content — desktop: floats to bottom via justify-end. Mobile: starts right after spacer. */}
        <div className="relative z-10 flex-1 flex flex-col justify-start lg:justify-end pb-10 lg:pb-14 w-full max-w-5xl mx-auto px-6">
          <div className="mb-5 lg:mb-8 text-left">
            <h1 className="text-[31.5px] lg:text-5xl font-extrabold text-white leading-tight mb-3 max-w-2xl drop-shadow-md">
              {hero.title}
            </h1>
            <p className="hidden lg:block text-white/85 text-base lg:text-lg max-w-xl leading-relaxed">
              {hero.subtitle}
            </p>
          </div>

          {/* Search widget — controlled by parent state */}
          <HourlySearchWidget activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </section>

      {/* ── TRUST BAR — TripAdvisor + Trustpilot ─────────────────────────── */}
      <section className="bg-white border-b border-gray-100">

        {/* TripAdvisor row */}
        <div className="flex items-center justify-center gap-2.5 py-4 border-b border-gray-100">
          <img src="/images/tripadvisor-logo.svg" alt="Tripadvisor" className="h-6 w-auto object-contain" />
          {/* 5 green dots */}
          {[0,1,2,3,4].map(i => (
            <span key={i} className="w-4 h-4 rounded-full bg-[#34E0A1] inline-block" />
          ))}
        </div>

        {/* Trustpilot row */}
        <div className="flex items-center justify-center py-4">
          <img src="/images/trustpilot-logo.png" alt="Trustpilot" className="h-[54px] w-auto object-contain" />
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          DYNAMIC CONTENT — switches on tab change
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hourly' ? (
        <>
          {/* ── HOURLY: Benefits ── */}
          <section className="py-16 lg:py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {HOURLY_BENEFITS.map((b) => (
                  <div key={b.title} className="text-center lg:text-left">
                    <div className="text-4xl mb-4">{b.emoji}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOURLY: Duration options ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">Choose your duration</h2>
              <p className="text-gray-500 mb-8 text-sm lg:text-base">All packages include a private vehicle and English-speaking driver.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {HOURLY_DURATIONS.map(({ hours, label, popular }) => (
                  <div key={hours} className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                    popular ? 'border-[#2534ff] bg-blue-50' : 'border-gray-200 bg-white hover:border-[#2534ff]/40'
                  }`}>
                    {popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#2534ff] text-white px-3 py-0.5 rounded-full whitespace-nowrap">
                        Most popular
                      </span>
                    )}
                    <Clock className={`w-6 h-6 mb-1.5 ${popular ? 'text-[#2534ff]' : 'text-gray-400'}`} />
                    <span className={`text-2xl font-extrabold ${popular ? 'text-[#2534ff]' : 'text-gray-800'}`}>{hours}h</span>
                    <span className="text-xs text-gray-500 mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOURLY: How it works (4 steps) ── */}
          <section className="py-16 lg:py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">How it works</h2>
              <p className="text-gray-500 mb-10 text-sm lg:text-base">Four simple steps to a stress-free day out.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {HOURLY_HOW.map((item) => <HowItWorksCard key={item.step} {...item} />)}
              </div>
            </div>
          </section>

          {/* ── HOURLY: Popular cities ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">Popular cities</h2>
              <p className="text-gray-500 text-sm mb-8">Hourly driver hire available across Thailand.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {CITIES.map((city) => (
                  <div key={city.name} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer hover:scale-[1.03] transition-transform">
                    <Image src={city.img} alt={`Hourly driver in ${city.name}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm drop-shadow">{city.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOURLY: FAQ ── */}
          <section className="py-12 lg:py-16 px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8">Frequently asked questions</h2>
              <div className="space-y-3">{HOURLY_FAQS.map((f) => <FaqItem key={f.q} {...f} />)}</div>
            </div>
          </section>

          {/* ── HOURLY: Popular bookings SEO list ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">The most popular hourly bookings</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                {POPULAR_HOURLY_LIST.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-sm text-[#2534ff] hover:underline truncate py-0.5"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* ── TRANSFERS: Transfer types ── */}
          <section className="py-10 lg:py-14 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TRANSFER_TYPES.map(({ emoji, title, desc, href }) => (
                  <Link
                    key={title}
                    href={href}
                    className="flex items-center gap-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#2534ff]/30 rounded-2xl px-5 py-5 transition-all group"
                  >
                    <span className="text-3xl shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm group-hover:text-[#2534ff] transition-colors">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-snug">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2534ff] shrink-0 ml-auto transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── TRANSFERS: Benefits ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TRANSFER_BENEFITS.map((b) => (
                  <div key={b.title} className="text-center lg:text-left">
                    <div className="text-4xl mb-4">{b.emoji}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TRANSFERS: How it works (3 steps) ── */}
          <section className="py-16 lg:py-20 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">How it works</h2>
              <p className="text-gray-500 mb-10 text-sm lg:text-base">Booked and confirmed in minutes.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {TRANSFER_HOW.map((item) => <HowItWorksCard key={item.step} {...item} />)}
              </div>
            </div>
          </section>

          {/* ── TRANSFERS: Popular routes ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">Popular routes in Thailand</h2>
              <p className="text-gray-500 text-sm mb-8">Fixed-price private transfers, no surge pricing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {POPULAR_ROUTES.map((r) => (
                  <div key={r.from + r.to}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-[#2534ff]/40 hover:bg-blue-50 cursor-pointer transition-all group">
                    <div className="flex flex-col items-center shrink-0 gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2534ff]" />
                      <div className="w-px h-4 bg-gray-200" />
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{r.from}</p>
                      <p className="text-xs text-gray-400 truncate">{r.to}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {r.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TRANSFERS: Popular cities ── */}
          <section className="py-12 lg:py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">Popular cities</h2>
              <p className="text-gray-500 text-sm mb-8">Private transfers available across Thailand.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {CITIES.map((city) => (
                  <div key={city.name} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer hover:scale-[1.03] transition-transform">
                    <Image src={city.img} alt={`Private transfer in ${city.name}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm drop-shadow">{city.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TRANSFERS: FAQ ── */}
          <section className="py-12 lg:py-16 px-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8">Frequently asked questions</h2>
              <div className="space-y-3">{TRANSFER_FAQS.map((f) => <FaqItem key={f.q} {...f} />)}</div>
            </div>
          </section>

          {/* ── TRANSFERS: Popular transfers SEO list ── */}
          <section className="py-12 lg:py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">The most popular transfers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                {POPULAR_TRANSFERS_LIST.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-sm text-[#2534ff] hover:underline truncate py-0.5"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── CTA BANNER — shared ────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-[#2534ff] px-8 py-12 lg:px-16 text-center">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/5" />
            <div className="relative z-10">
              {activeTab === 'hourly'
                ? <Clock className="w-8 h-8 text-white/60 mx-auto mb-4" />
                : <Car   className="w-8 h-8 text-white/60 mx-auto mb-4" />
              }
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
                {activeTab === 'hourly'
                  ? 'Ready to explore Thailand at your own pace?'
                  : 'Need a ride across Thailand?'
                }
              </h2>
              <p className="text-white/80 text-sm lg:text-base mb-8 max-w-lg mx-auto">
                {activeTab === 'hourly'
                  ? 'Book your hourly driver now and enjoy a full day of freedom—no rush, no hassle.'
                  : 'Book a private transfer in minutes. Fixed prices, no surprises, door-to-door service.'
                }
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold text-sm px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
              >
                {activeTab === 'hourly' ? 'Search hourly drivers' : 'Search transfers'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
