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
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget'
import {
  Star, CheckCircle2, BookOpen, Heart,
  Car, Plane, Users, ArrowRight,
  ArrowLeftRight,
  Compass, Ticket, Ship, Gift, ChevronRight, Tag,
  Clock, Lock, Shield,
} from 'lucide-react';

/* ── Service sidebar tabs (with section groupings) ────────────────────────── */
const SERVICE_TABS = [
  // § 1 — Core services
  {
    id: 'transfer', icon: Car, label: 'Private Transfers', badge: null, badgeColor: '', href: undefined, s: 1,
    children: [
      { id: 'airport',       icon: Plane,          label: 'Airport Transfer', href: '/airport-transfers' },
      { id: 'city-to-city',  icon: ArrowLeftRight, label: 'City-to-City',     href: '/transfers' },
      { id: 'charter',       icon: Clock,          label: 'Charter Rental',   href: '#' },
    ],
  },
  { id: 'tours',       icon: Compass,     label: 'Tours & Experiences', badge: null,       badgeColor: '',     href: '/tours',        s: 1 },
  { id: 'attractions', icon: Ticket,      label: 'Attraction Tickets',  badge: null,       badgeColor: '',     href: '/attractions',  s: 1 },
  { id: 'group',       icon: Users,       label: 'Group Tours',         badge: null,       badgeColor: '',     href: '/group-booking',   s: 1 },
  // § 3 — Planning tools
  { id: 'deals',       icon: Tag,         label: 'Deals & Offers',      badge: 'Hot',      badgeColor: 'red',  href: '/deals',     s: 3 },
  // § 4 — Account / loyalty
  { id: 'rewards',     icon: Gift,        label: 'Werest Rewards',      badge: 'Earn pts', badgeColor: 'amber',href: '/deals',     s: 4 },
];

/* ── SEO route link grid ──────────────────────────────────────────────────── */
const SEO_ROUTES = [
  [
    'Bangkok Airport to Bangkok', 'Bangkok to Pattaya', 'Phuket Airport to Bang Tao',
    'Don Mueang Airport to Bangkok', 'Karon to Khao Lak', 'Phuket to Krabi',
    'Chiang Mai to Golden Triangle', 'Ao Nang to Phuket', 'Bangkok Airport to Don Mueang',
    'Sukhothai to Bangkok', 'Bangkok to Chiang Mai', 'Chiang Mai to White Temple',
    'Chiang Mai to Lampang', 'Bangkok to Chumphon', 'Hat Yai to Penang',
    'Bangkok to Lopburi', 'Bangkok to Surat Thani', 'Karon to Krabi',
    'Laem Chabang Port to Don Mueang', 'Pattaya to Kanchanaburi',
    'Krabi to Trang', 'Bangkok to Buriram', 'Bangkok to Krabi',
    'Bangkok to Phitsanulok', 'Hua Hin to Surat Thani',
  ],
  [
    'Chiang Mai to Chiang Rai', 'Chiang Mai to Pai', 'Phuket Airport to Kamala Beach',
    'Chiang Mai to Sukhothai', 'Bangkok to Ayutthaya', 'Khao Lak to Krabi',
    'Bangkok Airport to Hua Hin', 'Phuket Airport to Nai Thon',
    'Kanchanaburi to Ayutthaya', 'Phuket Airport to Panwa', 'Chiang Rai to Sukhothai',
    'Khao Sok to Krabi', 'Phitsanulok to Chiang Mai', 'Bangkok Airport to Ban Phe Pier',
    'Nakhon Ratchasima to Bangkok', 'Bangkok to Chanthaburi', 'Phuket to Railay',
    'Amphawa to Bangkok', 'Bangkok to Ratchaburi', 'Bangkok to Sai Yok',
    'Phuket to Surat Thani', 'Bangkok Airport to Lopburi',
    'Chiang Mai to Hua Hin', 'Chiang Rai to Pai', 'Bangkok to Nakhon Pathom',
  ],
  [
    'Bangkok Airport to Pattaya', 'Phuket Airport to Patong', 'Bangkok to Hua Hin',
    'Phuket Airport to Kata Beach', 'Phuket Airport to Khao Lak',
    'Phuket Airport to Phuket Town', 'Phuket Airport to Karon', 'Phuket to Khao Lak',
    'Bangkok to Khao Yai', 'Khao Sok to Phuket', 'Phuket Airport to Rawai',
    'Krabi to Surat Thani', 'Pattaya to Hua Hin', 'Don Mueang Airport to Ayutthaya',
    'Phuket Airport to Chalong', 'Nakhon Ratchasima to Bangkok Airport',
    'Don Mueang Airport to Khao Yai', 'Pattaya to Ayutthaya',
    'Laem Chabang to Bangkok Airport', 'Bangkok Airport to Rayong',
    'Pattaya to Lopburi', 'Phuket to Hua Hin', 'Bangkok Airport to Chanthaburi',
    'Laem Chabang to Bangkok', 'Don Mueang Airport to Pattaya',
  ],
  [
    'Laem Chabang Port to Bangkok', 'Chiang Mai Airport to Chiang Rai',
    'Karon to Railay', 'Bangkok to Kanchanaburi', 'Phuket Airport to Mai Khao',
    'Chiang Rai Airport to Chiang Saen', 'Laem Chabang Port to Bangkok Airport',
    'Bangkok Airport to Kanchanaburi', 'Ayutthaya to Sukhothai',
    'Don Mueang Airport to Kanchanaburi', 'Bangkok Airport to Ayutthaya',
    'Phuket to Don Sak', 'Bangkok to Laem Sok', 'Bangkok Airport to Khao Yai',
    'Bangkok to Nakhon Sawan', 'Bangkok Airport to Nakhon Sawan',
    'Bangkok Airport to Laem Sok', 'Bangkok to Don Sak', 'Bangkok to Rayong',
    'Bangkok to Damnoen Saduak', 'Bangkok Airport to Surin', 'Krabi to Hua Hin',
    'Bangkok to Surin', 'Bangkok to Koh Chang', 'Bangkok Airport to Nakhon Ratchasima',
  ],
];

