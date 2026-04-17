'use client';

import { Users, Briefcase, Camera, CheckCircle2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { VehicleType, PricingRule } from '@/types';

interface VehicleSelectorProps {
  vehicles: PricingRule[];
  selected: VehicleType | null;
  passengers: number;
  luggage: number;
  onSelect: (v: VehicleType) => void;
}

const VEHICLE_EMOJI: Record<VehicleType, string> = {
  SEDAN:   '🚗',
  SUV:     '🚙',
  MINIVAN: '🚐',
};

const WHAT_INCLUDES = [
  { icon: '🚗', text: 'Door-to-door service'      },
  { icon: '💧', text: 'Complimentary water'        },
  { icon: '❄️', text: 'Air conditioned'            },
  { icon: '🧳', text: 'Luggage assistance'         },
  { icon: '⏱️', text: 'Flight delay monitoring'   },
  { icon: '🗺️', text: 'Local driver knowledge'    },
];

export default function VehicleSelector({ vehicles, selected, passengers, luggage, onSelect }: VehicleSelectorProps) {
  const selectedVehicle = vehicles.find(v => v.vehicleType === selected);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Select your ride</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {['Door-to-door', 'Driver speaks English', 'Sightseeing available'].map((tag, i) => (
            <span key={tag} className={cn(
              'text-xs font-medium px-3 py-1 rounded-full border',
              i === 2
                ? 'border-green-400 text-green-700 bg-green-50'
                : 'border-gray-300 text-gray-600',
            )}>
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-green-700 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
          Free cancellation up to 24 hours before departure
        </p>
      </div>

      {/* Vehicle rows */}
      <div className="space-y-2">
        {vehicles.map((v) => {
          const tooSmall   = v.maxPassengers < passengers || v.maxLuggage < luggage;
          const isSelected = selected === v.vehicleType;

          return (
            <button
              key={v.vehicleType}
              type="button"
              disabled={tooSmall}
              onClick={() => onSelect(v.vehicleType)}
              className={cn(
                'w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-150 flex items-center gap-4',
                isSelected  ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                : tooSmall  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50',
              )}
            >
              {/* Icon */}
              <div className="text-4xl w-14 text-center shrink-0">{VEHICLE_EMOJI[v.vehicleType]}</div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{v.name}</span>
                  {tooSmall && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      Too small
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {v.vehicleType === 'SEDAN' ? '1–3' : v.vehicleType === 'SUV' ? '1–6' : '1–10'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {v.maxLuggage}
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" /> {v.maxLuggage}
                  </span>
                </div>
              </div>

              {/* Fixed price */}
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-base">{formatCurrency(v.baseFare)}</p>
                {passengers > 1 && (
                  <p className="text-xs text-gray-400">
                    {formatCurrency(Math.round(v.baseFare / passengers))} pp
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* What's included – appears when a vehicle is selected */}
      {selectedVehicle && (
        <div className="animate-fade-in border border-gray-100 rounded-xl p-4 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800 mb-3">What&apos;s included</h3>
          <div className="grid grid-cols-2 gap-2">
            {WHAT_INCLUDES.map(item => (
              <div key={item.text} className="flex items-center gap-2 text-xs text-gray-600">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
            Max {selectedVehicle.maxPassengers} passengers · Max {selectedVehicle.maxLuggage} bags
          </p>
        </div>
      )}
    </div>
  );
}
