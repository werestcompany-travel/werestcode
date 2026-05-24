'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shield, Plane, MapPin, CheckCircle, Gift } from 'lucide-react';

// ─── Banner data — inline JSX, no external images ─────────────────────────────

interface BannerCard {
  id: number;
  href: string;
  bg: string;         // Tailwind gradient classes
  accent: string;     // pill colour
  tag: string;
  headline: string;
  sub: string;
  cta: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

const BANNERS: BannerCard[] = [
  {
    id: 1,
    href: '/auth/register',
    bg: 'from-[#2534ff] to-[#1a26cc]',
    accent: 'bg-white/20 text-white',
    tag: 'New User Offer',
    headline: '10% Off Your First Transfer',
    sub: 'Sign up and save on your first private car booking',
    cta: 'Claim Now →',
    Icon: Gift,
    iconBg: 'bg-white/15',
  },
  {
    id: 2,
    href: '/booking',
    bg: 'from-emerald-500 to-teal-600',
    accent: 'bg-white/20 text-white',
    tag: 'Book with Confidence',
    headline: 'Free Cancellation',
    sub: 'Cancel for free up to 24 hours before pickup — no questions asked',
    cta: 'Book Now →',
    Icon: Shield,
    iconBg: 'bg-white/15',
  },
  {
    id: 3,
    href: '/results',
    bg: 'from-violet-600 to-purple-700',
    accent: 'bg-white/20 text-white',
    tag: 'Airport Special',
    headline: 'Airport Pickup from ฿600',
    sub: 'Professional driver meets you at arrivals with a name sign',
    cta: 'See Routes →',
    Icon: Plane,
    iconBg: 'bg-white/15',
  },
  {
    id: 4,
    href: '/results?pickup_address=Bangkok+City+Centre&dropoff_address=Pattaya',
    bg: 'from-amber-500 to-orange-600',
    accent: 'bg-white/20 text-white',
    tag: 'Popular Route',
    headline: 'Bangkok → Pattaya ฿1,800',
    sub: 'Fixed price · No surge · Available 24 / 7',
    cta: 'Book This Route →',
    Icon: MapPin,
    iconBg: 'bg-white/15',
  },
  {
    id: 5,
    href: '/transfers',
    bg: 'from-[#0a0e2e] to-[#1a20a0]',
    accent: 'bg-blue-400/30 text-blue-200',
    tag: 'Our Promise',
    headline: 'Fixed Price · No Surprises',
    sub: 'The price you see at booking is the price you pay — always',
    cta: 'Learn More →',
    Icon: CheckCircle,
    iconBg: 'bg-white/10',
  },
];

const GAP     = 10;   // px between cards
const HEIGHT  = 137;  // card min-height px
const VISIBLE = 3;    // cards visible at once
const TOTAL   = BANNERS.length;

// Triple-clone array: [copy] [real] [copy] — enables seamless infinite loop
const ITEMS = [...BANNERS, ...BANNERS, ...BANNERS];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PromoBannerSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardW,    setCardW]    = useState(0);
  const [idx,      setIdx]      = useState(TOTAL);      // start at first real card
  const [animated, setAnimated] = useState(true);
  const [paused,   setPaused]   = useState(false);

  // Measure card width synchronously on mount, then on resize
  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setCardW((w - GAP * (VISIBLE - 1)) / VISIBLE);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Re-enable animation after an instant snap
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  // After transition ends, silently snap back to the real copy
  const handleTransitionEnd = useCallback(() => {
    if (idx >= TOTAL * 2) {
      setAnimated(false);
      setIdx(TOTAL);
    } else if (idx < TOTAL) {
      setAnimated(false);
      setIdx(TOTAL * 2 - 1);
    }
  }, [idx]);

  const goNext = useCallback(() => {
    setAnimated(true);
    setIdx(p => p + 1);
  }, []);

  const goPrev = useCallback(() => {
    setAnimated(true);
    setIdx(p => p - 1);
  }, []);

  // Auto-advance every 3 s (paused on hover)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(goNext, 3000);
    return () => clearInterval(t);
  }, [goNext, paused]);

  // Dot click: go to banner i in the real copy
  const goTo = (i: number) => {
    setAnimated(true);
    setIdx(TOTAL + i);
  };

  // Compute pixel offset
  const step   = cardW + GAP;
  const offset = cardW ? -idx * step : 0;

  // Active dot: real index 0–(TOTAL-1)
  const dotIdx = ((idx - TOTAL) % TOTAL + TOTAL) % TOTAL;

  return (
    <section
      aria-label="Werest promotional offers"
      className="relative bg-white py-3 border-b border-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left arrow */}
      <button
        onClick={goPrev}
        aria-label="Previous"
        className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
      </button>

      {/* Clipping viewport */}
      <div ref={containerRef} className="overflow-hidden mx-8">
        <div
          className="flex"
          style={{
            gap:        GAP,
            transform:  `translateX(${offset}px)`,
            transition: animated && cardW > 0
              ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
            willChange: 'transform',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {ITEMS.map((b, i) => {
            const { Icon } = b;
            return (
              <Link
                key={i}
                href={b.href}
                className={`relative flex-shrink-0 rounded-xl overflow-hidden group bg-gradient-to-br ${b.bg} hover:brightness-110 transition-[filter] duration-200`}
                style={{
                  width:     cardW > 0 ? cardW : `calc(${100 / VISIBLE}% - ${GAP}px)`,
                  flex:      '0 0 auto',
                  height:    HEIGHT,
                }}
                tabIndex={Math.abs(i - idx) <= VISIBLE ? 0 : -1}
                aria-hidden={Math.abs(i - idx) > VISIBLE}
              >
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-3 sm:p-3.5">
                  {/* Top: tag + icon */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${b.accent}`}>
                      {b.tag}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${b.iconBg}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Middle: headline + sub */}
                  <div className="flex-1 flex flex-col justify-center mt-1">
                    <p className="text-white font-extrabold text-[13px] sm:text-[14px] leading-tight line-clamp-2">
                      {b.headline}
                    </p>
                    <p className="text-white/70 text-[10px] mt-0.5 leading-snug line-clamp-2 hidden sm:block">
                      {b.sub}
                    </p>
                  </div>

                  {/* Bottom: CTA */}
                  <p className="text-white/90 text-[10px] font-semibold mt-1 group-hover:text-white transition-colors">
                    {b.cta}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={goNext}
        aria-label="Next"
        className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-2.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === dotIdx ? 'bg-[#2534ff] w-4 h-1.5' : 'bg-gray-300 w-1.5 h-1.5'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === dotIdx}
          />
        ))}
      </div>
    </section>
  );
}
