'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, X, User, Heart, LogOut, ChevronDown, ChevronRight,
  BookOpen, Globe, Smartphone, Car, Compass, Ticket, Users, Tag, Gift, Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useWishlist } from '@/context/WishlistContext';
import LocaleCurrencyModal from './LocaleCurrencyModal';

/* ── Gold coin SVG icon ────────────────────────────────────────────────────── */
function CoinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="none" aria-label="Loyalty coins">
      <circle cx="9" cy="9" r="8.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
      <circle cx="9" cy="9" r="6" fill="none" stroke="#FDE68A" strokeWidth="1.5" opacity="0.7" />
      <text x="9" y="12.8" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#78350F" fontFamily="system-ui,sans-serif">฿</text>
    </svg>
  );
}

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

const TIER_CHIP: Record<string, string> = {
  EXPLORER:   'bg-gray-100 text-gray-600',
  ADVENTURER: 'bg-green-100 text-green-700',
  NAVIGATOR:  'bg-blue-100 text-blue-700',
  VOYAGER:    'bg-purple-100 text-purple-700',
};

const MOBILE_TRAVEL_OPTIONS = [
  { label: 'Private Transfers',   icon: Car,     href: '/results'       },
  { label: 'Tours & Experiences', icon: Compass, href: '/tours'         },
  { label: 'Attraction Tickets',  icon: Ticket,  href: '/attractions'   },
  { label: 'Group Tours',         icon: Users,   href: '/group-booking' },
  { label: 'Deals & Offers',      icon: Tag,     href: '/deals'         },
];

