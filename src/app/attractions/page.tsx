'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RecentlyViewed from '@/components/RecentlyViewed';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Search, Star, ChevronRight, Zap, Smartphone, Heart } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Badge = 'Sale' | 'Hot deal' | 'Likely to sell out' | 'Exclusive' | 'New' | 'Limited';

interface Attraction {
  id: string;
  slug: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: string;
  price: number;
  originalPrice?: number | null;
  badge?: string | null;
  gradient: string;
  emoji: string;
  category: string;
  href: string;
  featureImage?: string | null;
}

/* ─── Static data ────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Theme Parks',       emoji: '🎢', color: 'bg-orange-50  text-orange-600'  },
  { label: 'Water Parks',       emoji: '💦', color: 'bg-blue-50    text-blue-600'    },
  { label: 'Museums',           emoji: '🏛️', color: 'bg-purple-50  text-purple-600'  },
  { label: 'Parks & Gardens',   emoji: '🌿', color: 'bg-green-50   text-green-600'   },
  { label: 'Zoos & Aquariums',  emoji: '🦁', color: 'bg-yellow-50  text-yellow-700'  },
  { label: 'Cable Cars',        emoji: '🚡', color: 'bg-sky-50     text-sky-600'     },
  { label: 'Observation Decks', emoji: '🏙️', color: 'bg-indigo-50  text-indigo-600'  },
  { label: 'Historical Sites',  emoji: '🏯', color: 'bg-amber-50   text-amber-700'   },
  { label: 'Playgrounds',       emoji: '🎠', color: 'bg-pink-50    text-pink-600'    },
  { label: 'Indoor Games',      emoji: '🎮', color: 'bg-violet-50  text-violet-600'  },
  { label: 'Attraction Passes', emoji: '🎫', color: 'bg-teal-50    text-teal-600'    },
  { label: 'Events & Shows',    emoji: '🎭', color: 'bg-rose-50    text-rose-600'    },
];

const POPULAR_DESTINATIONS = [
  { name: 'Bangkok',     emoji: '🏙️', count: '320+ activities', gradient: 'from-orange-500 to-rose-500'   },
  { name: 'Phuket',      emoji: '🏝️', count: '180+ activities', gradient: 'from-cyan-500 to-blue-600'     },
  { name: 'Chiang Mai',  emoji: '🌿', count: '95+ activities',  gradient: 'from-green-500 to-teal-600'    },
  { name: 'Pattaya',     emoji: '🎡', count: '110+ activities', gradient: 'from-purple-500 to-indigo-600' },
  { name: 'Krabi',       emoji: '🌊', count: '60+ activities',  gradient: 'from-teal-500 to-cyan-600'     },
  { name: 'Koh Samui',   emoji: '🌴', count: '75+ activities',  gradient: 'from-amber-500 to-orange-600'  },
];

const BADGE_STYLES: Record<string, string> = {
  'Sale':               'bg-red-500 text-white',
  'Hot deal':           'bg-orange-500 text-white',
  'Likely to sell out': 'bg-amber-500 text-white',
  'Exclusive':          'bg-brand-600 text-white',
  'New':                'bg-green-500 text-white',
  'Limited':            'bg-purple-500 text-white',
};

/* ─── AttractionCard ─────────────────────────────────────────────────────── */
function AttractionCard({
  a,
  wishlisted,
  onToggleWishlist,
  onView,
}: {
  a: Attraction;
  wishlisted: boolean;
  onToggleWishlist: (a: Attraction) => void;
  onView: (a: Attraction) => void;
}) {
  const discount = a.originalPrice ? Math.round((1 - a.price / a.originalPrice) * 100) : 0;
  const [imgError, setImgError] = useState(false);
  const showImage = a.featureImage && !imgError;

  return (
    <Link href={a.href} onClick={() => a.href !== '#' && onView(a)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer flex flex-col">

      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {showImage ? (
          <Image
            src={a.featureImage!}
            alt={a.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${a.gradient}`} />
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40 select-none group-hover:opacity-55 transition-opacity">
              {a.emoji}
            </div>
          </>
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {a.location}
        </div>
        {a.badge && (
          <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[a.badge] ?? 'bg-gray-700 text-white'}`}>
            {a.badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist(a); }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
            wishlisted ? 'bg-red-500/90 hover:bg-red-600' : 'bg-white/20 hover:bg-white/40'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? 'fill-white text-white' : 'text-white'}`} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{a.category}</span>
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors min-h-[2.5rem]">
          {a.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= Math.round(a.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">{a.rating}</span>
          <span className="text-xs text-gray-400">({a.reviewCount})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {['Instant confirmation', 'Mobile voucher'].map(t => (
            <span key={t} className="flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md">
              {t === 'Instant confirmation' ? <Zap className="w-2.5 h-2.5 text-brand-500" /> : <Smartphone className="w-2.5 h-2.5 text-brand-500" />}
              {t}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-gray-50">
          <p className="text-[10px] text-gray-400">from</p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-extrabold text-gray-900">฿{a.price.toLocaleString()}</p>
            {a.originalPrice && <p className="text-xs text-gray-400 line-through">฿{a.originalPrice.toLocaleString()}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AttractionsPage() {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [wishlistSlugs,  setWishlistSlugs]  = useState<Set<string>>(new Set());
  const [userId,         setUserId]         = useState<string | null>(null);
  const [attractions,    setAttractions]    = useState<Attraction[]>([]);
  const [loadingList,    setLoadingList]    = useState(true);

  function handleView(a: Attraction) {
    addRecentlyViewed({
      id:       a.slug,
      name:     a.name,
      location: a.location,
      price:    a.price,
      rating:   a.rating,
      gradient: a.gradient,
      emoji:    a.emoji,
      href:     a.href,
    });
  }

  useEffect(() => {
    // Load attractions from DB
    fetch('/api/attractions')
      .then(r => r.json())
      .then(d => setAttractions(d.attractions ?? []))
      .finally(() => setLoadingList(false));

    // Load user + wishlist
    Promise.all([
      fetch('/api/user/me').then(r => r.json()),
      fetch('/api/user/wishlist').then(r => r.json()),
    ]).then(([meData, wlData]) => {
      setUserId(meData.user?.id ?? null);
      const slugs = new Set<string>((wlData.items ?? []).map((i: { attractionId: string }) => i.attractionId));
      setWishlistSlugs(slugs);
    });
  }, []);

  async function handleToggleWishlist(a: Attraction) {
    if (!userId) { openModal('email'); return; }
    const wasWishlisted = wishlistSlugs.has(a.slug);
    setWishlistSlugs(prev => {
      const next = new Set(prev);
      wasWishlisted ? next.delete(a.slug) : next.add(a.slug);
      return next;
    });
    if (wasWishlisted) {
      await fetch(`/api/user/wishlist?attractionId=${a.slug}`, { method: 'DELETE' });
    } else {
      await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attractionId: a.slug, attractionName: a.name, attractionUrl: a.href }),
      });
    }
  }

  const filtered = attractions.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5">
              <Link href="/" className="hover:text-gray-600">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700 font-medium">Attractions Tickets</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              Discover the best theme parks,<br className="hidden sm:block" />
              museums and more must-sees
            </h1>
            <p className="text-gray-500 mb-6">Book skip-the-line tickets, tours and experiences across Thailand.</p>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search attractions, destinations…"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-sm bg-white shadow-sm transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          {/* ── CATEGORY FILTER ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Browse by category</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3">
              {CATEGORIES.map((c) => (
                <button key={c.label} onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150 cursor-pointer col-span-1 ${
                    activeCategory === c.label ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.color}`}>{c.emoji}</div>
                  <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── ATTRACTIONS LIST ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇹🇭</span>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Thailand</h2>
                  <p className="text-xs text-gray-500">{filtered.length} attractions</p>
                </div>
              </div>
              <button onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                Explore all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loadingList ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-200 rounded w-1/4 mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">No attractions found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(a => (
                  <AttractionCard key={a.id} a={a}
                    wishlisted={wishlistSlugs.has(a.slug)}
                    onToggleWishlist={handleToggleWishlist}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── RECENTLY VIEWED ── */}
          <RecentlyViewed className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100" />

          {/* ── POPULAR DESTINATIONS ── */}
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Popular destinations in Thailand</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {POPULAR_DESTINATIONS.map(d => (
                <button key={d.name} className="group relative rounded-2xl overflow-hidden cursor-pointer text-left" style={{ minHeight: 120 }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${d.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className="absolute top-3 right-3 text-3xl opacity-30 group-hover:opacity-50 transition-opacity select-none">{d.emoji}</div>
                  <div className="relative z-10 p-4 flex flex-col justify-end h-full" style={{ minHeight: 120 }}>
                    <p className="text-white font-extrabold text-base leading-tight">{d.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{d.count}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ── WHY BOOK WITH US ── */}
          <section className="bg-white rounded-3xl p-8 border border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center">Why book with Werest Travel?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: '⚡', title: 'Instant confirmation', desc: 'Get your voucher immediately after booking — no waiting.'  },
                { emoji: '📱', title: 'Mobile vouchers',      desc: 'Show your phone at the entrance — no printing needed.'    },
                { emoji: '🔒', title: 'Secure & trusted',     desc: 'SSL-encrypted payments. Trusted by 10,000+ travellers.'  },
              ].map(item => (
                <div key={item.title} className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl">{item.emoji}</div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
