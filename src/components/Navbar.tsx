'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu, X, User, Heart, LogOut, ChevronDown, ChevronRight,
  BookOpen, Search, Headphones, Trash2, TrendingUp,
  Car, Compass, Ticket, Ship, Users, Tag, Gift, Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Gold coin SVG icon ──────────────────────────────────────────────────── */
function CoinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="none" aria-label="Loyalty coins">
      <circle cx="9" cy="9" r="8.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
      <circle cx="9" cy="9" r="6" fill="none" stroke="#FDE68A" strokeWidth="1.5" opacity="0.7" />
      <text x="9" y="12.8" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#78350F" fontFamily="system-ui,sans-serif">฿</text>
    </svg>
  );
}
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';
import { useAuthModal } from '@/context/AuthModalContext';
import LocaleCurrencyModal from './LocaleCurrencyModal';

const LANGUAGES: { code: Lang; label: string; flagSrc: string; native: string }[] = [
  { code: 'EN', flagSrc: 'https://flagcdn.com/w40/gb.png',  label: 'English', native: 'English'  },
  { code: 'TH', flagSrc: 'https://flagcdn.com/w40/th.png',  label: 'Thai',    native: 'ภาษาไทย' },
  { code: 'ZH', flagSrc: 'https://flagcdn.com/w40/cn.png',  label: 'Chinese', native: '中文'     },
];

