'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Users, Briefcase, Camera, CheckCircle2, Info, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { VehicleType, PricingRule } from '@/types';
import VehicleDetailModal from '@/components/booking/VehicleDetailModal';

interface VehicleSelectorProps {
  vehicles:   PricingRule[];
  selected:   VehicleType | null;
  passengers: number;
  luggage:    number;
  onSelect:   (v: VehicleType) => void;
}

const VEHICLE_EMOJI: Record<VehicleType, string> = {
  SEDAN:      '🚗',
  SUV:        '🚙',
  MINIVAN:    '🚐',
  LUXURY_MPV: '🚐',
};

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

function FeatureTag({ label, color, desc }: { label: string; color: string; desc: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

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
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
            'w-56 rounded-xl bg-gray-900 text-white text-[11px] leading-snug px-3 py-2.5 shadow-xl',
            'pointer-events-none',
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

export default function VehicleSelector({ vehicles, selected, passengers, luggage, onSelect }: VehicleSelectorProps) {
  const [modalVehicle, setModalVehicle] = useState<VehicleType | null>(null);

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

      {/* Vehicle cards */}
      <div className="space-y-4">
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
                'w-full text-left rounded-2xl border-2 transition-all duration-200',
                'flex flex-col sm:flex-row items-center gap-0 overflow-hidden',
                isSelected
                  ? 'border-brand-500 shadow-[0_0_0_4px_rgba(37,52,255,0.10)] bg-white'
                  : tooSmall
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-md',
              )}
            >
              {/* ── Image panel ── */}
              <div className={cn(
                'relative w-full sm:w-[220px] h-[160px] sm:h-[140px] shrink-0 flex items-center justify-center',
                isSelected
                  ? 'bg-gradient-to-br from-brand-50 to-blue-50'
                  : 'bg-gradient-to-br from-slate-50 to-blue-50/40',
              )}>
                {v.imageUrl ? (
                  <Image
                    src={v.imageUrl}
                    alt={`${v.name} — private transfer vehicle`}
                    fill
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-contain p-4 drop-shadow-lg"
                  />
                ) : (
                  <span className="text-7xl select-none drop-shadow">{VEHICLE_EMOJI[v.vehicleType]}</span>
                )}

                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Too small badge */}
                {tooSmall && (
                  <div className="absolute top-3 left-3 text-[10px] bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                    Too small
                  </div>
                )}

                {/* Info button */}
                <button
                  type="button"
                  aria-label={`View details for ${v.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalVehicle(v.vehicleType);
                  }}
                  className={cn(
                    'absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm',
                    'bg-white/80 hover:bg-white text-gray-500 hover:text-[#2534ff] border border-gray-200',
                  )}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Info panel ── */}
              <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-stretch gap-0 w-full">

                {/* Details */}
                <div className="flex-1 px-5 py-4 text-center sm:text-left">
                  <p className="font-extrabold text-gray-900 text-lg leading-tight mb-1">{v.name}</p>
                  <p className="text-[12px] text-gray-400 mb-3 leading-snug line-clamp-2">{v.description}</p>

                  {/* Capacity chips */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg',
                      isSelected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600',
                    )}>
                      <Users className="w-3.5 h-3.5" />
                      Up to {v.maxPassengers} pax
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg',
                      isSelected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600',
                    )}>
                      <Briefcase className="w-3.5 h-3.5" />
                      {v.maxLuggage} bags
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg',
                      isSelected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600',
                    )}>
                      <Camera className="w-3.5 h-3.5" />
                      carry-on
                    </span>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className={cn(
                  'flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center',
                  'w-full sm:w-auto px-5 pb-4 sm:py-4 sm:pr-5 gap-3',
                  'border-t sm:border-t-0 sm:border-l border-gray-100',
                )}>
                  <div className="text-center sm:text-right">
                    <p className="font-extrabold text-gray-900 text-2xl leading-none">
                      {formatCurrency(v.baseFare)}
                    </p>
                    {passengers > 1 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCurrency(Math.round(v.baseFare / passengers))} / person
                      </p>
                    )}
                  </div>
                  <div className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold transition-colors shrink-0',
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : tooSmall
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-brand-600/10 text-brand-700 group-hover:bg-brand-600 group-hover:text-white',
                  )}>
                    {isSelected ? 'Selected ✓' : 'Select'}
                  </div>
                </div>

              </div>
            </button>
          );
        })}
      </div>

      {/* Vehicle detail modal */}
      {modalVehicle && (
        <VehicleDetailModal
          vehicleType={modalVehicle}
          onClose={() => setModalVehicle(null)}
          onSelect={onSelect}
          isSelected={selected === modalVehicle}
        />
      )}

    </div>
  );
}
