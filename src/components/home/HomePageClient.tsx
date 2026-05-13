'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState, useCallback, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchTabs from '@/components/search/SearchTabs';
import BlogCard from '@/components/blog/BlogCard';
import DynamicTourSections from '@/components/home/DynamicTourSections';
import { useLocale } from '@/context/LocaleContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useWishlist } from '@/context/WishlistContext';
import { type BlogPostSummary } from '@/lib/blog';
import {
  Star, CheckCircle2, BookOpen, Heart,
  Car, Plane, Users, ArrowRight,
  ArrowLeftRight,
  Compass, Ticket, Ship, Gift, ChevronRight, Tag,
  Clock, Umbrella, Headphones,
} from 'lucide-react';

/* ── Service sidebar tabs (with section groupings) ────────────────────────── */
const SERVICE_TABS = [
  // § 1 — Core services
  {
    id: 'transfer', icon: Car, label: 'Private Transfers', badge: null, badgeColor: '', href: undefined, s: 1,
    children: [
      { id: 'airport', icon: Plane, label: 'Airport Transfer', href: '/results' },
      { id: 'charter', icon: Clock, label: 'Charter Rental',   href: '#' },
    ],
  },
  { id: 'tours',       icon: Compass,     label: 'Tours & Experiences', badge: null,       badgeColor: '',     href: '/tours',        s: 1 },
  { id: 'attractions', icon: Ticket,      label: 'Attraction Tickets',  badge: null,       badgeColor: '',     href: '/attractions',  s: 1 },
  { id: 'dinner',      icon: Ship,        label: 'Cruises',             badge: 'New',      badgeColor: 'blue', href: '/cruises',      s: 1 },
  { id: 'group',       icon: Users,       label: 'Group Tours',         badge: null,       badgeColor: '',     href: '/group-booking',   s: 1 },
  // § 3 — Planning tools
  { id: 'deals',       icon: Tag,         label: 'Deals & Offers',      badge: 'Hot',      badgeColor: 'red',  href: '/deals',     s: 3 },
  // § 4 — Account / loyalty
  { id: 'rewards',     icon: Gift,        label: 'Werest Rewards',      badge: 'Earn pts', badgeColor: 'amber',href: undefined,    s: 4 },
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

/* ── Auto-slider promotional banners ─────────────────────────────────────── */
const PROMO_BANNERS = [
  { img: '/images/promos/promo1.avif', tag: 'New User Offer',  title: 'First Booking — 10% Off',   desc: 'Sign in and save on your first private transfer',  cta: 'Claim Now',  href: '#',        openModal: true  },
  { img: '/images/promos/promo2.avif', tag: 'Free Cancel',     title: 'Book with Confidence',      desc: 'Cancel for free up to 24 hours before pickup',     cta: 'Learn More', href: '/booking', openModal: false },
  { img: '/images/promos/promo3.avif', tag: 'Earn Rewards',    title: 'Collect Werest Points',     desc: 'Earn on every trip and redeem for free rides',      cta: 'Join Now',   href: '#',        openModal: true  },
  { img: '/images/promos/promo4.avif', tag: 'Popular Route',   title: 'Bangkok → Pattaya ฿1,800', desc: 'Fixed price · No surge · Available 24/7',           cta: 'Book Now',   href: '/results?pickup_address=Bangkok&dropoff_address=Pattaya', openModal: false },
  { img: '/images/promos/promo5.avif', tag: 'Airport Special', title: 'Airport Pickup from ฿900', desc: 'Professional driver waiting at arrivals',            cta: 'See Routes', href: '/results', openModal: false },
];

/* ── Get-inspired destination cards ─────────────────────────────────────── */
const INSPIRED_DESTS = [
  { id: 'anywhere',  name: 'Anywhere',    sub: 'Explore all of Thailand',  haul: null,           img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=600&q=80', wide: true  },
  { id: 'bangkok',   name: 'Bangkok',     sub: 'City tours & transfers',   haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80', wide: false },
  { id: 'phuket',    name: 'Phuket',      sub: 'Beach & island trips',     haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80', wide: false },
  { id: 'chiangmai', name: 'Chiang Mai',  sub: 'Cultural experiences',     haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', wide: false },
  { id: 'krabi',     name: 'Krabi',       sub: 'Nature & adventure',       haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',   wide: false },
  { id: 'pattaya',   name: 'Pattaya',     sub: 'Day trips & beach',        haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=600&q=80', wide: false },
  { id: 'huahin',    name: 'Hua Hin',     sub: 'Beaches & royal town',     haul: 'Medium haul',  img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80', wide: false },
  { id: 'samui',     name: 'Koh Samui',   sub: 'Island paradise',          haul: 'Medium haul',  img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=600&q=80', wide: false },
  { id: 'ayutthaya', name: 'Ayutthaya',   sub: 'Ancient temples & ruins',  haul: 'Short haul',   img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80', wide: false },
];

/* ── Places you may like data (per destination) ─────────────────────────── */
type PlaceEntry = {
  name: string; category: string; sub: string; img: string;
  price: string; rating: number; reviews: number; booked: string;
  badge?: string; originalPrice?: string; deals?: string[];
};
const PLACES_BY_DEST: Record<string, PlaceEntry[]> = {
  anywhere: [
    { name: 'Grand Palace & Emerald Buddha', category: 'Attraction', sub: 'Bangkok',    img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80', price: '฿500',       rating: 4.9, reviews: 18200, booked: '500K+', badge: 'Best seller',  originalPrice: '฿600',   deals: ['10% off', 'Audio guide'] },
    { name: 'Phi Phi Islands Speedboat',     category: 'Day Trip',   sub: 'Phuket',    img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=400&q=80', price: '฿3,200',     rating: 4.9, reviews: 7846,  booked: '300K+', badge: 'Likely to sell out', deals: ['Buy 4 get 25% off'] },
    { name: 'Airport Transfer BKK → City',  category: 'Transfer',   sub: 'Bangkok',   img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', price: 'From ฿900', rating: 4.9, reviews: 15426, booked: '1M+',   badge: 'Top rated',   deals: ['Free waiting time'] },
    { name: 'Elephant Sanctuary Day Trip',  category: 'Tour',       sub: 'Chiang Mai',img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', price: '฿2,500',     rating: 4.8, reviews: 3200,  booked: '200K+', badge: 'Eco-friendly', deals: ['Lunch included'] },
  ],
  bangkok: [
    { name: 'Grand Palace & Wat Phra Kaew',    category: 'Attraction', sub: 'Old Town',    img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80', price: '฿500',       rating: 4.9, reviews: 18200, booked: '500K+', badge: 'Best seller',  originalPrice: '฿600', deals: ['10% off'] },
    { name: 'Damnoen Saduak Floating Market',  category: 'Day Trip',   sub: 'Ratchaburi',  img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=80', price: '฿1,800',     rating: 4.8, reviews: 5400,  booked: '150K+',                         deals: ['Breakfast included'] },
    { name: 'Suvarnabhumi Airport Transfer',   category: 'Transfer',   sub: 'BKK Airport', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', price: 'From ฿900', rating: 4.9, reviews: 15426, booked: '1M+',   badge: 'Top rated',   deals: ['Free waiting time'] },
    { name: 'Bangkok Night Tour & Street Food',category: 'Tour',       sub: 'City Centre', img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80', price: '฿2,200',     rating: 4.7, reviews: 2100,  booked: '80K+',  badge: 'New',          deals: ['Dinner included'] },
  ],
  phuket: [
    { name: 'Phi Phi Islands Speedboat',   category: 'Day Trip', sub: 'Andaman Sea',  img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=400&q=80', price: '฿3,200',     rating: 4.9, reviews: 7846, booked: '300K+', badge: 'Likely to sell out', deals: ['Buy 4 get 25% off'] },
    { name: 'Phuket Airport Transfer',     category: 'Transfer', sub: 'HKT Airport',  img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80', price: 'From ฿800', rating: 4.9, reviews: 9200, booked: '400K+', badge: 'Top rated',           deals: ['Free waiting time'] },
    { name: 'James Bond Island Tour',      category: 'Day Trip', sub: 'Phang Nga Bay',img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', price: '฿2,800',     rating: 4.8, reviews: 4300, booked: '200K+', badge: 'Likely to sell out' },
    { name: 'Old Phuket Town Exploration', category: 'Tour',     sub: 'Phuket Town',  img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80', price: '฿1,200',     rating: 4.7, reviews: 1800, booked: '60K+' },
  ],
  chiangmai: [
    { name: 'Elephant Nature Park',        category: 'Tour',     sub: 'Mae Taeng',   img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', price: '฿2,500',     rating: 4.9, reviews: 3200, booked: '200K+', badge: 'Eco-friendly', deals: ['Lunch included'] },
    { name: 'Chiang Mai Airport Transfer', category: 'Transfer', sub: 'CNX Airport', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', price: 'From ฿400', rating: 4.9, reviews: 5100, booked: '180K+', badge: 'Top rated',   deals: ['Free waiting time'] },
    { name: 'Doi Inthanon National Park',  category: 'Day Trip', sub: 'Chom Thong',  img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', price: '฿2,200',     rating: 4.8, reviews: 2800, booked: '100K+' },
    { name: 'Night Bazaar & Street Food',  category: 'Tour',     sub: 'Old City',    img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=80', price: '฿1,500',     rating: 4.7, reviews: 1400, booked: '50K+',                         deals: ['Dinner included'] },
  ],
  krabi: [
    { name: '4 Islands Snorkeling Trip', category: 'Day Trip',   sub: 'Andaman Sea', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', price: '฿1,800',     rating: 4.9, reviews: 6200, booked: '250K+', badge: 'Best seller', deals: ['Lunch included'] },
    { name: 'Krabi → Phuket Airport',   category: 'Transfer',   sub: 'HKT Airport', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80', price: 'From ฿2,400',rating: 4.8, reviews: 2100, booked: '80K+',                        deals: ['Free waiting time'] },
    { name: 'Ao Nang & Railay Cave',    category: 'Attraction', sub: 'Ao Nang',     img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', price: '฿200',       rating: 4.7, reviews: 3400, booked: '120K+',                       originalPrice: '฿250', deals: ['20% off'] },
    { name: 'Tiger Cave Temple Hike',   category: 'Tour',       sub: 'Krabi Town',  img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', price: '฿1,200',     rating: 4.8, reviews: 1900, booked: '70K+' },
  ],
  pattaya: [
    { name: 'Sanctuary of Truth Tour',    category: 'Attraction', sub: 'Pattaya',          img: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80', price: '฿500',       rating: 4.9, reviews: 4800, booked: '180K+', badge: 'Best seller', originalPrice: '฿600', deals: ['10% off'] },
    { name: 'Bangkok → Pattaya Transfer', category: 'Transfer',   sub: 'BKK → Pattaya',   img: 'https://images.unsplash.com/photo-1548625361-58a9d86b0e5b?w=400&q=80', price: 'From ฿1,800',rating: 4.8, reviews: 7200, booked: '350K+', badge: 'Top rated',   deals: ['Free waiting time'] },
    { name: 'Coral Island Day Trip',      category: 'Day Trip',   sub: 'Gulf of Thailand', img: 'https://images.unsplash.com/photo-1595435934349-8d929fbb7bc5?w=400&q=80', price: '฿2,200',     rating: 4.7, reviews: 2900, booked: '100K+',                      deals: ['Lunch included'] },
    { name: 'Pattaya City & Temple Tour', category: 'Tour',       sub: 'City Centre',      img: 'https://images.unsplash.com/photo-1548625361-58a9d86b0e5b?w=400&q=80', price: '฿1,500',     rating: 4.8, reviews: 1600, booked: '55K+',                       deals: ['Guide included'] },
  ],
};

/* ── Car classes ─────────────────────────────────────────────────────────── */
const CAR_CLASSES = [
  {
    id: 'sedan',
    name: 'Sedan',
    maxPax: 3,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/14png/w=600,h=400,fit=contain',
  },
  {
    id: 'suv',
    name: 'SUV',
    maxPax: 6,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/13png/w=600,h=400,fit=contain',
  },
  {
    id: 'minivan',
    name: 'Minivan',
    maxPax: 10,
    image: 'https://travelthru.com/cdn-cgi/imagedelivery/wZpbJM3t8iED5kIISxeUgQ/10-1png/w=600,h=400,fit=contain',
  },
  {
    id: 'luxury-mpv',
    name: 'Luxury MPV',
    maxPax: 6,
    image: 'https://eu2.contabostorage.com/fd5fb40e53894be8a861ffc261151838:cbs-webapi-test/c0f0b52e-1b54-4588-a98f-9a987bc6dd0b.png',
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
  const [sidebarPinned,  setSidebarPinned]  = useState(true);
  const [sidebarHover,   setSidebarHover]   = useState(false);
  const [hoveredSidebarTab, setHoveredSidebarTab] = useState<string | null>(null);
  const [selectedDest,   setSelectedDest]   = useState('anywhere');
  const { isWishlisted, toggle, isLoggedIn } = useWishlist();
  const inspiredSliderRef                   = useRef<HTMLDivElement>(null);
  const [sliderCanLeft,  setSliderCanLeft]  = useState(false);
  const [sliderCanRight, setSliderCanRight] = useState(true);
  const [placesVisible,  setPlacesVisible]  = useState(true);
  const [navHidden,      setNavHidden]      = useState(false);
  const sidebarVisible = sidebarPinned || sidebarHover;

  /* ── Mirror navbar hide/show so sidebar top slides in sync ── */
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 80) setNavHidden(true);
      else setNavHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setPlacesVisible(false);
    const timer = setTimeout(() => setPlacesVisible(true), 220);
    return () => clearTimeout(timer);
  }, [selectedDest]);

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
      const ipv = window.innerWidth >= 640 ? 3 : 1;
      setSliderStep((w + 12) / ipv); // 12 = gap-3
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const ipv = window.innerWidth >= 640 ? 3 : 1;
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
    const ipv   = window.innerWidth >= 640 ? 3 : 1;
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
      <Navbar
        onHamburgerClick={() => setSidebarPinned(p => !p)}
        onHamburgerHoverEnter={() => { if (!sidebarPinned) setSidebarHover(true); }}
      />
      {/* ════════════════════════════════════════════════════════════
          PAGE SHELL — sticky sidebar + scrollable main
      ════════════════════════════════════════════════════════════ */}
      <div className="flex">

        {/* ── Full-page sticky sidebar ── */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 self-start sticky bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden ${sidebarVisible ? 'w-[238px]' : 'w-[56px]'}`}
          style={{
            top: navHidden ? '0px' : '64px',
            height: navHidden ? '100vh' : 'calc(100vh - 64px)',
            transition: 'top 300ms ease-in-out, height 300ms ease-in-out, width 300ms',
          }}
          onMouseLeave={() => { if (!sidebarPinned) setSidebarHover(false); }}
        >
          <div className="w-[238px] flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <nav className="flex-1 pb-2">
              {SERVICE_TABS.map((tab, idx) => {
                const showDivider = idx > 0 && tab.s !== SERVICE_TABS[idx - 1].s;
                const active    = activeService === tab.id;
                const Icon      = tab.icon;
                const expanded  = sidebarVisible;
                const cls = `group w-full flex items-center py-3 text-[13.5px] font-medium transition-all duration-200 border-l-[3px] ${
                  expanded ? 'gap-3 px-5' : 'pl-[19px]'
                } ${
                  active
                    ? 'bg-gray-100 text-gray-900 border-gray-300'
                    : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                }`;
                const inner = (
                  <>
                    <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {expanded && <span className="flex-1 text-left truncate">{tab.label}</span>}
                    {expanded && tab.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        tab.badgeColor === 'red'   ? 'bg-red-100 text-red-600' :
                        tab.badgeColor === 'blue'  ? 'bg-brand-100 text-brand-700' :
                        tab.badgeColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{tab.badge}</span>
                    )}
                    {expanded && active && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                  </>
                );
                const isTabHovered = hoveredSidebarTab === tab.id;
                return (
                  <span
                    key={tab.id}
                    className="block mb-[5px]"
                    onMouseEnter={() => tab.children && setHoveredSidebarTab(tab.id)}
                    onMouseLeave={() => tab.children && setHoveredSidebarTab(null)}
                  >
                    {showDivider && tab.s === 3 && (
                      <span className="block h-px bg-gray-100 mx-3 my-2" />
                    )}
                    {tab.href ? (
                      <Link href={tab.href} className={cls}>{inner}</Link>
                    ) : (
                      <button type="button" onClick={() => setActiveService(tab.id)} className={cls}>{inner}</button>
                    )}
                    {tab.children && sidebarVisible && (
                      <span
                        className="block overflow-hidden transition-all duration-200"
                        style={{ maxHeight: isTabHovered ? `${tab.children.length * 36}px` : '0px', opacity: isTabHovered ? 1 : 0 }}
                      >
                        {tab.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              className="group flex items-center gap-2.5 py-2 pl-[52px] pr-4 text-[12px] font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50/60 transition-all duration-150"
                            >
                              <ChildIcon className="w-[13px] h-[13px] shrink-0 text-gray-400 group-hover:text-brand-500" />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>

            {/* ── Pinned bottom: Why travel with us? ── */}
            <div className="mt-auto shrink-0">
              <span className="block h-px bg-gray-100 mx-3 mb-2" />
              {sidebarVisible && (
                <p className="px-5 pt-1 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Why travel with us?
                </p>
              )}
              <Link
                href="#"
                className={`group w-full flex items-center py-3 text-[13.5px] font-medium transition-all duration-200 border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-[5px] ${sidebarVisible ? 'gap-3 px-5' : 'pl-[19px]'}`}
              >
                <Umbrella className="w-[17px] h-[17px] shrink-0 text-gray-400 group-hover:text-gray-600" />
                {sidebarVisible && <span className="flex-1 text-left truncate">Insurance benefits</span>}
              </Link>
              <Link
                href="#"
                className={`group w-full flex items-center py-3 text-[13.5px] font-medium transition-all duration-200 border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-[5px] ${sidebarVisible ? 'gap-3 px-5' : 'pl-[19px]'}`}
              >
                <Headphones className="w-[17px] h-[17px] shrink-0 text-gray-400 group-hover:text-gray-600" />
                {sidebarVisible && <span className="flex-1 text-left truncate">24/7 Local Support</span>}
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main scrollable content ── */}
        <main className="flex-1 min-w-0">

      {/* ════════════════════════════════════════════════════════════
          1. HERO — full-width gradient
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Hero" className="mb-0 sm:mb-[30px]">

        {/* ── Right: Trip.com-style blue gradient hero ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center overflow-x-hidden md:overflow-hidden pt-16 relative bg-white sm:bg-transparent min-h-0 sm:min-h-[500px] md:min-h-[580px]"
        >
          {/* Background landscape — hidden on mobile, visible sm+ */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src="/images/hero-bg.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          {/* Blue gradient overlay — hidden on mobile, visible sm+ */}
          <div className="hidden sm:block absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(13,28,110,0.93) 0%, rgba(20,53,184,0.88) 20%, rgba(30,82,210,0.83) 42%, rgba(40,112,232,0.78) 62%, rgba(58,143,245,0.73) 82%, rgba(90,176,255,0.68) 100%)' }} />
          {/* Mobile: Trip.com-style icon grid (4-column, 2-row) */}
          <div className="relative z-10 md:hidden w-full px-3 pt-[18px] pb-0 shrink-0">
            <div className="grid grid-cols-4 gap-y-5">
              {SERVICE_TABS.map((tab, idx) => {
                const Icon   = tab.icon;
                const active = activeService === tab.id;
                const isPrimary = idx < 4; // first row gets solid filled circles

                // Mobile (white bg): blue circles for primary, gray for secondary
                // sm+ (blue bg): same blue for primary, frosted glass for secondary
                const circleClass = isPrimary
                  ? 'bg-[#2534ff]'
                  : active
                    ? 'bg-gray-200 ring-2 ring-brand-300 sm:bg-white/30 sm:backdrop-blur-sm sm:ring-white/60'
                    : 'bg-gray-100 border border-gray-200 sm:bg-white/15 sm:backdrop-blur-sm sm:border-white/30';

                const content = (
                  <>
                    <div className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto transition-all duration-200 ${circleClass}`}>
                      <Icon className={`w-[26px] h-[26px] ${isPrimary ? 'text-white' : 'text-brand-600 sm:text-white'}`} />
                      {tab.badge && (
                        <span className={`absolute -top-0.5 -right-0.5 text-[8px] font-black px-1 py-0.5 rounded-full leading-none ${
                          tab.badgeColor === 'red'   ? 'bg-red-500 text-white'   :
                          tab.badgeColor === 'blue'  ? 'bg-blue-400 text-white'  :
                          tab.badgeColor === 'amber' ? 'bg-amber-400 text-white' :
                          'bg-white/80 text-gray-700'
                        }`}>{tab.badge}</span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold leading-tight text-center text-gray-700 sm:text-white/90 px-0.5">
                      {tab.label}
                    </p>
                  </>
                );

                return tab.href ? (
                  <Link key={tab.id} href={tab.href} className="flex flex-col items-center">
                    {content}
                  </Link>
                ) : (
                  <button key={tab.id} type="button" onClick={() => setActiveService(tab.id)} className="flex flex-col items-center">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central content — desktop only */}
          <div id="hero-search-anchor" className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-0 sm:py-8 md:py-12 flex flex-col items-center gap-3 sm:gap-5 text-center">

            {/* Title — hidden on mobile */}
            <h1 className="hidden sm:block text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {activeService === 'transfer'    && <><span className="block">Your Thailand Journey</span><span className="block">Starts Here</span></>}
              {activeService === 'tours'       && 'Tours & Experiences in Thailand'}
              {activeService === 'attractions' && 'Top Attraction Tickets'}
              {activeService === 'deals'       && 'Exclusive Deals & Offers'}
              {activeService === 'dinner'      && 'Unforgettable Cruises'}
              {activeService === 'group'       && 'Group Adventures Await'}
              {activeService === 'rewards'     && 'Earn Werest Rewards'}
            </h1>

            {/* Trust badges — hidden on mobile */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1 text-white/80 text-[11px] sm:text-[13px] font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Secure booking</span>
              <span className="text-white/30 hidden sm:block">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Support in approx. 30s</span>
              <span className="text-white/30 hidden sm:block">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" />Free cancellation</span>
            </div>

            {/* Search container — hidden on mobile, visible on sm+ */}
            {(activeService === 'transfer' || activeService === 'tours' || activeService === 'attractions') ? (
              <div className="hidden sm:block w-full my-3 sm:my-[30px]">
                <SearchTabs prefillRoute={prefillRoute} activeService={activeService} />
              </div>
            ) : (
              <div className="hidden sm:block bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl px-10 py-10 max-w-sm w-full">
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
                  href={activeService === 'deals' ? '/deals' : `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`}
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
          2. NEW USER EXCLUSIVE
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="New user exclusive" className="bg-white pt-[30px] pb-7 sm:pt-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">New user exclusive</h2>
          {/* Mobile: single-row horizontal scroll with snap; sm+: 2-col grid; lg+: 4-col grid */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {NEW_USER_CARDS.map((c) => {
              const mobileCard = 'shrink-0 w-[75vw] max-w-[264px] snap-start sm:w-auto sm:max-w-none';
              const cls = c.highlight
                ? `group col-span-1 flex flex-col justify-between rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${(c as { gradient?: string }).gradient ?? ''} min-h-[148px] sm:min-h-[148px] ${mobileCard}`
                : `group flex flex-col justify-between rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 min-h-[148px] sm:min-h-[148px] bg-white ${mobileCard}`;

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
            <div className="shrink-0 w-1 sm:hidden" aria-hidden="true" />
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
                const ipv = window.innerWidth >= 640 ? 3 : 1;
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
                const ipv = window.innerWidth >= 640 ? 3 : 1;
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
                    <div className="relative h-[145px] sm:h-[165px] overflow-hidden">
                      <img
                        src={b.img}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
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
          GET INSPIRED — destination card carousel (smooth scroll)
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="inspired-heading" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="inspired-heading" className="text-xl font-bold text-gray-900 mb-5">Get inspired for your next trip</h2>
          <div className="relative">

            {/* Scrollable track — hidden scrollbar, 5 rectangle cards visible */}
            <div
              ref={inspiredSliderRef}
              className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={() => {
                const el = inspiredSliderRef.current;
                if (!el) return;
                setSliderCanLeft(el.scrollLeft > 2);
                setSliderCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
              }}
            >
              {INSPIRED_DESTS.map((dest) => {
                const isSelected = selectedDest === dest.id;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedDest(dest.id)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group focus:outline-none h-[140px] sm:h-[160px] transition-all duration-200 shrink-0 w-[calc(40%_-_6px)] sm:w-[calc(25%_-_9px)] lg:w-[calc(20%_-_9.6px)]"
                  >
                    {/* Photo */}
                    <Image
                      src={dest.img}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 20vw"
                      unoptimized
                    />

                    {/* Bottom gradient — always on for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                    {/* Brand overlay — fades in only when selected */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ backgroundColor: '#2534ff', opacity: isSelected ? 0.3 : 0 }}
                    />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                      <p className="font-bold text-white text-[13px] leading-tight drop-shadow-sm">{dest.name}</p>
                      <p className="text-white/80 text-[11px] mt-0.5 leading-snug">{dest.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Left arrow */}
            {sliderCanLeft && (
              <button
                type="button"
                onClick={() => {
                  const el = inspiredSliderRef.current;
                  if (!el) return;
                  const card = el.firstElementChild as HTMLElement;
                  const step = card ? (card.offsetWidth + 12) * 2 : el.clientWidth / 5 * 2;
                  el.scrollBy({ left: -step, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous destinations"
              >
                <ChevronRight className="w-4 h-4 text-gray-700 rotate-180" />
              </button>
            )}

            {/* Right arrow */}
            {sliderCanRight && (
              <button
                type="button"
                onClick={() => {
                  const el = inspiredSliderRef.current;
                  if (!el) return;
                  const card = el.firstElementChild as HTMLElement;
                  const step = card ? (card.offsetWidth + 12) * 2 : el.clientWidth / 5 * 2;
                  el.scrollBy({ left: step, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label="Next destinations"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          THINGS TO DO IN [CITY]
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="places-heading" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 id="places-heading" className="text-xl font-bold text-gray-900">
                Things to do in{' '}
                <span key={selectedDest} className="text-brand-600 animate-fade-in">
                  {selectedDest === 'anywhere'
                    ? 'Thailand'
                    : (INSPIRED_DESTS.find(d => d.id === selectedDest)?.name ?? 'Thailand')}
                </span>
              </h2>
              <p className="text-gray-400 text-sm mt-0.5">Handpicked experiences — book instantly</p>
            </div>
            <Link
              href="/attractions"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors shrink-0"
            >
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 transition-opacity duration-300"
            style={{ opacity: placesVisible ? 1 : 0 }}
          >
            {(PLACES_BY_DEST[selectedDest] ?? PLACES_BY_DEST.anywhere).map((place) => (
              <div key={place.name} className="relative group flex flex-col">
                {/* Card — full-height link */}
                <Link
                  href={`/results?pickup_address=${encodeURIComponent(place.category === 'Transfer' ? '' : place.sub)}`}
                  className="flex flex-col h-full rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-brand-100 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-32 sm:h-44 overflow-hidden shrink-0">
                    <Image
                      src={place.img}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />
                    {/* Badge — top-left */}
                    {place.badge && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm ${
                          place.badge === 'Likely to sell out' ? 'bg-amber-500' :
                          place.badge === 'New'                ? 'bg-green-600' :
                          place.badge === 'Eco-friendly'       ? 'bg-emerald-700' :
                          'bg-brand-600'
                        }`}>
                          {place.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    {/* Category · Location */}
                    <p className="text-gray-400 text-[11px] mb-1.5">
                      {place.category} · {place.sub}
                    </p>

                    {/* Title */}
                    <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors mb-1.5 flex-1">
                      {place.name}
                    </p>

                    {/* Availability */}
                    <p className="text-[11px] text-green-600 font-medium mb-1.5">
                      Book now for today
                    </p>

                    {/* Rating + booked count */}
                    <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5 mb-2">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-800">{place.rating}</span>
                      <span className="text-[11px] text-gray-400">({place.reviews.toLocaleString()})</span>
                      <span className="text-[11px] text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{place.booked} booked</span>
                    </div>

                    {/* Price row */}
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="font-bold text-gray-900 text-[15px]">{place.price}</span>
                      {place.originalPrice && (
                        <span className="text-[12px] text-gray-400 line-through">{place.originalPrice}</span>
                      )}
                    </div>

                    {/* Deal tags */}
                    {place.deals && place.deals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {place.deals.map(deal => (
                          <span
                            key={deal}
                            className="text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.5 rounded"
                          >
                            {deal}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Heart / wishlist — outside <Link> to avoid nested interactive elements */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!isLoggedIn) { openModal('email'); return; }
                    await toggle({ itemId: `place:${place.name}`, itemName: place.name, itemUrl: '/attractions', itemType: 'attraction' });
                  }}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                  aria-label={isWishlisted(`place:${place.name}`) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-3.5 h-3.5 transition-colors ${isWishlisted(`place:${place.name}`) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Mobile — see all link */}
          <div className="sm:hidden mt-5 text-center">
            <Link
              href="/attractions"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              See all experiences <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic tour sections — "Things to do in [City]" */}
      <DynamicTourSections />

      {/* ════════════════════════════════════════════════════════════
          DISCOVER THE WONDERS OF THAILAND — full-width banner
      ════════════════════════════════════════════════════════════ */}
      <section aria-label="Discover Thailand" className="hidden sm:block relative w-full overflow-hidden" style={{ height: 200 }}>
        {/* Background photo — Phi Phi Island */}
        <Image
          src="https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=80"
          alt="Discover Thailand — Phi Phi Island aerial view"
          fill
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(5,12,40,0.72) 0%, rgba(10,22,70,0.58) 50%, rgba(5,12,40,0.72) 100%)' }} />
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="text-white tracking-[0.25em] sm:tracking-[0.32em] text-base sm:text-xl md:text-3xl select-none drop-shadow-md uppercase font-light text-center">
            Discover the wonders of&nbsp;
            <strong className="font-extrabold tracking-[0.18em]" style={{ color: '#2534ff' }}>Thailand</strong>
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. VEHICLE OPTIONS — fleet showcase
      ════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="fleet-heading" className="pt-0 pb-4 sm:py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-2 sm:mb-4">
            <h2 id="fleet-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">Vehicle Options</h2>
          </div>

          <div className="bg-white rounded-2xl px-3 py-0 sm:px-6 sm:py-2">
          <div className="flex gap-[6px] overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:gap-8 lg:gap-10 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {CAR_CLASSES.map((cls) => {
              const open = activeVehicle === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setActiveVehicle(open ? null : cls.id)}
                  onMouseEnter={() => setActiveVehicle(cls.id)}
                  onMouseLeave={() => setActiveVehicle(null)}
                  className="shrink-0 w-[55vw] max-w-[220px] snap-start sm:w-auto sm:max-w-none flex flex-col items-center text-center py-1 px-4 rounded-2xl transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`${cls.name} — up to ${cls.maxPax} passengers`}
                >
                  <div className="relative w-full mb-1" style={{ height: 'clamp(130px, 30vw, 338px)' }}>
                    <Image
                      src={cls.image}
                      alt={`${cls.name} — private transfer Thailand`}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width: 640px) 55vw, 25vw"
                      quality={100}
                      unoptimized
                    />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">{cls.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-600">
                    <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
        </main>{/* end main */}
      </div>{/* end flex shell */}

    </Fragment>
  );
}
