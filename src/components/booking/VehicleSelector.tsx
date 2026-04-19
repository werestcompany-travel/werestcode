'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Users, Briefcase, Camera, CheckCircle2, Info } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { VehicleType, PricingRule } from '@/types';

interface VehicleSelectorProps {
  vehicles:   PricingRule[];
  selected:   VehicleType | null;
  passengers: number;
  luggage:    number;
  onSelect:   (v: VehicleType) => void;
}

/* Emoji shown only when no imageUrl is available */
const VEHICLE_EMOJI: Record<VehicleType, string> = {
  SEDAN:   '🚗',
  SUV:     '🚙',
  MINIVAN: '🚐',
};

/* Feature tags with tooltip descriptions */
const FEATURE_TAGS = [
  {
    label: 'Door-to-door',
    color: 'border-gray-300 text-gray-600',
    desc:  'Your driver picks you up and drops you off at your exact address — no walking to a bus stop or shared shuttle.',
  },
  {
    label: 'Driver speaks English',
    color: 'border-gray-300 text-gray-600',
    desc:  'All our drivers are screened for English communication so you can share addresses, ask for stops, or just chat comfortably.',
  },
  {
    label: 'Meet & Greet',
    color: 'border-blue-300 text-blue-700 bg-blue-50',
    desc:  'Your driver will be waiting inside the terminal or lobby with a name sign — no searching, no stress after a long flight.',
  },
];

/* ── FeatureTag with hover + tap tooltip ─────────────────────────────────── */
function FeatureTag({ label, color, desc }: { label: string; color: string; desc: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  /* Close when clicking outside */
  const handleOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open, handleOutside]);

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        /* hover on desktop, tap on mobile */
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border transition-colors select-none',
          color,
          open && 'ring-2 ring-offset-1 ring-blue-200',
        )}
      >
        {label}
        <Info className="w-3 h-3 opacity-50 shrink-0" />
      </button>

      {/* Tooltip */}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
            'w-56 rounded-xl bg-gray-900 text-white text-[11px] leading-snug px-3 py-2.5 shadow-xl',
            'pointer-events-none',
            /* small arrow */
            'after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2',
            'after:border-4 after:border-transparent after:border-t-gray-900',
          )}
        >
          {desc}
        </span>
      )}
    </span>
  );
}

/* ── VehicleSelector ─────────────────────────────────────────────────────── */
export default function VehicleSelector({ vehicles, selected, passengers, luggage, onSelect }: VehicleSelectorProps) {

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Select your ride</h2>

        <div className="flex flex-wrap gap-2 mb-2">
          {FEATURE_TAGS.map(tag => (
            <FeatureTag key={tag.label} {...tag} />
          ))}
        </div>

        <p className="text-xs text-green-700 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
          Free cancellation up to 24 hours before departure
        </p>
      </div>

      {/* Vehicle rows */}
      <div className="space-y-3">
        {vehicles.map((v) => {
          const tooSmall   = v.maxPassengers < passengers || v.maxLuggage < luggage;
          const isSelected = selected === v.vehicleType;

          return (
            <button
              key={v.vehicleType}
              type="button"
              disabled={tooSmall}
              onClick={() => onSelect(v.vehicleType)}
              className={cn(
                'w-full text-left rounded-2xl border-2 px-5 py-4 transition-all duration-150 flex items-center gap-5',
                isSelected  ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                : tooSmall  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50/70',
              )}
            >
              {/* Vehicle image */}
              <div className={cn(
                'relative w-[130px] h-[80px] shrink-0 rounded-xl overflow-hidden flex items-center justify-center',
                'bg-gradient-to-br from-slate-50 to-blue-50/40',
              )}>
                {v.imageUrl ? (
                  <Image
                    src={v.imageUrl}
                    alt={`${v.name} — private transfer vehicle`}
                    fill
                    sizes="130px"
                    className="object-contain p-2 drop-shadow-md"
                  />
                ) : (
                  <span className="text-5xl select-none">{VEHICLE_EMOJI[v.vehicleType]}</span>
                )}
              </div>

              {/* Name + capacity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-gray-900 text-[15px]">{v.name}</span>
                  {tooSmall && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      Too small
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mb-2 leading-snug">{v.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    1–{v.maxPassengers}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {v.maxLuggage} bags
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" /> carry-on
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-lg leading-tight">{formatCurrency(v.baseFare)}</p>
                {passengers > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatCurrency(Math.round(v.baseFare / passengers))} / person
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
