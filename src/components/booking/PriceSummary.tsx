'use client';

import { formatCurrency, VEHICLE_LABELS } from '@/lib/utils';
import { VehicleType, SelectedAddOn } from '@/types';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PriceSummaryProps {
  vehicleType: VehicleType | null;
  basePrice: number;
  selectedAddOns: SelectedAddOn[];
  addOnsTotal: number;
  totalPrice: number;
  onContinue: () => void;
  disabled?: boolean;
}

export default function PriceSummary({
  vehicleType, basePrice, selectedAddOns, addOnsTotal, totalPrice, onContinue, disabled,
}: PriceSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      <div className="px-5 py-4">
        <p className="text-sm font-bold text-gray-800 mb-3">Price details</p>

        {vehicleType ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Transport ({VEHICLE_LABELS[vehicleType]})</span>
              <span className="font-semibold">{formatCurrency(basePrice)}</span>
            </div>
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
            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-2xl text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Select a vehicle above to see pricing</p>
        )}
      </div>

      {/* Free cancellation */}
      <div className="mx-5 mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <span className="text-green-600 shrink-0">✓</span>
        <p className="text-xs text-green-700 font-medium leading-snug">
          Free cancellation up to 24 hours before your pickup time.
        </p>
      </div>

      <div className="px-5 pb-5">
        <Button fullWidth size="lg" disabled={disabled || !vehicleType} onClick={onContinue}>
          Continue to Booking
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-[10px] text-gray-400 text-center mt-2">No payment required now</p>
      </div>
    </div>
  );
}
