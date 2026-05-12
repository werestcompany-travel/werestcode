'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, User, Heart, LogOut, ChevronDown,
  BookOpen, Search, Headphones, Trash2, Clock, TrendingUp,
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
  { rank: 1, name: 'Bangkok',     desc: 'Iconic landmarks | History and culture | Nightlife',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=80&q=80' },
  { rank: 2, name: 'Phuket',      desc: 'Beach paradise | Island hopping | Water sports',       img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=80&q=80' },
  { rank: 3, name: 'Chiang Mai',  desc: 'Temples & culture | Night markets | Trekking',         img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&q=80' },
  { rank: 4, name: 'Pattaya',     desc: 'Beach getaway | Bucket list destination | Family fun', img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=80&q=80' },
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

  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [localeOpen,   setLocaleOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [navHidden,    setNavHidden]    = useState(false);
  const [searchQ,      setSearchQ]      = useState('');
  const [phIdx,        setPhIdx]        = useState(0);
  const [phFading,     setPhFading]     = useState(false);
  const [searchFocused,       setSearchFocused]       = useState(false);
  const [searchHistory,       setSearchHistory]       = useState<string[]>([]);
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
  const userMenuRef    = useRef<HTMLDivElement>(null);
  const localeRef      = useRef<HTMLDivElement>(null);
  const searchWrapRef  = useRef<HTMLDivElement>(null);
  const lastScrollY    = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      if (y > lastScrollY.current && y > 80) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
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
      if (userMenuRef.current    && !userMenuRef.current.contains(e.target as Node))    setUserMenuOpen(false);
      if (localeRef.current      && !localeRef.current.contains(e.target as Node))      setLocaleOpen(false);
      if (searchWrapRef.current  && !searchWrapRef.current.contains(e.target as Node))  setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'DELETE' });
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

  return (
    <Fragment>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Background */}
      <div className={cn(
        'absolute inset-0 bg-white border-b border-gray-200 shadow-sm transition-opacity duration-300 pointer-events-none',
        isDark ? 'opacity-0' : 'opacity-100',
      )} />

      {/* ── Main bar — full width, pl-3 so hamburger icon (p-2 inside) lands at 20px matching sidebar px-5 ── */}
      <nav className="relative z-10 h-16 flex items-center gap-2 pl-3 pr-4">

        {/* 1. Hamburger — always visible, aligns with sidebar tab icons */}
        <button
          type="button"
          onClick={() => onHamburgerClick?.()}
          onMouseEnter={() => onHamburgerHoverEnter?.()}
          aria-label="Toggle sidebar"
          className={`p-2 rounded-lg transition-colors shrink-0 ${
            isDark
              ? 'text-white/90 hover:text-white'
              : 'text-gray-600 hover:text-brand-600 hover:bg-gray-100'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 2. Logo — right next to hamburger */}
        <Link href="/" className="flex items-center shrink-0 mr-1">
          <Image
            src="/images/logo.png"
            alt="Werest Travel"
            height={40}
            width={131}
            priority
            className={`object-contain transition-all duration-300 ${isDark ? 'brightness-0 invert' : ''}`}
          />
        </Link>

        {/* 3. Search box + dropdown */}
        <div ref={searchWrapRef} className="relative hidden sm:block ml-[38px] w-full max-w-sm">
          <form
            onSubmit={handleSearch}
            className={cn(
              'flex items-center gap-2 border rounded-lg px-3 h-9 transition-all w-full',
              searchFocused
                ? 'border-brand-400 bg-white shadow-sm'
                : isDark
                  ? 'bg-white/10 border-white/25 focus-within:bg-white/20 focus-within:border-white/50'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300',
            )}
          >
            <div className="relative flex-1 min-w-0 h-full flex items-center">
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className={`w-full bg-transparent text-sm outline-none ${isDark && !searchFocused ? 'text-white' : 'text-gray-700'}`}
              />
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

          {/* ── Search dropdown ── */}
          {searchFocused && (
            <div className="absolute top-full left-0 mt-2 w-[620px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
              <div className="p-4 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Search history */}
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">Search history</span>
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={clearHistory}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Clear search history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map(h => (
                        <button
                          key={h}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSearchChipClick(h)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white"
                        >
                          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other travelers searched for */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Other travelers searched for</p>
                  <div className="flex flex-wrap gap-2">
                    {(showMoreSuggestions ? POPULAR_SUGGESTIONS : POPULAR_SUGGESTIONS.slice(0, 6)).map(s => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleSearchChipClick(s)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white capitalize"
                      >
                        {s}
                      </button>
                    ))}
                    {!showMoreSuggestions && POPULAR_SUGGESTIONS.length > 6 && (
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setShowMoreSuggestions(true)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Two-column: Top searches + Trending destinations */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Top searches */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Top searches</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {TOP_SEARCHES.map(item => (
                        <button
                          key={item.rank}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSearchChipClick(item.title)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left w-full group"
                        >
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

                  {/* Trending destinations */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Trending destinations</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {TRENDING_DESTINATIONS.map(dest => (
                        <button
                          key={dest.rank}
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSearchChipClick(dest.name)}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left w-full group"
                        >
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
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* 4. Desktop utility links */}
        <div className="hidden md:flex items-center gap-0.5">

          {/* Find bookings */}
          <Link
            href="/tracking"
            className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}
          >
            Manage bookings
          </Link>

          {/* Customer support */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}
          >
            <Headphones className="w-4 h-4 shrink-0" />
            Customer support
          </a>

          {/* Currency / Language */}
          <div className="relative" ref={localeRef}>
            <button
              type="button"
              onClick={() => setLocaleOpen(!localeOpen)}
              className={`flex items-center gap-0.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
            >
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
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLang(l.code); setLocaleOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        lang === l.code ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
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
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCurrency(c.code); setLocaleOpen(false); }}
                      className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        currency === c.code ? 'bg-brand-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-bold">{c.code}</span>
                      <span className={`text-[11px] ${currency === c.code ? 'text-white/70' : 'text-gray-400'}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          {user ? (
            <div className="relative ml-1" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                {/* Loyalty tier badge */}
                {user.tierLevel && (
                  <span className={`hidden lg:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                    {user.tierLevel}
                  </span>
                )}
                {/* Points — desktop only */}
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
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                            {user.tierLevel}
                          </span>
                        )}
                        {user.loyaltyPoints != null && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            {user.loyaltyPoints.toLocaleString()} pts
                          </span>
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
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openModal()}
              className="ml-1 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              Sign in / Register
            </button>
          )}
        </div>

        {/* Mobile: search icon + sign-in shortcut */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={() => router.push('/results')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/90' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          {!user && (
            <button type="button" onClick={() => openModal()}
              className="text-xs font-bold bg-brand-600 text-white px-3 py-1.5 rounded-full whitespace-nowrap">
              Sign in
            </button>
          )}
          {user && (
            <Link href="/account" className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name[0].toUpperCase()}
              </div>
              {user.tierLevel && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                  {user.tierLevel}
                </span>
              )}
            </Link>
          )}
        </div>
      </nav>

    </header>
    </Fragment>
  );
}
