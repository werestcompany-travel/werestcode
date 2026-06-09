'use client';

import { useEffect } from 'react';
import { X, Luggage } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PassengerState {
  adults:    number;
  children:  number;
  extraBags: number;
}

interface Props {
  value:    PassengerState;
  onChange: (v: PassengerState) => void;
  onClose:  () => void;
  /** desktop: render as floating dropdown; mobile: bottom sheet */
  mode?: 'sheet' | 'dropdown';
}

function Counter({
  value, min = 0, max = 20,
  onChange,
}: {
  value: number; min?: number; max?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          'w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-lg leading-none transition-colors',
          value <= min ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#2534ff] hover:text-[#2534ff]',
        )}
      >−</button>
      <span className="text-base font-bold w-5 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          'w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 text-lg leading-none transition-colors',
          value >= max ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#2534ff] hover:text-[#2534ff]',
        )}
      >+</button>
    </div>
  );
}

export default function PassengerSheet({ value, onChange, onClose, mode = 'sheet' }: Props) {
  const set = (patch: Partial<PassengerState>) => onChange({ ...value, ...patch });

  /* Lock body scroll while sheet is open */
  useEffect(() => {
    if (mode === 'sheet') {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mode]);

  const content = (
    <div className={cn(
      'bg-white',
      mode === 'sheet'
        ? 'rounded-t-3xl px-6 pt-5 pb-8 w-full'
        : 'rounded-2xl border border-gray-200 shadow-2xl px-6 pt-5 pb-6 w-[360px]',
    )}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">Passengers</h3>
        <button type="button" onClick={onClose}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Adults */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Adults</p>
          <p className="text-xs text-gray-400">Age 12+</p>
        </div>
        <Counter value={value.adults} min={1} max={20} onChange={v => set({ adults: v })} />
      </div>

      {/* Children */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">Children</p>
          <p className="text-xs text-gray-400">Age 0–12</p>
        </div>
        <Counter value={value.children} min={0} max={10} onChange={v => set({ children: v })} />
      </div>

      {/* Bag allowance */}
      <p className="text-sm font-bold text-gray-900 mb-3">Each passenger is allowed</p>
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm text-gray-700">
            <Luggage className="w-4 h-4 text-gray-500 shrink-0" />
            One checked bag
          </div>
          <span className="text-xs font-medium text-[#2534ff] border border-[#2534ff]/30 rounded-full px-2.5 py-0.5 bg-blue-50 whitespace-nowrap">
            29 × 21 × 11 inch
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm text-gray-700">
            <Luggage className="w-4 h-4 text-gray-400 shrink-0" />
            One carry-on bag
          </div>
          <span className="text-xs font-medium text-[#2534ff] border border-[#2534ff]/30 rounded-full px-2.5 py-0.5 bg-blue-50 whitespace-nowrap">
            22 × 14 × 9 inch
          </span>
        </div>
      </div>

      {/* Extra bags */}
      <div className="border-t border-gray-100 pt-5 mb-5">
        <p className="text-sm font-bold text-gray-900 mb-1">Need more space?</p>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          You can add extra suitcases at no extra cost, but you might need a bigger vehicle.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Suitcases</p>
            <p className="text-xs text-gray-400">One checked bag + one carry on</p>
          </div>
          <Counter value={value.extraBags} min={0} max={10} onChange={v => set({ extraBags: v })} />
        </div>
      </div>

      {/* Done */}
      <button
        type="button"
        onClick={onClose}
        className="w-full bg-[#2534ff] hover:bg-[#1420cc] text-white font-bold text-base py-3.5 rounded-2xl transition-colors"
      >
        Done
      </button>
    </div>
  );

  if (mode === 'dropdown') {
    return (
      <div className="absolute top-full right-0 mt-2 z-50">
        {content}
      </div>
    );
  }

  /* Bottom sheet with backdrop */
  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative z-10">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 bg-white rounded-t-3xl">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {content}
      </div>
    </div>
  );
}