/* ── New-user exclusive cards ─────────────────────────────────────────────── */
const NEW_USER_CARDS = [
  { highlight: true,  title: 'New users get more discounts on travel!', sub: 'Sign in to unlock exclusive welcome deals', cta: 'Sign in & claim all', href: '#', openModal: true,  emoji: '🎁', gradient: 'from-brand-600 to-brand-800' },
  { highlight: false, title: '10% off',       sub: 'First Transfer',         cta: 'Claim all', href: '#',        openModal: true,  emoji: '🚗' },
  { highlight: false, title: 'Free cancel',   sub: 'Up to 24h before pickup',cta: 'Claim all', href: '/booking', openModal: false, emoji: '🛡️' },
  { highlight: false, title: '15% off',       sub: 'Airport Transfers',      cta: 'Claim all', href: '/results', openModal: false, emoji: '✈️' },
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
const PROMO_BANNERS = [
  { bg: 'from-[#2534ff] to-[#1a26cc]', tag: 'New User Offer',  title: 'First Booking — 10% Off',   desc: 'Sign in and save on your first private transfer',  cta: 'Claim Now',  href: '#',        openModal: true  },
  { bg: 'from-emerald-500 to-teal-600', tag: 'Free Cancel',    title: 'Book with Confidence',      desc: 'Cancel for free up to 24 hours before pickup',     cta: 'Learn More', href: '/booking', openModal: false },
  { bg: 'from-violet-600 to-purple-700', tag: 'Earn Rewards',  title: 'Collect Werest Points',     desc: 'Earn on every trip and redeem for free rides',      cta: 'Join Now',   href: '#',        openModal: true  },
  { bg: 'from-amber-500 to-orange-600', tag: 'Popular Route',  title: 'Bangkok → Pattaya ฿1,800', desc: 'Fixed price · No surge · Available 24/7',           cta: 'Book Now',   href: '/results?pickup_address=Bangkok&dropoff_address=Pattaya', openModal: false },
  { bg: 'from-[#0a0e2e] to-[#1a20a0]', tag: 'Airport Special', title: 'Airport Pickup from ฿600', desc: 'Professional driver waiting at arrivals',            cta: 'See Routes', href: '/results', openModal: false },
];

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
    image: 'https://www.toyota.co.th/media/product/series/grades/v/altis/19/8055e76f92e3f8e92b2f16771cebb42db2bcb9eda12ca1565ed5ce5a98ad4d56.webp',
  },
  {
    id: 'suv',
    name: 'SUV',
    maxPax: 4,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/fortuner_leader/47/02eff79ee7167df9807c067a0025b87e55458f0203b2b91f70e6b537fc6abf84.webp',
  },
  {
    id: 'minivan',
    name: 'Minivan',
    maxPax: 10,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/hiace/214/7c64131428daae1b2ac92c35d5cb6432a75c65eb3df845fa0da308e55cd5f116.webp',
  },
  {
    id: 'luxury-mpv',
    name: 'Luxury MPV',
    maxPax: 6,
    image: 'https://www.toyota.co.th/media/product/series/grades/v/alphard/27/9bd8c8811a6213ea1429d91b5bcba32246b73d1255cbb3ae6be04309d1231b08.webp',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePageClient({ latestPosts = [] }: { latestPosts?: BlogPostSummary[] }) {
  const { t } = useLocale();
  const { openModal } = useAuthModal();
  const [blogTab, setBlogTab] = useState(0);
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

  /* ── Promo slider ── */
  const sliderRef    = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const touchStartX  = useRef(0);
  const touchStartY  = useRef(0);
  const touchOffset  = useRef(0);
  const isDragging   = useRef(false);
  const [sliderIdx,  setSliderIdx]  = useState(0);
  const [sliderStep, setSliderStep] = useState(0); // px per item + gap

  useEffect(() => {
    function measure() {
      if (!sliderRef.current) return;
      const w   = sliderRef.current.offsetWidth;
      const ipv = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      setSliderStep((w + 12) / ipv); // 12 = gap-3
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const ipv = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const max = PROMO_BANNERS.length - ipv;
    const t = setInterval(() => setSliderIdx(i => i >= max ? 0 : i + 1), 3000);
    return () => clearInterval(t);
  }, [sliderStep]);

  /* ── Promo slider touch drag handlers ── */
  const handlePromoTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchOffset.current = 0;
    isDragging.current  = false;
    if (trackRef.current) trackRef.current.style.transition = 'none';
  };

  const handlePromoTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Ignore if vertical scroll is dominant and drag hasn't started yet
    if (!isDragging.current && Math.abs(dx) < Math.abs(dy)) return;
    isDragging.current  = true;
    touchOffset.current = dx;
    if (trackRef.current && sliderStep) {
      trackRef.current.style.transform = `translateX(${-(sliderIdx * sliderStep) + dx}px)`;
    }
  };

  const handlePromoTouchEnd = () => {
    if (trackRef.current) trackRef.current.style.transition = 'transform 500ms ease-in-out';
    if (!isDragging.current) return;
    const delta = touchOffset.current;
    const ipv   = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const max   = PROMO_BANNERS.length - ipv;
    let newIdx  = sliderIdx;
    if (delta < -50 && sliderIdx < max) newIdx = sliderIdx + 1;
    else if (delta > 50 && sliderIdx > 0) newIdx = sliderIdx - 1;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${newIdx * sliderStep}px)`;
    }
    setSliderIdx(newIdx);
    touchOffset.current = 0;
    isDragging.current  = false;
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
      <Navbar />
      {/* ════════════════════════════════════════════════════════════
          PAGE SHELL
      ════════════════════════════════════════════════════════════ */}
      <div className="pt-16">
        <main>

      {/* ════════════════════════════════════════════════════════════
          1. HERO — full-width gradient
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Hero" className="mb-0 lg:mb-[30px] lg:px-6 lg:pt-6">

        {/* ── Hero card ── */}
        <div className="flex flex-col items-center justify-start lg:justify-center overflow-hidden relative lg:min-h-[680px] lg:rounded-[2rem]" style={{ minHeight: '260px' }}>
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

          {/* Central content */}
          <div id="hero-search-anchor" className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-8 pb-2 lg:py-12 flex flex-col items-center gap-3 lg:gap-5 text-center self-start lg:self-center">

            {/* Title */}
            <h1 className="text-[22px] leading-snug lg:text-5xl font-extrabold text-white tracking-tight">
              {activeService === 'transfer'    && <><span className="block">Your Thailand Journey</span><span className="block">Starts Here</span></>}
              {activeService === 'tours'       && 'Tours & Experiences in Thailand'}
              {activeService === 'attractions' && 'Top Attraction Tickets'}
              {activeService === 'deals'       && 'Exclusive Deals & Offers'}
              {activeService === 'dinner'      && 'Unforgettable Cruises'}
              {activeService === 'group'       && 'Group Adventures Await'}
              {activeService === 'rewards'     && 'Earn Werest Rewards'}
            </h1>

            {/* Search container — desktop only */}
            {(activeService === 'transfer' || activeService === 'tours' || activeService === 'attractions') ? (
              <div className="hidden lg:block w-full my-3 lg:my-[30px]">
                <SearchTabs prefillRoute={prefillRoute} activeService={activeService} />
                {/* Price-locked promise + payment logos */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4">
                  <span className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5 text-green-400" />Price locked at booking — no surprises
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
                  {activeService === 'dinner'  ? 'Cruises'          :
                   activeService === 'group'   ? 'Group Tours'      :
                   activeService === 'deals'   ? 'Hot Deals'        : 'Werest Rewards'}
                </h2>
                <p className="text-white/75 text-sm mb-6">
                  {activeService === 'rewards'
                    ? 'Earn points on every booking and redeem for free trips.'
                    : activeService === 'deals'
                    ? 'Browse our latest exclusive discounts.'
                    : 'Coming soon — be the first to know when it launches.'}
                </p>
                <Link
                  href={activeService === 'deals' ? '/deals' : `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                  className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-brand-50 transition-colors"
                >
                  {activeService === 'rewards' ? 'Learn More' : activeService === 'deals' ? 'View Deals' : 'Notify Me'}
                </Link>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          MOBILE SERVICE ICON CARD — floats below hero
      ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden mx-3 -mt-[130px] relative z-10 bg-white rounded-2xl shadow-lg px-4 pt-5 pb-4">
        <div className="grid grid-cols-3 gap-y-5">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const href = tab.href ?? (tab.id === 'transfer' ? '/results' : '#');
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
                <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight px-1">{tab.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          PLATFORM REVIEW SLIDER
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Reviews" className="bg-white border-b border-gray-100 py-8 mt-6 lg:mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(() => {
            const platBase = PLATFORM_REVIEWS[reviewPlatIdx];
            const plat = platBase.id === 'tripadvisor' && taReviews
              ? { ...platBase, reviews: taReviews }
              : platBase;
            const review = plat.reviews[reviewCardIdx];
            return (
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">

                {/* ── LEFT: 2-row full-width container bar ── */}
                <div className="shrink-0 w-full lg:w-[320px]">
                  <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden w-full">

                    {/* ── Row 1: TripAdvisor — full width ── */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 w-full">
                      {/* Logo left-aligned */}
                      <img
                        src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
                        alt="Tripadvisor"
                        className="h-[22px] w-auto object-contain object-left"
                      />
                      {/* 5 green bubble dots right side */}
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-[18px] h-[18px] rounded-full" style={{background:'#34e0a1'}} />
                        ))}
                      </div>
                    </div>

                    {/* ── Row 2: Trustpilot — full width ── */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white w-full">
                      {/* Logo left-aligned — same height as TripAdvisor */}
                      <img
                        src="https://cdn.trustpilot.net/brand-assets/4.3.0/logo-black.svg"
                        alt="Trustpilot"
                        className="h-[22px] w-auto object-contain object-left"
                      />
                      {/* Excellent + 5 star boxes right side */}
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-[18px] h-[18px] flex items-center justify-center" style={{background:'#00b67a'}}>
                              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white" aria-hidden="true">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.1l-6.2 4.2 2.4-7.4L2 9.4h7.6z"/>
                              </svg>
                            </div>
                          ))}
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Divider ── */}

                {/* ── RIGHT: Quick stats ── */}
                <div className="hidden lg:flex flex-col gap-4 shrink-0 text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">4.9<span className="text-amber-400">★</span></p>
                    <p className="text-[11px] text-gray-500">500+ reviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">24h</p>
                    <p className="text-[11px] text-gray-500">Free cancel</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">&lt;5 min</p>
                    <p className="text-[11px] text-gray-500">WhatsApp reply</p>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. NEW USER EXCLUSIVE
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="New user exclusive" className="bg-white pt-[30px] pb-7 lg:pt-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New user exclusive</h2>
          {/* Mobile: single-row horizontal scroll with snap; sm+: 2-col grid; lg+: 4-col grid */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {NEW_USER_CARDS.map((c) => {
              const mobileCard = 'shrink-0 w-[75vw] max-w-[264px] snap-start lg:w-auto lg:max-w-none';
              const cls = c.highlight
                ? `group col-span-1 flex flex-col justify-between rounded-2xl p-4 lg:p-5 bg-gradient-to-br ${(c as { gradient?: string }).gradient ?? ''} min-h-[148px] ${mobileCard}`
                : `group flex flex-col justify-between rounded-2xl p-4 lg:p-5 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 min-h-[148px] bg-white ${mobileCard}`;

              const inner = c.highlight ? (
                <>
                  <div>
                    <span className="text-2xl">{c.emoji}</span>
                    <p className="text-white font-bold text-sm leading-snug mt-2">{c.title}</p>
                    <p className="text-white/70 text-xs mt-1 leading-snug">{c.sub}</p>
                  </div>
                  <span className="mt-4 inline-block bg-white text-brand-700 font-bold text-xs px-4 py-2 rounded-lg group-hover:bg-brand-50 transition-colors text-center">
                    {c.cta}
                  </span>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-2xl">{c.emoji}</span>
                    <p className="font-extrabold text-gray-900 text-xl mt-2 leading-tight">{c.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{c.sub}</p>
                  </div>
                  <span className="mt-4 inline-block bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-lg group-hover:bg-brand-700 transition-colors text-center">
                    {c.cta}
                  </span>
                </>
              );

              return c.openModal ? (
                <button key={c.title} type="button" onClick={() => openModal('register')} className={cls}>
                  {inner}
                </button>
              ) : (
                <Link key={c.title} href={c.href} className={cls}>
                  {inner}
                </Link>
              );
            })}
            {/* Trailing spacer so last card doesn't flush against screen edge on mobile */}
            <div className="shrink-0 w-1 lg:hidden" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. PROMOTIONAL BANNER SLIDER
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Promotions" className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Slider container */}
          <div className="relative overflow-hidden sm:overflow-visible">
            {/* Left arrow */}
            <button
              type="button"
              aria-label="Previous"
              onClick={() => {
                const ipv = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
                const max = PROMO_BANNERS.length - ipv;
                setSliderIdx(i => i <= 0 ? max : i - 1);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>

            {/* Right arrow */}
            <button
              type="button"
              aria-label="Next"
              onClick={() => {
                const ipv = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
                const max = PROMO_BANNERS.length - ipv;
                setSliderIdx(i => i >= max ? 0 : i + 1);
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:border-brand-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Track */}
            <div ref={sliderRef} className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-3"
                style={{ transform: `translateX(-${sliderIdx * sliderStep}px)`, transition: 'transform 500ms ease-in-out' }}
                onTouchStart={handlePromoTouchStart}
                onTouchMove={handlePromoTouchMove}
                onTouchEnd={handlePromoTouchEnd}
              >
                {PROMO_BANNERS.map((b) => {
                  const inner = (
                    <div className={`relative h-[145px] sm:h-[165px] overflow-hidden bg-gradient-to-br ${b.bg} flex flex-col justify-between p-4`}>
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white px-2 py-0.5 rounded-full w-fit">{b.tag}</span>
                      <div>
                        <p className="text-white font-extrabold text-base sm:text-lg leading-tight">{b.title}</p>
                        <p className="text-white/75 text-xs mt-1 leading-snug hidden sm:block">{b.desc}</p>
                        <p className="text-white/90 text-[11px] font-semibold mt-2">{b.cta} →</p>
                      </div>
                    </div>
                  );
                  return b.openModal ? (
                    <button
                      key={b.title}
                      type="button"
                      onClick={() => openModal('register')}
                      className="shrink-0 block rounded-2xl overflow-hidden text-left"
                      style={{ width: sliderStep ? sliderStep - 12 : 'auto' }}
                    >
                      {inner}
                    </button>
                  ) : (
                    <Link
                      key={b.title}
                      href={b.href}
                      className="shrink-0 block rounded-2xl overflow-hidden"
                      style={{ width: sliderStep ? sliderStep - 12 : 'auto' }}
                    >
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {Array.from({ length: PROMO_BANNERS.length }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSliderIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === sliderIdx ? 'bg-brand-600 w-4' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════
          WHERE TO NEXT — portrait city card row
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="inspired-heading" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <h2 id="inspired-heading" className="text-xl font-bold text-gray-900 mb-5">Where to next?</h2>

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
            className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4"
          >
            {INSPIRED_DESTS.map((dest) => {
              const isSelected = selectedDest === dest.id;
              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDest(dest.id)}
                  className="relative rounded-2xl cursor-pointer group outline-none focus:outline-none focus-visible:outline-none shrink-0 w-[45vw] max-w-[210px] sm:w-[30vw] sm:max-w-[210px] lg:w-[17vw] lg:max-w-[220px] h-[260px] transition-all duration-200"
                >
                  {/* Photo + selected overlay — clipped to card corners */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <Image
                      src={dest.img}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 17vw"
                      unoptimized
                    />
                    {/* #2534ff overlay — 30% opacity when selected */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                      style={{ backgroundColor: '#2534ff', opacity: isSelected ? 0.3 : 0 }}
                    />
                  </div>

                  {/* City text */}
                  <div className="absolute bottom-0 left-0 px-4 pb-4 text-left">
                    <p className="font-bold text-white text-[18px] leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">{dest.name}</p>
                    <p className="text-white text-[13px] mt-0.5 font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">Explore →</p>
                  </div>

                  {/* ▼ Downward triangle — points to the content section below */}
                  {isSelected && (
                    <div className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[13px] border-r-[13px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#2534ff] z-20" />
                  )}
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
          POPULAR DESTINATIONS — horizontal scroll slider
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="popular-dest-heading" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-5 px-4 sm:px-6 lg:px-8">
            <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
            <h2 id="popular-dest-heading" className="text-xl font-bold text-gray-900">Popular Destinations</h2>
          </div>

          {/* One-row horizontal scroll — all screen sizes */}
          <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6 lg:px-8 pb-2">
            {POPULAR_DESTINATIONS.map((dest) => (
              <Link
                key={dest.id}
                href={dest.href}
                className="relative shrink-0 overflow-hidden rounded-2xl group"
                style={{ width: 'clamp(140px, 38vw, 220px)', height: 'clamp(170px, 28vw, 260px)' }}
              >
                <Image
                  src={dest.img}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-3 font-bold text-white text-[15px] leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">
                  {dest.name}
                </p>
              </Link>
            ))}
            {/* trailing spacer on mobile */}
            <div className="shrink-0 w-1" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          GOOGLE REVIEWS — live widget (only shows when GOOGLE_PLACE_ID configured)
      ════════════════════════════════════════════════════════════ */}
      <GoogleReviewsWidget />

      {/* ════════════════════════════════════════════════════════════
          5. VEHICLE OPTIONS — fleet showcase
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="fleet-heading" className="pt-0 pb-6 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-4 lg:mb-8">
            <h2 id="fleet-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">Vehicle Options</h2>
          </div>

          <div className="bg-white rounded-2xl px-3 py-0 lg:px-8 lg:py-3">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-12 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {CAR_CLASSES.map((cls) => {
              const open = activeVehicle === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setActiveVehicle(open ? null : cls.id)}
                  onMouseEnter={() => setActiveVehicle(cls.id)}
                  onMouseLeave={() => setActiveVehicle(null)}
                  className="shrink-0 w-[70vw] max-w-[286px] snap-start lg:w-auto lg:max-w-none flex flex-col items-center text-center py-2 px-5 rounded-2xl transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`${cls.name} — up to ${cls.maxPax} passengers`}
                >
                  <div className="relative w-full mb-2" style={{ height: 'clamp(117px, 18vw, 195px)' }}>
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
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                    <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Up to {cls.maxPax} passengers
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
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
          12. SEO ROUTE KEYWORD GRID
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="All transfer routes in Thailand" className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('seo.h2')}</h2>
          <nav aria-label="Transfer route directory">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0">
              {SEO_ROUTES.map((col, ci) => (
                <ul key={ci} className="space-y-0">
                  {col.map((route) => {
                    const toIdx = route.toLowerCase().lastIndexOf(' to ');
                    const from  = toIdx !== -1 ? route.slice(0, toIdx).trim() : route;
                    const to    = toIdx !== -1 ? route.slice(toIdx + 4).trim() : '';
                    return (
                      <li key={route}>
                        <a
                          href={`/results?pickup_address=${encodeURIComponent(from)}&dropoff_address=${encodeURIComponent(to)}`}
                          onClick={(e) => handleSeoRouteClick(route, e)}
                          className="group/r block text-sm text-brand-700 hover:text-brand-900 py-1.5 leading-snug flex items-center gap-1"
                        >
                          <span className="group-hover/r:underline">{route}</span>
                          <ArrowLeftRight className="w-3 h-3 shrink-0 opacity-0 group-hover/r:opacity-60 transition-opacity" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </nav>
        </div>
      </section>

        <Footer />
        </main>
      </div>

    </Fragment>
  );
}
