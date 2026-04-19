export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { VEHICLE_CONFIGS, VEHICLE_TYPES } from '@/lib/vehicles';

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

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db');
    const [vehicles, addOns] = await Promise.all([
      prisma.pricingRule.findMany({ where: { isActive: true }, orderBy: { baseFare: 'asc' } }),
      prisma.addOn.findMany({ where: { isActive: true } }),
    ]);

    if (vehicles.length > 0) {
      return NextResponse.json({ success: true, vehicles, addOns });
    }
    // DB connected but empty — return fallback data
    return NextResponse.json({ success: true, vehicles: FALLBACK_VEHICLES, addOns: FALLBACK_ADDONS });
  } catch {
    // DB not configured — return static fallback so the page always works
    return NextResponse.json({ success: true, vehicles: FALLBACK_VEHICLES, addOns: FALLBACK_ADDONS });
  }
}
