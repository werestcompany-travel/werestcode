'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewSection from '@/components/reviews/ReviewSection';
import OpeningHoursCard from '@/components/attractions/OpeningHours';
import DressCodeBadge from '@/components/attractions/DressCodeBadge';
import TravellerPhotos from '@/components/attractions/TravellerPhotos';
import GoodForTags from '@/components/attractions/GoodForTags';
import {
  Star, ChevronRight, MapPin, Clock, Users, Check, X,
  ChevronDown, Heart, Zap, Smartphone, Info,
  Minus, Plus, Shield, Package, ChevronLeft,
  Images,
} from 'lucide-react';

/* ─── Default fallback data ─────────────────────────────────────────────── */
const DEFAULT_GALLERY = [
  { src: 'https://sanctuaryoftruthmuseum.com/wp-content/uploads/2025/05/IMG_2579-e1748839457794-1090x1536.png', alt: 'Sanctuary of Truth main tower'    },
  { src: 'https://sanctuaryoftruthmuseum.com/wp-content/uploads/2025/11/1-3-768x1089.jpg',                      alt: 'Sanctuary of Truth exterior view' },
  { src: 'https://sanctuaryoftruthmuseum.com/wp-content/uploads/2025/11/2-3-768x1089.jpg',                      alt: 'Sanctuary of Truth carved details'},
  { src: 'https://sanctuaryoftruthmuseum.com/wp-content/uploads/2022/05/LINE_ALBUM_220321_11.jpg',               alt: 'Wood carving activity'            },
  { src: 'https://sanctuaryoftruthmuseum.com/wp-content/uploads/2022/05/LINE_ALBUM_220321_6-1.jpg',              alt: 'Elephant riding at Sanctuary'     },
];

const DEFAULT_PACKAGES = [
  {
    id: 'standard',
    name: 'Standard Entrance',
    desc: 'Full access to the Sanctuary building and grounds',
    includes: ['Entrance ticket', 'Cultural dance show', 'Elephant show', 'Free parking'],
    adultPrice: 479, adultOriginal: 531,
    childPrice: 239, childOriginal: 265,
    popular: false,
    badge: null as string | null,
  },
  {
    id: 'standard-elephant',
    name: 'Standard + Elephant Riding',
    desc: 'Everything in Standard plus a guided elephant ride',
    includes: ['Entrance ticket', 'Cultural dance show', 'Elephant show', '1 elephant ride (15 min)', 'Free parking'],
    adultPrice: 679, adultOriginal: 799,
    childPrice: 429, childOriginal: 499,
    popular: true,
    badge: 'Best Value' as string | null,
  },
  {
    id: 'full-experience',
    name: 'Full Experience Package',
    desc: 'The complete Sanctuary experience with all activities included',
    includes: ['Entrance ticket', 'Cultural dance show', 'Elephant show', 'Elephant ride', 'Boat trip around the complex', 'Carriage tour of grounds', 'Free parking'],
    adultPrice: 899, adultOriginal: 1100,
    childPrice: 599, childOriginal: 750,
    popular: false,
    badge: 'Most Complete' as string | null,
  },
];

const DEFAULT_EXPECT_STEPS = [
  { time: 'On arrival', title: 'Entrance & Hard Hat', icon: '🪖', desc: 'Collect your hard hat at the entrance (mandatory for safety inside the building). Entry to the temple area is guided every 30 minutes — a staff member will brief you before you go in. Sarongs are available at the gate if you need to cover up.' },
  { time: '~15 min',    title: 'Exterior & Grounds', icon: '🏯', desc: 'Start by walking around the perimeter to take in the full 105-metre structure. Admire the four-faced Brahma sculpture at the main entrance and the carved female figures on each rooftop, each representing a different virtue — family care, religious observance, land fertility, and wisdom.' },
  { time: '~45–60 min', title: 'Guided Tour Inside', icon: '🗺️', desc: 'A local guide (English, Thai, Russian, or Chinese) leads you through all four halls: the Southern Hall (family and parental love), Northern Hall (Confucianism and Taoism), Eastern Hall (celestial elements and destiny), and Western Hall (four elements with Naga, Brahma, and Shiva). The Central Hall houses the grand wooden throne symbolising harmony.' },
  { time: '11:30 or 15:30', title: 'Cultural Dance Performance', icon: '💃', desc: 'Watch a traditional Thai cultural dance performance held twice daily (11:30 AM and 3:30 PM). The show lasts approximately 20–30 minutes and features traditional costumes, classical instruments, and storytelling through movement.' },
  { time: 'Anytime',    title: 'Elephant Show & Riding', icon: '🐘', desc: 'The elephant area is open throughout the day. Watch the trained elephant show, or book an elephant ride on-site (additional fee unless included in your package). Horse riding, ATV rentals, and speedboat/ancient dredger tours around the complex are also available.' },
  { time: 'Before leaving', title: 'Wood Carving & Shopping', icon: '🪵', desc: 'Visit the working wood carving studio and watch artisans hand-carve new sculptures for the building in real time. Browse the on-site gift shop and souvenir stalls. The Snow Forest walk and the Himmapan mythological forest are great final stops before you leave.' },
];

