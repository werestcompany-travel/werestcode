'use client';

import { formatCurrency, VEHICLE_LABELS } from '@/lib/utils';
import { VehicleType, SelectedAddOn } from '@/types';

/** Only the two fields PriceSummary actually needs — works with PricingRule or VEHICLE_CONFIGS entries */
type VehicleCapacity = { maxPassengers: number; maxLuggage: number };
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

const WHAT_INCLUDES = [
  { icon: '🚗', text: 'Door-to-door service'    },
  { icon: '💧', text: 'Complimentary water'      },
  { icon: '❄️', text: 'Air conditioned'          },
  { icon: '🧳', text: 'Luggage assistance'       },
  { icon: '⏱️', text: 'Flight delay monitoring' },
  { icon: '🗺️', text: 'Local driver knowledge'  },
];

interface PriceSummaryProps {
  vehicleType:  VehicleType | null;
  vehicleData?: VehicleCapacity | null;
  basePrice:    number;
  selectedAddOns: SelectedAddOn[];
  addOnsTotal:  number;
  totalPrice:   number;
  onContinue:    () => void;
  disabled?:     boolean;
  loading?:      boolean;
  isRoundTrip?:  boolean;
  buttonLabel?:  string;
}

export default function PriceSummary({
  vehicleType, vehicleData, basePrice, selectedAddOns, addOnsTotal,
  totalPrice, onContinue, disabled, loading, isRoundTrip, buttonLabel = 'Continue to Booking',
}: PriceSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      <div className="px-5 py-4">
        <p className="text-sm font-bold text-gray-800 mb-3">Price details</p>

        {vehicleType ? (
          <div className="space-y-2 text-sm">

            {/* Departure leg */}
            <div className="flex justify-between text-gray-600">
              <span>{isRoundTrip ? 'Departure' : 'Transport'} ({VEHICLE_LABELS[vehicleType]})</span>
              <span className="font-semibold">{formatCurrency(basePrice)}</span>
            </div>

            {/* Return leg — round trips only */}
            {isRoundTrip && (
              <div className="flex justify-between text-gray-600">
                <span>Return ({VEHICLE_LABELS[vehicleType]})</span>
                <span className="font-semibold">{formatCurrency(basePrice)}</span>
              </div>
            )}

            {/* Add-ons */}
            {selectedAddOns.map(a => (
              <div key={a.addOnId} className="flex justify-between text-gray-600">
                <span>{a.name} × {a.quantity}</span>
                <span className="font-semibold">{formatCurrency(a.unitPrice * a.quantity)}</span>
              </div>
            ))}

            <div className="flex justify-between text-gray-400 text-xs">
              <span>Stops</span>
              <span>{formatCurrency(0)}</span>
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-2xl text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>

            {/* What's included */}
            {vehicleData && (
              <div className="mt-1 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-2.5">What&apos;s included</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                  {WHAT_INCLUDES.map(item => (
                    <div key={item.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="shrink-0">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2.5">
                  Max {vehicleData.maxPassengers} passengers · Max {vehicleData.maxLuggage} bags
                </p>
              </div>
            )}

          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Select a vehicle above to see pricing</p>
        )}
      </div>

      {/* Free cancellation notice */}
      <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <span className="text-green-600 shrink-0">✓</span>
        <p className="text-xs text-green-700 font-medium leading-snug">
          Free cancellation up to 24 hours before your pickup time.
        </p>
      </div>

      <div className="px-5 pb-5">
        <Button fullWidth size="lg" disabled={disabled || !vehicleType} loading={loading} onClick={onContinue}>
          {buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-[10px] text-gray-400 text-center mt-2">No payment required now</p>
      </div>
    </div>
  );
}
