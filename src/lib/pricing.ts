import { VehicleType, SelectedAddOn } from '@/types';

interface PricingConfig {
  baseFare: number;
  pricePerKm: number;
}

const PRICING: Record<VehicleType, PricingConfig> = {
  SEDAN:      { baseFare: 500,  pricePerKm: 12 },
  SUV:        { baseFare: 800,  pricePerKm: 18 },
  MINIVAN:    { baseFare: 1200, pricePerKm: 22 },
  LUXURY_MPV: { baseFare: 3500, pricePerKm: 35 },
};

export function calculateBasePrice(vehicleType: VehicleType, distanceKm: number): number {
  const { baseFare, pricePerKm } = PRICING[vehicleType];
  return Math.round(baseFare + pricePerKm * distanceKm);
}

export function calculateAddOnsTotal(addOns: SelectedAddOn[]): number {
  return addOns.reduce((sum, a) => sum + a.unitPrice * a.quantity, 0);
}

export function calculateTotal(
  vehicleType: VehicleType,
  distanceKm: number,
  addOns: SelectedAddOn[],
): { basePrice: number; addOnsTotal: number; totalPrice: number } {
  const basePrice = calculateBasePrice(vehicleType, distanceKm);
  const addOnsTotal = calculateAddOnsTotal(addOns);
  return { basePrice, addOnsTotal, totalPrice: basePrice + addOnsTotal };
}
