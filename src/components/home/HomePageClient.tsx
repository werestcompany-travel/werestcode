'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchTabs from '@/components/search/SearchTabs';
import BlogCard from '@/components/blog/BlogCard';
import { useLocale } from '@/context/LocaleContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useWishlist } from '@/context/WishlistContext';
import { type BlogPostSummary } from '@/lib/blog';
import DynamicTourSections from '@/components/home/DynamicTourSections'
import RecentlyViewedSection from '@/components/RecentlyViewedSection'
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget'
import {
  Star, CheckCircle2, BookOpen, Heart,
  Car, Plane, Users, ArrowRight,
  ArrowLeftRight, Luggage,
  Compass, Ticket, Ship, Gift, ChevronRight, Tag,
  Clock, Lock, Shield,
} from 'lucide-react';

/* ── Service sidebar tabs (with section groupings) ────────────────────────── */
const SERVICE_TABS = [
  // § 1 — Core services
  {
    id: 'transfer', icon: Car, labelKey: 'svc.transfer', badge: null, badgeColor: '', href: undefined, s: 1,
    children: [
      { id: 'airport',       icon: Plane,          labelKey: 'svc.airport',    href: '/airport-transfers' },
      { id: 'city-to-city',  icon: ArrowLeftRight, labelKey: 'svc.cityToCity', href: '/transfers' },
      { id: 'charter',       icon: Clock,          labelKey: 'svc.charter',    href: '#' },
    ],
  },
  { id: 'tours',       icon: Compass,     labelKey: 'svc.tours',       badge: null,       badgeColor: '',     href: '/tours',        s: 1 },
  { id: 'attractions', icon: Ticket,      labelKey: 'svc.attractions', badge: null,       badgeColor: '',     href: '/attractions',  s: 1 },
  { id: 'group',       icon: Users,       labelKey: 'svc.group',       badge: null,       badgeColor: '',     href: '/group-booking',   s: 1 },
  // § 3 — Planning tools
  { id: 'deals',       icon: Tag,         labelKey: 'svc.deals',       badge: 'Hot',      badgeColor: 'red',  href: '/deals',     s: 3 },
  // § 4 — Account / loyalty
  { id: 'rewards',     icon: Gift,        labelKey: 'svc.rewards',     badge: 'Earn pts', badgeColor: 'amber',href: '/deals',     s: 4 },
];