/* ── Sub-nav link helper ────────────────────────────────────────────────────── */
function SubNavLink({ href, children, emoji }: { href: string; children: React.ReactNode; emoji?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap rounded-lg hover:bg-gray-50 transition-colors"
    >
      {emoji && <span>{emoji}</span>}
      {children}
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Navbar() {
  const { lang, currency, setLang, setCurrency, t } = useLocale();
  const router = useRouter();
  const { openModal, user, setUser } = useAuthModal();
  const { wishlistedIds } = useWishlist();
  const wishlistCount = wishlistedIds.size;

  /* ── State ── */
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [localeModalOpen, setLocaleModalOpen] = useState(false);
  const [localeModalTab,  setLocaleModalTab]  = useState<'language' | 'currency'>('language');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const activeLang  = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  /* ── Mobile menu animation ── */
  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => setTimeout(() => setMobileMenuVisible(true), 10));
  };
  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 220);
  };

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  /* ── Close user dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await fetch('/api/user/logout', { method: 'DELETE' }); } catch {}
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <Fragment>
      {/* ════════════════════════════════════════════════════════════
          HEADER — 2-row Klook-style
      ════════════════════════════════════════════════════════════ */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">

        {/* ── Row 1 (60px) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-[60px] gap-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Werest Travel"
                height={36}
                width={118}
                priority
                className="object-contain"
              />
            </Link>

            {/* Flex spacer */}
            <div className="flex-1" />

            {/* ── Desktop right actions ── */}
            <div className="hidden md:flex items-center gap-0.5">

              {/* Language / Currency */}
              <button
                type="button"
                onClick={() => { setLocaleModalOpen(true); setLocaleModalTab('language'); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{lang}</span>
                <span className="text-gray-300 mx-0.5">|</span>
                <span>{currency}</span>
              </button>

              {/* App */}
              <Link
                href="/app"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>App</span>
              </Link>

              {/* Help */}
              <Link
                href="/help-center"
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Help
              </Link>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 bg-[#2534ff] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Auth */}
              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#2534ff] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="max-w-[90px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                    {user.tierLevel && (
                      <span className={`hidden lg:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.tierLevel}
                      </span>
                    )}
                    {user.loyaltyPoints != null && (
                      <span className="hidden xl:inline-flex items-center justify-center w-6 h-6">
                        <CoinIcon />
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
                            {user.loyaltyPoints != null && <CoinIcon className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2534ff] transition-colors">
                        <User className="w-4 h-4" /> {t('nav.account')}
                      </Link>
                      <Link href="/account?tab=wishlist" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2534ff] transition-colors">
                        <Heart className="w-4 h-4" /> {t('nav.wishlist')}
                      </Link>
                      <Link href="/account?tab=bookings" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2534ff] transition-colors">
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
                <>
                  <button
                    type="button"
                    onClick={() => openModal('register')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('email')}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#2534ff] hover:bg-[#1a26cc] rounded-full transition-colors"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={openMobileMenu}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Row 2 — Sub navigation (desktop only) ── */}
        <div className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-[44px]">
              <SubNavLink href="/results">Airport Transfers</SubNavLink>
              <SubNavLink href="/transfers">City-to-City</SubNavLink>
              <SubNavLink href="/tours">Tours &amp; Experiences</SubNavLink>
              <SubNavLink href="/attractions">Attraction Tickets</SubNavLink>
              <SubNavLink href="/destinations">Destinations</SubNavLink>
              <SubNavLink href="/group-booking">Group Tours</SubNavLink>
              <div className="w-px h-4 bg-gray-200 mx-2" />
              <SubNavLink href="/deals" emoji="🏷️">Deals &amp; Offers</SubNavLink>
              <SubNavLink href="/tracking" emoji="📋">My Bookings</SubNavLink>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN MENU OVERLAY
      ════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className={cn(
            'fixed inset-0 z-[200] bg-white flex flex-col md:hidden transition-all duration-200 ease-out',
            mobileMenuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3',
          )}
        >
          {/* Top bar */}
          <div className="h-[60px] flex items-center gap-3 px-4 shrink-0 border-b border-gray-100">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center shrink-0">
              <Image src="/images/logo.png" alt="Werest Travel" height={32} width={106} priority className="object-contain" />
            </Link>
            <div className="flex-1" />
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-10">

            {/* Account card */}
            <div className="mx-4 mt-5">
              {!user ? (
                <div className="bg-[#eef2ff] rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3">
                    Access savings just for you – in only one step!
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/tracking" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-[#2534ff] text-[#2534ff] font-bold text-sm">
                      My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={() => { openModal('register'); closeMobileMenu(); }}
                      className="flex items-center justify-center h-11 rounded-xl bg-[#2534ff] text-white font-bold text-sm hover:bg-[#1a26cc] transition-colors"
                    >
                      Sign in / Register
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#eef2ff] rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-[#2534ff] flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-[15px]">{user.name}</p>
                      {user.loyaltyPoints != null && <CoinIcon className="w-4 h-4 mt-0.5" />}
                    </div>
                    {user.tierLevel && (
                      <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full ${TIER_CHIP[user.tierLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.tierLevel}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/account" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl border-2 border-[#2534ff] text-[#2534ff] font-bold text-sm">
                      My Account
                    </Link>
                    <Link href="/account?tab=bookings" onClick={closeMobileMenu}
                      className="flex items-center justify-center h-11 rounded-xl bg-[#2534ff] text-white font-bold text-sm hover:bg-[#1a26cc] transition-colors">
                      My Bookings
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Language / Currency */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">Settings</p>

              <button
                type="button"
                onClick={() => { closeMobileMenu(); setTimeout(() => { setLocaleModalOpen(true); setLocaleModalTab('language'); }, 230); }}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50"
              >
                <img src={activeLang.flagSrc} alt={activeLang.label} className="w-7 h-5 object-cover rounded shrink-0" />
                <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{activeLang.native} (Thailand)</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {(() => {
                const activeCurr = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];
                return (
                  <button
                    type="button"
                    onClick={() => { closeMobileMenu(); setTimeout(() => { setLocaleModalOpen(true); setLocaleModalTab('currency'); }, 230); }}
                    className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50"
                  >
                    <span className="text-2xl leading-none shrink-0">{activeCurr.flag}</span>
                    <span className="flex-1 text-left text-[15px] text-gray-800 font-medium">{currency} — {activeCurr.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })()}
            </div>

            {/* Travel options */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">Travel options</p>
              {MOBILE_TRAVEL_OPTIONS.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href} onClick={closeMobileMenu}
                  className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-700 shrink-0" />
                  <span className="flex-1 text-[15px] text-gray-800 font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>

            {/* More */}
            <div className="px-4 mt-7">
              <p className="text-[13px] font-medium text-gray-400 mb-1 px-1">More</p>

              <Link href="/account?tab=wishlist" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Wishlist</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link href="/help-center" onClick={closeMobileMenu}
                className="flex items-center gap-3 w-full py-4 border-b border-gray-100 active:bg-gray-50">
                <Headphones className="w-5 h-5 text-gray-700 shrink-0" />
                <span className="flex-1 text-[15px] text-gray-800 font-medium">Help Center</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

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

              {!user ? (
                <div className="flex gap-3 pt-5 pb-2">
                  <button
                    type="button"
                    onClick={() => { openModal('email'); closeMobileMenu(); }}
                    className="flex-1 h-11 rounded-xl border-2 border-[#2534ff] text-[#2534ff] font-bold text-sm"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => { openModal('register'); closeMobileMenu(); }}
                    className="flex-1 h-11 rounded-xl bg-[#2534ff] text-white font-bold text-sm hover:bg-[#1a26cc] transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => { closeMobileMenu(); await handleLogout(); }}
                  className="flex items-center gap-3 w-full py-4 active:bg-red-50"
                >
                  <LogOut className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="flex-1 text-left text-[15px] text-red-500 font-medium">Sign out</span>
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
