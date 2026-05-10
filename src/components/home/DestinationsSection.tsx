'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface Attraction {
  id:      string;
  name:    string;
  city:    string;
  score:   number;
  rating:  number;
  reviews: number;
  image:   string;
  href:    string;
  tripBest?: boolean;
}

interface Destination {
  id:    string;
  label: string;
}

/* ── Data ──────────────────────────────────────────────────────────────────── */
const DESTINATIONS: Destination[] = [
  { id: 'bangkok',   label: 'Bangkok'    },
  { id: 'phuket',    label: 'Phuket'     },
  { id: 'chiangmai', label: 'Chiang Mai' },
  { id: 'krabi',     label: 'Krabi'      },
  { id: 'kohsamui',  label: 'Koh Samui'  },
  { id: 'pattaya',   label: 'Pattaya'    },
];

const ATTRACTIONS: Record<string, Attraction[]> = {
  bangkok: [
    { id: 'bkk1', name: 'Grand Palace & Wat Phra Kaew', city: 'Bangkok', score: 9.8, rating: 4.9, reviews: 28400, image: 'photo-1563492065599-3520f775eeed', href: '/tours?city=bangkok', tripBest: true },
    { id: 'bkk2', name: 'Wat Arun — Temple of Dawn',    city: 'Bangkok', score: 9.6, rating: 4.8, reviews: 19200, image: 'photo-1508009603885-50cf7c579365', href: '/tours?city=bangkok', tripBest: true },
    { id: 'bkk3', name: 'Chatuchak Weekend Market',      city: 'Bangkok', score: 9.4, rating: 4.7, reviews: 14600, image: 'photo-1534536281715-e28d76689b4d', href: '/tours?city=bangkok' },
    { id: 'bkk4', name: 'Chao Phraya River Cruise',      city: 'Bangkok', score: 9.2, rating: 4.7, reviews: 11300, image: 'photo-1556901453-57e8e5b5ab1c', href: '/tours?city=bangkok' },
    { id: 'bkk5', name: 'Lumphini Park & City Skyline',  city: 'Bangkok', score: 9.0, rating: 4.6, reviews: 8900,  image: 'photo-1602940659805-770d1b3b9911', href: '/tours?city=bangkok' },
    { id: 'bkk6', name: 'Jim Thompson House Museum',     city: 'Bangkok', score: 8.8, rating: 4.6, reviews: 7400,  image: 'photo-1518684079-3c830dcef090', href: '/tours?city=bangkok' },
  ],
  phuket: [
    { id: 'hkt1', name: 'Phi Phi Islands Day Tour',       city: 'Phuket', score: 9.9, rating: 4.9, reviews: 32100, image: 'photo-1537956965359-7573183d1f57', href: '/tours?city=phuket', tripBest: true },
    { id: 'hkt2', name: 'Big Buddha Phuket',               city: 'Phuket', score: 9.5, rating: 4.8, reviews: 21500, image: 'photo-1596895111956-bf1cf0599ce5', href: '/tours?city=phuket', tripBest: true },
    { id: 'hkt3', name: 'Patong Beach & Bangla Road',      city: 'Phuket', score: 9.3, rating: 4.7, reviews: 17800, image: 'photo-1589394815804-964ed0be2eb5', href: '/tours?city=phuket' },
    { id: 'hkt4', name: 'James Bond Island Tour',          city: 'Phuket', score: 9.1, rating: 4.7, reviews: 15200, image: 'photo-1606041008023-472dfb5e530f', href: '/tours?city=phuket' },
    { id: 'hkt5', name: 'Phang Nga Bay Kayaking',          city: 'Phuket', score: 9.0, rating: 4.6, reviews: 12400, image: 'photo-1535083783855-aaab7ebfd4f5', href: '/tours?city=phuket' },
    { id: 'hkt6', name: 'Phuket Old Town Walking Tour',    city: 'Phuket', score: 8.7, rating: 4.5, reviews: 8100,  image: 'photo-1552465011-b4e21bf6e79a', href: '/tours?city=phuket' },
  ],
  chiangmai: [
    { id: 'cnx1', name: 'Doi Inthanon National Park',      city: 'Chiang Mai', score: 9.7, rating: 4.9, reviews: 18900, image: 'photo-1558618666-fcd25c85cd64', href: '/tours?city=chiangmai', tripBest: true },
    { id: 'cnx2', name: 'Elephant Nature Park',            city: 'Chiang Mai', score: 9.8, rating: 4.9, reviews: 24300, image: 'photo-1546567668-bf2e45fb7e87', href: '/tours?city=chiangmai', tripBest: true },
    { id: 'cnx3', name: 'Old City Temples Walking Tour',   city: 'Chiang Mai', score: 9.2, rating: 4.7, reviews: 13700, image: 'photo-1599576439791-3c9bdafb4d60', href: '/tours?city=chiangmai' },
    { id: 'cnx4', name: 'Sunday Night Bazaar',             city: 'Chiang Mai', score: 9.0, rating: 4.6, reviews: 11200, image: 'photo-1488646953014-85cb44e25828', href: '/tours?city=chiangmai' },
    { id: 'cnx5', name: 'Chiang Rai White Temple Tour',    city: 'Chiang Mai', score: 9.4, rating: 4.8, reviews: 16500, image: 'photo-1544551763-77ef2d0cfc6c', href: '/tours?city=chiangmai' },
    { id: 'cnx6', name: 'Thai Cooking Class',              city: 'Chiang Mai', score: 9.1, rating: 4.7, reviews: 9800,  image: 'photo-1467003909585-2f8a72700288', href: '/tours?city=chiangmai' },
  ],
  krabi: [
    { id: 'kbi1', name: 'Railay Beach by Longtail Boat',   city: 'Krabi', score: 9.8, rating: 4.9, reviews: 22100, image: 'photo-1535083783855-aaab7ebfd4f5', href: '/tours?city=krabi', tripBest: true },
    { id: 'kbi2', name: '4 Islands Snorkelling Tour',       city: 'Krabi', score: 9.6, rating: 4.8, reviews: 17400, image: 'photo-1606041008023-472dfb5e530f', href: '/tours?city=krabi', tripBest: true },
    { id: 'kbi3', name: 'Tiger Cave Temple Sunrise Trek',   city: 'Krabi', score: 9.3, rating: 4.7, reviews: 12600, image: 'photo-1552465011-b4e21bf6e79a', href: '/tours?city=krabi' },
    { id: 'kbi4', name: 'Kayaking Hong Island',             city: 'Krabi', score: 9.1, rating: 4.6, reviews: 9300,  image: 'photo-1596895111956-bf1cf0599ce5', href: '/tours?city=krabi' },
    { id: 'kbi5', name: 'Ao Nang Night Market',             city: 'Krabi', score: 8.9, rating: 4.6, reviews: 7800,  image: 'photo-1537956965359-7573183d1f57', href: '/tours?city=krabi' },
    { id: 'kbi6', name: 'Rock Climbing Railay',             city: 'Krabi', score: 9.0, rating: 4.7, reviews: 8500,  image: 'photo-1589394815804-964ed0be2eb5', href: '/tours?city=krabi' },
  ],
  kohsamui: [
    { id: 'ksm1', name: 'Ang Thong National Marine Park',  city: 'Koh Samui', score: 9.7, rating: 4.9, reviews: 19800, image: 'photo-1544551763-77ef2d0cfc6c', href: '/tours?city=kohsamui', tripBest: true },
    { id: 'ksm2', name: 'Big Buddha Temple & Fisherman Wharf', city: 'Koh Samui', score: 9.3, rating: 4.7, reviews: 14200, image: 'photo-1558618666-fcd25c85cd64', href: '/tours?city=kohsamui', tripBest: true },
    { id: 'ksm3', name: 'Chaweng Beach Sunset Cruise',     city: 'Koh Samui', score: 9.1, rating: 4.7, reviews: 11500, image: 'photo-1589394815804-964ed0be2eb5', href: '/tours?city=kohsamui' },
    { id: 'ksm4', name: 'Koh Tao Snorkelling Day Trip',    city: 'Koh Samui', score: 9.5, rating: 4.8, reviews: 16700, image: 'photo-1537956965359-7573183d1f57', href: '/tours?city=kohsamui' },
    { id: 'ksm5', name: 'Namuang Waterfall & Secret Falls', city: 'Koh Samui', score: 8.8, rating: 4.6, reviews: 8200,  image: 'photo-1606041008023-472dfb5e530f', href: '/tours?city=kohsamui' },
    { id: 'ksm6', name: 'Samui Elephant Sanctuary',        city: 'Koh Samui', score: 9.4, rating: 4.8, reviews: 13900, image: 'photo-1546567668-bf2e45fb7e87', href: '/tours?city=kohsamui' },
  ],
  pattaya: [
    { id: 'pty1', name: 'Coral Island Speedboat Tour',     city: 'Pattaya', score: 9.4, rating: 4.8, reviews: 20300, image: 'photo-1535083783855-aaab7ebfd4f5', href: '/tours?city=pattaya', tripBest: true },
    { id: 'pty2', name: 'Nong Nooch Tropical Garden',      city: 'Pattaya', score: 9.1, rating: 4.7, reviews: 15600, image: 'photo-1552465011-b4e21bf6e79a', href: '/tours?city=pattaya', tripBest: true },
    { id: 'pty3', name: 'Walking Street Night Tour',       city: 'Pattaya', score: 8.9, rating: 4.6, reviews: 12100, image: 'photo-1544551763-77ef2d0cfc6c', href: '/tours?city=pattaya' },
    { id: 'pty4', name: 'Sanctuary of Truth',              city: 'Pattaya', score: 9.3, rating: 4.7, reviews: 17400, image: 'photo-1467003909585-2f8a72700288', href: '/tours?city=pattaya' },
    { id: 'pty5', name: 'Pattaya Viewpoint & Jomtien',     city: 'Pattaya', score: 8.7, rating: 4.5, reviews: 8900,  image: 'photo-1596895111956-bf1cf0599ce5', href: '/tours?city=pattaya' },
    { id: 'pty6', name: 'Khao Kheow Open Zoo',             city: 'Pattaya', score: 9.0, rating: 4.6, reviews: 11300, image: 'photo-1558618666-fcd25c85cd64', href: '/tours?city=pattaya' },
  ],
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function fmtScore(n: number) {
  return n.toFixed(1);
}

function fmtReviews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function DestinationsSection() {
  const [activeId, setActiveId] = useState<string>('bangkok');

  const attractions = ATTRACTIONS[activeId] ?? [];

  return (
    <section aria-labelledby="inspire-heading" className="py-8 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="inspire-heading" className="text-[22px] font-bold text-gray-900 leading-tight">
            Get inspired for your next trip
          </h2>
          <Link
            href="/tours"
            className="flex items-center gap-1 text-[13px] font-semibold text-[#006aff] hover:underline whitespace-nowrap"
          >
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination chips */}
        <div className="relative flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-4">
          {DESTINATIONS.map((dest) => {
            const isActive = dest.id === activeId;
            return (
              <div key={dest.id} className="relative shrink-0">
                <button
                  onClick={() => setActiveId(dest.id)}
                  className={`relative px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 whitespace-nowrap border ${
                    isActive
                      ? 'bg-[#006aff] text-white border-[#006aff] ring-2 ring-[#006aff] ring-offset-1'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#006aff] hover:text-[#006aff]'
                  }`}
                >
                  {dest.label}
                </button>
                {/* Downward triangle caret for active chip */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[14px] w-0 h-0 pointer-events-none"
                    style={{
                      borderLeft:  '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop:   '10px solid #006aff',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Attraction cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-6 lg:overflow-x-visible lg:snap-none lg:pb-0">
          {attractions.map((a) => (
            <Link
              key={a.id}
              href={a.href}
              data-card
              className="group relative flex-shrink-0 snap-start w-[200px] sm:w-[220px] lg:w-auto rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
                <Image
                  src={`https://images.unsplash.com/${a.image}?auto=format&fit=crop&w=400&q=80`}
                  alt={a.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 16vw"
                />

                {/* Trip Best badge */}
                {a.tripBest && (
                  <div
                    className="absolute top-2 left-2 flex items-center gap-0.5 px-2 py-[3px] rounded-full text-[10px] font-semibold leading-none"
                    style={{ background: 'rgba(255,255,255,0.92)', color: '#5c3d11' }}
                  >
                    <span style={{ color: '#c47f17', fontWeight: 800 }}>{'{'}</span>
                    <span className="mx-[3px]">Trip Best</span>
                    <span style={{ color: '#c47f17', fontWeight: 800 }}>{'}'}</span>
                  </div>
                )}
              </div>

              {/* White footer */}
              <div className="px-2.5 pt-2 pb-2.5">
                {/* City pill + flame score */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-medium text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 leading-none whitespace-nowrap">
                    {a.city}
                  </span>
                  <Flame className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-800">{fmtScore(a.score)}</span>
                </div>

                {/* Attraction name */}
                <p className="text-[12px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                  {a.name}
                </p>

                {/* Rating & reviews */}
                <p className="text-[11px] text-gray-400">
                  {a.rating}/5 · {fmtReviews(a.reviews)} reviews
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