/* ── SEO route link grid ──────────────────────────────────────────────────── */
/* ── SEO routes grouped by category tab ─────────────────────────────────── */
const SEO_ROUTE_TABS = [
  {
    labelKey: 'seo.tab.popular',
    routes: [
      'Bangkok Airport to Bangkok', 'Bangkok to Pattaya', 'Phuket Airport to Patong',
      'Don Mueang Airport to Bangkok', 'Bangkok to Hua Hin', 'Phuket to Krabi',
      'Chiang Mai to Chiang Rai', 'Bangkok Airport to Pattaya', 'Phuket Airport to Khao Lak',
      'Bangkok to Chiang Mai', 'Phuket Airport to Phuket Town', 'Bangkok to Koh Chang',
      'Phuket Airport to Karon', 'Bangkok to Khao Yai', 'Krabi to Surat Thani',
    ],
  },
  {
    labelKey: 'seo.tab.airport',
    routes: [
      'Bangkok Airport to Bangkok', 'Don Mueang Airport to Bangkok', 'Phuket Airport to Patong',
      'Phuket Airport to Kata Beach', 'Phuket Airport to Khao Lak', 'Phuket Airport to Karon',
      'Phuket Airport to Phuket Town', 'Phuket Airport to Rawai', 'Phuket Airport to Chalong',
      'Phuket Airport to Mai Khao', 'Phuket Airport to Nai Thon', 'Phuket Airport to Kamala Beach',
      'Phuket Airport to Bang Tao', 'Phuket Airport to Panwa', 'Bangkok Airport to Hua Hin',
      'Bangkok Airport to Pattaya', 'Bangkok Airport to Kanchanaburi', 'Bangkok Airport to Rayong',
      'Bangkok Airport to Don Mueang', 'Bangkok Airport to Ayutthaya', 'Bangkok Airport to Surin',
      'Chiang Mai Airport to Chiang Rai', 'Chiang Rai Airport to Chiang Saen',
      'Laem Chabang Port to Bangkok Airport', 'Don Mueang Airport to Ayutthaya',
    ],
  },
  {
    labelKey: 'seo.tab.city',
    routes: [
      'Bangkok to Pattaya', 'Bangkok to Hua Hin', 'Bangkok to Chiang Mai',
      'Bangkok to Koh Chang', 'Bangkok to Khao Yai', 'Bangkok to Surat Thani',
      'Bangkok to Ayutthaya', 'Bangkok to Kanchanaburi', 'Bangkok to Lopburi',
      'Phuket to Krabi', 'Phuket to Khao Lak', 'Phuket to Surat Thani',
      'Chiang Mai to Chiang Rai', 'Chiang Mai to Pai', 'Chiang Mai to Sukhothai',
      'Krabi to Surat Thani', 'Pattaya to Hua Hin', 'Karon to Khao Lak',
      'Hat Yai to Penang', 'Ao Nang to Phuket', 'Khao Sok to Phuket',
      'Laem Chabang Port to Bangkok', 'Laem Chabang to Bangkok',
      'Bangkok to Damnoen Saduak', 'Sukhothai to Bangkok',
    ],
  },
  {
    labelKey: 'seo.tab.beach',
    routes: [
      'Bangkok to Pattaya', 'Bangkok to Hua Hin', 'Bangkok to Koh Chang',
      'Phuket Airport to Patong', 'Phuket Airport to Kata Beach', 'Phuket Airport to Karon',
      'Phuket Airport to Rawai', 'Phuket Airport to Bang Tao', 'Phuket to Krabi',
      'Krabi to Surat Thani', 'Ao Nang to Phuket', 'Karon to Khao Lak',
      'Karon to Railay', 'Bangkok to Rayong', 'Bangkok to Laem Sok',
      'Phuket to Don Sak', 'Bangkok to Don Sak', 'Bangkok to Surin',
      'Laem Chabang to Bangkok', 'Pattaya to Hua Hin',
    ],
  },
  {
    labelKey: 'seo.tab.northern',
    routes: [
      'Chiang Mai to Chiang Rai', 'Chiang Mai to Pai', 'Chiang Mai to Sukhothai',
      'Chiang Mai to Golden Triangle', 'Chiang Mai to Lampang', 'Chiang Mai to White Temple',
      'Chiang Rai to Sukhothai', 'Chiang Rai to Pai', 'Chiang Mai to Hua Hin',
      'Phitsanulok to Chiang Mai', 'Bangkok to Phitsanulok', 'Bangkok to Nakhon Sawan',
      'Chiang Mai Airport to Chiang Rai', 'Chiang Rai Airport to Chiang Saen',
      'Bangkok Airport to Ban Phe Pier',
    ],
  },
];

/* Keep flat SEO_ROUTES for any legacy usage */
const SEO_ROUTES = SEO_ROUTE_TABS.map(t => t.routes);

/* ── New-user exclusive cards — titleKey/subKey/ctaKey resolved at render ── */
const NEW_USER_CARDS = [
  { highlight: true,  titleKey: 'newUser.title',         subKey: 'newUser.sub',          ctaKey: 'newUser.cta',      href: '#',        openModal: true,  emoji: '🎁', gradient: 'from-brand-600 to-brand-800' },
  { highlight: false, titleKey: 'newUser.off10.title',   subKey: 'newUser.off10.sub',    ctaKey: 'newUser.claimAll', href: '#',        openModal: true,  emoji: '🚗' },
  { highlight: false, titleKey: 'newUser.cancel.title',  subKey: 'newUser.cancel.sub',   ctaKey: 'newUser.claimAll', href: '/booking', openModal: false, emoji: '🛡️' },
  { highlight: false, titleKey: 'newUser.off15.title',   subKey: 'newUser.off15.sub',    ctaKey: 'newUser.claimAll', href: '/results', openModal: false, emoji: '✈️' },
];

