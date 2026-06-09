'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerForm, { type CustomerFormData } from '@/components/booking/CustomerForm';
import { formatCurrency } from '@/lib/utils';
import { VEHICLE_CONFIGS, VEHICLE_TYPES } from '@/lib/vehicles';
import {
  Car, Clock, MapPin, Plus, Trash2, Users, Calendar,
  ChevronRight, CheckCircle2, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleType } from '@/types';

/* ── Constants ─────────────────────────────────────────────────────────────── */

const HOURLY_RATES: Record<VehicleType, number> = {
  SEDAN:      1200,
  SUV:        1800,
  MINIVAN:    2500,
  LUXURY_MPV: 5000,
};

const KM_RATES: Record<VehicleType, number> = {
  SEDAN:      12,
  SUV:        18,
  MINIVAN:    22,
  LUXURY_MPV: 35,
};

const BASE_PRICES: Record<VehicleType, number> = {
  SEDAN:      500,
  SUV:        800,
  MINIVAN:    1200,
  LUXURY_MPV: 3500,
};

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Stop {
  id:      string;
  address: string;
  lat:     number;
  lng:     number;
  note:    string;
  order:   number;
}

/* ── Google Maps Autocomplete hook ──────────────────────────────────────────── */

function useAutocomplete(
  inputRef: React.RefObject<HTMLInputElement>,
  onPlace: (address: string, lat: number, lng: number) => void,
  mapsReady: boolean,
) {
  useEffect(() => {
    if (!mapsReady || !inputRef.current || typeof window === 'undefined') return;
    if (!(window as any).google?.maps?.places) return;

    const ac = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
    });

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      const address = place.formatted_address ?? inputRef.current?.value ?? '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onPlace(address, lat, lng);
    });

    return () => {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
    };
  }, [mapsReady, inputRef, onPlace]);
}

/* ── StopInput ─────────────────────────────────────────────────────────────── */