const CURRENCIES: { code: Currency; name: string; flag: string }[] = [
  { code: 'THB', name: 'Thai Baht',         flag: '🇹🇭' },
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',              flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     flag: '🇬🇧' },
  { code: 'CNY', name: 'Chinese Yuan',      flag: '🇨🇳' },
  { code: 'JPY', name: 'Japanese Yen',      flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar',  flag: '🇸🇬' },
];

const SEARCH_PLACEHOLDERS = [
  'Things to do in Phuket',
  'Temple tour Bangkok',
  'Airport transfer Bangkok',
];

const POPULAR_SUGGESTIONS = [
  'bangkok', 'phuket', 'chiang mai', 'pattaya', 'krabi',
  'koh samui', 'ayutthaya', 'hua hin', 'sanctuary of truth',
];

const TOP_SEARCHES = [
  { rank: 1, title: 'The Sanctuary of Truth Ticket in Pattaya',          location: 'Pattaya',          price: 'From ฿499',   img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=80&q=80' },
  { rank: 2, title: 'Phi Phi Islands Speedboat Day Trip from Phuket',     location: 'Phuket',           price: 'From ฿1,290', img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=80&q=80' },
  { rank: 3, title: 'Damnoen Saduak & Maeklong Railway Market Day Tour',  location: 'Samut Songkhram',  price: 'From ฿950',   img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=80&q=80' },
  { rank: 4, title: 'Elephant Nature Park Half-Day Experience',           location: 'Chiang Mai',       price: 'From ฿1,800', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&q=80' },
];

const TRENDING_DESTINATIONS = [
  { rank: 1, name: 'Bangkok',    desc: 'Iconic landmarks | History and culture | Nightlife',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=80&q=80' },
  { rank: 2, name: 'Phuket',     desc: 'Beach paradise | Island hopping | Water sports',       img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=80&q=80' },
  { rank: 3, name: 'Chiang Mai', desc: 'Temples & culture | Night markets | Trekking',         img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&q=80' },
  { rank: 4, name: 'Pattaya',    desc: 'Beach getaway | Bucket list destination | Family fun', img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=80&q=80' },
];

const MOBILE_TRAVEL_OPTION_KEYS = [
  { labelKey: 'svc.transfer',    Icon: Car,     href: '/transfers'    },
  { labelKey: 'svc.tours',       Icon: Compass, href: '/tours'        },
  { labelKey: 'svc.attractions', Icon: Ticket,  href: '/attractions'  },
  { labelKey: 'svc.group',       Icon: Users,   href: '/group-booking'},
  { labelKey: 'svc.deals',       Icon: Tag,     href: '/deals'        },
];

const NAV_LINK_KEYS = [
  { labelKey: 'nav.transfers',  href: '/transfers'   },
  { labelKey: 'nav.thingsToDo', href: '/attractions' },
];

export default function Navbar({
  transparent = false,
}: {
  transparent?: boolean;
}) {
  const { lang, currency, setLang, setCurrency, t } = useLocale();
  const router   = useRouter()
  const pathname = usePathname();
  const { openModal, user, setUser } = useAuthModal();

  /* ── Desktop state ── */
  const [userMenuOpen,        setUserMenuOpen]        = useState(false);
  const [scrolled,            setScrolled]            = useState(false);
  const [navHidden,           setNavHidden]           = useState(false);
  const [searchQ,             setSearchQ]             = useState('');
  const [searchFocused,       setSearchFocused]       = useState(false);
  const [phIdx,               setPhIdx]               = useState(0);
  const [phFading,            setPhFading]            = useState(false);
  const [searchHistory,       setSearchHistory]       = useState<string[]>([]);
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);

  /* ── Mobile menu state ── */
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  /* ── Locale modal state ── */
  const [localeModalOpen, setLocaleModalOpen] = useState(false);
  const [localeModalTab, setLocaleModalTab]   = useState<'language' | 'currency'>('language');

  const userMenuRef    = useRef<HTMLDivElement>(null);
  const lastScrollY    = useRef(0);

  /* ── Open / close mobile menu with animation ── */
  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => setTimeout(() => setMobileMenuVisible(true), 10));
  };
  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 220);
  };

  /* ── Lock body scroll while mobile menu open ── */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setNavHidden(false);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhFading(true);
      setTimeout(() => {
        setPhIdx(i => (i + 1) % SEARCH_PLACEHOLDERS.length);
        setPhFading(false);
      }, 350);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('werest_search_history');
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', { method: 'DELETE' });
    } catch {}
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) {
      const updated = [q, ...searchHistory.filter(h => h !== q)].slice(0, 8);
      setSearchHistory(updated);
      try { localStorage.setItem('werest_search_history', JSON.stringify(updated)); } catch {}
      router.push(`/results?q=${encodeURIComponent(q)}`);
      setSearchQ('');
      setSearchFocused(false);
    }
  };

  const handleSearchChipClick = (term: string) => {
    const updated = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8);
    setSearchHistory(updated);
    try { localStorage.setItem('werest_search_history', JSON.stringify(updated)); } catch {}
    router.push(`/results?q=${encodeURIComponent(term)}`);
    setSearchFocused(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try { localStorage.removeItem('werest_search_history'); } catch {}
  };

  // Text/icon colour: white only when transparent AND not yet scrolled (dark hero behind nav)
  // Once scrolled (white bg) or on non-transparent pages → dark text
  const useWhite = transparent && !scrolled;
  const isDark = transparent && !scrolled;
  const activeLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  /* ── Shared search dropdown ── */
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 mt-2 w-[min(620px,92vw)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
      <div className="p-4 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

        {searchHistory.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">{t('search.history')}</span>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={clearHistory}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Clear search history">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map(h => (
                <button key={h} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSearchChipClick(h)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white">
                  <TrendingUp className="w-3 h-3 text-gray-400 shrink-0" />{h}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">{t('search.othersTravelled')}</p>
          <div className="flex flex-wrap gap-2">
            {(showMoreSuggestions ? POPULAR_SUGGESTIONS : POPULAR_SUGGESTIONS.slice(0, 6)).map(s => (
              <button key={s} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSearchChipClick(s)}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white capitalize">
                {s}
              </button>
            ))}
            {!showMoreSuggestions && POPULAR_SUGGESTIONS.length > 6 && (
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowMoreSuggestions(true)}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('search.topSearches')}</p>
            </div>
            <div className="flex flex-col gap-2">
              {TOP_SEARCHES.map(item => (
                <button key={item.rank} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSearchChipClick(item.title)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left w-full group">
                  <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{item.rank}</span>
                  <img src={item.img} alt={item.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">{item.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-gray-400 truncate">{item.location}</span>
                      <span className="text-[10px] font-semibold text-orange-500 shrink-0 ml-1">{item.price}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{t('search.trending')}</p>
            </div>
            <div className="flex flex-col gap-2">
              {TRENDING_DESTINATIONS.map(dest => (
                <button key={dest.rank} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSearchChipClick(dest.name)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left w-full group">
                  <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{dest.rank}</span>
                  <img src={dest.img} alt={dest.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">{dest.name}</p>
                    <p className="text-[10px] text-gray-400 leading-tight truncate mt-0.5">{dest.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <Fragment>
      {/* ════════════════════════════════════════════════════════════
          TOP UTILITY BAR — desktop only, overlays hero
      ════════════════════════════════════════════════════════════ */}
      <div className={`hidden lg:block fixed top-2 left-0 right-0 z-[51] transition-opacity duration-300 ${(!transparent || scrolled) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-3 lg:px-6">
          <div className="flex items-center justify-end gap-5 h-8 rounded-xl text-white/80 text-xs font-medium">
            <Link href="/deals" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Gift className="w-3.5 h-3.5" />
              Deals &amp; Promo
            </Link>
            <span className="w-px h-3 bg-white/30" />
            <Link href="/contact" className="hover:text-white transition-colors">Partner with Werest</Link>
            <span className="w-px h-3 bg-white/30" />
            <Link href="/group-booking" className="hover:text-white transition-colors">Group Tours</Link>
            <span className="w-px h-3 bg-white/30" />
            {/* Language / currency switcher */}
            {(() => {
              const FLAG_MAP: Record<string, string> = {
                EN: 'https://flagcdn.com/w40/gb.png',
                TH: 'https://flagcdn.com/w40/th.png',
                ZH: 'https://flagcdn.com/w40/cn.png',
              };
              return (
                <button
                  type="button"
                  onClick={() => { setLocaleModalOpen(true); setLocaleModalTab('language'); }}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <img src={FLAG_MAP[lang] ?? FLAG_MAP['EN']} alt={lang} className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                  <span>{lang}</span>
                  <span className="text-white/30">|</span>
                  <span>{currency}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MAIN NAVBAR — pushed down by 32px when top bar visible
      ════════════════════════════════════════════════════════════ */}
      <header className={`fixed left-0 right-0 z-50 h-16 transition-all duration-300 ease-in-out ${navHidden ? '-translate-y-full' : 'translate-y-0'} ${transparent && !scrolled ? 'top-0 lg:top-8' : 'top-0'}`}>

        {/* White background — shown when scrolled OR on non-transparent pages */}
        <div className={cn(
          'absolute inset-0 bg-white border-b border-gray-200 shadow-sm transition-opacity duration-300 pointer-events-none',
          (!transparent || scrolled) ? 'opacity-100' : 'opacity-0',
        )} />

        <nav className="relative z-10 h-full">
        <div className="max-w-7xl mx-auto h-full flex items-center px-3 lg:px-6">

          {/* ─── MOBILE (< lg) — Klook-style: [≡ + logo] [spacer] [search + user] ─── */}
          <div className="lg:hidden flex items-center flex-1 min-w-0">

            {/* LEFT: hamburger + logo side by side */}
            <button type="button" onClick={openMobileMenu} aria-label="Menu"
              className={`p-2 rounded-lg transition-colors shrink-0 ${useWhite ? 'text-white hover:text-white' : 'text-gray-700 hover:text-brand-600'}`}>
              <Menu className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </button>
            <Link href="/" aria-label="Werest home" className="ml-1 shrink-0">
              <Image src="/images/logo.png" alt="Werest Travel" height={28} width={94} priority
                className={`object-contain transition-all duration-300 ${useWhite ? 'brightness-0 invert' : ''}`} />
            </Link>

            {/* SPACER */}
            <div className="flex-1" />
            {user ? (
              <Link href="/account" className="p-2 rounded-lg shrink-0" aria-label="Account">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </Link>
            ) : (
              <button type="button" onClick={() => openModal()} aria-label="Sign in"
                className={`p-2 rounded-lg transition-colors shrink-0 ${useWhite ? 'text-white hover:text-white' : 'text-gray-600 hover:text-brand-600'}`}>
                <User className="w-[22px] h-[22px]" strokeWidth={1.6} />
              </button>
            )}

          </div>

          {/* ─── DESKTOP (lg+) ─── */}

          <Link href="/" className="hidden lg:flex items-center shrink-0 mr-4">
            <Image src="/images/logo.png" alt="Werest Travel" height={36} width={120} priority
              className={`object-contain transition-all duration-300 ${useWhite ? 'brightness-0 invert' : ''}`} />
          </Link>

          {/* Primary nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINK_KEYS.map(link => (
              <Link key={link.href} href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${useWhite ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block flex-1" />

          <div className="hidden lg:flex items-center gap-1.5">



            {/* Recently viewed / Bookings */}
            <Link href="/tracking"
              className={`text-sm font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${useWhite ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
              {t('nav.bookings')}
            </Link>

            {user ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${useWhite ? 'text-white/90 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}>
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      {user.loyaltyPoints != null && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2534ff]">
                            💎 {user.loyaltyPoints.toLocaleString()} pts
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      <User className="w-4 h-4" /> {t('nav.account')}
                    </Link>
                    <Link href="/account?tab=wishlist" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      <Heart className="w-4 h-4" /> {t('nav.wishlist')}
                    </Link>
                    <Link href="/account?tab=bookings" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      <BookOpen className="w-4 h-4" /> {t('nav.bookings')}
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={async () => { setUserMenuOpen(false); await handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center ml-1">
                {/* Combined Sign up / Log in button */}
                <button type="button" onClick={() => openModal('email')}
                  className="text-sm font-bold px-5 py-1.5 rounded-full transition-colors whitespace-nowrap bg-[#2534ff] hover:bg-[#1a27e0] text-white">
                  Sign up / Log in
                </button>
              </div>
            )}
          </div>

        </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN MENU OVERLAY  (md: hidden)
      ════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className={cn(
            'fixed inset-0 z-[200] bg-white flex flex-col lg:hidden transition-all duration-200 ease-out',
            mobileMenuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3',
          )}
        >
          {/* ── Overlay header (mirrors main nav) ── */}
          <div className="h-16 shrink-0 border-b border-gray-100 px-3 lg:px-6">
          <div className="max-w-7xl mx-auto h-full flex items-center gap-2">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center shrink-0 -ml-[5px]">
              <Image src="/images/logo.png" alt="Werest Travel" height={32} width={106} priority className="object-contain" />
            </Link>
            <button type="button" onClick={() => { router.push('/results'); closeMobileMenu(); }}
              className="flex-1 min-w-0 flex items-center gap-2 rounded-full px-4 h-[42px] bg-gray-100 border border-transparent"
              aria-label="Search">
              <Search className="w-[18px] h-[18px] shrink-0 text-gray-400" />
              <span className="text-[15px] font-normal text-gray-400 truncate">{t('nav.whereTo')}</span>
            </button>
            {user ? (
              <Link href="/account" onClick={closeMobileMenu} className="p-1.5 rounded-lg shrink-0">
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </Link>
            ) : (
              <button type="button" onClick={() => openModal()} aria-label="Sign in"
                className="p-1.5 rounded-lg text-gray-600 shrink-0">
                <User className="w-[22px] h-[22px]" strokeWidth={1.6} />
              </button>
            )}
            <button type="button" onClick={closeMobileMenu} aria-label="Close menu"
              className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors shrink-0">
              <X className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </button>
          </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-10">

            {/* ── Savings / Account card ── */}
            <div className="mx-4 mt-5">
              {!user ? (
                <div className="bg-[#eef2ff] rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3">
                    {t('nav.accessSavings')}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">{t('nav.savingsPerks1')}</span>
                    <span className="text-gray-300 hidden xs:block">|</span>
                    <span className="flex items-center gap-1.5">{t('nav.savingsPerks2')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/tracking" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-brand-600 text-brand-600 font-bold text-sm">
                      {t('nav.searchBookings')}
                    </Link>
                    <button type="button" onClick={() => { openModal('register'); closeMobileMenu(); }}
                      className="flex items-center justify-center h-11 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
                      {t('nav.signInRegister')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#eef2ff] rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-[15px]">{user.name}</p>
                      {user.loyaltyPoints != null && (
                        <CoinIcon className="w-4 h-4 mt-0.5" />
                      )}
                    </div>
                    {user.loyaltyPoints != null && (
                      <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2534ff]">
                        💎 {user.loyaltyPoints.toLocaleString()} pts
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/account" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-brand-600 text-brand-600 font-bold text-sm">
                      {t('nav.myAccount')}
                    </Link>
                    <Link href="/account?tab=bookings" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
                      {t('nav.myBookings')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Settings ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">{t('nav.settings')}</p>

              {/* Language row */}
              <button type="button" onClick={() => { closeMobileMenu(); setTimeout(() => { setLocaleModalOpen(true); setLocaleModalTab('language'); }, 230); }}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <img src={activeLang.flagSrc} alt={activeLang.label} className="w-7 h-5 object-cover rounded shrink-0" />
                <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{activeLang.native} (Thailand)</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Currency row */}
              {(() => {
                const activeCurr = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];
                return (
                  <button type="button" onClick={() => { closeMobileMenu(); setTimeout(() => { setLocaleModalOpen(true); setLocaleModalTab('currency'); }, 230); }}
                    className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                    <span className="text-2xl leading-none shrink-0">{activeCurr.flag}</span>
                    <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{currency} — {activeCurr.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })()}

            </div>

            {/* ── Travel options ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">{t('nav.travelOptions')}</p>
              {MOBILE_TRAVEL_OPTION_KEYS.map(({ labelKey, Icon, href }) => (
                <Link key={href} href={href} onClick={closeMobileMenu}
                  className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-700 shrink-0" />
                  <span className="flex-1 text-[15px] text-gray-800 font-medium">{t(labelKey)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>

            {/* ── More ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">{t('nav.more')}</p>

              <Link href="/blog" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Newspaper className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Blog</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link href="/help-center" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Search className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">{t('nav.helpCenter')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link href="/contact" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Headphones className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">{t('nav.contactUs')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link href="/tracking" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <BookOpen className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">{t('nav.manageBookings')}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>


              {user && (
                <button type="button" onClick={async () => { closeMobileMenu(); await handleLogout(); }}
                  className="flex items-center gap-3 w-full py-4 active:bg-red-50">
                  <LogOut className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="flex-1 text-left text-[15px] text-red-500 font-medium">{t('nav.signOut')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Language & Currency Modal ── */}
      <LocaleCurrencyModal
        open={localeModalOpen}
        tab={localeModalTab}
        onClose={() => setLocaleModalOpen(false)}
        onTabChange={setLocaleModalTab}
      />
    </Fragment>
  );
}