/* ── Platform review slider data ──────────────────────────────────────────── */
const PLATFORM_REVIEWS = [
  {
    id: 'tripadvisor',
    label: 'Tripadvisor',
    overallLabel: 'Excellent',
    score: '5.0',
    totalReviews: '320+',
    accentColor: '#00aa6c',
    reviews: [
      { text: 'Amazing driver, perfectly on time. Fixed price — no surprises at all. Highly recommend.', name: 'James T.', country: 'Australia', flag: '🇦🇺', route: 'Bangkok Airport → Phuket' },
      { text: 'Driver was waiting at arrivals with a name sign. Spotless car, ice-cold AC. Exactly what I paid online.', name: 'Emma K.', country: 'Canada', flag: '🇨🇦', route: 'Don Mueang → Bangkok City' },
      { text: 'Booked for a group of 8. The minivan was clean and the driver knew every back road to avoid traffic.', name: 'Oliver B.', country: 'Germany', flag: '🇩🇪', route: 'Bangkok → Pattaya' },
    ],
  },
  {
    id: 'google',
    label: 'Google',
    overallLabel: '4.9 / 5',
    score: '4.9',
    totalReviews: '180+',
    accentColor: '#fbbc04',
    reviews: [
      { text: 'Tried three transfer companies before finding Werest. Night and day difference — professional, clean car, fixed price.', name: 'Sarah L.', country: 'United States', flag: '🇺🇸', route: 'Suvarnabhumi → Hua Hin' },
      { text: 'Free cancellation was a lifesaver when our flight was delayed. They rescheduled with zero fuss.', name: 'Michael R.', country: 'United Kingdom', flag: '🇬🇧', route: 'Phuket Airport → Patong' },
      { text: 'WhatsApp support replied in under 2 minutes when I changed my pickup time. Exceptional service.', name: 'Yuki T.', country: 'Japan', flag: '🇯🇵', route: 'Chiang Mai Airport → Nimman' },
    ],
  },
  {
    id: 'trustpilot',
    label: 'Trustpilot',
    overallLabel: 'Excellent',
    score: '4.8',
    totalReviews: '95+',
    accentColor: '#00b67a',
    reviews: [
      { text: 'The price I saw online was exactly what I paid — not a baht more. That level of honesty is rare in Thailand.', name: 'David M.', country: 'Australia', flag: '🇦🇺', route: 'Bangkok → Kanchanaburi' },
      { text: 'Smooth booking, confirmation in minutes, driver arrived 10 minutes early. Could not ask for more.', name: 'Isabelle F.', country: 'France', flag: '🇫🇷', route: 'Phuket → Krabi' },
      { text: 'Used Werest for three transfers during my two-week trip. Every single one was flawless.', name: 'Liam O.', country: 'Ireland', flag: '🇮🇪', route: 'Multiple routes · Thailand' },
    ],
  },
];

/* ── Auto-slider promotional banners ─────────────────────────────────────── */

/* ── Popular destination bento grid ──────────────────────────────────────── */
const POPULAR_DESTINATIONS = [
  {
    id: 'phuket',    name: 'Phuket',
    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
    href: '/destinations/phuket',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'chiangmai', name: 'Chiang Mai',
    img: 'https://images.unsplash.com/photo-1599576838688-8a6c11263108?w=800&q=80',
    href: '/destinations/chiang-mai',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 'bangkok',   name: 'Bangkok',
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
    href: '/destinations/bangkok',
    span: 'col-span-2 row-span-1',
  },
  {
    id: 'krabi',     name: 'Krabi',
    img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
    href: '/destinations/krabi',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'pattaya',   name: 'Pattaya',
    img: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800&q=80',
    href: '/destinations/pattaya',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 'kohsamui',  name: 'Koh Samui',
    img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
    href: '/destinations/koh-samui',
    span: 'col-span-1 row-span-1',
  },
];

