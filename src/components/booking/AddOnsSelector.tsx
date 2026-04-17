'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { AddOn, SelectedAddOn } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface AddOnsSelectorProps {
  addOns: AddOn[];
  selected: SelectedAddOn[];
  onToggle: (addOn: AddOn, qty: number) => void;
}

export default function AddOnsSelector({ addOns, selected, onToggle }: AddOnsSelectorProps) {
  const getQty = (id: string) => selected.find((s) => s.addOnId === id)?.quantity ?? 0;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Optional Add-ons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addOns.map((addon) => {
          const qty = getQty(addon.id);
          const active = qty > 0;

          return (
            <div
              key={addon.id}
              className={cn(
                'rounded-xl border p-4 transition-all duration-200',
                active ? 'border-brand-400 bg-brand-50' : 'border-gray-100 bg-white',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl mt-0.5 shrink-0">{addon.icon ?? '➕'}</span>
                  <div>
                    <p className={cn('text-sm font-semibold', active ? 'text-brand-800' : 'text-gray-900')}>
                      {addon.name}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug mt-0.5">{addon.description}</p>
                    <p className="text-sm font-bold text-brand-700 mt-1">{formatCurrency(addon.price)}</p>
                  </div>
                </div>

                {/* Quantity control */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {active && (
                    <>
                      <button
                        type="button"
                        onClick={() => onToggle(addon, qty - 1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{qty}</span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggle(addon, qty + 1)}
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                      active
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-brand-100 hover:text-brand-700',
                    )}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
