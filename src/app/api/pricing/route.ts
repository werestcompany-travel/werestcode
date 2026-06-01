export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { VEHICLE_CONFIGS, VEHICLE_TYPES } from '@/lib/vehicles';
import type { VehicleType } from '@/types';

const FALLBACK_VEHICLES = VEHICLE_TYPES.map((type) => ({
  id: type,
  vehicleType: type,
  name: VEHICLE_CONFIGS[type].name,
  description: VEHICLE_CONFIGS[type].description,
  maxPassengers: VEHICLE_CONFIGS[type].maxPassengers,
  maxLuggage: VEHICLE_CONFIGS[type].maxLuggage,
  baseFare: type === 'SEDAN' ? 1200 : type === 'SUV' ? 1800 : 2500,
  pricePerKm: 0,
  imageUrl: VEHICLE_CONFIGS[type].imageUrl,
  isActive: true,
  updatedAt: new Date().toISOString(),
}));

const FALLBACK_ADDONS = [
  {
    id: 'child-seat',
    name: 'Child Seat',
    description: 'Certified child safety seat (up to 18 kg)',
    price: 300,
    icon: '🪑',
    isActive: true,
  },
];

export async function GET(req: Request) {
  try {
    const { prisma } = await import('@/lib/db');
    const url = new URL(req.url);
    const vehicleTypeParam = url.searchParams.get('vehicleType') as VehicleType | null;
    const pickupAddress   = url.searchParams.get('pickup') ?? '';
    const dropoffAddress  = url.searchParams.get('dropoff') ?? '';
    const pickupDate      = url.searchParams.get('date') ? new Date(url.searchParams.get('date')!) : new Date();
    const pickupHour      = pickupDate.getHours();
    const dayOfWeek       = pickupDate.getDay();

    const [vehicles, addOns, dynamicRules] = await Promise.all([
      prisma.pricingRule.findMany({ where: { isActive: true }, orderBy: { baseFare: 'asc' } }),
      prisma.addOn.findMany({ where: { isActive: true } }),
      prisma.dynamicPricingRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      }),
    ]);

    // ── Apply dynamic pricing rules to each vehicle ──────────────────────────
    function applyRules(baseFare: number, vType: string): { adjustedFare: number; appliedRule: string | null } {
      for (const rule of dynamicRules) {
        // Vehicle type filter
        if (rule.vehicleType && rule.vehicleType !== vType) continue;
        // Day-of-week filter
        if (rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) continue;
        // Hour filter
        if (rule.startHour !== null && rule.endHour !== null) {
          if (pickupHour < rule.startHour || pickupHour >= rule.endHour) continue;
        }
        // Date range filter
        if (rule.startDate && pickupDate < rule.startDate) continue;
        if (rule.endDate   && pickupDate > rule.endDate)   continue;
        // Keyword filter
        if (rule.pickupKeyword  && !pickupAddress.toLowerCase().includes(rule.pickupKeyword.toLowerCase()))   continue;
        if (rule.dropoffKeyword && !dropoffAddress.toLowerCase().includes(rule.dropoffKeyword.toLowerCase())) continue;

        // Rule matches — apply adjustment
        const adjustedFare = rule.flatAmount !== null
          ? baseFare + rule.flatAmount
          : baseFare * rule.multiplier;
        return { adjustedFare: Math.max(0, adjustedFare), appliedRule: rule.name };
      }
      return { adjustedFare: baseFare, appliedRule: null };
    }

    if (vehicles.length > 0) {
      const enriched = vehicles.map(v => {
        const cfg = VEHICLE_CONFIGS[v.vehicleType as VehicleType];
        const { adjustedFare, appliedRule } = applyRules(v.baseFare, v.vehicleType);
        return cfg
          ? { ...v, name: cfg.name, description: cfg.description, adjustedBaseFare: adjustedFare, appliedPricingRule: appliedRule }
          : { ...v, adjustedBaseFare: adjustedFare, appliedPricingRule: appliedRule };
      });
      // Filter by vehicleType if provided
      const result = vehicleTypeParam ? enriched.filter(v => v.vehicleType === vehicleTypeParam) : enriched;
      return NextResponse.json({ success: true, vehicles: result, addOns });
    }
    return NextResponse.json({ success: true, vehicles: FALLBACK_VEHICLES, addOns: FALLBACK_ADDONS });
  } catch {
    return NextResponse.json({ success: true, vehicles: FALLBACK_VEHICLES, addOns: FALLBACK_ADDONS });
  }
}
