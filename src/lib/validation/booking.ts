import { z } from 'zod';

export const vehicleTypeSchema = z.enum(['SEDAN', 'SUV', 'MINIVAN', 'LUXURY_MPV']);

export const selectedAddOnSchema = z.object({
  addOnId:  z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

export const createBookingSchema = z.object({
  // Route
  pickupAddress:  z.string().min(1).max(500),
  pickupLat:      z.number().min(-90).max(90),
  pickupLng:      z.number().min(-180).max(180),
  dropoffAddress: z.string().min(1).max(500),
  dropoffLat:     z.number().min(-90).max(90),
  dropoffLng:     z.number().min(-180).max(180),
  distanceKm:     z.number().positive().max(2000),
  durationMin:    z.number().int().positive().max(3000),

  // Schedule
  pickupDate: z.string().min(1, 'Pickup date required'),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),

  // Passengers
  passengers: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().min(1).max(50)),
  luggage:    z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().min(0).max(50)),

  // Vehicle
  vehicleType: vehicleTypeSchema,

  // Customer
  customerName:  z.string().min(1).max(150),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().min(5).max(30),
  specialNotes:  z.string().max(1000).optional(),

  // Add-ons (client-side values are ignored — prices resolved server-side)
  selectedAddOns: z.array(selectedAddOnSchema).max(20).optional(),

  // Discount code (optional — validated & applied server-side)
  discountCode: z.string().min(1).max(50).optional(),

  // These are ignored server-side (recalculated) but accepted to avoid schema errors
  basePrice:   z.number().optional(),
  addOnsTotal: z.number().optional(),
  totalPrice:  z.number().optional(),

  // Payment method
  paymentMethod: z.string().optional(),

  // Round-trip fields (display only — stored for reference, not used for pricing)
  isRoundTrip: z.boolean().optional(),
  returnDate:  z.string().optional(),
  returnTime:  z.string().optional(),
});

export const discountCodeSchema = z.object({
  code:        z.string().min(1).max(50),
  orderAmount: z.number().min(0).optional(),
});