const DEFAULT_FAQS = [
  { q: 'How long does a visit take?', a: 'Plan approximately 2–4 hours for a full visit, including the guided tour (45–60 minutes). If you add elephant riding, boat trips, and the cultural shows, budget 3–4 hours. Early morning visits (8:00–8:30 AM) are recommended to avoid crowds and the midday heat.' },
  { q: 'What is the dress code?', a: 'Visitors must dress modestly — cover shoulders and knees. Sarongs are available at the entrance for free if you are wearing shorts or a sleeveless top. Comfortable, closed-toe shoes are recommended as floors can be uneven. Hard hats are provided and must be worn inside the building.' },
  { q: 'What time are the cultural performances?', a: 'Traditional Thai cultural dance performances are held twice daily: 11:30 AM and 3:30 PM. Each show lasts approximately 20–30 minutes. Entry to the temple grounds is guided every 30 minutes, so arrive a few minutes before each departure time.' },
  { q: 'Is it accessible for elderly visitors and people with disabilities?', a: 'Yes. A special pick-up carriage is available at no extra charge from the viewpoint to the Sanctuary. The building has elevators, wheelchair-accessible slopes, and free wheelchair loans available at the entrance. Please inform staff upon arrival.' },
  { q: 'Is there food available on-site?', a: 'Yes — there are two restaurants inside the complex (open 9:00 AM–6:00 PM). Naklua Kitchen Restaurant serves Thai and Halal dishes with views overlooking the cliffs. The Food & Drink café offers snacks, sweets, coffee, and smoothies throughout the day.' },
  { q: 'How do I get there from Bangkok or Pattaya city?', a: 'From Bangkok: Take Motorway No. 7 towards Pattaya (approximately 149 km, ~2 hours by car). Buses depart from Ekamai or Mo Chit stations. From Pattaya city: Take a taxi, motorbike taxi, or baht bus — every driver knows the Sanctuary. Free on-site parking for 200 cars and 30 buses.' },
  { q: 'Can I get a refund if I cancel?', a: 'Tickets booked through Werest Travel can be cancelled for free up to 24 hours before your visit date. Cancellations within 24 hours of the visit are non-refundable. Tickets purchased directly at the museum entrance are non-refundable.' },
  { q: 'Can the venue be rented for events or pre-wedding shoots?', a: 'Yes, the Sanctuary of Truth is available for private events, banquets, and professional photo/video shoots. Contact the venue directly for availability and pricing: +66 81-350-8710 (Khun Chuang Rak) or +66 81-350-8709 (Sales team).' },
];

const DEFAULT_OVERVIEW = 'The <strong class="text-gray-900">Sanctuary of Truth</strong> is a stunning all-wood temple and philosophical monument on the beachfront of Pattaya, Thailand. Built in 1981 and still under active construction, this magnificent structure rises <strong class="text-gray-900">105 metres tall</strong> — entirely from teak wood, with no nails, no concrete, and no metal supports.\n\nEvery surface is covered in intricate hand-carved sculptures depicting deities, mythological creatures, and scenes from Hindu and Buddhist traditions. It is both a living artwork and a spiritual monument dedicated to the ancient wisdom of human civilisation.';

