'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Heart, LogOut, ChevronDown, BookOpen, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES  = [{ code: 'EN', label: 'English' }, { code: 'TH', label: 'ภาษาไทย' }];
const CURRENCIES = [
  { code: 'USD', symbol: '$' }, { code: 'THB', symbol: '฿' },
  { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
];

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open,         setOpen]         = useState(false);
  const [user,         setUser]         = useState<{ id: string; name: string; email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localeOpen,   setLocaleOpen]   = useState(false);
  const [lang,         setLang]         = useState('EN');
  const [currency,     setCurrency]     = useState('USD');
  const [scrolled,     setScrolled]     = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const localeRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auth
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null));

    // Locale prefs
    setLang(localStorage.getItem('werest_lang') ?? 'EN');
    setCurrency(localStorage.getItem('werest_currency') ?? 'USD');

    // Scroll detection
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); // run once on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (localeRef.current   && !localeRef.current.contains(e.target as Node))   setLocaleOpen(false);
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

  // true = transparent background + white text (only on transparent-prop pages before scroll)
  const isDark = transparent && !scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* White background layer: always shown on non-transparent pages, fades in on scroll for transparent pages */}
      <div className={cn(
        'absolute inset-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-opacity duration-500 ease-in-out pointer-events-none',
        isDark ? 'opacity-0' : 'opacity-100',
      )} />

      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm text-white">W</span>
          </div>
          <span className={`font-bold text-xl tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Werest<span className={`font-light transition-colors duration-500 ${isDark ? 'text-white/80' : 'text-brand-500'}`}> Travel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { href: '/',            label: 'Home'                },
            { href: '/attractions', label: 'Attractions Tickets' },
            { href: '/tracking',    label: 'Track Booking'       },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-brand-600'}`}>
              {item.label}
            </Link>
          ))}

          {/* Language / Currency */}
          <div className="relative" ref={localeRef}>
            <button
              onClick={() => setLocaleOpen(!localeOpen)}
              className={`flex items-center gap-1.5 text-sm font-medium border rounded-full px-3 py-1 transition-colors duration-300 ${
                isDark ? 'border-white/30 text-white/90 hover:text-white hover:border-white/60' : 'border-gray-200 text-gray-600 hover:text-brand-600 hover:border-brand-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
              <span className={isDark ? 'text-white/40' : 'text-gray-300'}>|</span>
              <span>{currency}</span>
            </button>

            {localeOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Language</p>
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {LANGUAGES.map(l => (
                    <button key={l.code}
                      onClick={() => { setLang(l.code); localStorage.setItem('werest_lang', l.code); }}
                      className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${lang === l.code ? 'bg-brand-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Currency</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CURRENCIES.map(c => (
                    <button key={c.code}
                      onClick={() => { setCurrency(c.code); localStorage.setItem('werest_currency', c.code); }}
                      className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${currency === c.code ? 'bg-brand-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User section */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${isDark ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-brand-600'}`}
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/account" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                    <User className="w-4 h-4" /> My Account
                  </Link>
                  <Link href="/account?tab=wishlist" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <Link href="/account?tab=bookings" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                    <BookOpen className="w-4 h-4" /> My Bookings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/register"
                className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-brand-600'}`}>
                Register
              </Link>
              <Link href="/auth/login"
                className="text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-full transition-colors duration-200">
                Log in
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-white/90' : 'text-gray-600'}`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          <Link href="/"            onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">Home</Link>
          <Link href="/attractions" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">Attractions Tickets</Link>
          <Link href="/tracking"    onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">Track Booking</Link>

          {user ? (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <Link href="/account"          onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><User     className="w-4 h-4 text-brand-500" /> My Account</Link>
              <Link href="/account?tab=wishlist"  onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><Heart    className="w-4 h-4 text-brand-500" /> Wishlist</Link>
              <Link href="/account?tab=bookings"  onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><BookOpen className="w-4 h-4 text-brand-500" /> My Bookings</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 py-2.5 mt-1">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/register" onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-semibold border border-brand-600 text-brand-600 py-2.5 rounded-xl">
                Register
              </Link>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-bold bg-brand-600 text-white py-2.5 rounded-xl">
                Log in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
