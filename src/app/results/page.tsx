'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PriceSummary from '@/components/booking/PriceSummary';
import AddOnsSelector from '@/components/booking/AddOnsSelector';
import { VehicleType, PricingRule, AddOn, SelectedAddOn } from '@/types';
import { VEHICLE_CONFIGS, VEHICLE_TYPES } from '@/lib/vehicles';
import {
  ArrowLeft,
  Loader2,
  Clock,
  Users,
  Briefcase,
  ArrowRight,
  Pencil,
  MapPin,
  CheckCircle2,
  Zap,
  Check,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import TripEditPanel from '@/components/booking/TripEditPanel';

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsPageInner />
    </Suspense>
  );
}

/* ── helpers ── */

function isWeekendOrPeak(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
}

function getBadgeStyle(badge: string): string {
  if (badge === 'Most Popular') return 'bg-orange-500 text-white';
  if (badge === 'Best Value')   return 'bg-green-600 text-white';
  if (badge === 'Premium')      return 'bg-yellow-500 text-white';
  return 'bg-gray-500 text-white';
}

function getBadgeEmoji(badge: string): string {
  if (badge === 'Most Popular') return '🔥';
  if (badge === 'Best Value')   return '💰';
  if (badge === 'Premium')      return '👑';
  return '';
}

/* ── Vehicle photo card with exterior/interior toggle ── */
interface PhotoTabsProps {
  vehicleType: VehicleType;
  name: string;
}

