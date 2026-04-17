'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Ruler, Car } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface RouteIllustrationProps {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
}

// Haversine formula – straight-line km between two coords
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RouteIllustration({
  pickupAddress, pickupLat, pickupLng,
  dropoffAddress, dropoffLat, dropoffLng,
}: RouteIllustrationProps) {
  const [animated, setAnimated] = useState(false);

  // Estimate road distance (straight-line × 1.35 factor)
  const straightKm  = haversineKm(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const estDistKm   = straightKm * 1.35;
  const estDurationMin = Math.round((estDistKm / 55) * 60); // avg 55 km/h

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">

      {/* ── Illustration card ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #eef0ff 0%, #e8ecff 50%, #dde3ff 100%)',
          minHeight: 220,
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-brand-200/30" />
        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-brand-300/20" />

        {/* SVG Route Path */}
        <svg
          viewBox="0 0 300 200"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Road shadow */}
          <path
            d="M 60 30 C 60 80, 240 120, 240 170"
            fill="none"
            stroke="#c7cbff"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Road base */}
          <path
            d="M 60 30 C 60 80, 240 120, 240 170"
            fill="none"
            stroke="#a5abff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Animated dashes */}
          <path
            d="M 60 30 C 60 80, 240 120, 240 170"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="10 8"
            style={{
              strokeDashoffset: animated ? 0 : 200,
              transition: 'stroke-dashoffset 1.8s ease-in-out',
            }}
          />
        </svg>

        {/* Pickup marker */}
        <div className="absolute top-4 left-8 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-300/50">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-sm max-w-[140px]">
            <p className="text-[10px] text-gray-400 font-medium">Pickup</p>
            <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{pickupAddress.split(',')[0]}</p>
          </div>
        </div>

        {/* Animated car */}
        <div
          className="absolute z-20 transition-all duration-1000"
          style={{
            left: animated ? '48%' : '16%',
            top:  animated ? '44%' : '10%',
            transform: 'translate(-50%, -50%)',
            fontSize: 22,
          }}
        >
          🚗
        </div>

        {/* Dropoff marker */}
        <div className="absolute bottom-4 right-8 flex items-center gap-2 z-10 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-300/50">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-sm max-w-[140px] text-right">
            <p className="text-[10px] text-gray-400 font-medium">Drop-off</p>
            <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{dropoffAddress.split(',')[0]}</p>
          </div>
        </div>

        {/* Distance badge in centre */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm border border-brand-100 rounded-full px-3 py-1 shadow-sm mt-4">
            <span className="text-xs font-bold text-brand-700">
              ~{estDistKm.toFixed(0)} km
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox
          icon={<Ruler className="w-4 h-4 text-brand-600" />}
          label="Est. distance"
          value={`~${estDistKm.toFixed(1)} km`}
          sub="by road"
        />
        <StatBox
          icon={<Clock className="w-4 h-4 text-brand-600" />}
          label="Est. drive time"
          value={`~${formatDuration(estDurationMin)}`}
          sub="average traffic"
        />
      </div>

      {/* ── Route labels ── */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[9px] font-bold">A</span>
          </div>
          <p className="text-xs text-gray-600 leading-snug">{pickupAddress}</p>
        </div>
        <div className="ml-2.5 border-l-2 border-dashed border-brand-200 pl-4 py-0.5">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Car className="w-3 h-3" /> Private transfer
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[9px] font-bold">B</span>
          </div>
          <p className="text-xs text-gray-600 leading-snug">{dropoffAddress}</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        * Distance &amp; time are estimates based on average road data
      </p>
    </div>
  );
}

function StatBox({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
}) {
  return (
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-center gap-2.5">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}
