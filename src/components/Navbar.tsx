'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, X, User, Heart, LogOut, ChevronDown, ChevronRight,
  BookOpen, Search, Headphones, Trash2, Clock, TrendingUp,
  Car, Compass, Ticket, Ship, Users, Tag, Gift, Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';
import { useAuthModal } from '@/context/AuthModalContext';

const LANGUAGES: { code: Lang; label: string; flagSrc: string; native: string }[] = [
  { code: 'EN', flagSrc: 'https://flagcdn.com/w40/gb.png',  label: 'English', native: 'English'  },
  { code: 'TH', flagSrc: 'https://flagcdn.com/w40/th.png',  label: 'Thai',    native: 'ภาษาไทย' },
  { code: 'ZH', flagSrc: 'https://flagcdn.com/w40/cn.png',  label: 'Chinese', native: '中文'     },
];

const CURRENCIES: { code: Currency; name: string }[] = [
  { code: 'USD', name: 'US Dollar'     },
  { code: 'EUR', name: 'Euro'          },
  { code: 'GBP', name: 'British Pound' },
  { code: 'THB', name: 'Thai Baht'     },
];

const SEARCH_PLACEHOLDERS = [
  'Things to do in Phuket',
  'Temple tour Bangkok',
  'Dinner cruise',
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

const TIER_CHIP: Record<string, string> = {
  EXPLORER:   'bg-gray-100 text-gray-600',
  ADVENTURER: 'bg-green-100 text-green-700',
  NAVIGATOR:  'bg-blue-100 text-blue-700',
  VOYAGER:    'bg-purple-100 text-purple-700',
};

const TRENDING_DESTINATIONS = [
  { rank: 1, name: 'Bangkok',    desc: 'Iconic landmarks | History and culture | Nightlife',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=80&q=80' },
  { rank: 2, name: 'Phuket',     desc: 'Beach paradise | Island hopping | Water sports',       img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=80&q=80' },
  { rank: 3, name: 'Chiang Mai', desc: 'Temples & culture | Night markets | Trekking',         img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&q=80' },
  { rank: 4, name: 'Pattaya',    desc: 'Beach getaway | Bucket list destination | Family fun', img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=80&q=80' },
];

const MOBILE_TRAVEL_OPTIONS = [
  { label: 'Private Transfers',  Icon: Car,     href: '/results'      },
  { label: 'Tours & Experiences',Icon: Compass, href: '/tours'        },
  { label: 'Attraction Tickets', Icon: Ticket,  href: '/attractions'  },
  { label: 'Cruises',            Icon: Ship,    href: '/cruises'      },
  { label: 'Group Tours',        Icon: Users,   href: '/group-booking'},
  { label: 'Deals & Offers',     Icon: Tag,     href: '/deals'        },
];

export default function Navbar({
  transparent = false,
  onHamburgerClick,
  onHamburgerHoverEnter,
}: {
  transparent?: boolean;
  onHamburgerClick?: () => void;
  onHamburgerHoverEnter?: () => void;
}) {
  const { lang, currency, setLang, setCurrency, t } = useLocale();
  const router = useRouter();
  const { openModal, user, setUser } = useAuthModal();

  /* ── Desktop state ── */
  const [userMenuOpen,        setUserMenuOpen]        = useState(false);
  const [localeOpen,          setLocaleOpen]          = useState(false);
  const [scrolled,            setScrolled]            = useState(false);
  const [navHidden,           setNavHidden]           = useState(false);
  const [searchQ,             setSearchQ]             = useState('');
  const [phIdx,               setPhIdx]               = useState(0);
  const [phFading,            setPhFading]            = useState(false);
  const [searchFocused,       setSearchFocused]       = useState(false);
  const [searchHistory,       setSearchHistory]       = useState<string[]>([]);
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);

  /* ── Mobile menu state ── */
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [langExpanded,      setLangExpanded]      = useState(false);
  const [currExpanded,      setCurrExpanded]      = useState(false);

  const userMenuRef    = useRef<HTMLDivElement>(null);
  const localeRef      = useRef<HTMLDivElement>(null);
  const searchWrapRef  = useRef<HTMLDivElement>(null);
  const lastScrollY    = useRef(0);

  /* ── Open / close mobile menu with animation ── */
  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => setTimeout(() => setMobileMenuVisible(true), 10));
  };
  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    setLangExpanded(false);
    setCurrExpanded(false);
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
      if (y > lastScrollY.current && y > 80) setNavHidden(true);
      else setNavHidden(false);
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
      if (userMenuRef.current   && !userMenuRef.current.contains(e.target as Node))   setUserMenuOpen(false);
      if (localeRef.current     && !localeRef.current.contains(e.target as Node))     setLocaleOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSearchFocused(false);
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

  const isDark = transparent && !scrolled;
  const activeLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  /* ── Shared search dropdown ── */
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 mt-2 w-[min(620px,92vw)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
      <div className="p-4 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

        {searchHistory.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Search history</span>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={clearHistory}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Clear search history">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map(h => (
                <button key={h} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSearchChipClick(h)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white">
                  <Clock className="w-3 h-3 text-gray-400 shrink-0" />{h}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Other travelers searched for</p>
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Top searches</p>
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
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Trending destinations</p>
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
          MAIN NAVBAR
      ════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}>

        <div className={cn(
          'absolute inset-0 bg-white border-b border-gray-200 shadow-sm transition-opacity duration-300 pointer-events-none',
          isDark ? 'opacity-0' : 'opacity-100',
        )} />

        <nav className="relative z-10 h-16 flex items-center gap-2 pl-3 pr-4">

          {/* ─── MOBILE (< md) ─── */}

          <Link href="/" className="flex items-center shrink-0 lg:hidden -ml-[5px]">
            <Image src="/images/logo.png" alt="Werest Travel" height={32} width={106} priority
              className={`object-contain transition-all duration-300 ${isDark ? 'brightness-0 invert' : ''}`} />
          </Link>

          <button type="button" onClick={() => router.push('/results')}
            className={cn('lg:hidden flex-1 min-w-0 flex items-center gap-2 rounded-full px-4 h-[42px] transition-all',
              isDark ? 'bg-white/15 border border-white/20' : 'bg-gray-100 border border-transparent')}
            aria-label="Search">
            <Search className={`w-[18px] h-[18px] shrink-0 ${isDark ? 'text-white/60' : 'text-gray-400'}`} />
            <span className={`text-[15px] font-normal truncate ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Where to?</span>
          </button>

          {/* Mobile user icon */}
          {user ? (
            <Link href="/account" className="lg:hidden p-1.5 rounded-lg shrink-0" aria-label="Account">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name[0].toUpperCase()}
              </div>
            </Link>
          ) : (
            <button type="button" onClick={() => openModal()} aria-label="Sign in"
              className={`lg:hidden p-1.5 rounded-lg transition-colors shrink-0 ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-100'}`}>
              <User className="w-[22px] h-[22px]" strokeWidth={1.6} />
            </button>
          )}

          {/* Mobile hamburger → opens full-screen menu */}
          <button type="button" onClick={openMobileMenu} aria-label="Menu"
            className={`lg:hidden p-1.5 rounded-lg transition-colors shrink-0 ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-100'}`}>
            <Menu className="w-[22px] h-[22px]" strokeWidth={1.8} />
          </button>

          {/* ─── DESKTOP (md+) ─── */}

          <button type="button" onClick={() => onHamburgerClick?.()} onMouseEnter={() => onHamburgerHoverEnter?.()}
            aria-label="Toggle sidebar"
            className={`hidden lg:flex p-2 rounded-lg transition-colors shrink-0 ${isDark ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-100'}`}>
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="hidden lg:flex items-center shrink-0 mr-1">
            <Image src="/images/logo.png" alt="Werest Travel" height={40} width={131} priority
              className={`object-contain transition-all duration-300 ${isDark ? 'brightness-0 invert' : ''}`} />
          </Link>

          <div ref={searchWrapRef} className="relative hidden lg:block ml-2 lg:ml-[38px] w-full max-w-[200px] lg:max-w-sm min-w-0">
            <form onSubmit={handleSearch}
              className={cn('flex items-center gap-2 border rounded-lg px-3 h-9 transition-all w-full',
                searchFocused ? 'border-brand-400 bg-white shadow-sm'
                  : isDark ? 'bg-white/10 border-white/25 focus-within:bg-white/20 focus-within:border-white/50'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300')}>
              <div className="relative flex-1 min-w-0 h-full flex items-center">
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} onFocus={() => setSearchFocused(true)}
                  className={`w-full bg-transparent text-sm outline-none ${isDark && !searchFocused ? 'text-white' : 'text-gray-700'}`} />
                {!searchQ && (
                  <span className={`absolute inset-0 flex items-center text-sm pointer-events-none select-none transition-opacity duration-[350ms] ${phFading ? 'opacity-0' : 'opacity-100'} ${isDark && !searchFocused ? 'text-white/50' : 'text-gray-400'}`}>
                    {SEARCH_PLACEHOLDERS[phIdx]}
                  </span>
                )}
              </div>
              <button type="submit" className={`shrink-0 transition-colors ${isDark && !searchFocused ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-brand-600'}`}>
                <Search className="w-4 h-4" />
              </button>
            </form>
            {searchFocused && <SearchDropdown />}
          </div>

          <div className="hidden lg:block flex-1" />

          <div className="hidden lg:flex items-center gap-0.5">

            <Link href="/tracking"
              className={`hidden lg:flex text-sm font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}>
              Manage bookings
            </Link>

            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`} target="_blank" rel="noopener noreferrer"
              className={`hidden lg:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}>
              <Headphones className="w-4 h-4 shrink-0" />Customer support
            </a>

            <div className="relative" ref={localeRef}>
              <button type="button" onClick={() => setLocaleOpen(!localeOpen)}
                className={`flex items-center gap-0.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                <img src={activeLang.flagSrc} alt={activeLang.label} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                <span className="text-gray-300 mx-0.5">|</span>
                <span>{currency}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ml-0.5 ${localeOpen ? 'rotate-180' : ''}`} />
              </button>

              {localeOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 z-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('locale.language')}</p>
                  <div className="flex flex-col gap-1 mb-4">
                    {LANGUAGES.map(l => (
                      <button key={l.code} type="button" onClick={() => { setLang(l.code); setLocaleOpen(false); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${lang === l.code ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <img src={l.flagSrc} alt={l.label} className="w-7 h-5 object-cover rounded shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{l.native}</p>
                          <p className={`text-xs leading-tight ${lang === l.code ? 'text-white/70' : 'text-gray-400'}`}>{l.label}</p>
                        </div>
                        {lang === l.code && (
                          <svg className="w-4 h-4 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('locale.currency')}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CURRENCIES.map(c => (
                      <button key={c.code} type="button" onClick={() => { setCurrency(c.code); setLocaleOpen(false); }}
                        className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-sm transition-colors ${currency === c.code ? 'bg-brand-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        <span className="font-bold">{c.code}</span>
                        <span className={`text-[11px] ${currency === c.code ? 'text-white/70' : 'text-gray-400'}`}>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                  {user.tierLevel && (
                    <span className={`hidden lg:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                      {user.tierLevel}
                    </span>
                  )}
                  {user.loyaltyPoints != null && (
                    <span className="hidden xl:inline text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {user.loyaltyPoints.toLocaleString()} pts
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform hidden lg:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      {(user.tierLevel || user.loyaltyPoints != null) && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {user.tierLevel && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>{user.tierLevel}</span>
                          )}
                          {user.loyaltyPoints != null && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{user.loyaltyPoints.toLocaleString()} pts</span>
                          )}
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
              <button type="button" onClick={() => openModal()}
                className="ml-1 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-3 lg:px-5 py-2 rounded-full transition-colors whitespace-nowrap shadow-sm">
                <span className="lg:hidden">Sign in</span>
                <span className="hidden lg:inline">Sign in / Register</span>
              </button>
            )}
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
          <div className="h-16 flex items-center gap-2 px-4 shrink-0 border-b border-gray-100">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center shrink-0 -ml-[5px]">
              <Image src="/images/logo.png" alt="Werest Travel" height={32} width={106} priority className="object-contain" />
            </Link>
            <button type="button" onClick={() => { router.push('/results'); closeMobileMenu(); }}
              className="flex-1 min-w-0 flex items-center gap-2 rounded-full px-4 h-[42px] bg-gray-100 border border-transparent"
              aria-label="Search">
              <Search className="w-[18px] h-[18px] shrink-0 text-gray-400" />
              <span className="text-[15px] font-normal text-gray-400 truncate">Where to?</span>
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

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-10">

            {/* ── Savings / Account card ── */}
            <div className="mx-4 mt-5">
              {!user ? (
                <div className="bg-[#eef2ff] rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3">
                    Access savings just for you – in only one step!
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">💰 Extraordinary Savings</span>
                    <span className="text-gray-300 hidden xs:block">|</span>
                    <span className="flex items-center gap-1.5">⭐ Rewards for booking</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/tracking" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-brand-600 text-brand-600 font-bold text-sm">
                      Search Bookings
                    </Link>
                    <button type="button" onClick={() => { openModal('register'); closeMobileMenu(); }}
                      className="flex items-center justify-center h-11 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
                      Sign in/register
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
                        <p className="text-xs text-amber-600 font-semibold">{user.loyaltyPoints.toLocaleString()} pts</p>
                      )}
                    </div>
                    {user.tierLevel && (
                      <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.tierLevel}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/account" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-brand-600 text-brand-600 font-bold text-sm">
                      My Account
                    </Link>
                    <Link href="/account?tab=bookings" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors">
                      My Bookings
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Settings ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">Settings</p>

              {/* Language row */}
              <button type="button" onClick={() => { setLangExpanded(v => !v); setCurrExpanded(false); }}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <img src={activeLang.flagSrc} alt={activeLang.label} className="w-7 h-5 object-cover rounded shrink-0" />
                <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{activeLang.native} (Thailand)</span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${langExpanded ? 'rotate-90' : ''}`} />
              </button>
              {langExpanded && (
                <div className="bg-gray-50 rounded-xl mx-1 mb-1 overflow-hidden">
                  {LANGUAGES.map(l => (
                    <button key={l.code} type="button"
                      onClick={() => { setLang(l.code); setLangExpanded(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors ${lang === l.code ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <img src={l.flagSrc} alt={l.label} className="w-6 h-4 object-cover rounded shrink-0" />
                      <span>{l.native}</span>
                      {lang === l.code && (
                        <svg className="w-4 h-4 ml-auto text-brand-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Currency row */}
              <button type="button" onClick={() => { setCurrExpanded(v => !v); setLangExpanded(false); }}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <div className="w-7 h-5 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-bold">$</span>
                </div>
                <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{currency}</span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${currExpanded ? 'rotate-90' : ''}`} />
              </button>
              {currExpanded && (
                <div className="bg-gray-50 rounded-xl mx-1 mb-1 overflow-hidden">
                  {CURRENCIES.map(c => (
                    <button key={c.code} type="button"
                      onClick={() => { setCurrency(c.code); setCurrExpanded(false); }}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors ${currency === c.code ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <span><span className="font-bold">{c.code}</span> <span className="text-gray-400 font-normal">— {c.name}</span></span>
                      {currency === c.code && (
                        <svg className="w-4 h-4 text-brand-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Travel options ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">Travel options</p>
              {MOBILE_TRAVEL_OPTIONS.map(({ label, Icon, href }) => (
                <Link key={label} href={href} onClick={closeMobileMenu}
                  className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-700 shrink-0" />
                  <span className="flex-1 text-[15px] text-gray-800 font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>

            {/* ── More ── */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">More</p>

              <Link href="#" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                  <Gift className="w-3 h-3 text-white" />
                </div>
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Werest Rewards</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
                target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Headphones className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Customer Support</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </a>

              <Link href="/tracking" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <BookOpen className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Manage Bookings</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <button type="button" className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Smartphone className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">Download the app</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>

              {user && (
                <button type="button" onClick={async () => { closeMobileMenu(); await handleLogout(); }}
                  className="flex items-center gap-3 w-full py-4 active:bg-red-50">
                  <LogOut className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="flex-1 text-left text-[15px] text-red-500 font-medium">Sign out</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </Fragment>
  );
}
