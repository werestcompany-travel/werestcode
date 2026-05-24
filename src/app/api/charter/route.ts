import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP } from '@/lib/rate-limit';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function generateCharterRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `CHAR-${yy}${mm}${dd}-${rand}`;
}

/* ── POST /api/charter ────────────────────────────────────────────────────── */

export async function POST(req: Request) {
  // Rate limit: 10 per hour per IP
  const ip = getIP(req);
  const rl = await rateLimitAsync(`charter:${ip}`, { limit: 10, windowSec: 60 * 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const {
    charterType,
    vehicleType,
    startDate,
    startTime,
    durationHours,
    startAddress,
    startLat,
    startLng,
    stops,
    endAddress,
    endLat,
    endLng,
    customerName,
    customerEmail,
    customerPhone,
    passengers,
    specialNotes,
    hourlyRate,
    distanceKm,
    basePrice,
    totalPrice,
  } = body as Record<string, unknown>;

  // ── Validation ─────────────────────────────────────────────────────────────
  const errors: string[] = [];

  if (!charterType || !['HOURLY', 'MULTI_STOP'].includes(String(charterType)))
    errors.push('Invalid charter type.');
  if (!vehicleType || !['SEDAN', 'SUV', 'MINIVAN', 'LUXURY_MPV'].includes(String(vehicleType)))
    errors.push('Invalid vehicle type.');
  if (!startDate)    errors.push('Start date is required.');
  if (!startTime)    errors.push('Start time is required.');
  if (!startAddress) errors.push('Start address is required.');
  if (!customerName) errors.push('Customer name is required.');
  if (!customerEmail || !String(customerEmail).match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    errors.push('Valid customer email is required.');
  if (!customerPhone || String(customerPhone).replace(/\D/g, '').length < 8)
    errors.push('Valid customer phone is required.');
  if (!passengers || Number(passengers) < 1)
    errors.push('At least 1 passenger is required.');
  if (typeof basePrice !== 'number' || basePrice < 0)
    errors.push('Base price is required.');
  if (typeof totalPrice !== 'number' || totalPrice < 0)
    errors.push('Total price is required.');

  if (charterType === 'HOURLY') {
    if (!durationHours || Number(durationHours) < 1)
      errors.push('Duration in hours is required for hourly charter.');
  }

  if (errors.length) {
    return NextResponse.json({ success: false, error: errors.join(' ') }, { status: 422 });
  }

  // ── Create booking ─────────────────────────────────────────────────────────
  try {
    const bookingRef = generateCharterRef();

    const booking = await prisma.charterBooking.create({
      data: {
        bookingRef,
        charterType:   String(charterType) as 'HOURLY' | 'MULTI_STOP',
        vehicleType:   String(vehicleType) as 'SEDAN' | 'SUV' | 'MINIVAN' | 'LUXURY_MPV',
        startDate:     new Date(String(startDate)),
        startTime:     String(startTime),
        durationHours: durationHours != null ? Number(durationHours) : null,
        startAddress:  String(startAddress),
        startLat:      Number(startLat) || 0,
        startLng:      Number(startLng) || 0,
        stops:         stops ?? [],
        endAddress:    endAddress ? String(endAddress) : null,
        endLat:        endLat != null ? Number(endLat) : null,
        endLng:        endLng != null ? Number(endLng) : null,
        customerName:  String(customerName),
        customerEmail: String(customerEmail),
        customerPhone: String(customerPhone),
        passengers:    Number(passengers),
        specialNotes:  specialNotes ? String(specialNotes) : null,
        hourlyRate:    hourlyRate != null ? Number(hourlyRate) : null,
        distanceKm:    distanceKm != null ? Number(distanceKm) : 0,
        basePrice:     Number(basePrice),
        totalPrice:    Number(totalPrice),
      },
    });

    return NextResponse.json({ success: true, bookingRef: booking.bookingRef, id: booking.id });
  } catch (err) {
    console.error('[charter] create error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to save booking. Please try again.' },
      { status: 500 }
    );
  }
}
