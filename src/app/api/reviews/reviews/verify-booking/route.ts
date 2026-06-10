export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP } from '@/lib/rate-limit';

// 10 attempts per 15 minutes per IP
const VERIFY_LIMIT = { limit: 10, windowSec: 60 * 15 };

const bodySchema = z.object({
  bookingRef: z.string().min(1).max(50).transform(s => s.trim().toUpperCase()),
  email:      z.string().email().max(255).transform(s => s.trim().toLowerCase()),
  entityType: z.enum(['TRANSFER', 'TOUR', 'ATTRACTION']).optional(),
});

/**
 * POST /api/reviews/verify-booking
 * Body: { bookingRef, email, entityType? }
 *
 * Returns:
 *   { verified: true,  customerName, entityName, entityId }
 *   { verified: false, error: string }
 */
export async function POST(req: NextRequest) {
  // Rate-limit by IP
  const ip = getIP(req);
  const rl = await rateLimitAsync(`verify-booking:${ip}`, VERIFY_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json({ verified: false, error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  // Parse body
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ verified: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ verified: false, error: parsed.error.issues[0]?.message ?? 'Validation failed.' }, { status: 400 });
  }

  const { bookingRef, email } = parsed.data;

  // ── 1. Transfer / private-transfer booking ───────────────────────────────
  const transfer = await prisma.booking.findFirst({
    where: {
      bookingRef,
      customerEmail: { equals: email, mode: 'insensitive' },
    },
    select: {
      customerName:  true,
      customerEmail: true,
      paymentStatus: true,
      currentStatus: true,
      bookingRef:    true,
    },
  });

  if (transfer) {
    // BookingStatus enum: PENDING | DRIVER_CONFIRMED | DRIVER_STANDBY | DRIVER_PICKED_UP | COMPLETED | CANCELLED
    // paymentStatus is a plain String: "AWAITING_PAYMENT" | "PAID" | "FAILED" | "REFUNDED"
    const ok = transfer.paymentStatus === 'PAID' ||
               transfer.currentStatus === 'COMPLETED' ||
               transfer.currentStatus === 'DRIVER_CONFIRMED' ||
               transfer.currentStatus === 'DRIVER_STANDBY' ||
               transfer.currentStatus === 'DRIVER_PICKED_UP';
    if (!ok) {
      return NextResponse.json({ verified: false, error: 'Booking found but payment is not yet confirmed.' });
    }
    return NextResponse.json({
      verified:     true,
      customerName: transfer.customerName,
      entityType:   'TRANSFER',
      entityId:     transfer.bookingRef,
      entityName:   `Transfer – ${transfer.bookingRef}`,
    });
  }

  // ── 2. Tour booking ──────────────────────────────────────────────────────
  const tourBooking = await prisma.tourBooking.findFirst({
    where: {
      bookingRef,
      customerEmail: { equals: email, mode: 'insensitive' },
    },
    select: {
      customerName:  true,
      paymentStatus: true,
      status:        true,
      tourTitle:     true,
      tourSlug:      true,
    },
  });

  if (tourBooking) {
    const ok = tourBooking.paymentStatus === 'PAID' ||
               tourBooking.status === 'COMPLETED' ||
               tourBooking.status === 'CONFIRMED';
    if (!ok) {
      return NextResponse.json({ verified: false, error: 'Booking found but payment is not yet confirmed.' });
    }
    return NextResponse.json({
      verified:     true,
      customerName: tourBooking.customerName,
      entityType:   'TOUR',
      entityId:     tourBooking.tourSlug,
      entityName:   tourBooking.tourTitle,
    });
  }

  // ── 3. Attraction booking ────────────────────────────────────────────────
  const attractionBooking = await prisma.attractionBooking.findFirst({
    where: {
      bookingRef,
      customerEmail: { equals: email, mode: 'insensitive' },
    },
    select: {
      customerName:   true,
      paymentStatus:  true,
      status:         true,
      attractionName: true,
      attractionId:   true,
    },
  });

  if (attractionBooking) {
    // AttractionBookingStatus enum: PENDING | CONFIRMED | CANCELLED | USED
    // paymentStatus is a plain String
    const ok = attractionBooking.paymentStatus === 'PAID' ||
               attractionBooking.status === 'CONFIRMED' ||
               attractionBooking.status === 'USED';
    if (!ok) {
      return NextResponse.json({ verified: false, error: 'Booking found but payment is not yet confirmed.' });
    }
    return NextResponse.json({
      verified:     true,
      customerName: attractionBooking.customerName,
      entityType:   'ATTRACTION',
      entityId:     attractionBooking.attractionId,
      entityName:   attractionBooking.attractionName,
    });
  }

  // Not found in any table
  return NextResponse.json({
    verified: false,
    error:    'No confirmed booking found for this reference and email combination.',
  });
}
