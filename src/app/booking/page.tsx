'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import CustomerForm, { type CustomerFormData } from '@/components/booking/CustomerForm';
import PaymentSection, { type PaymentMethod } from '@/components/booking/PaymentSection';
import PriceSummary from '@/components/booking/PriceSummary';
import { VehicleType, SelectedAddOn } from '@/types';
import { formatDate, formatCurrency, VEHICLE_LABELS } from '@/lib/utils';
import { VEHICLE_CONFIGS } from '@/lib/vehicles';
import { Calendar, Clock, Users, Briefcase, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

export default function BookingPage() { return <Suspense><BookingPageInner /></Suspense>; }
function BookingPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading,       setLoading]       = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  // Parse params
  const pickupAddress  = params.get('pickup_address')  ?? '';
  const pickupLat      = parseFloat(params.get('pickup_lat')  ?? '0');
  const pickupLng      = parseFloat(params.get('pickup_lng')  ?? '0');
  const dropoffAddress = params.get('dropoff_address') ?? '';
  const dropoffLat     = parseFloat(params.get('dropoff_lat') ?? '0');
  const dropoffLng     = parseFloat(params.get('dropoff_lng') ?? '0');
  const distanceKm     = parseFloat(params.get('distance_km')  ?? '0');
  const durationMin    = parseInt(params.get('duration_min')   ?? '0');
  const date           = params.get('date')       ?? '';
  const time           = params.get('time')       ?? '';
  const passengers     = parseInt(params.get('passengers')     ?? '2');
  const luggage        = parseInt(params.get('luggage')        ?? '1');
  const vehicleType    = (params.get('vehicle') ?? 'SEDAN') as VehicleType;
  const basePrice      = parseFloat(params.get('base_price')   ?? '0');
  const addOnsTotal    = parseFloat(params.get('addons_total') ?? '0');
  const totalPrice     = parseFloat(params.get('total_price')  ?? '0');
  const isRoundTrip    = params.get('is_round_trip') === 'true';
  const returnDate     = params.get('return_date') ?? '';
  const returnTime     = params.get('return_time') ?? '';

  // Decode add-ons from "id:qty:price,id:qty:price"
  const selectedAddOns: SelectedAddOn[] = (params.get('addons') ?? '')
    .split(',')
    .filter(Boolean)
    .map((chunk) => {
      const [addOnId, qty, unitPrice] = chunk.split(':');
      return { addOnId, name: '', quantity: parseInt(qty), unitPrice: parseFloat(unitPrice) };
    });

  const handleSubmit = async (customerData: CustomerFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress,  pickupLat,  pickupLng,
          dropoffAddress, dropoffLat, dropoffLng,
          distanceKm, durationMin,
          pickupDate: date,
          pickupTime: time,
          passengers, luggage,
          vehicleType,
          selectedAddOns,
          basePrice, addOnsTotal, totalPrice,
          paymentMethod,
          ...customerData,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Booking failed');
      }

      router.push(`/confirmation/${json.data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* Step bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="ml-auto">
              <StepBreadcrumb current={3} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── LEFT: customer details + payment method ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <CustomerForm onSubmit={handleSubmit} />
              </div>
              <PaymentSection value={paymentMethod} onChange={setPaymentMethod} />
            </div>

            {/* ── RIGHT: trip summary + price summary ── */}
            <div className="lg:col-span-1 space-y-4 sticky top-24">

              {/* Trip summary */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-card px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Trip Summary</p>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2534ff] text-white">
                    {isRoundTrip ? 'Round trip' : 'One way'}
                  </span>
                </div>

                {/* Route */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2534ff] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Pickup</p>
                      <p className="text-xs text-gray-800 font-medium leading-snug">{pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 w-3.5 h-3.5 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Drop-off</p>
                      <p className="text-xs text-gray-800 font-medium leading-snug">{dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Date / time rows */}
                <div className="space-y-2 mb-3">
                  {date && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1">Departure</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">{formatDate(date)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#2534ff]" />
                        <span className="text-sm font-bold text-gray-900">{time}</span>
                      </div>
                    </div>
                  )}
                  {isRoundTrip && returnDate && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2534ff] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-[#2534ff] uppercase tracking-wide leading-none mb-1">Return</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">{formatDate(returnDate)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-[#2534ff]" />
                        <span className="text-sm font-bold text-gray-900">{returnTime}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pax / bags / vehicle chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <InfoChip icon={<Users className="w-3 h-3" />}    label={`${passengers} pax`} />
                  <InfoChip icon={<Briefcase className="w-3 h-3" />} label={`${luggage} bags`} />
                  <span className="text-xs bg-[#2534ff] text-white font-semibold px-2.5 py-1.5 rounded-lg">
                    {VEHICLE_LABELS[vehicleType]}
                  </span>
                  {distanceKm > 0 && (
                    <span className="text-xs text-gray-400">{distanceKm.toFixed(1)} km</span>
                  )}
                </div>
              </div>

              {/* Price summary */}
              <PriceSummary
                vehicleType={vehicleType}
                vehicleData={VEHICLE_CONFIGS[vehicleType]}
                basePrice={basePrice}
                selectedAddOns={selectedAddOns}
                addOnsTotal={addOnsTotal}
                totalPrice={totalPrice}
                onContinue={() => {
                  const form = document.getElementById('customer-form') as HTMLFormElement | null;
                  form?.requestSubmit();
                }}
                loading={loading}
                isRoundTrip={isRoundTrip}
                buttonLabel="Confirm Booking"
              />
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

function StepBreadcrumb({ current }: { current: number }) {
  const steps = ['Select your ride', 'Add Experiences', 'Details & Payment'];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
              ${i + 1 === current
                ? 'border-[#2534ff] bg-[#2534ff] text-white'
                : i + 1 < current
                  ? 'border-[#2534ff] bg-white text-[#2534ff]'
                  : 'border-gray-300 text-gray-400'}`}>
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

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
      {icon} {label}
    </div>
  );
}
