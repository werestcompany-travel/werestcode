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
  Pencil,
  MapPin,
  Zap,
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


/* ── Single vehicle result card ── */
interface VehicleCardProps {
  vehicle: PricingRule;
  isSelected: boolean;
  tripDate: string;
  onSelect: (v: VehicleType | null) => void;
}


function VehicleCard({ vehicle, isSelected, tripDate, onSelect }: VehicleCardProps) {
  const cfg    = VEHICLE_CONFIGS[vehicle.vehicleType];
  const limited = isWeekendOrPeak(tripDate);

  return (
    <div
      role="button"
      tabIndex={tooSmall ? -1 : 0}
      onClick={() => onSelect(isSelected ? null : vehicle.vehicleType)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(isSelected ? null : vehicle.vehicleType); }}
      className={`relative flex flex-col sm:flex-row rounded-2xl border-2 overflow-hidden transition-all duration-200 bg-white cursor-pointer ${
        isSelected
          ? 'border-[#2534ff] shadow-[0_0_0_4px_rgba(37,52,255,0.10)]'
          : 'border-gray-200 hover:border-[#2534ff]/50 hover:shadow-md'
      }`}
    >
      {/* Photo panel — full height left column */}
      <div className="relative w-full sm:w-[260px] shrink-0 flex flex-col">
        <div className="relative flex-1 min-h-[180px] overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-white">
          <Image
            src={cfg.exteriorImage}
            alt={vehicle.name}
            fill
            sizes="(max-width: 640px) 100vw, 260px"
            className={`object-center ${
              vehicle.vehicleType === 'SEDAN'       ? 'object-contain scale-[0.85]' :
              vehicle.vehicleType === 'MINIVAN'     ? 'object-cover scale-[0.90]'   :
              vehicle.vehicleType === 'SUV'         ? 'object-cover scale-[1.00]'   :
                                                      'object-cover scale-[0.85]'
            }`}
            priority={false}
          />
        </div>
      </div>

      {/* Info panel */}
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

        {/* Availability + price + CTA */}
        <div className="flex flex-col sm:flex-row items-end justify-end gap-3 mt-auto">

          {limited && (
            <p className="flex items-center gap-1 text-xs font-semibold text-amber-600 mr-auto">
              <Zap className="w-3.5 h-3.5 shrink-0" /> Limited availability
            </p>
          )}

          {/* Price + CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-extrabold text-gray-900 leading-none">{formatCurrency(vehicle.baseFare)}</p>
              <p className="text-xs text-gray-400 mt-0.5">per vehicle</p>
            </div>
            <button
              type="button"
              disabled={tooSmall}
              onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : vehicle.vehicleType); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
                isSelected
                  ? 'bg-[#2534ff] text-white'
                  : tooSmall
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2534ff] text-white hover:bg-[#1420cc]'
              }`}
            >
              {isSelected ? 'Selected ✓' : 'Select'}
            </button>
          </div>
        </div>

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

  // Only show vehicles that can accommodate the requested passengers + luggage
  const sortedVehicles = [...vehicles]
    .filter(v => v.maxPassengers >= passengers && v.maxLuggage >= luggage)
    .sort((a, b) => a.baseFare - b.baseFare);

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
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex-1 flex justify-center">
              <StepBar current={1} />
            </div>
            {/* spacer to balance the Back button */}
            <div className="w-[60px] shrink-0" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">

          <h2 className="text-xl font-bold text-gray-900 mb-4">Select your ride</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: vehicles + add-ons ── */}
            <div className="lg:col-span-2 space-y-4">

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
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isRoundTrip ? 'bg-[#2534ff] text-white' : 'bg-[#2534ff] text-white'}`}>
                      {isRoundTrip ? 'Round trip' : 'One way'}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{passengers}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{luggage}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(e => !e)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] border border-[#2534ff] px-2.5 py-1 rounded-lg hover:bg-[#2534ff] hover:text-white transition-colors shrink-0"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>

                {/* Route mini */}
                <div className="space-y-1.5 text-xs mb-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#2534ff] shrink-0" />
                    <p className="text-gray-800 font-medium truncate">{pickupAddress.split(',')[0] || 'Pickup location'}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-[1px]">
                    <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full border-2 border-red-500 bg-red-100" />
                    </div>
                    <p className="text-gray-800 font-medium truncate">{dropoffAddress.split(',')[0] || 'Drop-off location'}</p>
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
