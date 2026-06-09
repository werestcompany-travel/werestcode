'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useLocale } from '@/context/LocaleContext';
import { Search, Star, ChevronRight, ChevronLeft, Heart, MapPin, Tag } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
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
const DESTINATION_CHIPS = [
  { name: 'Bangkok',     img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=120&q=70', count: '320+' },
  { name: 'Phuket',      img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=120&q=70', count: '180+' },
  { name: 'Chiang Mai',  img: 'https://images.unsplash.com/photo-1512553402468-0f82eb1ff5f5?w=120&q=70', count: '95+'  },
  { name: 'Pattaya',     img: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=120&q=70', count: '110+' },
  { name: 'Krabi',       img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=120&q=70', count: '60+'  },
  { name: 'Koh Samui',   img: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=120&q=70', count: '75+'  },
  { name: 'Ayutthaya',   img: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=120&q=70', count: '40+'  },
  { name: 'Hua Hin',     img: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=120&q=70', count: '50+'  },
];

const SECTION_GROUPS = [
  { key: 'unmissable',  labelKey: 'attr.sec.unmissable', badge: '🔥', categories: ['Theme Parks', 'Water Parks', 'Cable Cars', 'Observation Decks'] },
  { key: 'cultural',    labelKey: 'attr.sec.cultural',   badge: '🏯', categories: ['Museums', 'Historical Sites', 'Parks & Gardens'] },
  { key: 'fun',         labelKey: 'attr.sec.fun',        badge: '🎉', categories: ['Playgrounds', 'Indoor Games', 'Zoos & Aquariums'] },
  { key: 'shows',       labelKey: 'attr.sec.shows',      badge: '🎭', categories: ['Events & Shows', 'Attraction Passes'] },
];

const PROMO_CODES = [
  { code: 'SAVE20', pct: '20% off', desc: 'No min. spend', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { code: 'FIRST15', pct: '15% off', desc: 'First booking', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { code: 'SUMMER10', pct: '10% off', desc: 'Summer deal', color: 'bg-green-50 border-green-200 text-green-700' },
  { code: 'VIP25', pct: '25% off', desc: 'Members only', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

/* ─── HorizontalScroll wrapper ───────────────────────────────────────────── */
function HScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') => {
    ref.current?.scrollBy({ left: dir === 'r' ? 540 : -540, behavior: 'smooth' });
  };
  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll('l')}
        className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-[#2534ff] hover:border-[#2534ff] transition-all opacity-0 group-hover/scroll:opacity-100"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll('r')}
        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-[#2534ff] hover:border-[#2534ff] transition-all opacity-0 group-hover/scroll:opacity-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <div
        ref={ref}
        className={`flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── ActivityCard ───────────────────────────────────────────────────────── */
function ActivityCard({
  a, wishlisted, onToggleWishlist, onView,
}: {
  a: Attraction; wishlisted: boolean;
  onToggleWishlist: (a: Attraction) => void;
  onView: (a: Attraction) => void;
}) {
  const { t } = useLocale();
  const [imgErr, setImgErr] = useState(false);
  const showImg = a.featureImage && !imgErr;
  const discount = a.originalPrice ? Math.round((1 - a.price / a.originalPrice) * 100) : 0;

  return (
    <Link
      href={a.href}
      onClick={() => a.href !== '#' && onView(a)}
      className="group relative shrink-0 w-[200px] sm:w-[220px] lg:w-[256px] flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-[148px] lg:h-[168px] overflow-hidden bg-gray-100 shrink-0">
        {showImg ? (
          <Image src={a.featureImage!} alt={a.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgErr(true)} sizes="256px" />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${a.gradient}`} />
            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40 select-none">{a.emoji}</div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Badge */}
        {a.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">{a.badge}</span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-8 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-500 text-white">-{discount}%</span>
        )}
        {/* Wishlist */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); onToggleWishlist(a); }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${wishlisted ? 'bg-red-500/90' : 'bg-black/20 hover:bg-black/40'}`}
        >
          <Heart className={`w-3 h-3 ${wishlisted ? 'fill-white text-white' : 'text-white'}`} />
        </button>
        {/* Location */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
          <MapPin className="w-2.5 h-2.5" />{a.location}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{a.category}</p>
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2534ff] transition-colors min-h-[2.6rem]">{a.name}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-gray-800">{a.rating}</span>
          <span className="text-[10px] text-gray-400">({a.reviewCount})</span>
        </div>
        <div className="mt-auto pt-2 border-t border-gray-50">
          <p className="text-[9px] text-gray-400 uppercase tracking-wide">{t('attr.fromPrice')}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-base font-extrabold text-gray-900">฿{a.price.toLocaleString()}</p>
            {a.originalPrice && <p className="text-xs text-gray-400 line-through">฿{a.originalPrice.toLocaleString()}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Section row ────────────────────────────────────────────────────────── */
function ActivitySection({
  labelKey, badge, attractions, wishlisted, onToggleWishlist, onView,
}: {
  labelKey: string; badge: string; attractions: Attraction[];
  wishlisted: Set<string>;
  onToggleWishlist: (a: Attraction) => void;
  onView: (a: Attraction) => void;
}) {
  const { t } = useLocale();
  if (attractions.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-lg">{badge}</span>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{t(labelKey)}</h2>
        </div>
        <Link href="#" className="flex items-center gap-1 text-sm font-semibold text-[#2534ff] hover:underline whitespace-nowrap">
          {t('attr.seeAll')} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <HScroll className="px-4 sm:px-6 lg:px-8 pb-2">
        {attractions.map(a => (
          <ActivityCard key={a.id} a={a} wishlisted={wishlisted.has(a.slug)} onToggleWishlist={onToggleWishlist} onView={onView} />
        ))}
        <div className="shrink-0 w-1" aria-hidden />
      </HScroll>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AttractionsPage() {
  const { openModal } = useAuthModal();
  const { t } = useLocale();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const [search,        setSearch]        = useState('');
  const [wishlistSlugs, setWishlistSlugs] = useState<Set<string>>(new Set());
  const [userId,        setUserId]        = useState<string | null>(null);
  const [attractions,   setAttractions]   = useState<Attraction[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [showAll,       setShowAll]       = useState(false);
  const [activeChip,    setActiveChip]    = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attractions')
      .then(r => r.json())
      .then(d => setAttractions(d.attractions ?? []))
      .finally(() => setLoading(false));
    Promise.all([
      fetch('/api/user/me').then(r => r.json()),
      fetch('/api/user/wishlist').then(r => r.json()),
    ]).then(([meData, wlData]) => {
      setUserId(meData.user?.id ?? null);
      setWishlistSlugs(new Set((wlData.items ?? []).map((i: { attractionId: string }) => i.attractionId)));
    });
  }, []);

  function handleView(a: Attraction) {
    addRecentlyViewed({ id: a.slug, name: a.name, location: a.location, price: a.price, rating: a.rating, gradient: a.gradient, emoji: a.emoji, href: a.href });
  }

  async function handleToggleWishlist(a: Attraction) {
    if (!userId) { openModal('email'); return; }
    const was = wishlistSlugs.has(a.slug);
    setWishlistSlugs(prev => { const n = new Set(prev); was ? n.delete(a.slug) : n.add(a.slug); return n; });
    if (was) {
      await fetch(`/api/user/wishlist?attractionId=${a.slug}`, { method: 'DELETE' });
    } else {
      await fetch('/api/user/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attractionId: a.slug, attractionName: a.name, attractionUrl: a.href }) });
    }
  }

  /* Filter by search + active chip */
  const filtered = attractions.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase());
    const matchChip   = !activeChip || a.location.toLowerCase().includes(activeChip.toLowerCase());
    return matchSearch && matchChip;
  });

  /* Group by section */
  const sectionData = SECTION_GROUPS.map(sg => ({
    key:      sg.key,
    labelKey: sg.labelKey,
    badge:    sg.badge,
    items:    filtered.filter(a => sg.categories.includes(a.category)).slice(0, 10),
  }));

  /* All-mode grid (when "Explore all" clicked or search active) */
  const showGrid = showAll || search.length > 0;

  return (
    <>
      <Navbar transparent />

      {/* ── HERO (unchanged) ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl">
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-5">
              <Link href="/" className="hover:text-gray-600">{t('nav.home')}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700 font-medium">{t('attr.breadcrumb')}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {t('attr.hero.title')}
            </h1>
            <p className="text-gray-500 mb-6">{t('attr.hero.sub')}</p>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setShowAll(true); }}
                placeholder={t('attr.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#2534ff] focus:outline-none text-sm bg-white shadow-sm transition-colors"
              />
              {search && (
                <button onClick={() => { setSearch(''); setShowAll(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="bg-white min-h-screen">

        {/* ── DESTINATION CHIPS ─────────────────────────────────────────── */}
        <div className="border-b border-gray-100 py-5">
          <HScroll className="px-4 sm:px-6 lg:px-8">
            {DESTINATION_CHIPS.map(d => (
              <button
                key={d.name}
                type="button"
                onClick={() => setActiveChip(activeChip === d.name ? null : d.name)}
                className={`shrink-0 flex flex-col items-center gap-1.5 transition-all ${activeChip === d.name ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
              >
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 transition-all ${activeChip === d.name ? 'ring-[#2534ff] ring-offset-2' : 'ring-transparent'}`}>
                  <Image src={d.img} alt={d.name} fill className="object-cover" sizes="64px" unoptimized />
                </div>
                <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{d.name}</p>
                <p className="text-[10px] text-gray-400">{d.count}</p>
              </button>
            ))}
            <div className="shrink-0 w-1" aria-hidden />
          </HScroll>
        </div>

        {!showGrid ? (
          <div className="py-6 space-y-8">

            {/* ── CAROUSEL SECTIONS ─────────────────────────────────────── */}
            {loading ? (
              /* Skeleton */
              [1, 2, 3].map(s => (
                <div key={s} className="px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between mb-3">
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="shrink-0 w-[200px] lg:w-[256px] rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                        <div className="h-[148px] bg-gray-200" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-4 bg-gray-200 rounded w-4/5" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-5 bg-gray-200 rounded w-1/4 mt-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              sectionData.map(s => (
                <ActivitySection
                  key={s.key}
                  labelKey={s.labelKey}
                  badge={s.badge}
                  attractions={s.items}
                  wishlisted={wishlistSlugs}
                  onToggleWishlist={handleToggleWishlist}
                  onView={handleView}
                />
              ))
            )}

            {/* ── EXPLORE ALL CTA ───────────────────────────────────────── */}
            {!loading && (
              <div className="flex justify-center px-4 pt-2 pb-4">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="flex items-center gap-2 border-2 border-gray-800 text-gray-800 font-bold text-sm px-8 py-3 rounded-full hover:bg-gray-900 hover:text-white transition-colors"
                >
                  {t('attr.exploreAll')}
                </button>
              </div>
            )}

            {/* ── PROMO CODES ───────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 lg:px-8 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#2534ff]" />
                  <h2 className="text-base font-bold text-gray-900">{t('attr.promos')}</h2>
                </div>
                <button className="text-sm font-semibold text-[#2534ff] hover:underline">{t('attr.promos.viewAll')}</button>
              </div>
              <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
                {PROMO_CODES.map(p => (
                  <div key={p.code} className={`shrink-0 border rounded-2xl px-4 py-3 min-w-[130px] ${p.color}`}>
                    <p className="text-lg font-extrabold leading-none">{p.pct}</p>
                    <p className="text-xs mt-1 opacity-70">{p.desc}</p>
                    <p className="text-[10px] font-mono font-bold mt-2 bg-white/50 rounded px-1.5 py-0.5 inline-block tracking-wider">{p.code}</p>
                  </div>
                ))}
                <div className="shrink-0 w-1" aria-hidden />
              </div>
            </div>

            {/* ── POPULAR DESTINATIONS ──────────────────────────────────── */}
            <section className="px-4 sm:px-6 lg:px-8 pb-4">
              <h2 className="text-base font-bold text-gray-900 mb-3">{t('attr.popularDests')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {DESTINATION_CHIPS.map(d => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => { setActiveChip(d.name); setShowAll(true); }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
                  >
                    <Image src={d.img} alt={d.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="220px" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <p className="text-white font-bold text-sm leading-tight">{d.name}</p>
                      <p className="text-white/70 text-[10px]">{d.count} {t('attr.activities')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ── WHY BOOK WITH US ──────────────────────────────────────── */}
            <section className="mx-4 sm:mx-6 lg:mx-8 bg-gray-50 rounded-3xl p-6 sm:p-8 mb-4">
              <h2 className="text-lg font-extrabold text-gray-900 mb-5 text-center">{t('attr.whyBook')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { emoji: '⚡', titleKey: 'attr.why.instant.title', descKey: 'attr.why.instant.desc' },
                  { emoji: '📱', titleKey: 'attr.why.mobile.title',  descKey: 'attr.why.mobile.desc' },
                  { emoji: '🔒', titleKey: 'attr.why.secure.title',  descKey: 'attr.why.secure.desc' },
                ].map(item => (
                  <div key={item.titleKey} className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">{item.emoji}</div>
                    <h3 className="font-bold text-gray-900 text-sm">{t(item.titleKey)}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{t(item.descKey)}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        ) : (

          /* ── ALL-GRID VIEW ────────────────────────────────────────────── */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeChip ? `${activeChip} ${t('attr.experiences')}` : search ? `${t('attr.results')} "${search}"` : t('attr.allExp')}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">{filtered.length} {t('attr.activities')}</p>
              </div>
              {(showAll && !search) && (
                <button
                  type="button"
                  onClick={() => { setShowAll(false); setActiveChip(null); }}
                  className="text-sm font-semibold text-[#2534ff] hover:underline flex items-center gap-1"
                >
                  {t('attr.back')}
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-40 bg-gray-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🔍</p>
                <p className="font-semibold text-gray-600">{t('attr.noActivities')}</p>
                <p className="text-sm mt-1">{t('attr.noActivitiesSub')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(a => (
                  <ActivityCard
                    key={a.id} a={a}
                    wishlisted={wishlistSlugs.has(a.slug)}
                    onToggleWishlist={handleToggleWishlist}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
