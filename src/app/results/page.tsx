'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import VehicleSelector from '@/components/booking/VehicleSelector';
import AddOnsSelector from '@/components/booking/AddOnsSelector';
import PriceSummary from '@/components/booking/PriceSummary';
import { VehicleType, PricingRule, AddOn, SelectedAddOn } from '@/types';
import { ArrowLeft, Loader2, Calendar, Clock, Users, Briefcase, ArrowRight, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import TripEditPanel from '@/components/booking/TripEditPanel';

const MiniRouteMap = dynamic(() => import('@/components/booking/MiniRouteMap'), { ssr: false });

export default function ResultsPage() { return <Suspense><ResultsPageInner /></Suspense>; }
function ResultsPageInner() {
  const params = useSearchParams();
  const router = useRouter();

  const pickupAddress  = params.get('pickup_address')  ?? '';
  const pickupLat      = parseFloat(params.get('pickup_lat')  ?? '13.7563');
  const pickupLng      = parseFloat(params.get('pickup_lng')  ?? '100.5018');
  const dropoffAddress = params.get('dropoff_address') ?? '';
  const dropoffLat     = parseFloat(params.get('dropoff_lat') ?? '13.8');
  const dropoffLng     = parseFloat(params.get('dropoff_lng') ?? '100.55');
  const date        = params.get('date')        ?? '';
  const time        = params.get('time')        ?? '';
  const passengers  = parseInt(params.get('passengers') ?? '2');
  const luggage     = parseInt(params.get('luggage')    ?? '1');
  const returnDate  = params.get('return_date') ?? '';
  const returnTime  = params.get('return_time') ?? '';
  const isRoundTrip = params.get('is_round_trip') === 'true' && !!returnDate;

  const [vehicles, setVehicles]               = useState<PricingRule[]>([]);
  const [addOns, setAddOns]                   = useState<AddOn[]>([]);
  const [loadingPricing, setLoadingPricing]   = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [selectedAddOns, setSelectedAddOns]   = useState<SelectedAddOn[]>([]);
  const [mapsReady, setMapsReady]             = useState(false);

  // Editable trip dates — initialised from URL, updated when user applies edits
  const [tripDate,       setTripDate]       = useState(date);
  const [tripTime,       setTripTime]       = useState(time);
  const [tripReturnDate, setTripReturnDate] = useState(returnDate);
  const [tripReturnTime, setTripReturnTime] = useState(returnTime);
  const [isEditing,      setIsEditing]      = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) setMapsReady(true);
  }, []);

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { setVehicles(d.vehicles ?? []); setAddOns(d.addOns ?? []); })
      .finally(() => setLoadingPricing(false));
  }, []);

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
  // Round trip doubles the base transport cost
  const totalPrice  = basePrice * (isRoundTrip ? 2 : 1) + addOnsTotal;

  const handleApplyEdit = (d: string, t: string, rd: string, rt: string) => {
    setTripDate(d);
    setTripTime(t);
    setTripReturnDate(rd);
    setTripReturnTime(rt);
    setIsEditing(false);

    // Keep URL in sync so refresh / share preserves edits
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
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="ml-auto">
              <StepBar current={1} />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: vehicles + add-ons ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6">
                {loadingPricing ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading vehicles…</span>
                  </div>
                ) : (
                  <VehicleSelector
                    vehicles={vehicles}
                    selected={selectedVehicle}
                    passengers={passengers}
                    luggage={luggage}
                    onSelect={setSelectedVehicle}
                  />
                )}
              </div>

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

            {/* ── RIGHT: mini map → price summary ── */}
            <div className="lg:col-span-1 space-y-4 sticky top-24">

              {/* Trip info chips */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isRoundTrip ? 'bg-[#2534ff] text-white' : 'bg-brand-600 text-white'
                  }`}>
                    {isRoundTrip ? 'Round trip' : 'One way'}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{passengers}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{luggage}</span>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setIsEditing(e => !e)}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        isEditing
                          ? 'bg-[#1420cc] text-white'
                          : 'bg-[#2534ff] text-white hover:bg-[#1420cc]'
                      }`}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Date / time rows */}
                <div className="space-y-2 mb-1">

                  {/* Departure */}
                  {tripDate && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">Departure</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">{formatDate(tripDate)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span className="text-sm font-bold text-gray-900">{tripTime}</span>
                      </div>
                    </div>
                  )}

                  {/* Return */}
                  {isRoundTrip && tripReturnDate && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5">
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

                </div>

                {/* Inline edit panel */}
                {isEditing && (
                  <TripEditPanel
                    isRoundTrip={isRoundTrip}
                    initialDate={tripDate}
                    initialTime={tripTime}
                    initialReturnDate={tripReturnDate}
                    initialReturnTime={tripReturnTime}
                    onApply={handleApplyEdit}
                    onCancel={() => setIsEditing(false)}
                  />
                )}

                {!isEditing && <div className="mb-3" />}

                {/* Interactive Google Maps route */}
                {mapsReady && (
                  <MiniRouteMap
                    pickupAddress={pickupAddress}   pickupLat={pickupLat}   pickupLng={pickupLng}
                    dropoffAddress={dropoffAddress} dropoffLat={dropoffLat} dropoffLng={dropoffLng}
                  />
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
    </>
  );
}

function StepBar({ current }: { current: number }) {
  const steps = ['Select your ride', 'Add Experiences', 'Details & Payment'];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
              ${i + 1 === current ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 text-gray-400'}`}>
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
