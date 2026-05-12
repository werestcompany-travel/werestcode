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
  exteriorImage: string;
  interiorImage: string;
  badge?:        'Most Popular' | 'Best Value' | 'Premium';
  includes:      string[];
}

const BASE_INCLUDES = [
  'Air conditioning',
  'Bottled water',
  'GPS navigation',
  'Professional driver',
  'Child seat on request',
];

export const VEHICLE_CONFIGS: Record<VehicleType, VehicleConfig> = {
  SEDAN: {
    maxPassengers: 2,
    maxLuggage:    2,
    name:          'Sedan',
    description:   'Toyota Corolla Altis or similar – perfect for couples and solo travellers',
    emoji:         '🚗',
    imageUrl:      '/images/sedan.png',
    exteriorImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80',
    badge:         'Best Value',
    includes:      [...BASE_INCLUDES],
  },
  SUV: {
    maxPassengers: 4,
    maxLuggage:    4,
    name:          'SUV',
    description:   'Toyota Fortuner or similar – spacious for small families',
    emoji:         '🚙',
    imageUrl:      '/images/suv.jpg',
    exteriorImage: 'https://images.unsplash.com/photo-1569171266568-70fdcee0b14e?w=800&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    badge:         'Most Popular',
    includes:      [...BASE_INCLUDES],
  },
  MINIVAN: {
    maxPassengers: 10,
    maxLuggage:    7,
    name:          'Minivan',
    description:   'Toyota Hi-Ace Commuter or similar – best for groups and large luggage',
    emoji:         '🚐',
    imageUrl:      '/images/minivan.png',
    exteriorImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1591086694498-4b09eca7e0df?w=800&q=80',
    includes:      [...BASE_INCLUDES],
  },
  LUXURY_MPV: {
    maxPassengers: 6,
    maxLuggage:    6,
    name:          'Luxury MPV',
    description:   'Toyota Alphard or similar – premium comfort for VIP transfers',
    emoji:         '🚘',
    imageUrl:      '/images/minivan.png',
    exteriorImage: 'https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?w=800&q=80',
    interiorImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    badge:         'Premium',
    includes:      [...BASE_INCLUDES, 'Meet & greet service', 'Luxury amenities'],
  },
};

/* ── Convenience helpers ─────────────────────────────────────────────────── */

/** Map of vehicle type → display label (e.g. SEDAN → 'Sedan') */
export const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN:      VEHICLE_CONFIGS.SEDAN.name,
  SUV:        VEHICLE_CONFIGS.SUV.name,
  MINIVAN:    VEHICLE_CONFIGS.MINIVAN.name,
  LUXURY_MPV: VEHICLE_CONFIGS.LUXURY_MPV.name,
};

/** All valid vehicle type keys, in display order */
export const VEHICLE_TYPES: VehicleType[] = ['SEDAN', 'SUV', 'MINIVAN', 'LUXURY_MPV'];

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