const DEFAULT_HIGHLIGHTS = [
  'Marvel at 105 metres of intricate hand-carved teak wood — no nails or metal used',
  'Explore all four halls themed on ancient Hindu and Buddhist philosophy',
  'Watch the traditional cultural dance performance held twice daily (11:30 and 15:30)',
  'See the elephant show and interact with the resident elephants',
  'Watch live artisans carving new sculptures for the building in real time',
  'Enjoy a peaceful boat trip around the beachside grounds',
  'Photograph the stunning structure and its surroundings at golden hour',
];

const DEFAULT_INCLUDED = [
  'Entrance ticket to the Sanctuary',
  'Daily cultural dance performance (11:30 & 15:30)',
  'Elephant show',
  'Free parking (200 cars / 30 buses)',
  'English-language guided tour',
  'Access to beachside grounds and gardens',
];

const DEFAULT_EXCLUDED = [
  'Elephant riding (add-on or package)',
  'Boat / ancient dredger trip (add-on)',
  'Horse riding',
  'Food and beverages',
  'Hotel pickup / drop-off (book transfer separately)',
];

const DEFAULT_INFO_ITEMS = [
  'Wear comfortable shoes — the complex involves extensive walking on uneven surfaces.',
  'Modest dress is required: cover shoulders and knees. Sarongs provided free at entrance.',
  'Hard hats are mandatory inside the building — provided at no charge.',
  'Arrive early (before 10 AM) to avoid crowds and midday heat.',
  'Entry to the temple is every 30 minutes — wait for the next group if you just missed one.',
  'Photography is permitted in most areas except specified restricted zones.',
  'The building is still under active construction — some upper areas may be restricted.',
];

/* ─── Ticket options ─────────────────────────────────────────────────────── */
const BASE_TICKETS = [
  { id: 'adult',  label: 'Adult',  desc: 'Age 13+',  popular: true  },
  { id: 'child',  label: 'Child',  desc: 'Age 3–12', popular: false },
  { id: 'infant', label: 'Infant', desc: 'Age 0–2',  popular: false },
];

/* ─── Reviews ────────────────────────────────────────────────────────────── */
const REVIEWS = [
  { name: 'Emma W.',    country: '🇬🇧 United Kingdom', rating: 5, date: 'Mar 2025', text: "Absolutely breathtaking structure. Every inch is carved by hand from teak wood — no nails, no metal. We spent nearly 3 hours and didn't see everything. The elephant show was a bonus!" },
  { name: 'Takeshi M.', country: '🇯🇵 Japan',          rating: 5, date: 'Feb 2025', text: 'One of the most unique buildings in the world. The carvings tell stories of Buddhist and Hindu mythology. Highly recommend hiring a local guide — it makes it so much richer.' },
  { name: 'Carlos R.',  country: '🇩🇪 Germany',        rating: 4, date: 'Jan 2025', text: "Very impressive place. Get here early to avoid the crowds and heat. The sunset view from the beachside is stunning. Book online — it's cheaper and you skip the queue." },
];

