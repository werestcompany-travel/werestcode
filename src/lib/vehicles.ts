/**
 * vehicles.ts — Single source of truth for vehicle type metadata.
 *
 * Every capacity limit, label, description, and emoji lives here.
 * Import this wherever vehicle data is needed to avoid duplication:
 *   • prisma/seed.ts          — DB seed
 *   • API routes              — backend validation
 *   • UI components           — display labels and limits
 *   • FAQ / content copy      — keep numbers in sync automatically
 */

import { VehicleType } from '@/types';

/* ── Capacity limits ──────────────────────────────────────────────────────── */
export interface VehicleConfig {
  maxPassengers: number;
  maxLuggage:    number;
  name:          string;
  description:   string;
  emoji:         string;
  imageUrl:      string;
}

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  SEDAN: {
    maxPassengers: 2,
    maxLuggage:    2,
    name:          'Sedan',
    description:   'Toyota Camry or similar – perfect for couples and solo travellers',
    emoji:         '🚗',
    imageUrl:      '/images/sedan.png',
  },
  SUV: {
    maxPassengers: 4,
    maxLuggage:    4,
    name:          'SUV',
    description:   'Toyota Fortuner or similar – spacious for small families',
    emoji:         '🚙',
    imageUrl:      '/images/suv.jpg',
  },
  MINIVAN: {
    maxPassengers: 10,
    maxLuggage:    7,
    name:          'Minivan',
    description:   'Toyota Commuter or similar – best for groups and large luggage',
    emoji:         '🚐',
    imageUrl:      '/images/minivan.png',
  },
};

/* ── Convenience helpers ─────────────────────────────────────────────────── */

/** Map of vehicle type → display label (e.g. SEDAN → 'Sedan') */
export const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN:   VEHICLE_CONFIGS.SEDAN.name,
  SUV:     VEHICLE_CONFIGS.SUV.name,
  MINIVAN: VEHICLE_CONFIGS.MINIVAN.name,
};

/** All valid vehicle type keys, in display order */
export const VEHICLE_TYPES: VehicleType[] = ['SEDAN', 'SUV', 'MINIVAN'];

/**
 * Returns true when the requested passengers/luggage fit inside the vehicle.
 * Use this for both frontend and backend validation.
 */
export function vehicleCanAccommodate(
  vehicleType: VehicleType,
  passengers: number,
  luggage: number,
): boolean {
  const cfg = VEHICLE_CONFIGS[vehicleType];
  return passengers <= cfg.maxPassengers && luggage <= cfg.maxLuggage;
}
