'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import CustomerForm from '@/components/booking/CustomerForm';
import PriceSummary from '@/components/booking/PriceSummary';
import { VehicleType, SelectedAddOn } from '@/types';
import { formatDate, formatCurrency, VEHICLE_LABELS } from '@/lib/utils';
import { Calendar, Clock, Users, Briefcase, MapPin, ArrowLeft } from 'lucide-react';

export default function BookingPage() { return <Suspense><BookingPageInner /></Suspense>; }
function BookingPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  // Decode add-ons from "id:qty:price,id:qty:price"
  const selectedAddOns: SelectedAddOn[] = (params.get('addons') ?? '')
    .split(',')
    .filter(Boolean)
    .map((chunk) => {
      const [addOnId, qty, unitPrice] = chunk.split(':');
      return { addOnId, name: '', quantity: parseInt(qty), unitPrice: parseFloat(unitPrice) };
    });

  const handleSubmit = async (customerData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    specialNotes: string;
  }) => {
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
        {/* Progress bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <StepBreadcrumb current={3} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left – Booking summary + form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Trip summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <h2 className="text-base font-bold text-gray-900 mb-4">Trip Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Pickup</p>
                      <p className="text-gray-800 font-medium">{pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 w-4 h-4 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500 bg-red-100" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Drop-off</p>
                      <p className="text-gray-800 font-medium">{dropoffAddress}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <InfoChip icon={<Calendar className="w-3.5 h-3.5" />} label={formatDate(date)} />
                    <InfoChip icon={<Clock className="w-3.5 h-3.5" />}    label={time} />
                    <InfoChip icon={<Users className="w-3.5 h-3.5" />}    label={`${passengers} pax`} />
                    <InfoChip icon={<Briefcase className="w-3.5 h-3.5" />} label={`${luggage} bags`} />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2.5 py-1 rounded-full">
                      {VEHICLE_LABELS[vehicleType]}
                    </span>
                    <span className="text-xs text-gray-500">{distanceKm.toFixed(1)} km · {formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Customer form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                <CustomerForm onSubmit={handleSubmit} loading={loading} />
              </div>
            </div>

            {/* Right – Price summary */}
            <div className="lg:col-span-1">
              <PriceSummary
                vehicleType={vehicleType}
                basePrice={basePrice}
                selectedAddOns={selectedAddOns}
                addOnsTotal={addOnsTotal}
                totalPrice={totalPrice}
                onContinue={() => {}}
                disabled
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StepBreadcrumb({ current }: { current: number }) {
  const steps = ['Search', 'Select Vehicle', 'Your Details', 'Confirmed'];
  return (
    <div className="flex items-center gap-1 text-xs">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1">
          <span className={i + 1 === current ? 'font-semibold text-brand-700' : i + 1 < current ? 'text-gray-400' : 'text-gray-300'}>
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-gray-200">›</span>}
        </span>
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