function PhotoTabs({ vehicleType, name }: PhotoTabsProps) {
  const [tab, setTab] = useState<'exterior' | 'interior'>('exterior');
  const cfg = VEHICLE_CONFIGS[vehicleType];
  const src = tab === 'exterior' ? cfg.exteriorImage : cfg.interiorImage;

  return (
    <div className="relative w-full sm:w-[260px] shrink-0">
      <div className="relative h-[180px] sm:h-full min-h-[180px] overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-slate-100">
        <Image
          src={src}
          alt={`${name} ${tab}`}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="object-cover transition-opacity duration-300"
          priority={false}
        />
      </div>
      {/* Tab toggle */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 backdrop-blur-sm rounded-full px-1 py-1">
        {(['exterior', 'interior'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900' : 'text-white hover:bg-white/20'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Single vehicle result card ── */
interface VehicleCardProps {
  vehicle: PricingRule;
  isSelected: boolean;
  passengers: number;
  luggage: number;
  tripDate: string;
  onSelect: (v: VehicleType) => void;
}

function VehicleCard({ vehicle, isSelected, passengers, luggage, tripDate, onSelect }: VehicleCardProps) {
  const cfg = VEHICLE_CONFIGS[vehicle.vehicleType];
  const tooSmall = vehicle.maxPassengers < passengers || vehicle.maxLuggage < luggage;
  const limited  = isWeekendOrPeak(tripDate);

  return (
    <div
      className={`relative flex flex-col sm:flex-row rounded-2xl border-2 overflow-hidden transition-all duration-200 bg-white ${
        isSelected
          ? 'border-[#2534ff] shadow-[0_0_0_4px_rgba(37,52,255,0.10)]'
          : tooSmall
            ? 'border-gray-100 opacity-50'
            : 'border-gray-200 hover:border-[#2534ff]/50 hover:shadow-md'
      }`}
    >
      {/* Badge — top-right absolute */}
      {cfg.badge && (
        <div
          className={`absolute top-3 right-3 z-10 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${getBadgeStyle(cfg.badge)}`}
        >
          <span>{getBadgeEmoji(cfg.badge)}</span>
          <span>{cfg.badge}</span>
        </div>
      )}

      {/* Too small badge */}
      {tooSmall && (
        <div className="absolute top-3 left-3 z-10 text-[10px] bg-red-500 text-white px-2 py-1 rounded-full font-bold">
          Too small
        </div>
      )}

      {/* Photo tabs — left panel */}
      <PhotoTabs vehicleType={vehicle.vehicleType} name={vehicle.name} />

      {/* Right info panel */}
      <div className="flex-1 flex flex-col p-5 gap-3">

        {/* Name + capacity */}
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1">{vehicle.name}</h3>
          <p className="text-xs text-gray-400 leading-snug mb-3">{vehicle.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${isSelected ? 'bg-blue-100 text-[#2534ff]' : 'bg-gray-100 text-gray-600'}`}>
              <Users className="w-3.5 h-3.5" /> Up to {vehicle.maxPassengers} pax
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${isSelected ? 'bg-blue-100 text-[#2534ff]' : 'bg-gray-100 text-gray-600'}`}>
              <Briefcase className="w-3.5 h-3.5" /> {vehicle.maxLuggage} bags
            </span>
          </div>
        </div>

        {/* Free cancellation */}
        <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          Free cancellation up to 48 hours before departure
        </p>

        {/* What's included — 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          {cfg.includes.map((item) => (
            <p key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
              <Check className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
              {item}
            </p>
          ))}
        </div>

        {/* Availability + price + CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-auto pt-2 border-t border-gray-100">

          {/* Availability */}
          <div>
            {limited ? (
              <p className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Zap className="w-3.5 h-3.5 shrink-0" /> Limited availability
              </p>
            ) : (
              <p className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Available
              </p>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-extrabold text-gray-900 leading-none">{formatCurrency(vehicle.baseFare)}</p>
              <p className="text-xs text-gray-400 mt-0.5">per vehicle</p>
            </div>
            <button
              type="button"
              disabled={tooSmall}
              onClick={() => !tooSmall && onSelect(vehicle.vehicleType)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
                isSelected
                  ? 'bg-[#2534ff] text-white'
                  : tooSmall
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2534ff] text-white hover:bg-[#1420cc]'
              }`}
            >
              {isSelected ? 'Selected ✓' : 'Select This Vehicle'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Route summary bar ── */
interface RouteSummaryBarProps {
  pickupAddress: string;
  dropoffAddress: string;
  date: string;
  time: string;
  duration: string;
  routeCount: number;
  onEdit: () => void;
}

function RouteSummaryBar({ pickupAddress, dropoffAddress, date, time, duration, routeCount, onEdit }: RouteSummaryBarProps) {
  const pickup  = pickupAddress  || 'Pickup';
  const dropoff = dropoffAddress || 'Drop-off';

  // Short names for display
  const short = (addr: string) => addr.split(',')[0] || addr;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">

        {/* Route */}
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm min-w-0">
          <MapPin className="w-4 h-4 text-[#2534ff] shrink-0" />
          <span className="truncate max-w-[140px]">{short(pickup)}</span>
          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate max-w-[140px]">{short(dropoff)}</span>
        </div>

        <div className="hidden sm:block w-px h-5 bg-gray-200" />

        {/* Duration */}
        {duration && (
          <p className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
            <Clock className="w-3.5 h-3.5" /> Approx. {duration}
          </p>
        )}

        {/* Date + time */}
        {date && (
          <p className="text-xs text-gray-500 shrink-0">
            {formatDate(date)} at {time}
          </p>
        )}

        {/* Social proof */}
        {routeCount > 0 && (
          <p className="text-xs font-semibold text-[#2534ff] shrink-0">
            🧳 {routeCount} travellers booked this route this month
          </p>
        )}

        {/* Edit button */}
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#2534ff] border border-[#2534ff] px-3 py-1.5 rounded-lg hover:bg-[#2534ff] hover:text-white transition-colors shrink-0"
        >
          <Pencil className="w-3 h-3" /> Edit search
        </button>
      </div>
    </div>
  );
}

/* ── Route map preview ── */
interface RouteMapPreviewProps {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  pickupAddress: string;
  dropoffAddress: string;
}

function RouteMapPreview({ pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress }: RouteMapPreviewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Only show static map when we have valid coords and an API key
  const hasCoords = pickupLat && pickupLng && dropoffLat && dropoffLng && apiKey;

  if (hasCoords) {
    const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?size=800x200&path=color:0x2534ffff|weight:4|${pickupLat},${pickupLng}|${dropoffLat},${dropoffLng}&markers=color:blue|${pickupLat},${pickupLng}&markers=color:red|${dropoffLat},${dropoffLng}&key=${apiKey}`;
    return (
      <div className="w-full h-[160px] relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <Image
          src={mapSrc}
          alt="Route map preview"
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  // Fallback placeholder
  return (
    <div className="w-full h-[80px] rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center gap-3 text-gray-400">
      <MapPin className="w-5 h-5" />
      <div className="text-xs text-center">
        <p className="font-semibold text-gray-600">Route Preview</p>
        <p className="truncate max-w-[260px]">{pickupAddress} → {dropoffAddress}</p>
      </div>
    </div>
  );
}

/* ── Step bar ── */
function StepBar({ current }: { current: number }) {
  const steps = ['Select your ride', 'Add Experiences', 'Details & Payment'];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
              i + 1 === current ? 'border-[#2534ff] bg-[#2534ff] text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${i + 1 === current ? 'text-gray-900' : 'text-gray-400'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

/* ── Main page ── */
function ResultsPageInner() {
  const params = useSearchParams();
  const router = useRouter();

  const pickupAddress  = params.get('pickup_address')  ?? '';
  const pickupLat      = parseFloat(params.get('pickup_lat')  ?? '13.7563');
  const pickupLng      = parseFloat(params.get('pickup_lng')  ?? '100.5018');
  const dropoffAddress = params.get('dropoff_address') ?? '';
  const dropoffLat     = parseFloat(params.get('dropoff_lat') ?? '13.8');
  const dropoffLng     = parseFloat(params.get('dropoff_lng') ?? '100.55');
  const date           = params.get('date')        ?? '';
  const time           = params.get('time')        ?? '';
  const passengers     = parseInt(params.get('passengers') ?? '2');
  const luggage        = parseInt(params.get('luggage')    ?? '1');
  const returnDate     = params.get('return_date') ?? '';
  const returnTime     = params.get('return_time') ?? '';
  const isRoundTrip    = params.get('is_round_trip') === 'true' && !!returnDate;

  const [vehicles, setVehicles]               = useState<PricingRule[]>([]);
  const [addOns, setAddOns]                   = useState<AddOn[]>([]);
  const [loadingPricing, setLoadingPricing]   = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedAddOns, setSelectedAddOns]   = useState<SelectedAddOn[]>([]);
  const [duration, setDuration]               = useState('');
  const [routeCount, setRouteCount]           = useState(0);
  const [mapsReady, setMapsReady]             = useState(false);
  const [isEditing, setIsEditing]             = useState(false);

  // Editable trip dates — initialised from URL, updated when user applies edits
  const [tripDate,       setTripDate]       = useState(date);
  const [tripTime,       setTripTime]       = useState(time);
  const [tripReturnDate, setTripReturnDate] = useState(returnDate);
  const [tripReturnTime, setTripReturnTime] = useState(returnTime);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) setMapsReady(true);
  }, []);

  // Fetch vehicle pricing
  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { setVehicles(d.vehicles ?? []); setAddOns(d.addOns ?? []); })
      .finally(() => setLoadingPricing(false));
  }, []);

  // Fetch route stats (social proof)
  useEffect(() => {
    if (!pickupAddress || !dropoffAddress) return;
    const from = pickupAddress.split(',')[0];
    const to   = dropoffAddress.split(',')[0];
    fetch(`/api/bookings/route-stats?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then(r => r.json())
      .then(d => setRouteCount(d.count ?? 0))
      .catch(() => {});
  }, [pickupAddress, dropoffAddress]);

  // Fetch travel duration via Google Maps Distance Matrix when maps are ready
  useEffect(() => {
    if (!mapsReady || !window.google?.maps) return;
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins:      [new window.google.maps.LatLng(pickupLat, pickupLng)],
        destinations: [new window.google.maps.LatLng(dropoffLat, dropoffLng)],
        travelMode:   window.google.maps.TravelMode.DRIVING,
        unitSystem:   window.google.maps.UnitSystem.METRIC,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          const element = result.rows[0]?.elements[0];
          if (element?.status === 'OK') {
            setDuration(element.duration.text);
          }
        }
      },
    );
  }, [mapsReady, pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const handleAddOnToggle = (addon: AddOn, qty: number) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(s => s.addOnId === addon.id);
      if (qty <= 0) return prev.filter(s => s.addOnId !== addon.id);
      if (exists) return prev.map(s => s.addOnId === addon.id ? { ...s, quantity: qty } : s);
      return [...prev, { addOnId: addon.id, name: addon.name, quantity: qty, unitPrice: addon.price }];
    });
  };

  const selectedVehicleData = vehicles.find(v => v.vehicleType === selectedVehicle);
  const basePrice   = selectedVehicleData?.baseFare ?? 0;
  const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.unitPrice * a.quantity, 0);
  const totalPrice  = basePrice * (isRoundTrip ? 2 : 1) + addOnsTotal;

  const handleApplyEdit = (d: string, t: string, rd: string, rt: string) => {
    setTripDate(d);
    setTripTime(t);
    setTripReturnDate(rd);
    setTripReturnTime(rt);
    setIsEditing(false);
    const current = new URLSearchParams(window.location.search);
    current.set('date', d);
    current.set('time', t);
    if (isRoundTrip) {
      current.set('return_date', rd);
      current.set('return_time', rt);
    }
    router.replace(`/results?${current.toString()}`);
  };

  const handleContinue = () => {
    if (!selectedVehicle) return;
    const addOnParam = selectedAddOns.map(a => `${a.addOnId}:${a.quantity}:${a.unitPrice}`).join(',');
    const p = new URLSearchParams({
      pickup_address: pickupAddress,   pickup_lat: String(pickupLat),   pickup_lng: String(pickupLng),
      dropoff_address: dropoffAddress, dropoff_lat: String(dropoffLat), dropoff_lng: String(dropoffLng),
      distance_km: '0', duration_min: '0',
      date: tripDate, time: tripTime, passengers: String(passengers), luggage: String(luggage),
      vehicle: selectedVehicle, addons: addOnParam,
      base_price: String(basePrice), addons_total: String(addOnsTotal), total_price: String(totalPrice),
      is_round_trip: String(isRoundTrip),
      ...(isRoundTrip ? { return_date: tripReturnDate, return_time: tripReturnTime } : {}),
    });
    router.push(`/add-experiences?${p.toString()}`);
  };

  // Sort vehicles: put viable ones first, too-small last
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aSmall = a.maxPassengers < passengers || a.maxLuggage < luggage ? 1 : 0;
    const bSmall = b.maxPassengers < passengers || b.maxLuggage < luggage ? 1 : 0;
    return aSmall - bSmall;
  });

  const whatsappMessage = `Hi, I need help choosing a vehicle for my trip from ${pickupAddress || 'my pickup'} to ${dropoffAddress || 'my destination'}.`;

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onReady={() => setMapsReady(true)}
      />
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-16">

        {/* Step bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="ml-auto">
              <StepBar current={1} />
            </div>
          </div>
        </div>

        {/* Route summary bar */}
        <RouteSummaryBar
          pickupAddress={pickupAddress}
          dropoffAddress={dropoffAddress}
          date={tripDate}
          time={tripTime}
          duration={duration}
          routeCount={routeCount}
          onEdit={() => setIsEditing(e => !e)}
        />

        {/* Route map preview */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <RouteMapPreview
            pickupLat={pickupLat}
            pickupLng={pickupLng}
            dropoffLat={dropoffLat}
            dropoffLng={dropoffLng}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: vehicles + add-ons ── */}
            <div className="lg:col-span-2 space-y-5">

              <h2 className="text-xl font-bold text-gray-900">Select your ride</h2>

              {loadingPricing ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 flex items-center justify-center gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading vehicles…</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedVehicles.map(v => (
                    <VehicleCard
                      key={v.vehicleType}
                      vehicle={v}
                      isSelected={selectedVehicle === v.vehicleType}
                      passengers={passengers}
                      luggage={luggage}
                      tripDate={tripDate}
                      onSelect={setSelectedVehicle}
                    />
                  ))}
                </div>
              )}

              {/* Add-ons */}
              {addOns.length > 0 && selectedVehicle && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 animate-fade-in">
                  <AddOnsSelector
                    addOns={addOns}
                    selected={selectedAddOns}
                    onToggle={handleAddOnToggle}
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT: trip summary + price ── */}
            <div className="lg:col-span-1 space-y-4 sticky top-24">

              {/* Trip info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${isRoundTrip ? 'bg-[#2534ff] text-white' : 'bg-[#2534ff] text-white'}`}>
                    {isRoundTrip ? 'Round trip' : 'One way'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{passengers}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{luggage}</span>
                  </div>
                </div>

                {/* Route mini */}
                <div className="space-y-2 text-xs mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2534ff] mt-0.5 shrink-0" />
                    <p className="text-gray-600 leading-snug line-clamp-2">{pickupAddress || 'Pickup location'}</p>
                  </div>
                  <div className="w-px h-4 bg-gray-200 ml-[6px]" />
                  <div className="flex items-start gap-2">
                    <div className="w-3.5 h-3.5 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
                    </div>
                    <p className="text-gray-600 leading-snug line-clamp-2">{dropoffAddress || 'Drop-off location'}</p>
                  </div>
                </div>

                {/* Departure */}
                {tripDate && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2534ff] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">Departure</p>
                      <p className="text-sm font-bold text-gray-900 leading-none">{formatDate(tripDate)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#2534ff]" />
                      <span className="text-sm font-bold text-gray-900">{tripTime}</span>
                    </div>
                  </div>
                )}

                {/* Return */}
                {isRoundTrip && tripReturnDate && (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2534ff] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#2534ff] uppercase tracking-wide leading-none mb-1">Return</p>
                      <p className="text-sm font-bold text-gray-900 leading-none">{formatDate(tripReturnDate)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#2534ff]" />
                      <span className="text-sm font-bold text-gray-900">{tripReturnTime}</span>
                    </div>
                  </div>
                )}

                {/* Duration */}
                {duration && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> Approx. {duration}
                  </p>
                )}

                {/* Edit panel */}
                {isEditing && (
                  <div className="mt-3">
                    <TripEditPanel
                      isRoundTrip={isRoundTrip}
                      initialDate={tripDate}
                      initialTime={tripTime}
                      initialReturnDate={tripReturnDate}
                      initialReturnTime={tripReturnTime}
                      onApply={handleApplyEdit}
                      onCancel={() => setIsEditing(false)}
                    />
                  </div>
                )}
              </div>

              {/* Price summary */}
              <PriceSummary
                vehicleType={selectedVehicle}
                vehicleData={selectedVehicleData}
                basePrice={basePrice}
                selectedAddOns={selectedAddOns}
                addOnsTotal={addOnsTotal}
                totalPrice={totalPrice}
                onContinue={handleContinue}
                disabled={!selectedVehicle}
                isRoundTrip={isRoundTrip}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Floating WhatsApp button */}
      <WhatsAppFloat />
    </>
  );
}
