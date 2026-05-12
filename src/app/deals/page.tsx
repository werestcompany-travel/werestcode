'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tag, Clock, Copy, Check, Flame, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { useAuthModal } from '@/context/AuthModalContext';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { key: '',            label: 'All Deals'    },
  { key: 'transfer',   label: 'Transfers'    },
  { key: 'tour',       label: 'Tours'        },
  { key: 'attraction', label: 'Attractions'  },
];

const DEALS = [
  {
    id: 'bkk-airport-10',
    type: 'transfer',
    title: 'Bangkok Airport Transfers',
    desc: 'Save on all Suvarnabhumi & Don Mueang pickups and drop-offs',
    discount: '10% OFF',
    code: 'BKKARRIVAL',
    validUntil: 'Jun 30, 2026',
    minPax: 1,
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    hot: true,
    href: '/booking',
  },
  {
    id: 'newuser-welcome',
    type: 'transfer',
    title: 'New User Welcome Offer',
    desc: 'First-time customers get 10% off any private transfer',
    discount: '10% OFF',
    code: 'WELCOME10',
    validUntil: 'Dec 31, 2026',
    minPax: 1,
    img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80',
    hot: false,
    href: '/auth/register',
  },
  {
    id: 'phi-phi-may',
    type: 'tour',
    title: 'Phi Phi Islands Speedboat Trip',
    desc: 'Full-day speedboat tour from Phuket — limited-time discount',
    discount: '15% OFF',
    code: 'PHIPHIMAY',
    validUntil: 'May 31, 2026',
    minPax: 2,
    img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=600&q=80',
    hot: true,
    href: '/tours/phi-phi-island-speedboat',
  },
  {
    id: 'floating-market',
    type: 'tour',
    title: 'Floating Market Boat Tour',
    desc: 'Damnoen Saduak canal experience — weekend special rate',
    discount: '12% OFF',
    code: 'FLOAT12',
    validUntil: 'Jun 15, 2026',
    minPax: 1,
    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
    hot: false,
    href: '/tours/floating-market-boat-tour',
  },
  {
    id: 'sanctuary-truth',
    type: 'attraction',
    title: 'Sanctuary of Truth — Pattaya',
    desc: 'Private day trip to the iconic all-wood temple by the sea',
    discount: '8% OFF',
    code: 'TRUTH8',
    validUntil: 'Jul 31, 2026',
    minPax: 1,
    img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&q=80',
    hot: false,
    href: '/tours/sanctuary-of-truth-pattaya',
  },
  {
    id: 'group-minivan',
    type: 'transfer',
    title: 'Group Minivan Discount',
    desc: 'Book a minivan for 6+ passengers and save on any route',
    discount: '15% OFF',
    code: 'GROUP15',
    validUntil: 'Dec 31, 2026',
    minPax: 6,
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    hot: false,
    href: '/booking',
  },
];

/* ── Copy button component ────────────────────────────────────────────────── */

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-brand-400 hover:bg-brand-50 transition-all group w-full"
    >
      <span className="font-mono text-sm font-bold text-gray-800 flex-1 text-left tracking-wider">{code}</span>
      {copied
        ? <Check className="w-4 h-4 text-green-500 shrink-0" />
        : <Copy className="w-4 h-4 text-gray-400 group-hover:text-brand-600 shrink-0 transition-colors" />
      }
    </button>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function DealsPage() {
  const [activeCategory, setActiveCategory] = useState('');
  const { openModal } = useAuthModal();

  const filtered = activeCategory
    ? DEALS.filter(d => d.type === activeCategory)
    : DEALS;

  const featured = DEALS.find(d => d.hot) ?? DEALS[0];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-14" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #e53e3e, transparent)' }} />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-bold uppercase tracking-widest">Limited Time Offers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
              Deals &amp; Offers
            </h1>
            <p className="text-white/60 text-base max-w-xl mb-8">
              Exclusive discount codes for Thailand private transfers, day trips and attractions. Copy the code and apply at checkout.
            </p>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Featured deal banner ──────────────────────────────────────── */}
          {!activeCategory && (
            <div className="relative rounded-3xl overflow-hidden mb-10 shadow-xl">
              <div className="relative h-56 sm:h-72">
                <Image
                  src={featured.img}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" /> HOT DEAL
                  </span>
                  <span className="bg-white/90 text-gray-900 text-xs font-black px-3 py-1 rounded-full">{featured.discount}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{featured.title}</h2>
                <p className="text-white/70 text-sm mb-5 max-w-sm">{featured.desc}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 border border-dashed border-white/40 rounded-xl px-4 py-2">
                    <span className="font-mono font-bold text-white tracking-widest text-sm">{featured.code}</span>
                    <Tag className="w-4 h-4 text-white/60" />
                  </div>
                  {featured.href.startsWith('/auth/') ? (
                    <button
                      type="button"
                      onClick={() => openModal('register')}
                      className="flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Claim offer <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      href={featured.href}
                      className="flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Book now <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Result count ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{filtered.length}</span> deal{filtered.length !== 1 ? 's' : ''} available
            </p>
            {activeCategory && (
              <button onClick={() => setActiveCategory('')} className="text-sm text-brand-600 hover:underline font-medium">
                Clear filter
              </button>
            )}
          </div>

          {/* ── Deals grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(deal => (
              <article
                key={deal.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={deal.img}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {deal.hot && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" /> HOT
                      </span>
                    )}
                    <span className="bg-white text-gray-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">{deal.discount}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-600 capitalize">{deal.type}</div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{deal.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{deal.desc}</p>

                  {/* Validity */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Valid until <span className="text-gray-600 font-medium">{deal.validUntil}</span></span>
                    {deal.minPax > 1 && <span className="ml-auto text-gray-400">Min. {deal.minPax} pax</span>}
                  </div>

                  {/* Code + CTA */}
                  <CopyCodeButton code={deal.code} />
                  {deal.href.startsWith('/auth/') ? (
                    <button
                      type="button"
                      onClick={() => openModal('register')}
                      className="mt-2 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors w-full"
                    >
                      Claim offer <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      href={deal.href}
                      className="mt-2 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                    >
                      Book now <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* ── Partner CTA ──────────────────────────────────────────────── */}
          <div className="mt-14 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl px-8 py-10 text-center text-white">
            <Star className="w-8 h-8 text-white/50 mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold mb-2">Want exclusive partner deals?</h2>
            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
              Join the Werest Affiliate Program and earn commission on every booking you refer — plus get access to exclusive partner-only discount codes.
            </p>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm"
            >
              Learn about our partner program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
