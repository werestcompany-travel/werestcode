'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchTabs from '@/components/search/SearchTabs';
import FaqSection from '@/components/home/FaqSection';
import DestinationsSection from '@/components/home/DestinationsSection';
import WhatsAppCTA from '@/components/home/WhatsAppCTA';
import BlogCard from '@/components/blog/BlogCard';
import { useLocale } from '@/context/LocaleContext';
import { type BlogPostSummary } from '@/lib/blog';
import {
  ShieldCheck, Star, MapPin, CheckCircle2,
  Car, Plane, Users, CreditCard, Bell, ArrowRight,
  Quote, ArrowLeftRight, BookOpen,
} from 'lucide-react';

/* ── SEO route link grid ──────────────────────────────────────────────────── */
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

/* ── Reviews with translation keys ───────────────────────────────────────── */
const REVIEWS = [
  { name: 'Sarah M.',  origin: 'United Kingdom', rating: 5, textKey: 'rev.1' },
  { name: 'James K.',  origin: 'Australia',      rating: 5, textKey: 'rev.2' },
  { name: 'Yuki T.',   origin: 'Japan',           rating: 5, textKey: 'rev.3' },
];

/* ── Benefits with translation keys ─────────────────────────────────────── */
const BENEFITS = [
  { icon: <Plane       className="w-6 h-6" />, titleKey: 'ben.flight.title',  descKey: 'ben.flight.desc'  },
  { icon: <ShieldCheck className="w-6 h-6" />, titleKey: 'ben.driver.title',  descKey: 'ben.driver.desc'  },
  { icon: <CreditCard  className="w-6 h-6" />, titleKey: 'ben.price.title',   descKey: 'ben.price.desc'   },
  { icon: <Bell        className="w-6 h-6" />, titleKey: 'ben.confirm.title', descKey: 'ben.confirm.desc' },
  { icon: <Users       className="w-6 h-6" />, titleKey: 'ben.greet.title',   descKey: 'ben.greet.desc'   },
  { icon: <CheckCircle2 className="w-6 h-6" />, titleKey: 'ben.cancel.title', descKey: 'ben.cancel.desc'  },
];

/* ── How-it-works steps with translation keys ────────────────────────────── */
const STEPS = [
  { n: '01', icon: <MapPin       className="w-5 h-5" />, titleKey: 'step.1.title', descKey: 'step.1.desc' },
  { n: '02', icon: <Car         className="w-5 h-5" />, titleKey: 'step.2.title', descKey: 'step.2.desc' },
  { n: '03', icon: <CheckCircle2 className="w-5 h-5" />, titleKey: 'step.3.title', descKey: 'step.3.desc' },
];

/* ── Trust-section items with translation keys ───────────────────────────── */
const TRUST_ITEMS = [
  { icon: <Plane       className="w-5 h-5 text-brand-600" />, titleKey: 'trust.flight.t', descKey: 'trust.flight.d' },
  { icon: <ShieldCheck className="w-5 h-5 text-brand-600" />, titleKey: 'trust.driver.t', descKey: 'trust.driver.d' },
  { icon: <Car         className="w-5 h-5 text-brand-600" />, titleKey: 'trust.vehicle.t', descKey: 'trust.vehicle.d' },
  { icon: <Bell        className="w-5 h-5 text-brand-600" />, titleKey: 'trust.support.t', descKey: 'trust.support.d' },
];

