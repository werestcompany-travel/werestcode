'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X, Share2, ChevronRight, MapPin, Clock,
  Users, Star, Car, Ticket, Compass, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface Highlight { emoji: string; label: string }

interface DestinationConfig {
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  highlights: Highlight[];
  tips: string[];
}

interface TourItem {
  slug: string;
  title: string;
  images: string[];
  duration: string;
  maxGroupSize: number;
  rating: number;
  badge?: string;
  options: { pricePerPerson: number }[];
}

interface AttractionItem {
  slug: string;
  name: string;
  featureImage?: string;
  location?: string;
  rating?: number;
  packages?: { adultPrice: number }[];
}

interface Props {
  dest: DestinationConfig;
  tours: TourItem[];
  attractions: AttractionItem[];
  formatTHB: (n: number) => string;
}

/* ── Tab definitions ────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'explore',      labelFn: (city: string) => `Explore ${city}` },
  { id: 'things-to-do', labelFn: () => 'Things to do' },
  { id: 'transfers',    labelFn: () => 'Transfers' },
  { id: 'attractions',  labelFn: () => 'Attractions' },
  { id: 'tours',        labelFn: () => 'Tours' },
];

/* ════════════════════════════════════════════════════════════════════════════ */
export default function DestinationPageClient({ dest, tours, attractions, formatTHB }: Props) {
  const [showSheet, setShowSheet]   = useState(false);
  const [activeTab, setActiveTab]   = useState('things-to-do');
  const tabBarRef                   = useRef<HTMLDivElement>(null);
  const contentRef                  = useRef<HTMLDivElement>(null);

  /* Scroll active tab into view */
  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const el = tabBarRef.current?.querySelector(`[data-tab="${id}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  /* Lock body scroll when sheet is open */
  useEffect(() => {
    document.body.style.overflow = showSheet ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSheet]);

  const priceMin = (opts: { pricePerPerson: number }[]) =>
    Math.min(...opts.map(o => o.pricePerPerson));

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="relative w-full" style={{ height: 'clamp(280px, 50vw, 420px)' }}>
          {/* Background image */}
          <Image
            src={dest.heroImage}
            alt={dest.name}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
          {/* Gradient overlay — stronger at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

          {/* Top row — breadcrumb + share */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-20 lg:pt-6">
            <nav className="flex items-center gap-1 text-white/75 text-xs font-medium">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/destinations" className="hover:text-white">Thailand</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{dest.name}</span>
            </nav>
            <button
              type="button"
              onClick={() => navigator.share?.({ title: dest.name, url: window.location.href })}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom content — headline + description + see more */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
            <h1 className="text-[22px] sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2">
              Things to do in {dest.name}
            </h1>
            <p className="text-white/85 text-sm leading-snug line-clamp-2 max-w-xl">
              {dest.description}
            </p>
            <button
              type="button"
              onClick={() => setShowSheet(true)}
              className="mt-1 text-white text-sm font-semibold underline underline-offset-2"
            >
              See more
            </button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            STICKY HORIZONTAL TAB NAV
        ══════════════════════════════════════════════════ */}
        <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div
            ref={tabBarRef}
            className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map(tab => {
              const label  = tab.labelFn(dest.name);
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`shrink-0 px-5 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                    active
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB CONTENT
        ══════════════════════════════════════════════════ */}
        <div ref={contentRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Explore [City] ── */}
          {activeTab === 'explore' && (
            <div className="space-y-10">
              {/* About */}
              <section>
                <h2 className="text-xl font-extrabold text-gray-900 mb-3">About {dest.name}</h2>
                <p className="text-gray-600 leading-relaxed">{dest.description}</p>
              </section>

              {/* Highlights */}
              <section>
                <h2 className="text-xl font-extrabold text-gray-900 mb-4">Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {dest.highlights.map(h => (
                    <div key={h.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center hover:border-brand-200 hover:shadow-sm transition-all">
                      <span className="text-3xl block mb-2">{h.emoji}</span>
                      <span className="text-xs font-semibold text-gray-700 leading-tight">{h.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Travel tips */}
              <section>
                <h2 className="text-xl font-extrabold text-gray-900 mb-4">Travel Tips</h2>
                <ul className="space-y-3">
                  {dest.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[11px] font-bold shrink-0">{i + 1}</span>
                      <p className="text-gray-600 text-sm leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {/* ── Things to do ── */}
          {activeTab === 'things-to-do' && (
            <div className="space-y-10">
              {tours.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-extrabold text-gray-900">Tours & Experiences</h2>
                    <Link href={`/tours?destination=${dest.name}`} className="text-sm font-semibold text-brand-600 flex items-center gap-1 hover:underline">
                      See all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tours.slice(0, 6).map(tour => (
                      <Link key={tour.slug} href={`/tours/${tour.slug}`}
                        className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all overflow-hidden group">
                        <div className="relative h-44 bg-gray-100">
                          {tour.images[0] && (
                            <Image src={tour.images[0]} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                          )}
                          {tour.badge && (
                            <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tour.badge}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{tour.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration}</span>
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{tour.rating}</span>
                          </div>
                          <p className="text-base font-extrabold text-brand-600">
                            {formatTHB(priceMin(tour.options))}
                            <span className="text-xs font-normal text-gray-400">/person</span>
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Highlights as "things to do" when no tours */}
              {tours.length === 0 && (
                <section>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-4">Popular Activities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {dest.highlights.map(h => (
                      <div key={h.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition-all">
                        <span className="text-2xl shrink-0">{h.emoji}</span>
                        <span className="text-sm font-semibold text-gray-700">{h.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── Transfers ── */}
          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-gray-900">Transfers to & from {dest.name}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { from: `${dest.name} Airport`, to: `${dest.name} City`, duration: '30–45 min', from_price: 600 },
                  { from: 'Bangkok', to: dest.name, duration: '2–8 hrs', from_price: 1800 },
                  { from: 'Phuket', to: dest.name, duration: '3–5 hrs', from_price: 2400 },
                ].map((r, i) => (
                  <Link key={i}
                    href={`/results?pickup_address=${encodeURIComponent(r.from)}&dropoff_address=${encodeURIComponent(r.to)}`}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{r.from}</p>
                        <p className="text-xs text-gray-400">→ {r.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.duration}</span>
                      <span className="text-sm font-extrabold text-brand-600">from ฿{r.from_price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center pt-4">
                <Link href={`/results?dropoff_address=${encodeURIComponent(dest.name)}`}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                  <Car className="w-4 h-4" /> Search all transfers to {dest.name}
                </Link>
              </div>
            </div>
          )}

          {/* ── Attractions ── */}
          {activeTab === 'attractions' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-gray-900">Attractions in {dest.name}</h2>
                <Link href={`/attractions?location=${dest.name}`} className="text-sm font-semibold text-brand-600 flex items-center gap-1 hover:underline">
                  See all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {attractions.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attractions.slice(0, 6).map(a => (
                    <Link key={a.slug} href={`/attractions/${a.slug}`}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all overflow-hidden group">
                      <div className="relative h-44 bg-gray-100">
                        {a.featureImage && (
                          <Image src={a.featureImage} alt={a.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{a.name}</h3>
                        <div className="flex items-center justify-between">
                          {a.location && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{a.location}</span>}
                          {a.packages?.[0] && (
                            <span className="text-sm font-extrabold text-brand-600">฿{a.packages[0].adultPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dest.highlights.map(h => (
                    <div key={h.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center gap-3">
                      <span className="text-2xl shrink-0">{h.emoji}</span>
                      <span className="text-sm font-semibold text-gray-700">{h.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tours ── */}
          {activeTab === 'tours' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-gray-900">All Tours in {dest.name}</h2>
              </div>
              {tours.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tours.map(tour => (
                    <Link key={tour.slug} href={`/tours/${tour.slug}`}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all overflow-hidden group">
                      <div className="relative h-44 bg-gray-100">
                        {tour.images[0] && (
                          <Image src={tour.images[0]} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                        )}
                        {tour.badge && (
                          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tour.badge}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{tour.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tour.duration}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Max {tour.maxGroupSize}</span>
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{tour.rating}</span>
                        </div>
                        <p className="text-base font-extrabold text-brand-600">
                          {formatTHB(priceMin(tour.options))}
                          <span className="text-xs font-normal text-gray-400">/person</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No tours listed yet for {dest.name}</p>
                  <p className="text-sm mt-1">Check back soon or browse all tours.</p>
                  <Link href="/tours" className="mt-4 inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:underline">
                    Browse all tours <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

        <Footer />
      </main>

      {/* ══════════════════════════════════════════════════
          BOTTOM SHEET — full city description
      ══════════════════════════════════════════════════ */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSheet(false)}
          />
          {/* Sheet */}
          <div className="relative w-full bg-white rounded-t-3xl z-10 max-h-[82vh] flex flex-col">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{dest.name}</h2>
              <button
                type="button"
                onClick={() => setShowSheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
              <p className="text-gray-700 text-base leading-relaxed">{dest.description}</p>
              {dest.tips.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Travel Tips</h3>
                  <ul className="space-y-2">
                    {dest.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
