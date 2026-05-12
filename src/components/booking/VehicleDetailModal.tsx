'use client';

import { useEffect, useCallback } from 'react';
import {
  X,
  Users,
  Briefcase,
  Star,
  Zap,
  Wind,
  Usb,
  Navigation,
  Armchair,
  Shield,
  Music,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { VehicleType } from '@/types';
import { cn } from '@/lib/utils';

/* ── Per-vehicle rich detail data ─────────────────────────────────────── */

interface FeatureItem {
  icon: React.ReactNode;
  label: string;
}

interface VehicleDetail {
  modelName: string;
  heroColor: string;   // Tailwind gradient classes for the hero bg
  vehicleClass: string;
  passengers: number;
  luggage: number;
  description: string;
  features: FeatureItem[];
  idealFor: string[];
  engine: string;
  transmission: string;
  year: string;
}

const iconCls = 'w-4 h-4 shrink-0';

const VEHICLE_DETAILS: Record<VehicleType, VehicleDetail> = {
  SEDAN: {
    modelName:    'Toyota Altis (Corolla Altis)',
    heroColor:    'from-blue-600 to-blue-400',
    vehicleClass: 'Sedan',
    passengers:   3,
    luggage:      3,
    description:
      'The Toyota Corolla Altis is one of Thailand\'s most trusted saloon cars — smooth, fuel-efficient, and perfectly sized for airport runs or city trips. The cabin is quiet, cool, and comfortably seats three adults with ample boot space for checked luggage.',
    features: [
      { icon: <Wind className={iconCls} />,       label: 'Full A/C' },
      { icon: <Usb className={iconCls} />,        label: 'USB charging' },
      { icon: <Armchair className={iconCls} />,   label: 'Leather seats' },
      { icon: <Navigation className={iconCls} />, label: 'GPS navigation' },
    ],
    idealFor: [
      'Airport transfers',
      'City trips',
      'Couples & solo travellers',
    ],
    engine:       '1.8L VVT-i',
    transmission: 'Automatic',
    year:         '2020 – present',
  },

  SUV: {
    modelName:    'Toyota Fortuner',
    heroColor:    'from-slate-700 to-slate-500',
    vehicleClass: 'SUV',
    passengers:   6,
    luggage:      4,
    description:
      'The Toyota Fortuner is a body-on-frame SUV built for both city comfort and off-road confidence. Its raised ride height and powerful diesel engine make it ideal for mountain routes to Chiang Mai or Pai, while the spacious three-row cabin keeps families comfortable on every road.',
    features: [
      { icon: <Wind className={iconCls} />,       label: 'Full A/C' },
      { icon: <Usb className={iconCls} />,        label: 'USB charging' },
      { icon: <Briefcase className={iconCls} />,  label: 'Spacious boot' },
      { icon: <Shield className={iconCls} />,     label: '4WD option' },
      { icon: <Navigation className={iconCls} />, label: 'GPS navigation' },
    ],
    idealFor: [
      'Family trips',
      'Chiang Mai mountains',
      'Group transfers',
    ],
    engine:       '2.8L Diesel Turbo',
    transmission: 'Automatic',
    year:         '2020 – present',
  },

  MINIVAN: {
    modelName:    'Toyota Commuter (Hi-Ace Commuter)',
    heroColor:    'from-emerald-600 to-teal-500',
    vehicleClass: 'Van',
    passengers:   9,
    luggage:      6,
    description:
      'The Toyota Hi-Ace Commuter is the gold standard for group travel in Thailand. Individual captain seats in every row, generous headroom, and a huge rear boot mean that even a fully-loaded group of nine arrives relaxed and ready to explore.',
    features: [
      { icon: <Wind className={iconCls} />,       label: 'Full A/C' },
      { icon: <Armchair className={iconCls} />,   label: 'Captain seats' },
      { icon: <Usb className={iconCls} />,        label: 'Individual USB ports' },
      { icon: <Briefcase className={iconCls} />,  label: 'Large boot' },
      { icon: <Navigation className={iconCls} />, label: 'GPS navigation' },
    ],
    idealFor: [
      'Large groups',
      'Corporate transfers',
      'Island day trips',
    ],
    engine:       '2.8L Diesel',
    transmission: 'Automatic',
    year:         '2019 – present',
  },

  LUXURY_MPV: {
    modelName:    'Toyota Alphard',
    heroColor:    'from-amber-700 to-yellow-500',
    vehicleClass: 'Luxury MPV',
    passengers:   6,
    luggage:      4,
    description:
      'The Toyota Alphard is the pinnacle of private ground transport — a rolling executive lounge draped in premium materials. Power-sliding doors open to fully-reclining captain seats, isolated from noise and wrapped in ambient lighting. When only the best will do.',
    features: [
      { icon: <Armchair className={iconCls} />,   label: 'Executive captain seats' },
      { icon: <SunMedium className={iconCls} />,  label: 'Panoramic sunroof' },
      { icon: <Music className={iconCls} />,      label: 'Premium sound system' },
      { icon: <Shield className={iconCls} />,     label: 'Privacy curtains' },
      { icon: <Wind className={iconCls} />,       label: 'A/C in all zones' },
      { icon: <Star className={iconCls} />,       label: 'Champagne service' },
    ],
    idealFor: [
      'VIP transfers',
      'Business executives',
      'Honeymoon couples',
      'Airport limousine',
    ],
    engine:       '3.5L V6',
    transmission: 'Automatic',
    year:         '2021 – present',
  },
};

/* ── Component ───────────────────────────────────────────────────────── */

interface VehicleDetailModalProps {
  vehicleType: VehicleType;
  onClose:     () => void;
  onSelect:    (v: VehicleType) => void;
  isSelected:  boolean;
}

export default function VehicleDetailModal({
  vehicleType,
  onClose,
  onSelect,
  isSelected,
}: VehicleDetailModalProps) {
  const detail = VEHICLE_DETAILS[vehicleType];

  /* Close on ESC */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    /* Prevent body scroll while open */
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  function handleSelect() {
    onSelect(vehicleType);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Details for ${detail.modelName}`}
    >
      {/* Card — stops click propagation so backdrop click closes but card click doesn't */}
      <div
        className={cn(
          'relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl',
          'max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto',
          'flex flex-col',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero ── */}
        <div
          className={cn(
            'relative shrink-0 h-44 sm:h-52 flex items-end rounded-t-3xl sm:rounded-t-3xl overflow-hidden',
            'bg-gradient-to-br',
            detail.heroColor,
          )}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

          {/* Vehicle class badge */}
          <div className="absolute top-4 left-5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-white/20 px-3 py-1 rounded-full">
              {detail.vehicleClass}
            </span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Model name */}
          <div className="relative px-6 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow">
              {detail.modelName}
            </h2>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 pt-5 pb-6 space-y-6">

          {/* Badge row */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
              <Users className="w-4 h-4" />
              Up to {detail.passengers} passengers
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
              <Briefcase className="w-4 h-4" />
              Up to {detail.luggage} bags
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
              <Star className="w-4 h-4" />
              {detail.vehicleClass}
            </span>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              About this vehicle
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{detail.description}</p>
          </div>

          {/* Features grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Features
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {detail.features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                >
                  <span className="text-[#2534ff]">{f.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Perfect for */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Perfect for
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.idealFor.map((use) => (
                <span
                  key={use}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Technical specs */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Technical specs
            </h3>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
              <SpecRow icon={<Zap className="w-4 h-4 text-[#2534ff]" />} label="Engine" value={detail.engine} />
              <SpecRow icon={<Shield className="w-4 h-4 text-[#2534ff]" />} label="Transmission" value={detail.transmission} />
              <SpecRow icon={<Star className="w-4 h-4 text-[#2534ff]" />} label="Model year" value={detail.year} />
            </div>
          </div>

        </div>

        {/* ── Sticky footer CTA ── */}
        <div className="shrink-0 px-5 sm:px-7 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleSelect}
            className={cn(
              'w-full py-3.5 rounded-2xl text-base font-bold transition-all duration-200',
              isSelected
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-[#2534ff] hover:bg-[#1a25e0] text-white shadow-md hover:shadow-lg',
            )}
          >
            {isSelected ? 'Vehicle already selected ✓' : 'Select This Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helper ─────────────────────────────────────────────────────────── */

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white">
      {icon}
      <span className="text-sm text-gray-500 flex-1">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
