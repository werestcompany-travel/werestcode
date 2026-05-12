'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchTabs from '@/components/search/SearchTabs';
import FaqSection from '@/components/home/FaqSection';
import WhatsAppCTA from '@/components/home/WhatsAppCTA';
import { useLocale } from '@/context/LocaleContext';
import {
  ShieldCheck, Star, Clock, MapPin, CheckCircle2,
  Car, Plane, Users, CreditCard, Bell, ArrowRight,
  Quote, ArrowLeftRight, Luggage,
} from 'lucide-react';

const ROUTES = [
  { from: 'Suvarnabhumi (BKK)', to: 'Bangkok City',  fromPrice: '฿1,200', time: '45 min',  gradient: 'from-brand-600 to-indigo-700',  emoji: '🏙️',
    href: '/results?pickup_address=Suvarnabhumi+Airport&dropoff_address=Bangkok+City+Centre' },
  { from: 'Don Mueang (DMK)',   to: 'Bangkok City',  fromPrice: '฿1,200', time: '40 min',  gradient: 'from-emerald-500 to-teal-700',  emoji: '✈️',
    href: '/results?pickup_address=Don+Mueang+Airport&dropoff_address=Bangkok+City+Centre' },
  { from: 'Bangkok City',       to: 'Pattaya',        fromPrice: '฿1,800', time: '1h 45m', gradient: 'from-cyan-500 to-blue-700',      emoji: '🏖️',
    href: '/results?pickup_address=Bangkok+City+Centre&dropoff_address=Pattaya' },
  { from: 'Bangkok City',       to: 'Hua Hin',        fromPrice: '฿1,800', time: '2h 30m', gradient: 'from-amber-500 to-orange-700',   emoji: '🌊',
    href: '/results?pickup_address=Bangkok+City+Centre&dropoff_address=Hua+Hin' },
  { from: 'Phuket Airport',     to: 'Patong Beach',   fromPrice: '฿1,200', time: '45 min',  gradient: 'from-pink-500 to-rose-700',     emoji: '🏝️',
    href: '/results?pickup_address=Phuket+Airport&dropoff_address=Patong+Beach' },
  { from: 'Chiang Mai City',    to: 'Chiang Rai',     fromPrice: '฿2,500', time: '3h 00m', gradient: 'from-green-600 to-emerald-800',  emoji: '🌿',
    href: '/results?pickup_address=Chiang+Mai&dropoff_address=Chiang+Rai' },
];

const REVIEWS = [
  { name: 'Sarah M.',  origin: 'United Kingdom', rating: 5, textKey: 'rev.1' },
  { name: 'James K.',  origin: 'Australia',      rating: 5, textKey: 'rev.2' },
  { name: 'Yuki T.',   origin: 'Japan',           rating: 5, textKey: 'rev.3' },
];

const STATS = [
  { value: '50+',    labelKey: 'stats.routes'    },
  { value: '10K+',  labelKey: 'stats.travellers' },
  { value: '4.9★',  labelKey: 'stats.rating'     },
  { value: '24 / 7', labelKey: 'stats.support'   },
];

const CAR_CLASSES = [
  {
    id: 'sedan',
    badge: 'Economy', badgeColor: 'bg-blue-100 text-blue-700',
    name: 'Sedan', model: 'Toyota Camry or similar',
    pax: 2, bags: 2, price: '฿1,200',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    features: ['Air conditioning', 'English-speaking driver', 'Meet & greet name sign', 'Free flight monitoring'],
  },
  {
    id: 'suv',
    badge: 'Comfort', badgeColor: 'bg-emerald-100 text-emerald-700',
    name: 'SUV', model: 'Toyota Fortuner or similar',
    pax: 4, bags: 4, price: '฿1,800',
    image: '/images/suv.jpg',
    features: ['Air conditioning', 'English-speaking driver', 'Meet & greet name sign', 'Extra luggage space', 'Child seat on request'],
  },
  {
    id: 'minivan',
    badge: 'Group', badgeColor: 'bg-amber-100 text-amber-700',
    name: 'Minivan', model: 'Toyota Commuter or similar',
    pax: 10, bags: 7, price: '฿2,500',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    features: ['Air conditioning', 'English-speaking driver', 'Meet & greet name sign', 'Ideal for groups & families', 'Ample luggage room'],
  },
];