/* ── Stats ───────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '50+',    labelKey: 'stats.routes'     },
  { value: '10K+',  labelKey: 'stats.travellers'  },
  { value: '4.9★',  labelKey: 'stats.rating'      },
  { value: '24 / 7', labelKey: 'stats.support'    },
];

/* ── Car classes ─────────────────────────────────────────────────────────── */
const CAR_CLASSES = [
  {
    id: 'sedan',
    name: 'Sedan',
    maxPax: 3,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/14png/w=140,h=112,fit=contain',
  },
  {
    id: 'suv',
    name: 'SUV',
    maxPax: 6,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/13png/w=140,h=112,fit=contain',
  },
  {
    id: 'minivan',
    name: 'Minivan',
    maxPax: 10,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/10-1png/w=140,h=112,fit=contain',
  },
  {
    id: 'luxury-mpv',
    name: 'Luxury MPV',
    maxPax: 6,
    image: 'https://eu2.contabostorage.com/fd5fb40e53894be8a861ffc261151838:cbs-webapi-test/c0f0b52e-1b54-4588-a98f-9a987bc6dd0b.png',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePageClient({ latestPosts = [] }: { latestPosts?: BlogPostSummary[] }) {
  const { t } = useLocale();
  const [blogTab, setBlogTab] = useState(0); // reserved for future blog filters
  const [prefillRoute, setPrefillRoute] = useState<{ from: string; to: string } | null>(null);
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);

  /** Parse "City A to City B" → prefill hero form + scroll up */
  const handleSeoRouteClick = useCallback((route: string, e: React.MouseEvent) => {
    e.preventDefault();
    const toIdx = route.toLowerCase().lastIndexOf(' to ');
    if (toIdx === -1) return;
    const from = route.slice(0, toIdx).trim();
    const to   = route.slice(toIdx + 4).trim();
    setPrefillRoute({ from, to });
    // Scroll hero search form into view
    document.getElementById('hero-search-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <>
      <Navbar transparent />

      {/* ════════════════════════════════════════════════════════════
          1. HERO  — visual design preserved exactly
      ════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Hero"
        className="relative flex flex-col justify-center overflow-hidden"
        style={{ minHeight: '92vh' }}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85"
            alt="Scenic road through Thailand — private transfer and day trip booking"
            fill priority
            className="object-cover object-center scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center gap-5 text-center">
          <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">
            {t('hero.tagline')}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl">
            {t('hero.title1')}<br className="hidden sm:block" /> {t('hero.title2')}
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-lg">
            {t('hero.subtitle')}
          </p>
          <div id="hero-search-anchor" className="w-full mt-2">
            <SearchTabs prefillRoute={prefillRoute} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/75 text-xs font-medium mt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
              {t('hero.badge1')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
              {t('hero.badge2')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
              {t('hero.badge3')}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 mt-1">
            <div className="flex gap-0.5" aria-label="5 stars">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />)}
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">{t('hero.rating')}</p>
              <p className="text-white/60 text-[10px] mt-0.5">{t('hero.ratingCount')}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 72L1440 72L1440 20C1200 72 720 0 0 52L0 72Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. STATS BAR
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Key statistics" className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-100">
            {STATS.map((s) => (
              <div key={s.labelKey} className="flex flex-col items-center text-center px-6 py-2">
                <dt className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">{s.value}</dt>
                <dd className="text-sm text-gray-500 mt-1">{t(s.labelKey)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. WHY CHOOSE WEREST — benefits grid
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="benefits-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('why.tagline')}</p>
            <h2 id="benefits-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('why.heading')}</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t('why.sub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <article
                key={b.titleKey}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_24px_rgba(37,52,255,0.08)] transition-all duration-200 bg-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-200" aria-hidden="true">
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{t(b.titleKey)}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t(b.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="hiw-heading" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('hiw.tagline')}</p>
            <h2 id="hiw-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('hiw.heading')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(16.66% + 24px)' }} aria-hidden="true" />
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(49.99% + 24px)' }} aria-hidden="true" />
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,52,255,0.25)] z-10 relative"
                    style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}
                    aria-hidden="true"
                  >
                    {s.icon}
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-600 text-brand-700 text-[10px] font-black flex items-center justify-center" aria-hidden="true">
                    {s.n}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{t(s.titleKey)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t(s.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. VEHICLE OPTIONS — fleet showcase
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="fleet-heading" className="py-16 bg-[#f2f2f2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="fleet-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Vehicle Options</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CAR_CLASSES.map((cls) => {
              const open = activeVehicle === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setActiveVehicle(open ? null : cls.id)}
                  onMouseEnter={() => setActiveVehicle(cls.id)}
                  onMouseLeave={() => setActiveVehicle(null)}
                  className="flex flex-col items-center text-center py-4 px-2 rounded-xl transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`${cls.name} — up to ${cls.maxPax} passengers`}
                >
                  <div className="relative w-full mb-4" style={{ height: 112 }}>
                    <Image
                      src={cls.image}
                      alt={`${cls.name} — private transfer Thailand`}
                      fill
                      className="object-contain drop-shadow-sm"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-gray-800">{cls.name}</p>
                  <div className={`mt-2 flex items-center gap-1 text-xs font-semibold text-brand-600 transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}>
                    <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    Up to {cls.maxPax} passengers
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6. BOOK BY DESTINATION — photo route cards (client tabs)
      ════════════════════════════════════════════════════════════ */}
      <DestinationsSection />

      {/* ════════════════════════════════════════════════════════════
          7. TRUST / SAFETY — split section
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="trust-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 420 }}>
              <Image
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80"
                alt="Professional driver and clean vehicle — safe Thailand transfer service"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-2xl font-extrabold text-gray-900">4.9 / 5</p>
                <div className="flex gap-0.5 my-1" aria-label="4.9 out of 5 stars">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
                </div>
                <p className="text-xs text-gray-500">{t('trust.verified')}</p>
              </div>
            </div>
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">{t('trust.tagline')}</p>
              <h2 id="trust-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                {t('trust.heading')}
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">{t('trust.para')}</p>
              <ul className="space-y-4">
                {TRUST_ITEMS.map((item) => (
                  <li key={item.titleKey} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t(item.titleKey)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(item.descKey)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          8. TESTIMONIALS
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="reviews-heading" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('rev.tagline')}</p>
            <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('rev.heading')}</h2>
            <div className="flex justify-center items-center gap-1 mt-3" aria-label="Average rating: 4.9 out of 5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
              <span className="ml-2 text-sm text-gray-600 font-medium">{t('rev.score')}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <article
                key={r.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_24px_rgba(37,52,255,0.07)] transition-all duration-200"
                itemScope itemType="https://schema.org/Review"
              >
                <Quote className="w-8 h-8 text-brand-200 mb-3" aria-hidden="true" />
                <p className="text-gray-700 text-sm leading-relaxed mb-5" itemProp="reviewBody">"{t(r.textKey)}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0" aria-hidden="true">
                    {r.name[0]}
                  </div>
                  <div itemProp="author" itemScope itemType="https://schema.org/Person">
                    <p className="font-semibold text-gray-900 text-sm" itemProp="name">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.origin}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5" aria-label={`${r.rating} stars`}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          9. TRAVEL BLOG
      ════════════════════════════════════════════════════════════ */}
      {latestPosts.length > 0 && (
        <section aria-labelledby="blog-heading" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-brand-600" aria-hidden="true" />
                  <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest">{t('blog.tagline')}</p>
                </div>
                <h2 id="blog-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('blog.heading')}</h2>
              </div>
              <a href="/blog" className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
                {t('blog.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {latestPosts.map((post) => (
                <div key={post.id} className="shrink-0 w-52 lg:w-auto">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {/* Mobile see-all link */}
            <div className="mt-6 flex justify-center sm:hidden">
              <a href="/blog" className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm">
                {t('blog.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          10. CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="cta-heading" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 60%, #0d1266 100%)' }} aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">{t('cta.tagline')}</p>
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{t('cta.heading')}</h2>
          <p className="text-white/65 mb-8 max-w-xl mx-auto">{t('cta.para')}</p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-7 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {t('cta.btn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          11. FAQ — extracted client component
      ════════════════════════════════════════════════════════════ */}
      <FaqSection />

      {/* ════════════════════════════════════════════════════════════
          12. SEO ROUTE KEYWORD GRID
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="All transfer routes in Thailand" className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('seo.h2')}</h2>
          <nav aria-label="Transfer route directory">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0">
              {SEO_ROUTES.map((col, ci) => (
                <ul key={ci} className="space-y-0">
                  {col.map((route) => {
                    const toIdx = route.toLowerCase().lastIndexOf(' to ');
                    const from  = toIdx !== -1 ? route.slice(0, toIdx).trim() : route;
                    const to    = toIdx !== -1 ? route.slice(toIdx + 4).trim() : '';
                    return (
                      <li key={route}>
                        <a
                          href={`/results?pickup_address=${encodeURIComponent(from)}&dropoff_address=${encodeURIComponent(to)}`}
                          onClick={(e) => handleSeoRouteClick(route, e)}
                          className="group/r block text-sm text-brand-700 hover:text-brand-900 py-1.5 leading-snug flex items-center gap-1"
                        >
                          <span className="group-hover/r:underline">{route}</span>
                          <ArrowLeftRight className="w-3 h-3 shrink-0 opacity-0 group-hover/r:opacity-60 transition-opacity" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp CTA */}
      <WhatsAppCTA />
    </>
  );
}