/* ── Where to next — destination cards ─────────────────────────────────── */
const INSPIRED_DESTS = [
  { id: 'bangkok',   name: 'Bangkok',    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80' },
  { id: 'phuket',    name: 'Phuket',     img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
  { id: 'chiangmai', name: 'Chiang Mai', img: 'https://images.unsplash.com/photo-1599576838688-8a6c11263108?w=600&q=80' },
  { id: 'krabi',     name: 'Krabi',      img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80'   },
  { id: 'pattaya',   name: 'Pattaya',    img: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=600&q=80' },
];


/* ── Car classes — same exteriorImage as VEHICLE_CONFIGS in lib/vehicles.ts ── */
const CAR_CLASSES = [
  {
    id: 'sedan',
    name: 'Sedan',
    maxPax: 2,
    maxBags: 2,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/altis/19/8055e76f92e3f8e92b2f16771cebb42db2bcb9eda12ca1565ed5ce5a98ad4d56.webp',
  },
  {
    id: 'suv',
    name: 'SUV',
    maxPax: 4,
    maxBags: 4,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/fortuner_leader/47/02eff79ee7167df9807c067a0025b87e55458f0203b2b91f70e6b537fc6abf84.webp',
  },
  {
    id: 'minivan',
    name: 'Minivan',
    maxPax: 10,
    maxBags: 10,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/hiace/214/7c64131428daae1b2ac92c35d5cb6432a75c65eb3df845fa0da308e55cd5f116.webp',
  },
  {
    id: 'luxury-mpv',
    name: 'Luxury MPV',
    maxPax: 6,
    maxBags: 6,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/alphard/27/9bd8c8811a6213ea1429d91b5bcba32246b73d1255cbb3ae6be04309d1231b08.webp',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePageClient({ latestPosts = [] }: { latestPosts?: BlogPostSummary[] }) {
  const { t } = useLocale();
  const { openModal } = useAuthModal();
  const [blogTab,   setBlogTab]   = useState(0);
  const [seoTabIdx, setSeoTabIdx] = useState(0);
  const [prefillRoute, setPrefillRoute] = useState<{ from: string; to: string } | null>(null);
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);
  const [activeService, setActiveService] = useState('transfer');
  const [selectedDest,   setSelectedDest]   = useState('bangkok');
  const [reviewPlatIdx,  setReviewPlatIdx]  = useState(0);
  const [reviewCardIdx,  setReviewCardIdx]  = useState(0);
  const [taReviews,      setTaReviews]      = useState<typeof PLATFORM_REVIEWS[0]['reviews'] | null>(null);
  const { isWishlisted, toggle, isLoggedIn } = useWishlist();
  const inspiredSliderRef                   = useRef<HTMLDivElement>(null);
  const [inspiredShowLeft,  setInspiredShowLeft]  = useState(false);
  const [inspiredShowRight, setInspiredShowRight] = useState(false);
  const [placesVisible,  setPlacesVisible]  = useState(true);

  useEffect(() => {
    setPlacesVisible(false);
    const timer = setTimeout(() => setPlacesVisible(true), 220);
    return () => clearTimeout(timer);
  }, [selectedDest]);

  /* ── Auto-advance review platform every 6s ── */
  useEffect(() => {
    const t = setInterval(() => {
      setReviewPlatIdx(i => (i + 1) % PLATFORM_REVIEWS.length);
      setReviewCardIdx(0);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  /* ── Fetch real TripAdvisor reviews ── */
  useEffect(() => {
    fetch('/api/reviews/tripadvisor')
      .then(r => r.json())
      .then(({ reviews }) => {
        if (!reviews?.length) return;
        setTaReviews(
          reviews.slice(0, 5).map((r: {
            rating: number; text: string; title: string;
            user: { username: string; user_location?: { name: string }; avatar?: { small?: string } };
            travel_date?: string;
          }) => ({
            text: r.text,
            name: r.user.username,
            country: r.user.user_location?.name ?? '',
            flag: '',
            route: r.travel_date ? `Travelled ${r.travel_date}` : 'Via TripAdvisor',
          }))
        );
      })
      .catch(() => { /* silently use mock data */ });
  }, []);

  /* ── Inspired slider arrows ── */
  useEffect(() => {
    const el = inspiredSliderRef.current;
    if (!el) return;
    const sync = () => {
      setInspiredShowLeft(el.scrollLeft > 4);
      setInspiredShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    el.addEventListener('scroll', sync, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener('scroll', sync); };
  }, []);

  const scrollInspired = (dir: 1 | -1) => {
    const el = inspiredSliderRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };


  /** Parse "City A to City B" → prefill hero form + scroll up */
  const handleSeoRouteClick = useCallback((route: string, e: React.MouseEvent) => {
    e.preventDefault();
    const toIdx = route.toLowerCase().lastIndexOf(' to ');
    if (toIdx === -1) return;
    const from = route.slice(0, toIdx).trim();
    const to   = route.slice(toIdx + 4).trim();
    setPrefillRoute({ from, to });
    // Scroll hero search form into view
    document.getElementById('hero-search-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <Fragment>
      <Navbar transparent />
      {/* ════════════════════════════════════════════════════════════
          PAGE SHELL
      ════════════════════════════════════════════════════════════ */}
      <div className="pt-16">
        <main>

      {/* ════════════════════════════════════════════════════════════
          1. HERO — full-width gradient
      ════════════════════════════════════════════════════════════ */}
      {/* -mt-16 pulls the hero card behind the transparent navbar */}
      <section aria-label="Hero" className="-mt-16 mb-0 lg:mb-[30px]">

        {/* ── Hero card ── */}
        <div className="flex flex-col items-center justify-start lg:justify-center relative lg:min-h-[680px]" style={{ minHeight: '320px' }}>
          {/* Background — Wat Rong Suea Ten (Blue Temple), Chiang Rai at blue hour */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1767548337291-17f5c6dc9932?w=1920&q=85"
              alt="Blue Temple Chiang Rai at blue hour"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              unoptimized
            />
          </div>
          {/* Dark-blue overlay — readable text, temple still visible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,8,40,0.55) 0%, rgba(3,12,55,0.48) 35%, rgba(4,16,65,0.38) 65%, rgba(2,8,40,0.20) 100%)' }} />
          {/* Extra top gradient to keep transparent nav text legible */}
          <div className="absolute inset-x-0 top-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, transparent 100%)' }} />

          {/* Central content */}
          {/* pt-16 accounts for the fixed navbar height; lg:pt-20 gives extra breathing room on desktop */}
          <div id="hero-search-anchor" className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-6 pt-20 pb-[140px] lg:pt-[141px] lg:pb-12 flex flex-col items-center gap-3 lg:gap-5 text-center self-start lg:self-center">

            {/* Title */}
            <h1 className="text-[32px] leading-snug lg:text-[34px] font-extrabold text-white tracking-tight">
              {activeService === 'transfer'    && <><span className="block mt-[10px]">{t('hero.transfer.title1')}</span><span className="block">{t('hero.transfer.title2')}</span></>}
              {activeService === 'tours'       && t('hero.tours.title')}
              {activeService === 'attractions' && t('hero.attractions.title')}
              {activeService === 'deals'       && t('hero.deals.title')}
              {activeService === 'dinner'      && t('hero.dinner.title')}
              {activeService === 'group'       && t('hero.group.title')}
              {activeService === 'rewards'     && t('hero.rewards.title')}
            </h1>

            {/* Search container — desktop only */}
            {(activeService === 'transfer' || activeService === 'tours' || activeService === 'attractions') ? (
              <div className="hidden lg:block w-[80%] mx-auto my-3 lg:my-[30px]">
                <SearchTabs prefillRoute={prefillRoute} activeService={activeService} />
                {/* Price-locked promise + payment logos */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4">
                  <span className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5 text-green-400" />{t('hero.priceLocked')}
                  </span>
                  <span className="text-white/20">│</span>
                  <span className="flex items-center gap-2 text-white/70 text-xs font-medium">
                    <span className="bg-white text-blue-700 font-black text-[10px] px-2 py-0.5 rounded tracking-wider">VISA</span>
                    <span className="bg-white rounded px-1.5 py-0.5 text-[10px] font-black" style={{color:'#eb001b'}}>MC</span>
                    <span className="bg-white text-gray-600 font-bold text-[10px] px-2 py-0.5 rounded tracking-wide">PayPal</span>
                    <span className="flex items-center gap-1 text-green-400 text-xs font-semibold"><Lock className="w-3 h-3" />SSL</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="hidden lg:block bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl px-10 py-10 max-w-sm w-full">
                {activeService === 'dinner'  && <Ship     className="w-12 h-12 text-white mx-auto mb-4" />}
                {activeService === 'group'   && <Users    className="w-12 h-12 text-white mx-auto mb-4" />}
                {activeService === 'rewards' && <Gift     className="w-12 h-12 text-amber-400 mx-auto mb-4" />}
                {activeService === 'deals'   && <Tag      className="w-12 h-12 text-white mx-auto mb-4" />}
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {activeService === 'dinner'  ? t('hero.card.cruises') :
                   activeService === 'group'   ? t('hero.card.group')   :
                   activeService === 'deals'   ? t('hero.card.deals')   : t('hero.card.rewards')}
                </h2>
                <p className="text-white/75 text-sm mb-6">
                  {activeService === 'rewards'
                    ? t('hero.card.rewardsDesc')
                    : activeService === 'deals'
                    ? t('hero.card.dealsDesc')
                    : t('hero.card.comingSoon')}
                </p>
                <Link
                  href={activeService === 'deals' ? '/deals' : `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                  className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-brand-50 transition-colors"
                >
                  {activeService === 'rewards' ? t('hero.card.learnMore') : activeService === 'deals' ? t('hero.card.viewDeals') : t('hero.card.notifyMe')}
                </Link>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          MOBILE SERVICE ICON CARD — floats below hero
      ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 -mt-[110px] relative z-10">
      <div className="bg-white rounded-2xl shadow-lg px-4 pt-5 pb-4">
        <div className="grid grid-cols-3 gap-y-5">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const href = tab.href ?? (tab.id === 'transfer' ? '/transfers' : '#');
            return (
              <Link key={tab.id} href={href} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center relative">
                  <Icon className="w-6 h-6 text-white" />
                  {tab.badge && (
                    <span className="absolute -top-0.5 -right-0.5 text-[8px] font-black px-1 py-0.5 rounded-full leading-none bg-red-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight px-1">{t(tab.labelKey)}</p>
              </Link>
            );
          })}
        </div>
      </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          FULL-WIDTH TRUST BAR (desktop only)
      ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-center divide-x divide-gray-200">

          {/* ── Trust badge: free cancellation ── */}
          <div className="flex items-center gap-2.5 px-8 py-3.5">
            <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{t('trust.bar.cancel')}</span>
          </div>

          {/* ── TripAdvisor ── */}
          <div className="flex items-center gap-2.5 px-8 py-3.5">
            <img
              src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
              alt="Tripadvisor"
              className="h-5 w-auto object-contain"
            />
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-[17px] h-[17px] rounded-full" style={{background:'#34e0a1'}} />
              ))}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">({t('trust.bar.reviews')})</span>
          </div>

          {/* ── Trustpilot ── */}
          <div className="flex items-center gap-2.5 px-8 py-3.5">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{t('trust.bar.excellent')}</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-[17px] h-[17px] flex items-center justify-center" style={{background:'#00b67a'}}>
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white" aria-hidden="true">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.1l-6.2 4.2 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                </div>
              ))}
            </div>
            <img
              src="https://cdn.trustpilot.net/brand-assets/4.3.0/logo-black.svg"
              alt="Trustpilot"
              className="h-5 w-auto object-contain"
            />
            <span className="text-xs text-gray-400 whitespace-nowrap">({t('trust.bar.tp.reviews')})</span>
          </div>

        </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          2. RECENTLY VIEWED
      ════════════════════════════════════════════════════════════ */}
      <RecentlyViewedSection />



      {/* ════════════════════════════════════════════════════════════
          WHERE TO NEXT — portrait city card row
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="inspired-heading" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto lg:px-8">

          {/* Section header */}
          <h2 id="inspired-heading" className="text-xl font-bold text-gray-900 mb-5 px-4 sm:px-6 lg:px-0">{t('home.whereNext')}</h2>

          {/* Portrait card row */}
          <div className="relative">

            {/* ── Left arrow ── */}
            {inspiredShowLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-white via-white/70 to-transparent z-10 pointer-events-none flex items-center">
                <button
                  type="button"
                  onClick={() => scrollInspired(-1)}
                  className="pointer-events-auto ml-1 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}

          <div
            ref={inspiredSliderRef}
            className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4 cursor-grab active:cursor-grabbing select-none px-4 sm:px-6 lg:px-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onMouseDown={(e) => {
              const el = e.currentTarget;
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft;
                el.scrollLeft = scrollLeft - (x - startX);
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            {INSPIRED_DESTS.map((dest) => {
              const isSelected = selectedDest === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDest(dest.id)}
                  className="relative rounded-2xl cursor-pointer group outline-none focus:outline-none focus-visible:outline-none shrink-0 w-[42vw] max-w-[200px] sm:w-[30vw] sm:max-w-[210px] lg:w-[17vw] lg:max-w-[220px] aspect-square lg:h-[260px] lg:aspect-auto transition-all duration-200"
                >
                  {/* Photo + selected overlay — clipped to card corners */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <Image
                      src={dest.img}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-500 lg:group-hover:scale-105"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 17vw"
                      unoptimized
                    />
                    {/* #2534ff overlay — 30% opacity when selected, desktop only */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300 pointer-events-none hidden lg:block"
                      style={{ backgroundColor: '#2534ff', opacity: isSelected ? 0.3 : 0 }}
                    />
                  </div>

                  {/* City text */}
                  <div className="absolute bottom-0 left-0 px-4 pb-4 text-left">
                    <p className="font-bold text-white text-[18px] leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">{dest.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

            {/* ── Right arrow ── */}
            {inspiredShowRight && (
              <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-white via-white/70 to-transparent z-10 pointer-events-none flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => scrollInspired(1)}
                  className="pointer-events-auto mr-1 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>{/* end relative */}

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          THINGS TO DO — directly under "Where to next?", auto-updates
          when a city card is selected
      ════════════════════════════════════════════════════════════ */}
      <DynamicTourSections
        selectedDest={selectedDest}
        cityName={INSPIRED_DESTS.find(d => d.id === selectedDest)?.name ?? 'Thailand'}
      />


      {/* ════════════════════════════════════════════════════════════
          GOOGLE REVIEWS — live widget (only shows when GOOGLE_PLACE_ID configured)
      ════════════════════════════════════════════════════════════ */}
      <GoogleReviewsWidget />

      {/* ════════════════════════════════════════════════════════════
          5. VEHICLE OPTIONS — fleet showcase
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="fleet-heading" className="pt-0 pb-6 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Header — matches "Things to do" style */}
          <div className="mb-5 px-4 sm:px-6 lg:px-8">
            <h2 id="fleet-heading" className="text-xl font-bold text-gray-900">{t('home.vehicleOpts')}</h2>
          </div>

          <div className="bg-white rounded-2xl px-0 py-0">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-8 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] px-4 sm:px-6 lg:px-8">
            {CAR_CLASSES.map((cls) => {
              const open = activeVehicle === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setActiveVehicle(open ? null : cls.id)}
                  onMouseEnter={() => setActiveVehicle(cls.id)}
                  onMouseLeave={() => setActiveVehicle(null)}
                  className="shrink-0 w-[78vw] snap-start lg:w-auto lg:max-w-none flex flex-col items-center text-center py-3 px-4 rounded-2xl transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`${cls.name} — up to ${cls.maxPax} passengers`}
                >
                  <div className="relative w-full mb-2" style={{ height: 'clamp(152px, 24vw, 254px)' }}>
                    <Image
                      src={cls.image}
                      alt={`${cls.name} — private transfer Thailand`}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width: 640px) 70vw, 25vw"
                      quality={100}
                      unoptimized
                    />
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-800">{cls.name}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-sm font-semibold text-[#2534ff]">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {cls.maxPax}
                    </span>
                    <span className="flex items-center gap-1">
                      <Luggage className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {cls.maxBags}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          9. TRAVEL BLOG
      ════════════════════════════════════════════════════════════ */}
      {latestPosts.length > 0 && (
        <section aria-labelledby="blog-heading" className="pt-8 pb-20 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-brand-600" aria-hidden="true" />
                  <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest">{t('blog.tagline')}</p>
                </div>
                <h2 id="blog-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">{t('blog.heading')}</h2>
              </div>
              <a href="/blog" className="hidden sm:flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-800 transition-colors">
                {t('blog.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {latestPosts.map((post) => (
                <div key={post.id} className="shrink-0 w-52 lg:w-auto">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {/* Mobile see-all link */}
            <div className="mt-6 flex justify-center sm:hidden">
              <a href="/blog" className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm">
                {t('blog.seeAll')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          10. CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="cta-heading" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 60%, #0d1266 100%)' }} aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">{t('cta.tagline')}</p>
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">{t('cta.heading')}</h2>
          <p className="text-white/65 mb-8 max-w-xl mx-auto">{t('cta.para')}</p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-7 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {t('cta.btn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          12. SEO ROUTE KEYWORD GRID — Trip.com style
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="All transfer routes in Thailand" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">{t('seo.h2')}</h2>

          {/* ── Category tabs ── */}
          <div className="flex gap-2 mb-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {SEO_ROUTE_TABS.map((tab, i) => (
              <button
                key={tab.labelKey}
                type="button"
                onClick={() => setSeoTabIdx(i)}
                className={`shrink-0 px-4 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                  i === seoTabIdx
                    ? 'bg-[#2534ff] text-white border-[#2534ff]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#2534ff] hover:text-[#2534ff]'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* ── Bordered link grid ── */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1">
              {SEO_ROUTE_TABS[seoTabIdx].routes.map((route) => {
                const toIdx = route.toLowerCase().lastIndexOf(' to ');
                const from  = toIdx !== -1 ? route.slice(0, toIdx).trim() : route;
                const to    = toIdx !== -1 ? route.slice(toIdx + 4).trim() : '';
                return (
                  <a
                    key={route}
                    href={`/results?pickup_address=${encodeURIComponent(from)}&dropoff_address=${encodeURIComponent(to)}`}
                    onClick={(e) => handleSeoRouteClick(route, e)}
                    className="text-sm text-brand-600 hover:text-brand-800 hover:underline py-1.5 leading-snug truncate"
                  >
                    {route}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

        <Footer />
        </main>
      </div>

    </Fragment>
  );
}