const TRUST_ITEMS = [
  { icon: <Plane       className="w-5 h-5 text-brand-600" />, titleKey: 'trust.flight.t',  descKey: 'trust.flight.d'  },
  { icon: <ShieldCheck className="w-5 h-5 text-brand-600" />, titleKey: 'trust.driver.t',  descKey: 'trust.driver.d'  },
  { icon: <Car         className="w-5 h-5 text-brand-600" />, titleKey: 'trust.vehicle.t', descKey: 'trust.vehicle.d' },
  { icon: <Bell        className="w-5 h-5 text-brand-600" />, titleKey: 'trust.support.t', descKey: 'trust.support.d' },
];

export default function PrivateTransferClient() {
  const { t } = useLocale();
  const [prefillRoute, setPrefillRoute] = useState<{ from: string; to: string } | null>(null);

  const handleSeoRouteClick = useCallback((route: string, e: React.MouseEvent) => {
    e.preventDefault();
    const toIdx = route.toLowerCase().lastIndexOf(' to ');
    if (toIdx === -1) return;
    setPrefillRoute({ from: route.slice(0, toIdx).trim(), to: route.slice(toIdx + 4).trim() });
    document.getElementById('hero-search-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <>
      <Navbar transparent />

      {/* ── HERO ── */}
      <section aria-label="Hero" className="relative flex flex-col justify-center overflow-hidden" style={{ minHeight: '92vh' }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=85"
            alt="Private transfer across Thailand — professional driver service"
            fill priority
            className="object-cover object-center scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />
        </div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center gap-5 text-center">
          <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">Private Transfer Service</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl">
            Private Transfers<br className="hidden sm:block" /> Across Thailand
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-lg">
            Door-to-door private transfers with verified local drivers. Fixed prices, no surge, instant confirmation.
          </p>
          <div id="hero-search-anchor" className="w-full mt-2">
            <SearchTabs prefillRoute={prefillRoute} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/75 text-xs font-medium mt-1">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />{t('hero.badge1')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />{t('hero.badge2')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />{t('hero.badge3')}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 mt-1">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
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

      {/* ── STATS ── */}
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

      {/* ── WHY CHOOSE WEREST — 3 cards ── */}
      <section aria-labelledby="pt-why-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Why Us</p>
            <h2 id="pt-why-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Why Choose Werest?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Simple, reliable, and affordable transfers across Thailand — every time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin className="w-8 h-8" />, title: 'Tailored to Your Needs', desc: 'Ideal for time-sensitive travel including airports, business, and events. Advance booking guarantees reliability and accommodates specific vehicle preferences.' },
              { icon: <Star   className="w-8 h-8" />, title: 'Local Expertise',         desc: 'Our drivers possess comprehensive regional knowledge and offer thoughtful recommendations and local insight throughout your journey.' },
              { icon: <CreditCard className="w-8 h-8" />, title: 'Transparent Fares, No Surprises', desc: 'Pre-booking secures your price in advance, ensuring no unexpected costs from traffic or surge demand. What you see is what you pay.' },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-3xl border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all bg-white">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5" aria-hidden="true">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMOOTH JOURNEYS — 4 steps ── */}
      <section aria-labelledby="pt-smooth-heading" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Getting Started</p>
            <h2 id="pt-smooth-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Smooth Journeys to Your Destinations</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From booking to arrival — a seamless transfer experience in four simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative">
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(25% - 40px)', left: 'calc(12.5% + 20px)' }} aria-hidden="true" />
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(25% - 40px)', left: 'calc(37.5% + 20px)' }} aria-hidden="true" />
            <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(25% - 40px)', left: 'calc(62.5% + 20px)' }} aria-hidden="true" />
            {[
              { n: '01', icon: <MapPin   className="w-5 h-5" />, title: 'Book Your Vehicle',      desc: 'Choose your route, vehicle type, date and time. Booking takes under 2 minutes.' },
              { n: '02', icon: <Bell     className="w-5 h-5" />, title: 'Receive Confirmation',   desc: 'Get instant booking confirmation with your driver details and trip summary.' },
              { n: '03', icon: <Car      className="w-5 h-5" />, title: 'Meet Your Driver',       desc: 'Your driver arrives on time with a name sign and assists with your luggage.' },
              { n: '04', icon: <Star     className="w-5 h-5" />, title: 'Relax & Enjoy the Ride', desc: 'Sit back and travel comfortably to your destination with a professional driver.' },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,52,255,0.25)] z-10 relative" style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }} aria-hidden="true">{s.icon}</div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-600 text-brand-700 text-[10px] font-black flex items-center justify-center" aria-hidden="true">{s.n}</span>
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

      {/* ── VEHICLE OPTIONS — 5 types ── */}
      <section aria-labelledby="pt-vehicle-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Our Fleet</p>
            <h2 id="pt-vehicle-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Vehicle Options</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From budget sedans to luxury SUVs — choose the vehicle that fits your group and style.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Standard Sedan', icon: '🚗', desc: 'Up to 3 pax',  badge: 'Economy', color: 'bg-blue-50 text-blue-700'     },
              { name: 'Standard SUV',   icon: '🚙', desc: 'Up to 6 pax',  badge: 'Comfort', color: 'bg-green-50 text-green-700'   },
              { name: 'Luxury SUV',     icon: '🚐', desc: 'Up to 6 pax',  badge: 'Premium', color: 'bg-purple-50 text-purple-700' },
              { name: 'Large Capacity', icon: '🚌', desc: 'Up to 12 pax', badge: 'Group',   color: 'bg-amber-50 text-amber-700'   },
              { name: 'Luxury Sedan',   icon: '🏎️', desc: 'Up to 3 pax',  badge: 'VIP',     color: 'bg-rose-50 text-rose-700'     },
            ].map((v) => (
              <div key={v.name} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-md transition-all">
                <span className="text-4xl mb-3" aria-hidden="true">{v.icon}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 ${v.color}`}>{v.badge}</span>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{v.name}</h3>
                <p className="text-xs text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAR CLASSES ── */}
      <section aria-labelledby="pt-fleet-heading" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">Our Fleet</p>
            <h2 id="pt-fleet-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Choose Your Vehicle</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">All vehicles are air-conditioned with professional, English-speaking drivers and fixed prices.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CAR_CLASSES.map((cls) => (
              <article key={cls.id} className="group flex flex-col rounded-3xl border border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(37,52,255,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="relative w-full bg-gray-50 overflow-hidden" style={{ height: 200 }}>
                  <Image src={cls.image} alt={`${cls.name} — private transfer Thailand`} fill className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <div className="mb-2"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cls.badgeColor}`}>{cls.badge}</span></div>
                  <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-0.5">{cls.name}</h3>
                  <p className="text-xs text-gray-400 mb-4">{cls.model}</p>
                  <div className="flex items-center gap-5 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600"><Users className="w-4 h-4 text-brand-500" /><span className="font-semibold">{cls.pax}</span><span className="text-gray-400">pax</span></div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600"><Luggage className="w-4 h-4 text-brand-500" /><span className="font-semibold">{cls.bags}</span><span className="text-gray-400">bags</span></div>
                  </div>
                  <ul className="space-y-1.5 flex-1 mb-5">
                    {cls.features.map((f) => (<li key={f} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}</li>))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">From</p>
                      <p className="text-2xl font-extrabold text-brand-600 leading-tight">{cls.price}</p>
                    </div>
                    <a href="#hero-search-anchor" onClick={(e) => { e.preventDefault(); document.getElementById('hero-search-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                      className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                      Book Now <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section aria-labelledby="pt-routes-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('rt.tagline')}</p>
              <h2 id="pt-routes-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('rt.heading')}</h2>
              <p className="text-gray-500 mt-2 text-sm">{t('rt.sub')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROUTES.map((r) => (
              <Link key={r.from + r.to} href={r.href} className="group relative rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600" style={{ minHeight: 200 }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} transition-all duration-300 group-hover:scale-[1.02]`} />
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} aria-hidden="true" />
                <div className="absolute top-3 right-4 text-6xl opacity-20 select-none" aria-hidden="true">{r.emoji}</div>
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
                      <p className="text-white/60 text-[10px]">{t('rt.from')}</p>
                      <p className="text-white font-extrabold text-xl">{r.fromPrice}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 group-hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
                      {t('rt.book')} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / SAFETY ── */}
      <section aria-labelledby="pt-trust-heading" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 420 }}>
              <Image src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80" alt="Professional driver — safe Thailand transfer service" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-2xl font-extrabold text-gray-900">4.9 / 5</p>
                <div className="flex gap-0.5 my-1">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-xs text-gray-500">{t('trust.verified')}</p>
              </div>
            </div>
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-3">{t('trust.tagline')}</p>
              <h2 id="pt-trust-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{t('trust.heading')}</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">{t('trust.para')}</p>
              <ul className="space-y-4">
                {TRUST_ITEMS.map((item) => (
                  <li key={item.titleKey} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">{item.icon}</div>
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

      {/* ── TESTIMONIALS ── */}
      <section aria-labelledby="pt-reviews-heading" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">{t('rev.tagline')}</p>
            <h2 id="pt-reviews-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('rev.heading')}</h2>
            <div className="flex justify-center items-center gap-1 mt-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2 text-sm text-gray-600 font-medium">{t('rev.score')}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <article key={r.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_24px_rgba(37,52,255,0.07)] transition-all duration-200" itemScope itemType="https://schema.org/Review">
                <Quote className="w-8 h-8 text-brand-200 mb-3" />
                <p className="text-gray-700 text-sm leading-relaxed mb-5" itemProp="reviewBody">"{t(r.textKey)}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{r.name[0]}</div>
                  <div itemProp="author" itemScope itemType="https://schema.org/Person">
                    <p className="font-semibold text-gray-900 text-sm" itemProp="name">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.origin}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section aria-labelledby="pt-cta-heading" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 60%, #0d1266 100%)' }} aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Book Your Transfer</p>
          <h2 id="pt-cta-heading" className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Travel in Comfort?</h2>
          <p className="text-white/65 mb-8 max-w-xl mx-auto">Book your private transfer in minutes. Fixed prices, verified drivers, instant confirmation — across all of Thailand.</p>
          <a href="#hero-search-anchor" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-7 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Book Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      <Footer />
      <WhatsAppCTA />

      {/* Hidden SEO route links */}
      <nav aria-label="Transfer route directory" className="sr-only">
        {['Bangkok Airport to Bangkok City', 'Bangkok to Pattaya', 'Phuket Airport to Patong Beach',
          'Don Mueang Airport to Bangkok', 'Bangkok to Hua Hin', 'Chiang Mai to Chiang Rai',
          'Phuket Airport to Karon', 'Bangkok to Kanchanaburi', 'Phuket Airport to Khao Lak',
        ].map((route) => {
          const toIdx = route.toLowerCase().lastIndexOf(' to ');
          const from  = toIdx !== -1 ? route.slice(0, toIdx).trim() : route;
          const to    = toIdx !== -1 ? route.slice(toIdx + 4).trim() : '';
          return (
            <a key={route} href={`/results?pickup_address=${encodeURIComponent(from)}&dropoff_address=${encodeURIComponent(to)}`}
              onClick={(e) => handleSeoRouteClick(route, e)}>
              {route}
            </a>
          );
        })}
      </nav>
    </>
  );
}
