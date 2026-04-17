'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, Users, Briefcase, Search, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceResult } from '@/types';

declare global {
  interface Window { google: typeof google; }
}

const today = new Date().toISOString().split('T')[0];

// Popular routes quick-fill
const QUICK_ROUTES = [
  {
    label: 'BKK → Bangkok City',
    pickup:  { address: 'Suvarnabhumi Airport (BKK), Bang Phli District, Samut Prakan, Thailand', lat: 13.6900, lng: 100.7501 },
    dropoff: { address: 'Sukhumvit Road, Bangkok, Thailand', lat: 13.7383, lng: 100.5601 },
  },
  {
    label: 'DMK → Bangkok City',
    pickup:  { address: "Don Mueang International Airport (DMK), Don Mueang, Bangkok, Thailand", lat: 13.9126, lng: 100.6068 },
    dropoff: { address: 'Sukhumvit Road, Bangkok, Thailand', lat: 13.7383, lng: 100.5601 },
  },
  {
    label: 'BKK → Pattaya',
    pickup:  { address: 'Suvarnabhumi Airport (BKK), Bang Phli District, Samut Prakan, Thailand', lat: 13.6900, lng: 100.7501 },
    dropoff: { address: 'Pattaya City, Chonburi, Thailand', lat: 12.9236, lng: 100.8825 },
  },
];

type TripMode = 'pickup' | 'dropoff';

export default function PrivateRideForm() {
  const router = useRouter();

  const [mode, setMode]                   = useState<TripMode>('pickup');
  const [pickup, setPickup]               = useState<PlaceResult | null>(null);
  const [dropoff, setDropoff]             = useState<PlaceResult | null>(null);
  const [pickupInput, setPickupInput]     = useState('');
  const [dropoffInput, setDropoffInput]   = useState('');
  const [date, setDate]                   = useState(today);
  const [time, setTime]                   = useState('10:00');
  const [passengers, setPassengers]       = useState(2);
  const [luggage, setLuggage]             = useState(1);
  const [showPassengers, setShowPassengers] = useState(false);
  const [error, setError]                 = useState('');

  const pickupRef  = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);
  const pickupAC   = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffAC  = useRef<google.maps.places.Autocomplete | null>(null);

  const initAutocomplete = useCallback(() => {
    if (!window.google || !pickupRef.current || !dropoffRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'place_id'],
      componentRestrictions: { country: 'TH' },
    };

    pickupAC.current = new google.maps.places.Autocomplete(pickupRef.current, options);
    pickupAC.current.addListener('place_changed', () => {
      const place = pickupAC.current!.getPlace();
      if (place.geometry?.location) {
        const addr = place.formatted_address ?? pickupRef.current!.value;
        setPickup({ address: addr, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setPickupInput(addr);
      }
    });

    dropoffAC.current = new google.maps.places.Autocomplete(dropoffRef.current, options);
    dropoffAC.current.addListener('place_changed', () => {
      const place = dropoffAC.current!.getPlace();
      if (place.geometry?.location) {
        const addr = place.formatted_address ?? dropoffRef.current!.value;
        setDropoff({ address: addr, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setDropoffInput(addr);
      }
    });
  }, []);

  useEffect(() => {
    if (window.google) { initAutocomplete(); return; }
    const interval = setInterval(() => {
      if (window.google) { clearInterval(interval); initAutocomplete(); }
    }, 300);
    return () => clearInterval(interval);
  }, [initAutocomplete]);

  const applyQuickRoute = (route: typeof QUICK_ROUTES[0]) => {
    setPickup(route.pickup);
    setPickupInput(route.pickup.address);
    setDropoff(route.dropoff);
    setDropoffInput(route.dropoff.address);
    setError('');
  };

  const handleSearch = () => {
    if (!pickup)  { setError('Please select a pickup location');  return; }
    if (!dropoff) { setError('Please select a drop-off location'); return; }
    setError('');

    const params = new URLSearchParams({
      pickup_address:  pickup.address,
      pickup_lat:      String(pickup.lat),
      pickup_lng:      String(pickup.lng),
      dropoff_address: dropoff.address,
      dropoff_lat:     String(dropoff.lat),
      dropoff_lng:     String(dropoff.lng),
      date, time,
      passengers: String(passengers),
      luggage:    String(luggage),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="space-y-4">

      {/* ── Mode toggle ── */}
      <div className="flex gap-4 border-b border-gray-100 pb-3">
        {([['pickup', 'Airport Pick-up', PlaneLanding], ['dropoff', 'Airport Drop-off', PlaneTakeoff]] as const).map(
          ([val, label, Icon]) => (
            <button
              key={val}
              type="button"
              onClick={() => setMode(val)}
              className={cn(
                'flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-all',
                mode === val
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ),
        )}
      </div>

      {/* ── Quick routes ── */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ROUTES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => applyQuickRoute(r)}
            className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors font-medium"
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Main fields row ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* From */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none z-10" />
          <input
            ref={pickupRef}
            type="text"
            placeholder="From – airport, hotel, address…"
            value={pickupInput}
            onChange={(e) => { setPickupInput(e.target.value); if (!e.target.value) setPickup(null); }}
            className="input-base pl-10"
          />
        </div>

        {/* To */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
          </div>
          <input
            ref={dropoffRef}
            type="text"
            placeholder="To – address or hotel"
            value={dropoffInput}
            onChange={(e) => { setDropoffInput(e.target.value); if (!e.target.value) setDropoff(null); }}
            className="input-base pl-10"
          />
        </div>
      </div>

      {/* ── Date / Time / Passengers row ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Date */}
        <div className="relative flex-1">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        {/* Time */}
        <div className="relative flex-1">
          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-base pl-10"
          />
        </div>

        {/* Passengers dropdown */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowPassengers(!showPassengers)}
            className="input-base flex items-center gap-2 w-full text-left"
          >
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-sm text-gray-700">
              {passengers} passenger{passengers !== 1 ? 's' : ''}, {luggage} bag{luggage !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {showPassengers && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-card-hover z-50 p-4 space-y-3">
              <CounterRow
                icon={<Users className="w-4 h-4 text-gray-400" />}
                label="Passengers"
                value={passengers} min={1} max={10}
                onChange={setPassengers}
              />
              <CounterRow
                icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                label="Luggage"
                value={luggage} min={0} max={15}
                onChange={setLuggage}
              />
              <button
                type="button"
                onClick={() => setShowPassengers(false)}
                className="w-full text-xs font-semibold text-brand-700 bg-brand-50 rounded-lg py-1.5 hover:bg-brand-100 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold rounded-xl px-6 py-3 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function CounterRow({
  icon, label, value, min, max, onChange,
}: {
  icon: React.ReactNode; label: string;
  value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        {icon} {label}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className={cn(
            'w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 transition-colors',
            value <= min ? 'opacity-30 cursor-not-allowed' : 'hover:bg-brand-50 hover:text-brand-700',
          )}
        >−</button>
        <span className="text-sm font-bold w-5 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className={cn(
            'w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 transition-colors',
            value >= max ? 'opacity-30 cursor-not-allowed' : 'hover:bg-brand-50 hover:text-brand-700',
          )}
        >+</button>
      </div>
    </div>
  );
}
