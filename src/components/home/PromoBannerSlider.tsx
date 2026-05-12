'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Banner data ──────────────────────────────────────────────────────────────

const BANNERS = [
  { id: 1, img: '/images/promos/promo-1.avif', href: '/private-transfer', alt: 'Promotion 1' },
  { id: 2, img: '/images/promos/promo-2.avif', href: '/tours',            alt: 'Promotion 2' },
  { id: 3, img: '/images/promos/promo-3.avif', href: '/private-transfer', alt: 'Promotion 3' },
  { id: 4, img: '/images/promos/promo-4.avif', href: '/auth/register',    alt: 'Promotion 4' },
  { id: 5, img: '/images/promos/promo-5.avif', href: '/tours',            alt: 'Promotion 5' },
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
          {ITEMS.map((b, i) => (
            <Link
              key={i}
              href={b.href}
              className="relative flex-shrink-0 rounded-xl overflow-hidden group hover:brightness-105 transition-[filter] duration-200"
              style={{
                width:     cardW > 0 ? cardW : `calc(${100 / VISIBLE}% - ${GAP}px)`,
                flex:      '0 0 auto',
                height:    HEIGHT,
              }}
              tabIndex={Math.abs(i - idx) <= VISIBLE ? 0 : -1}
              aria-hidden={Math.abs(i - idx) > VISIBLE}
            >
              <Image
                src={b.img}
                alt={b.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 33vw"
                priority={i < VISIBLE * 2}
              />
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
