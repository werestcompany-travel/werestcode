'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Banner data ──────────────────────────────────────────────────────────────

const BANNERS = [
  {
    id: 1,
    bg: 'from-[#0d3fa6] via-[#1352cc] to-[#0a2d8c]',
    tag: 'Werest Travel | 💳 Card Payment',
    headline: 'Exclusive offer for\nCard Payments',
    highlight: '฿200 OFF Transfers!',
    sub: null,
    cta: 'BOOK NOW',
    href: '/private-transfer',
    accent: '#ff3b5c',
    decorEmoji: '✈️',
    decorPos: 'right-4 top-2 text-5xl opacity-20',
    fine: '*New customers only. Use code WEREST200 at checkout.',
    textLight: true,
  },
  {
    id: 2,
    bg: 'from-[#e8f4ff] via-[#d0e8ff] to-[#c2dfff]',
    tag: 'Werest Travel | 🌸 Season Deals',
    headline: 'Big savings on\ntransfers and tours',
    highlight: null,
    sub: 'Get up to',
    bigNum: '฿3,000',
    cta: 'BOOK NOW',
    href: '/tours',
    accent: '#ff3b5c',
    decorEmoji: '🏖️',
    decorPos: 'right-3 top-2 text-5xl opacity-25',
    fine: '* 18 May 26 – 31 May 26 | Limited availability.',
    textLight: false,
  },
  {
    id: 3,
    bg: 'from-[#071a5e] via-[#0d2d9e] to-[#040f3d]',
    tag: 'Werest Travel',
    headline: 'TRANSFER\nTOP DEALS',
    arrow: true,
    sub: 'Up to 30% OFF',
    cta: 'BOOK NOW',
    href: '/private-transfer',
    accent: '#ff3b5c',
    decorEmoji: '🚗',
    decorPos: 'right-4 bottom-3 text-5xl opacity-20',
    fine: null,
    textLight: true,
  },
  {
    id: 4,
    bg: 'from-[#0f4c35] via-[#136640] to-[#0a3325]',
    tag: 'Werest Rewards | 🎁',
    headline: 'Earn points on\nevery booking',
    highlight: '200 Bonus Points!',
    sub: 'Free to join',
    cta: 'JOIN NOW',
    href: '/auth/register',
    accent: '#fbbf24',
    decorEmoji: '⭐',
    decorPos: 'right-4 top-2 text-5xl opacity-20',
    fine: '* Points redeemable on future bookings.',
    textLight: true,
  },
];

const GAP     = 10;   // px between cards
const HEIGHT  = 137;  // card min-height
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

  // Active dot: real index 0-3
  const dotIdx = ((idx - TOTAL) % TOTAL + TOTAL) % TOTAL;

  return (
    <section
      aria-label="Promotional banners"
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

      {/* Clipping viewport — hides off-screen cards */}
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
          {ITEMS.map((b, i) => (
            <Link
              key={i}
              href={b.href}
              className={`
                relative flex-shrink-0 rounded-xl overflow-hidden
                bg-gradient-to-br ${b.bg}
                group hover:brightness-105 transition-[filter] duration-200
              `}
              style={{
                width:     cardW > 0 ? cardW : `calc(${100 / VISIBLE}% - ${GAP}px)`,
                flex:      '0 0 auto',
                minHeight: HEIGHT,
              }}
              tabIndex={Math.abs(i - idx) <= VISIBLE ? 0 : -1}
              aria-hidden={Math.abs(i - idx) > VISIBLE}
            >
              {/* Decorative emoji */}
              <span className={`absolute pointer-events-none select-none ${b.decorPos}`} aria-hidden="true">
                {b.decorEmoji}
              </span>

              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '16px 16px' }}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-3.5" style={{ minHeight: HEIGHT }}>
                <div>
                  <p className={`text-[10px] font-bold mb-1 ${b.textLight ? 'text-white/70' : 'text-gray-500'}`}>
                    {b.tag}
                  </p>
                  <h3 className={`text-[16px] font-extrabold leading-tight whitespace-pre-line mb-1 ${b.textLight ? 'text-white' : 'text-gray-900'}`}>
                    {b.headline}
                    {'arrow' in b && b.arrow && <span className="ml-1">✈</span>}
                  </h3>
                  {'sub' in b && b.sub && !('bigNum' in b && b.bigNum) && (
                    <p className={`text-[12px] font-semibold ${b.textLight ? 'text-white/80' : 'text-gray-600'}`}>{b.sub}</p>
                  )}
                  {'bigNum' in b && b.bigNum && (
                    <div className="mt-0.5">
                      <p className={`text-[10px] font-semibold ${b.textLight ? 'text-white/70' : 'text-gray-500'}`}>{b.sub}</p>
                      <p className="text-[24px] font-black text-[#0070f3] leading-none">{b.bigNum}</p>
                    </div>
                  )}
                  {'highlight' in b && b.highlight && (
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: b.accent }}>
                      {b.highlight}
                    </span>
                  )}
                </div>

                <div>
                  <button
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ background: b.accent }}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {b.cta} <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                  {'fine' in b && b.fine && (
                    <p className={`mt-1 text-[8px] leading-tight ${b.textLight ? 'text-white/40' : 'text-gray-400'}`}>
                      {b.fine}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
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
