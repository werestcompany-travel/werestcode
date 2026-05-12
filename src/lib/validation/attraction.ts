import { z } from 'zod';

export const createAttractionBookingSchema = z.object({
  attractionId:   z.string().min(1).max(255),
  attractionName: z.string().min(1).max(255),
  packageId:      z.string().min(1).max(255),
  packageName:    z.string().min(1).max(255),

  visitDate: z.string().min(1, 'Visit date required'),

  adultQty:   z.number().int().min(0).max(100).optional().default(0),
  childQty:   z.number().int().min(0).max(100).optional().default(0),
  infantQty:  z.number().int().min(0).max(100).optional().default(0),
  // Prices are intentionally excluded from client input — server recalculates
  // them from the DB package record to prevent price manipulation.

  customerName:  z.string().min(1).max(150),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().min(5).max(30),
  notes:         z.string().max(1000).optional(),
  paymentMethod: z.enum(['card', 'cash', 'swift', 'crypto']).optional(),
}).refine(
  (data) => (data.adultQty ?? 0) + (data.childQty ?? 0) > 0,
  { message: 'At least one adult or child ticket required' },
);