/* ─── Types ──────────────────────────────────────────────────────────────── */
type GalleryImage  = { src: string; alt: string };
type PackageItem   = { id: string; name: string; desc: string; includes: string[]; adultPrice: number; adultOriginal: number; childPrice: number; childOriginal: number; popular: boolean; badge: string | null };
type ExpectStep    = { time: string; title: string; icon: string; desc: string };
type FaqItem       = { q: string; a: string };

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function SanctuaryDetailPage() {
  const router = useRouter();
  const { openModal } = useAuthModal();

  // Dynamic data (DB-driven with fallbacks)
  const [gallery,      setGallery]      = useState<GalleryImage[]>(DEFAULT_GALLERY);
  const [packages,     setPackages]     = useState<PackageItem[]>(DEFAULT_PACKAGES);
  const [expectSteps,  setExpectSteps]  = useState<ExpectStep[]>(DEFAULT_EXPECT_STEPS);
  const [faqs,         setFaqs]         = useState<FaqItem[]>(DEFAULT_FAQS);
  const [overviewText, setOverviewText] = useState(DEFAULT_OVERVIEW);
  const [highlights,   setHighlights]   = useState<string[]>(DEFAULT_HIGHLIGHTS);
  const [included,     setIncluded]     = useState<string[]>(DEFAULT_INCLUDED);
  const [excluded,     setExcluded]     = useState<string[]>(DEFAULT_EXCLUDED);
  const [infoItems,    setInfoItems]    = useState<string[]>(DEFAULT_INFO_ITEMS);

  // UI state
  const [selectedPkg,    setSelectedPkg]    = useState('standard');
  const [quantities,     setQuantities]     = useState<Record<string, number>>({ adult: 1, child: 0, infant: 0 });
  const [wishlisted,     setWishlisted]     = useState(false);
  const [openSection,    setOpenSection]    = useState<string | null>('overview');
  const [openFaq,        setOpenFaq]        = useState<number | null>(null);
  const [galleryOpen,    setGalleryOpen]    = useState(false);
  const [activePhoto,    setActivePhoto]    = useState(0);
  const [bookingError, setBookingError] = useState('');

  const pkg = packages.find(p => p.id === selectedPkg) ?? packages[0];

  const priceMap: Record<string, number> = {
    adult: pkg?.adultPrice ?? 0, child: pkg?.childPrice ?? 0, infant: 0,
  };
  const totalPrice = BASE_TICKETS.reduce((s, t) => s + (quantities[t.id] ?? 0) * (priceMap[t.id] ?? 0), 0);
  const totalQty   = Object.values(quantities).reduce((a, b) => a + b, 0);

  const setQty = (id: string, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));

  const openGallery = (index = 0) => { setActivePhoto(index); setGalleryOpen(true); };
  const prevPhoto   = () => setActivePhoto(i => (i - 1 + gallery.length) % gallery.length);
  const nextPhoto   = () => setActivePhoto(i => (i + 1) % gallery.length);

  useEffect(() => {
    // Fetch DB content
    fetch('/api/attractions/sanctuary-of-truth')
      .then(r => r.json())
      .then(d => {
        if (!d.data) return;
        const a = d.data;
        if (Array.isArray(a.gallery)      && a.gallery.length)      setGallery(a.gallery);
        if (Array.isArray(a.expectSteps)  && a.expectSteps.length)  setExpectSteps(a.expectSteps);
        if (Array.isArray(a.faqs)         && a.faqs.length)         setFaqs(a.faqs);
        if (a.overview)                                              setOverviewText(a.overview);
        if (Array.isArray(a.highlights)   && a.highlights.length)   setHighlights(a.highlights);
        if (Array.isArray(a.included)     && a.included.length)     setIncluded(a.included);
        if (Array.isArray(a.excluded)     && a.excluded.length)     setExcluded(a.excluded);
        if (Array.isArray(a.infoItems)    && a.infoItems.length)    setInfoItems(a.infoItems);
        if (Array.isArray(a.packages)     && a.packages.length) {
          const mapped: PackageItem[] = a.packages.map((p: Record<string, unknown>) => ({
            id:           String(p.id),
            name:         String(p.name),
            desc:         String(p.description ?? ''),
            includes:     Array.isArray(p.includes) ? p.includes as string[] : [],
            adultPrice:   Number(p.adultPrice),
            adultOriginal: Number(p.adultOriginal ?? p.adultPrice),
            childPrice:   Number(p.childPrice),
            childOriginal: Number(p.childOriginal ?? p.childPrice),
            popular:      Boolean(p.popular),
            badge:        p.badge ? String(p.badge) : null,
          }));
          setPackages(mapped);
          setSelectedPkg(mapped[0].id);
        }
      })
      .catch(() => {});

    // Auth + wishlist
    Promise.all([
      fetch('/api/user/me').then(r => r.json()),
      fetch('/api/user/wishlist').then(r => r.json()),
    ]).then(([, wlData]) => {
      const saved = (wlData.items ?? []).some((i: { attractionId: string }) => i.attractionId === 'sanctuary-of-truth');
      setWishlisted(saved);
    });
  }, []);

  async function handleToggleWishlist() {
    const meRes = await fetch('/api/user/me');
    const meData = await meRes.json();
    if (!meData.user) { openModal('email'); return; }
    if (wishlisted) {
      await fetch('/api/user/wishlist?attractionId=sanctuary-of-truth', { method: 'DELETE' });
    } else {
      await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attractionId: 'sanctuary-of-truth',
          attractionName: 'Sanctuary of Truth, Pattaya',
          attractionUrl: '/attractions/sanctuary-of-truth',
        }),
      });
    }
    setWishlisted(!wishlisted);
  }

  function handleBookNow() {
    setBookingError('');
    if (totalQty === 0) { setBookingError('Please select at least one ticket.'); return; }
    const p = new URLSearchParams({
      attractionId:   'sanctuary-of-truth',
      attractionName: 'Sanctuary of Truth, Pattaya',
      packageId:      pkg.id,
      packageName:    pkg.name,
      adultPrice:     String(pkg.adultPrice),
      childPrice:     String(pkg.childPrice),
      adultQty:       String(quantities.adult  ?? 0),
      childQty:       String(quantities.child  ?? 0),
      infantQty:      String(quantities.infant ?? 0),
    });
    router.push(`/attractions/checkout?${p.toString()}`);
  }

  const Accordion = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-100">
      <button className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpenSection(openSection === id ? null : id)}>
        <span className="font-bold text-gray-900">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSection === id ? 'rotate-180' : ''}`} />
      </button>
      {openSection === id && <div className="pb-5 animate-fade-in">{children}</div>}
    </div>
  );

  return (
    <>
      <Navbar />

      {/* ══ GALLERY LIGHTBOX MODAL ══════════════════════════════════════════ */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
            <span className="text-white/70 text-sm font-medium">{activePhoto + 1} / {gallery.length}</span>
            <p className="text-white font-semibold text-sm hidden sm:block">The Sanctuary of Truth, Pattaya</p>
            {/* Close button — always visible top-right */}
            <button
              onClick={() => setGalleryOpen(false)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/30 border border-white/30 text-white font-semibold text-xs px-3 py-2 rounded-full transition-colors">
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          {/* Image area */}
          <div className="flex-1 relative flex items-center justify-center px-16 sm:px-20">
            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={gallery[activePhoto].src}
                alt={gallery[activePhoto].alt}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 896px"
                unoptimized
                priority
              />
            </div>

            {/* Left arrow */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:left-4 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right arrow */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:right-4 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-colors">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          <p className="text-center text-white/50 text-xs py-2 shrink-0">{gallery[activePhoto].alt}</p>

          {/* Thumbnail strip */}
          <div className="flex gap-2 justify-center px-4 pb-5 shrink-0">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0
                  ${activePhoto === i ? 'border-white scale-105' : 'border-white/20 hover:border-white/60 opacity-50 hover:opacity-100'}`}>
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="64px" unoptimized />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-16 bg-white min-h-screen">

        {/* ── BREADCRUMB ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/attractions" className="hover:text-gray-600">Thailand</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/attractions" className="hover:text-gray-600">Pattaya</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-500 truncate max-w-[160px] sm:max-w-xs">The Sanctuary of Truth</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 truncate max-w-[120px] sm:max-w-xs">The Sanctuary of Truth Ticket</span>
          </nav>
        </div>

        {/* ── TITLE + RATING ROW ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-1.5">
            The Sanctuary of Truth Ticket in Pattaya
          </h1>
          <p className="text-gray-500 text-sm mb-3">Explore Thailand's impressive wooden religious shrine and monument</p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-900">4.7</span>
                <span className="text-brand-600 font-semibold text-sm">/5</span>
                <div className="flex gap-0.5 ml-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <button className="text-sm text-gray-700 underline underline-offset-2 decoration-dotted hover:text-brand-600 transition-colors">
                  15.6K reviews
                </button>
              </div>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <span className="text-sm text-gray-600 hidden sm:inline">400K+ booked</span>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <button className="flex items-center gap-1 text-sm text-gray-700 underline underline-offset-2 decoration-dotted hover:text-brand-600 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                The Sanctuary of Truth
              </button>
            </div>

            <button onClick={handleToggleWishlist}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-red-500 transition-colors">
              <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              {wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
            </button>
          </div>
        </div>

        {/* ── PHOTO GRID ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div
            className="rounded-2xl overflow-hidden gap-1"
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '210px 210px' }}
          >
            <div className="row-span-2 relative bg-gray-100 cursor-pointer overflow-hidden group" onClick={() => openGallery(0)}>
              <Image
                src={gallery[0].src}
                alt={gallery[0].alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 60vw, 50vw"
                priority
                unoptimized
              />
            </div>

            {gallery.slice(1, 5).map((img, i) => (
              <div key={i} className="relative bg-gray-100 cursor-pointer overflow-hidden group" onClick={() => openGallery(i + 1)}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 25vw, 20vw"
                  unoptimized
                />
                {i === 3 && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />}
                {i === 3 && (
                  <button
                    onClick={e => { e.stopPropagation(); openGallery(0); }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-900 font-bold px-3.5 py-2 rounded-xl text-sm shadow-lg transition-colors"
                  >
                    <Images className="w-4 h-4" />
                    Gallery
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ════════════════ LEFT COLUMN ════════════════ */}
            <div className="lg:col-span-2 space-y-0">

              {/* Opening hours info box (A5) */}
              <div className="mb-4">
                <OpeningHoursCard slug="sanctuary-of-truth" />
              </div>

              {/* Dress code info card (A6) */}
              <div className="mb-4">
                <DressCodeBadge />
              </div>

              {/* Good For tags (A8) */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Good for</p>
                <GoodForTags category="temple" max={3} size="md" />
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-2 pb-5 border-b border-gray-100">
                <span className="text-[11px] bg-orange-50 text-orange-600 font-semibold px-2.5 py-1 rounded-full">Historical Sites</span>
                <span className="text-[11px] bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Instant confirmation
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> Mobile voucher
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-gray-400" /> Duration: 2–4 hours
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Users className="w-3 h-3 text-gray-400" /> Suitable for all ages
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-gray-400" /> Naklua Beach, Pattaya
                </span>
              </div>

              {/* ── ACCORDION SECTIONS ── */}
              <Accordion id="overview" title="Overview">
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  {overviewText.split('\n\n').map((para, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
                  ))}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { label: 'Built',         value: '1981 – present'          },
                      { label: 'Height',        value: '105 metres'              },
                      { label: 'Material',      value: '100% teak wood, no nails'},
                      { label: 'Opening hours', value: '8:00 AM – 6:00 PM daily' },
                      { label: 'Location',      value: 'Naklua Beach, Pattaya'   },
                      { label: 'Style',         value: 'Hindu-Buddhist'          },
                    ].map(d => (
                      <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{d.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{d.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>

              <Accordion id="highlights" title="Highlights">
                <ul className="space-y-3">
                  {highlights.map(h => (
                    <li key={h} className="flex items-start gap-3 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {h}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion id="includes" title="What's included / excluded">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Included</p>
                    <ul className="space-y-2.5">
                      {included.map(item => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Not included</p>
                    <ul className="space-y-2.5">
                      {excluded.map(item => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion id="expect" title="What to expect">
                <div className="space-y-0">
                  {expectSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center text-xl shrink-0">
                          {step.icon}
                        </div>
                        {i < expectSteps.length - 1 && (
                          <div className="w-0.5 flex-1 bg-brand-100 mt-2 min-h-[24px]" />
                        )}
                      </div>
                      <div className="pt-1.5 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{step.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>

              <Accordion id="info" title="Important information">
                <ul className="space-y-3">
                  {infoItems.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion id="cancellation" title="Cancellation policy">
                <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                  <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Free cancellation available</p>
                    <p className="text-green-700">Cancel or reschedule for free up to <strong>24 hours before your visit date</strong>. No refunds for cancellations made within 24 hours of the visit or no-shows.</p>
                  </div>
                </div>
              </Accordion>

              {/* ── FAQ ── */}
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Frequently asked questions</h2>
                <p className="text-sm text-gray-400 mb-5">Everything you need to know before your visit</p>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span className={`font-semibold text-sm transition-colors ${openFaq === i ? 'text-brand-600' : 'text-gray-900'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-brand-600' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed bg-gray-50 animate-fade-in border-t border-gray-100">
                          <p className="pt-3">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── TRAVELLER PHOTOS (A9) ── */}
              <TravellerPhotos />

              {/* ── REVIEWS ── */}
              <div className="pt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900">4.7</p>
                    <div className="flex gap-0.5 justify-center my-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-xs text-gray-500">15,000+ reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-2">{s}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${[78,15,5,1,1][5-s]}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{[78,15,5,1,1][5-s]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  {REVIEWS.map(r => (
                    <div key={r.name} className="border border-gray-100 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {r.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.country} · {r.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ════════════════ RIGHT: BOOKING WIDGET ════════════════ */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden">

                <div className="bg-red-500 text-white text-center text-xs font-bold py-2 tracking-wide uppercase">
                  🔥 Limited time — Save 10% today
                </div>

                <div className="p-5 space-y-5">

                  {/* ── PACKAGE SELECTOR ── */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Select package
                    </p>
                    <div className="space-y-2">
                      {packages.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPkg(p.id)}
                          className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-150
                            ${selectedPkg === p.id
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-sm font-bold text-gray-900">{p.name}</span>
                                {p.badge && (
                                  <span className="text-[9px] bg-brand-600 text-white font-bold px-1.5 py-0.5 rounded-full">{p.badge}</span>
                                )}
                                {p.popular && !p.badge && (
                                  <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">Popular</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500">{p.desc}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-extrabold text-gray-900">฿{p.adultPrice.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400 line-through">฿{p.adultOriginal.toLocaleString()}</p>
                            </div>
                          </div>
                          {selectedPkg === p.id && p.includes.length > 0 && (
                            <ul className="mt-2 space-y-1 border-t border-brand-200 pt-2">
                              {p.includes.map(inc => (
                                <li key={inc} className="flex items-center gap-1.5 text-[11px] text-brand-700">
                                  <Check className="w-3 h-3 text-green-500 shrink-0" /> {inc}
                                </li>
                              ))}
                            </ul>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── TICKET QUANTITIES ── */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select tickets</p>
                    <div className="space-y-3">
                      {BASE_TICKETS.map(t => {
                        const price = priceMap[t.id] ?? 0;
                        const orig = t.id === 'adult' ? pkg?.adultOriginal : t.id === 'child' ? pkg?.childOriginal : undefined;
                        return (
                          <div key={t.id} className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                                {t.popular && <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded-full">Popular</span>}
                              </div>
                              <p className="text-xs text-gray-400">{t.desc}</p>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-sm font-bold text-gray-900">{price === 0 ? 'Free' : `฿${price.toLocaleString()}`}</p>
                                {orig && <p className="text-xs text-gray-400 line-through">฿{orig.toLocaleString()}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setQty(t.id, -1)} disabled={(quantities[t.id] ?? 0) === 0}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-30">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-gray-900">{quantities[t.id] ?? 0}</span>
                              <button onClick={() => setQty(t.id, 1)}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── TOTAL + CTA ── */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Total price</p>
                        <p className="text-xs text-gray-400">({totalQty} {totalQty === 1 ? 'ticket' : 'tickets'} · {pkg?.name})</p>
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900">
                        {totalQty === 0 ? '—' : `฿${totalPrice.toLocaleString()}`}
                      </p>
                    </div>

                    {bookingError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{bookingError}</p>
                    )}

                    <button
                      disabled={totalQty === 0}
                      onClick={handleBookNow}
                      className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.3)]">
                      {totalQty === 0 ? 'Select tickets above' : 'Book now'}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2">Choose date & payment on next page</p>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    {[
                      { icon: <Shield     className="w-3.5 h-3.5 text-green-500" />, text: 'Free cancellation up to 24 hrs before' },
                      { icon: <Zap        className="w-3.5 h-3.5 text-brand-500" />, text: 'Instant confirmation by email'         },
                      { icon: <Smartphone className="w-3.5 h-3.5 text-blue-500" />, text: 'Mobile voucher — no printing needed'   },
                    ].map(t => (
                      <div key={t.text} className="flex items-center gap-2 text-xs text-gray-600">
                        {t.icon} {t.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <ReviewSection
          entityType="ATTRACTION"
          entityId="sanctuary-of-truth"
          entityName="Sanctuary of Truth"
        />
      </div>
      <Footer />
    </>
  );
}