function StopInput({
  stop,
  index,
  mapsReady,
  onUpdate,
  onRemove,
}: {
  stop: Stop;
  index: number;
  mapsReady: boolean;
  onUpdate: (id: string, patch: Partial<Stop>) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePlace = useCallback(
    (address: string, lat: number, lng: number) => {
      onUpdate(stop.id, { address, lat, lng });
    },
    [stop.id, onUpdate],
  );

  useAutocomplete(inputRef, handlePlace, mapsReady);

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center pt-3">
        <div className="w-6 h-6 rounded-full bg-brand-100 border-2 border-brand-400 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-brand-700">{index + 1}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            defaultValue={stop.address}
            placeholder={`Stop ${index + 1} address`}
            onBlur={(e) => {
              if (!stop.lat) onUpdate(stop.id, { address: e.target.value });
            }}
            className="input-base pl-10 text-sm"
          />
        </div>
        <input
          type="text"
          value={stop.note}
          onChange={(e) => onUpdate(stop.id, { note: e.target.value })}
          placeholder="Note (optional) — e.g. pick up luggage, 10 min stop"
          className="input-base text-xs text-gray-500 py-1.5"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(stop.id)}
        className="mt-2.5 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
        title="Remove stop"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── VehicleCard ───────────────────────────────────────────────────────────── */

function VehicleCard({
  type,
  selected,
  charterType,
  hours,
  distanceKm,
  onSelect,
}: {
  type: VehicleType;
  selected: boolean;
  charterType: 'HOURLY' | 'MULTI_STOP';
  hours: number;
  distanceKm: number;
  onSelect: () => void;
}) {
  const cfg = VEHICLE_CONFIGS[type];
  const price =
    charterType === 'HOURLY'
      ? HOURLY_RATES[type] * Math.max(hours, 1)
      : BASE_PRICES[type] + KM_RATES[type] * Math.max(distanceKm, 1);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-150',
        selected
          ? 'border-brand-500 bg-brand-50 shadow-md'
          : 'border-gray-200 hover:border-brand-300 bg-white hover:bg-gray-50',
      )}
    >
      {cfg.badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          {cfg.badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{cfg.emoji}</span>
        <div>
          <p className="font-bold text-gray-900 text-sm">{cfg.name}</p>
          <p className="text-[11px] text-gray-400">{cfg.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span>Up to {cfg.maxPassengers} pax</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {charterType === 'HOURLY' ? `฿${HOURLY_RATES[type].toLocaleString()}/hr` : `฿${KM_RATES[type]}/km`}
          </p>
          <p className="font-extrabold text-brand-700 text-base">{formatCurrency(price)}</p>
        </div>
      </div>
      {selected && (
        <CheckCircle2 className="absolute bottom-3 right-3 w-4 h-4 text-brand-600" />
      )}
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export default function CharterPage() {
  const router = useRouter();
  const [mapsReady, setMapsReady] = useState(false);

  // Tab
  const [tab, setTab] = useState<'HOURLY' | 'MULTI_STOP'>('HOURLY');

  // Shared
  const [vehicle, setVehicle]       = useState<VehicleType>('SUV');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('09:00');
  const [passengers, setPassengers] = useState(2);
  const [loading, setLoading]       = useState(false);

  // Hourly
  const [hours, setHours]             = useState(4);
  const [startAddress, setStartAddress] = useState('');
  const [startLat, setStartLat]       = useState(0);
  const [startLng, setStartLng]       = useState(0);
  const startRef = useRef<HTMLInputElement>(null);

  // Multi-stop
  const [msStart, setMsStart]       = useState('');
  const [msStartLat, setMsStartLat] = useState(0);
  const [msStartLng, setMsStartLng] = useState(0);
  const [msEnd, setMsEnd]           = useState('');
  const [msEndLat, setMsEndLat]     = useState(0);
  const [msEndLng, setMsEndLng]     = useState(0);
  const [returnToStart, setReturnToStart] = useState(false);
  const [stops, setStops]           = useState<Stop[]>([]);
  const [estimatedKm, setEstimatedKm] = useState(0);
  const msStartRef = useRef<HTMLInputElement>(null);
  const msEndRef   = useRef<HTMLInputElement>(null);

  // Customer form visible after vehicle selected
  const [showForm, setShowForm] = useState(false);

  /* ── Autocomplete hooks ─────────────────────────────────────────────────── */

  const handleStartPlace = useCallback((address: string, lat: number, lng: number) => {
    setStartAddress(address);
    setStartLat(lat);
    setStartLng(lng);
  }, []);

  const handleMsStartPlace = useCallback((address: string, lat: number, lng: number) => {
    setMsStart(address);
    setMsStartLat(lat);
    setMsStartLng(lng);
  }, []);

  const handleMsEndPlace = useCallback((address: string, lat: number, lng: number) => {
    setMsEnd(address);
    setMsEndLat(lat);
    setMsEndLng(lng);
  }, []);

  useAutocomplete(startRef, handleStartPlace, mapsReady);
  useAutocomplete(msStartRef, handleMsStartPlace, mapsReady);
  useAutocomplete(msEndRef, handleMsEndPlace, mapsReady);

  /* ── Stop management ────────────────────────────────────────────────────── */

  const addStop = () => {
    if (stops.length >= 8) {
      toast.error('Maximum 8 stops allowed.');
      return;
    }
    setStops(prev => [
      ...prev,
      { id: crypto.randomUUID(), address: '', lat: 0, lng: 0, note: '', order: prev.length },
    ]);
  };

  const updateStop = useCallback((id: string, patch: Partial<Stop>) => {
    setStops(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  }, []);

  /* ── Pricing ────────────────────────────────────────────────────────────── */

  const totalPrice =
    tab === 'HOURLY'
      ? HOURLY_RATES[vehicle] * Math.max(hours, 1)
      : BASE_PRICES[vehicle] + KM_RATES[vehicle] * Math.max(estimatedKm, 1);

  /* ── Estimate km when multi-stop addresses change ──────────────────────── */

  useEffect(() => {
    if (tab !== 'MULTI_STOP') return;
    const allLat = [msStartLat, ...stops.map(s => s.lat), returnToStart ? 0 : msEndLat].filter(Boolean);
    const allLng = [msStartLng, ...stops.map(s => s.lng), returnToStart ? 0 : msEndLng].filter(Boolean);
    if (allLat.length < 2) { setEstimatedKm(0); return; }

    // Rough straight-line estimate (multiply by 1.3 for road factor)
    let totalD = 0;
    for (let i = 0; i < allLat.length - 1; i++) {
      const R = 6371;
      const dLat = ((allLat[i + 1] - allLat[i]) * Math.PI) / 180;
      const dLon = ((allLng[i + 1] - allLng[i]) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((allLat[i] * Math.PI) / 180) *
          Math.cos((allLat[i + 1] * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      totalD += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    setEstimatedKm(Math.round(totalD * 1.3));
  }, [tab, msStartLat, msStartLng, stops, msEndLat, msEndLng, returnToStart]);

  /* ── Validation before showing form ─────────────────────────────────────── */

  const handleContinue = () => {
    if (!date) { toast.error('Please select a date.'); return; }
    if (tab === 'HOURLY') {
      if (!startAddress) { toast.error('Please enter a start address.'); return; }
    } else {
      if (!msStart) { toast.error('Please enter a start address.'); return; }
      if (stops.length === 0) { toast.error('Please add at least one stop.'); return; }
      if (stops.some(s => !s.address)) { toast.error('Please fill in all stop addresses.'); return; }
    }
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('charter-customer-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  /* ── Submit ─────────────────────────────────────────────────────────────── */

  const handleSubmit = async (customerData: CustomerFormData) => {
    setLoading(true);
    try {
      const payload = {
        charterType: tab,
        vehicleType: vehicle,
        startDate:   date,
        startTime:   time,
        durationHours: tab === 'HOURLY' ? hours : undefined,
        startAddress:  tab === 'HOURLY' ? startAddress : msStart,
        startLat:      tab === 'HOURLY' ? startLat : msStartLat,
        startLng:      tab === 'HOURLY' ? startLng : msStartLng,
        stops:         tab === 'MULTI_STOP'
          ? stops.map((s, i) => ({ address: s.address, lat: s.lat, lng: s.lng, note: s.note, order: i }))
          : [],
        endAddress: tab === 'MULTI_STOP' ? (returnToStart ? (tab === 'MULTI_STOP' ? msStart : undefined) : msEnd || undefined) : undefined,
        endLat:     tab === 'MULTI_STOP' && !returnToStart && msEndLat ? msEndLat : undefined,
        endLng:     tab === 'MULTI_STOP' && !returnToStart && msEndLng ? msEndLng : undefined,
        passengers,
        hourlyRate: tab === 'HOURLY' ? HOURLY_RATES[vehicle] : undefined,
        distanceKm: tab === 'MULTI_STOP' ? estimatedKm : 0,
        basePrice:  totalPrice,
        totalPrice,
        ...customerData,
        specialNotes: customerData.specialNotes,
      };

      const res  = await fetch('/api/charter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Booking failed. Please try again.');
      }

      router.push(`/charter/confirmation?ref=${encodeURIComponent(json.bookingRef)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onReady={() => setMapsReady(true)}
      />
      <Navbar transparent />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-[#1a2aee] to-[#2534ff] text-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Car className="w-4 h-4" />
              Charter &amp; Multi-Stop Bookings
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Your ride, your route</h1>
            <p className="text-blue-100 text-base max-w-xl mx-auto">
              Book a vehicle by the hour or plan a custom multi-stop journey across Thailand with a professional driver.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Tab switcher */}
          <div className="flex bg-white rounded-2xl border border-gray-200 p-1 shadow-sm">
            {(['HOURLY', 'MULTI_STOP'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setShowForm(false); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                  tab === t
                    ? 'bg-[#2534ff] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {t === 'HOURLY' ? (
                  <><Clock className="w-4 h-4" /> Hourly Charter</>
                ) : (
                  <><MapPin className="w-4 h-4" /> Multi-Stop</>
                )}
              </button>
            ))}
          </div>

          {/* ── HOURLY TAB ─────────────────────────────────────────────────────── */}
          {tab === 'HOURLY' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" /> Hourly Charter Details
              </h2>

              {/* Start address */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pickup / Start Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={startRef}
                    type="text"
                    placeholder="Hotel, airport, address…"
                    defaultValue={startAddress}
                    onBlur={(e) => { if (!startLat) setStartAddress(e.target.value); }}
                    className="input-base pl-10"
                  />
                </div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Start Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Hours + Passengers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Duration (hours) *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="input-base pl-10 appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Passengers *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="input-base pl-10 appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <p>
                  Your driver will be with you for the full booked duration.
                  You can go anywhere within that time — the driver handles all routes.
                  Additional hours can be arranged directly with the driver.
                </p>
              </div>
            </div>
          )}

          {/* ── MULTI-STOP TAB ─────────────────────────────────────────────────── */}
          {tab === 'MULTI_STOP' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> Multi-Stop Route
              </h2>

              {/* Start */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Start Address *</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-500 pointer-events-none" />
                  <input
                    ref={msStartRef}
                    type="text"
                    placeholder="Hotel, airport, address…"
                    defaultValue={msStart}
                    onBlur={(e) => { if (!msStartLat) setMsStart(e.target.value); }}
                    className="input-base pl-10"
                  />
                </div>
              </div>

              {/* Stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600">
                    Stops ({stops.length}/8)
                  </label>
                  {stops.length < 8 && (
                    <button
                      type="button"
                      onClick={addStop}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stop
                    </button>
                  )}
                </div>

                {stops.length === 0 && (
                  <button
                    type="button"
                    onClick={addStop}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add your first stop
                  </button>
                )}

                {stops.map((stop, i) => (
                  <StopInput
                    key={stop.id}
                    stop={stop}
                    index={i}
                    mapsReady={mapsReady}
                    onUpdate={updateStop}
                    onRemove={removeStop}
                  />
                ))}
              </div>

              {/* End address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">End Address</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={returnToStart}
                      onChange={(e) => setReturnToStart(e.target.checked)}
                      className="rounded accent-brand-600"
                    />
                    Return to start
                  </label>
                </div>
                {!returnToStart && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-red-400 bg-red-100 pointer-events-none" />
                    <input
                      ref={msEndRef}
                      type="text"
                      placeholder="Final destination (optional)"
                      defaultValue={msEnd}
                      onBlur={(e) => { if (!msEndLat) setMsEnd(e.target.value); }}
                      className="input-base pl-10"
                    />
                  </div>
                )}
                {returnToStart && (
                  <p className="text-xs text-gray-400 italic">Driver will return you to the start address.</p>
                )}
              </div>

              {/* Date + Time + Passengers */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Passengers *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="input-base pl-10 appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Estimated distance note */}
              {estimatedKm > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                  <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  Estimated distance: ~{estimatedKm} km (road factor applied). Final price confirmed by driver.
                </div>
              )}
            </div>
          )}

          {/* ── Vehicle Selection ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-brand-600" /> Choose Your Vehicle
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VEHICLE_TYPES.map((v) => (
                <VehicleCard
                  key={v}
                  type={v}
                  selected={vehicle === v}
                  charterType={tab}
                  hours={hours}
                  distanceKm={estimatedKm}
                  onSelect={() => { setVehicle(v); setShowForm(false); }}
                />
              ))}
            </div>
          </div>

          {/* ── Price summary + Continue button ──────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  {tab === 'HOURLY'
                    ? `${hours} hour${hours > 1 ? 's' : ''} · ${VEHICLE_CONFIGS[vehicle].name}`
                    : `${stops.length} stop${stops.length !== 1 ? 's' : ''} · ${VEHICLE_CONFIGS[vehicle].name}${estimatedKm > 0 ? ` · ~${estimatedKm} km` : ''}`}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{formatCurrency(totalPrice)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tab === 'HOURLY'
                    ? `฿${HOURLY_RATES[vehicle].toLocaleString()} × ${hours} hr`
                    : `฿${BASE_PRICES[vehicle].toLocaleString()} base + ฿${KM_RATES[vehicle]}/km`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1a28e0] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              No upfront payment · Pay on the day · Free cancellation 24h before
            </p>
          </div>

          {/* ── Customer Form ────────────────────────────────────────────────── */}
          {showForm && (
            <div id="charter-customer-form" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <CustomerForm onSubmit={handleSubmit} />

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const form = document.getElementById('customer-form') as HTMLFormElement | null;
                  form?.requestSubmit();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a28e0] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Confirming…
                  </span>
                ) : (
                  <>Confirm Charter Booking · {formatCurrency(totalPrice)}</>
                )}
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
