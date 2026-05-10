'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Heart, LogOut, ChevronDown, BookOpen, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';
import SignInModal from '@/components/auth/SignInModal';

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

export default function Navbar({ transparent = false, onMenuToggle }: { transparent?: boolean; onMenuToggle?: () => void }) {
  const { lang, currency, setLang, setCurrency, t } = useLocale();

  const [open,         setOpen]         = useState(false);
  const [user,         setUser]         = useState<{ id: string; name: string; email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localeOpen,   setLocaleOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [authModal,    setAuthModal]    = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const localeRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => setUser(d.user ?? null))
      .catch(() => setUser(null));

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const isDark = transparent && !scrolled;
  const activeLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  const activeCurr = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className={cn(
        'absolute inset-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-opacity duration-500 ease-in-out pointer-events-none',
        isDark ? 'opacity-0' : 'opacity-100',
      )} />

      <nav className="relative z-10 w-full px-4 sm:px-6 lg:pl-3 lg:pr-8 h-16 flex items-center gap-4">

        {/* Hamburger + Logo — grouped so they align as one unit */}
        <div className="flex items-center gap-2 shrink-0">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className={`w-5 h-5 ${isDark ? 'text-white/80' : 'text-gray-600'}`} />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm text-white">W</span>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Werest<span className={`font-light transition-colors duration-500 ${isDark ? 'text-white/80' : 'text-brand-500'}`}> Travel</span>
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {[
            { href: '/',            key: 'nav.home'        },
            { href: '/attractions', key: 'nav.attractions' },
            { href: '/blog',        key: 'nav.blog'        },
            { href: '/tracking',    key: 'nav.tracking'    },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-brand-600'}`}>
              {t(item.key)}
            </Link>
          ))}

          {/* ── Language / Currency dropdown ── */}
          <div className="relative" ref={localeRef}>
            <button
              onClick={() => setLocaleOpen(!localeOpen)}
              className={`flex items-center gap-1.5 text-sm font-medium border rounded-full px-3 py-1.5 transition-colors duration-300 ${
                isDark
                  ? 'border-white/30 text-white/90 hover:border-white/60 hover:text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              <img src={activeLang.flagSrc} alt={activeLang.label} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
              <span className="font-semibold">{lang}</span>
              <span className={isDark ? 'text-white/40' : 'text-gray-300'}>|</span>
              <span className="font-semibold">{currency}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${localeOpen ? 'rotate-180' : ''}`} />
            </button>

            {localeOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 z-50">

                {/* Language */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t('locale.language')}
                </p>
                <div className="flex flex-col gap-1 mb-4">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLocaleOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        lang === l.code
                          ? 'bg-[#2534ff] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
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

                {/* Currency */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t('locale.currency')}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setLocaleOpen(false); }}
                      className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        currency === c.code
                          ? 'bg-[#2534ff] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
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
              onClick={() => setAuthModal(true)}
              className={`text-sm font-bold px-5 py-2 rounded-full transition-colors duration-200 ${
                isDark
                  ? 'bg-white text-[#2534ff] hover:bg-white/90'
                  : 'bg-[#2534ff] hover:bg-[#1a27d9] text-white'
              }`}
            >
              Sign in/register
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden ml-auto p-2 rounded-lg transition-colors ${isDark ? 'text-white/90' : 'text-gray-600'}`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* ── Sign in/register modal ── */}
      <SignInModal open={authModal} onClose={() => setAuthModal(false)} />

      {/* ── Mobile menu ── */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 shadow-lg">
          <Link href="/"            onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">{t('nav.home')}</Link>
          <Link href="/attractions" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">{t('nav.attractions')}</Link>
          <Link href="/blog"        onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">{t('nav.blog')}</Link>
          <Link href="/tracking"    onClick={() => setOpen(false)} className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">{t('nav.tracking')}</Link>

          {/* Language picker (mobile) */}
          <div className="py-3 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('locale.language')}</p>
            <div className="flex gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    lang === l.code ? 'bg-[#2534ff] text-white border-[#2534ff]' : 'border-gray-200 text-gray-600'
                  }`}>
                  <img src={l.flagSrc} alt={l.label} className="w-5 h-3.5 object-cover rounded-sm" /> {l.code}
                </button>
              ))}
            </div>
          </div>

          {/* Currency picker (mobile) */}
          <div className="py-3 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('locale.currency')}</p>
            <div className="flex gap-2 flex-wrap">
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => setCurrency(c.code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    currency === c.code ? 'bg-[#2534ff] text-white border-[#2534ff]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {c.code}
                </button>
              ))}
            </div>
          </div>

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
              <Link href="/account"             onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><User     className="w-4 h-4 text-brand-500" /> {t('nav.account')}</Link>
              <Link href="/account?tab=wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><Heart    className="w-4 h-4 text-brand-500" /> {t('nav.wishlist')}</Link>
              <Link href="/account?tab=bookings" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2.5"><BookOpen className="w-4 h-4 text-brand-500" /> {t('nav.bookings')}</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 py-2.5 mt-1">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setOpen(false); setAuthModal(true); }}
                className="flex-1 text-center text-sm font-bold bg-[#2534ff] text-white py-2.5 rounded-xl"
              >
                Sign in/register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
