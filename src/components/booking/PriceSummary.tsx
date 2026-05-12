'use client';

import { useState } from 'react';
import { formatCurrency, VEHICLE_LABELS } from '@/lib/utils';
import { VehicleType, SelectedAddOn } from '@/types';
import { ArrowRight, Tag, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

type VehicleCapacity = { maxPassengers: number; maxLuggage: number };

const WHAT_INCLUDES = [
  { icon: '🚗', text: 'Door-to-door service'    },
  { icon: '💧', text: 'Complimentary water'      },
  { icon: '❄️', text: 'Air conditioned'          },
  { icon: '🧳', text: 'Luggage assistance'       },
  { icon: '⏱️', text: 'Flight delay monitoring' },
  { icon: '🗺️', text: 'Local driver knowledge'  },
];

interface SurchargeItem { label: string; amount: number; }

interface PriceSummaryProps {
  vehicleType:    VehicleType | null;
  vehicleData?:   VehicleCapacity | null;
  basePrice:      number;
  selectedAddOns: SelectedAddOn[];
  addOnsTotal:    number;
  totalPrice:     number;
  onContinue:     () => void;
  disabled?:      boolean;
  loading?:       boolean;
  isRoundTrip?:   boolean;
  buttonLabel?:   string;
  // Surcharges (airport / night / peak / holiday)
  surcharges?:    SurchargeItem[];
  surchargeTotal?: number;
  // Discount
  discountCode?:        string;
  discountAmount?:      number;
  discountApplied?:     boolean;
  onApplyDiscount?:     (code: string) => Promise<{ error?: string }>;
  onRemoveDiscount?:    () => void;
}

export default function PriceSummary({
  vehicleType, vehicleData, basePrice, selectedAddOns, addOnsTotal,
  totalPrice, onContinue, disabled, loading, isRoundTrip, buttonLabel = 'Continue to Booking',
  surcharges = [], surchargeTotal = 0,
  discountCode = '', discountAmount = 0, discountApplied = false,
  onApplyDiscount, onRemoveDiscount,
}: PriceSummaryProps) {
  const [codeInput, setCodeInput]     = useState('');
  const [applyError, setApplyError]   = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  const handleApply = async () => {
    if (!codeInput.trim() || !onApplyDiscount) return;
    setApplyError('');
    setApplyLoading(true);
    const res = await onApplyDiscount(codeInput.trim().toUpperCase());
    setApplyLoading(false);
    if (res.error) {
      setApplyError(res.error);
    } else {
      setCodeInput('');
    }
  };

  const handleRemove = () => {
    setCodeInput('');
    setApplyError('');
    onRemoveDiscount?.();
  };

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

            {/* Surcharges (airport / night / peak / holiday) */}
            {surcharges.map((s) => (
              <div key={s.label} className="flex justify-between text-amber-700 text-xs">
                <span className="flex items-center gap-1">
                  <span>⚡</span>{s.label}
                </span>
                <span className="font-semibold">+{formatCurrency(s.amount)}</span>
              </div>
            ))}

            {/* Discount savings line */}
            {discountApplied && discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Discount ({discountCode})
                </span>
                <span>−{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-gray-900">Total</span>
              <div className="text-right">
                {discountApplied && discountAmount > 0 && (
                  <p className="text-xs text-gray-400 line-through mb-0.5">
                    {formatCurrency(totalPrice + discountAmount)}
                  </p>
                )}
                <span className="font-extrabold text-2xl text-gray-900">{formatCurrency(totalPrice)}</span>
              </div>
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

      {/* ── Discount code section ── */}
      {onApplyDiscount && vehicleType && (
        <div className="mx-5 mb-3">
          {discountApplied ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-green-700 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span className="font-mono tracking-wide">{discountCode}</span>
                <span className="text-green-600 font-bold">−{formatCurrency(discountAmount)}</span>
              </span>
              <button type="button" onClick={handleRemove} className="text-green-500 hover:text-green-700 transition-colors" aria-label="Remove discount">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={codeInput}
                    onChange={e => { setCodeInput(e.target.value.toUpperCase()); setApplyError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } }}
                    placeholder="Discount code"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
                    maxLength={50}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!codeInput.trim() || applyLoading}
                  className="shrink-0 px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {applyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                </button>
              </div>
              {applyError && (
                <p className="text-xs text-red-600 pl-1">{applyError}</p>
              )}
            </div>
          )}
        </div>
      )}

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
