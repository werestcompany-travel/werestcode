/**
 * Booking reminder cron job — runs daily at 08:00 UTC (15:00 Bangkok time).
 * Sends 24-hour-before reminder emails for:
 *   - Transfer bookings (pickupDate = tomorrow, status ≠ CANCELLED/COMPLETED)
 *   - Tour bookings (bookingDate = tomorrow, status = CONFIRMED)
 *   - Attraction bookings (visitDate = tomorrow, status = PENDING/CONFIRMED)
 *
 * Protected by CRON_SECRET env var. Vercel calls this via vercel.json cron config.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  sendTransferReminderEmail,
  sendTourReminderEmail,
  sendAttractionReminderEmail,
} from '@/lib/email';

function getTomorrow(): { start: Date; end: Date } {
  const now = new Date();
  // "tomorrow" in Bangkok time (UTC+7): we compare in UTC so add 7h offset
  const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const tomorrowBangkok = new Date(bangkokNow);
  tomorrowBangkok.setUTCDate(tomorrowBangkok.getUTCDate() + 1);

  // Date-only boundaries in UTC
  const start = new Date(Date.UTC(
    tomorrowBangkok.getUTCFullYear(),
    tomorrowBangkok.getUTCMonth(),
    tomorrowBangkok.getUTCDate(),
    0, 0, 0, 0,
  ));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel passes it as Authorization: Bearer <secret>)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { start, end } = getTomorrow();

  let transferCount = 0;
  let tourCount = 0;
  let attractionCount = 0;
  const errors: string[] = [];

  // ── Transfer bookings ──────────────────────────────────────────────────────
  try {
    const transfers = await prisma.booking.findMany({
      where: {
        pickupDate: { gte: start, lt: end },
        currentStatus: { notIn: ['CANCELLED', 'COMPLETED'] },
      },
      select: {
        bookingRef: true,
        customerName: true,
        customerEmail: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupDate: true,
        pickupTime: true,
        vehicleType: true,
        totalPrice: true,
      },
    });

    for (const b of transfers) {
      await sendTransferReminderEmail({
        bookingRef:     b.bookingRef,
        customerName:   b.customerName,
        customerEmail:  b.customerEmail,
        pickupAddress:  b.pickupAddress,
        dropoffAddress: b.dropoffAddress,
        pickupDate:     b.pickupDate,
        pickupTime:     b.pickupTime,
        vehicleType:    b.vehicleType,
        totalPrice:     b.totalPrice,
      });
      transferCount++;
    }
  } catch (err) {
    console.error('[cron/reminders] Transfer error:', err);
    errors.push(`transfers: ${String(err)}`);
  }

  // ── Tour bookings ──────────────────────────────────────────────────────────
  try {
    const tours = await prisma.tourBooking.findMany({
      where: {
        bookingDate: { gte: start, lt: end },
        status: 'CONFIRMED',
      },
      select: {
        bookingRef: true,
        customerName: true,
        customerEmail: true,
        tourTitle: true,
        optionLabel: true,
        bookingDate: true,
        totalPrice: true,
      },
    });

    for (const b of tours) {
      await sendTourReminderEmail({
        bookingRef:    b.bookingRef,
        customerName:  b.customerName,
        customerEmail: b.customerEmail,
        tourTitle:     b.tourTitle,
        optionLabel:   b.optionLabel,
        bookingDate:   b.bookingDate,
        totalPrice:    b.totalPrice,
      });
      tourCount++;
    }
  } catch (err) {
    console.error('[cron/reminders] Tour error:', err);
    errors.push(`tours: ${String(err)}`);
  }

  // ── Attraction bookings ────────────────────────────────────────────────────
  try {
    const attractions = await prisma.attractionBooking.findMany({
      where: {
        visitDate: { gte: start, lt: end },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: {
        bookingRef: true,
        customerName: true,
        customerEmail: true,
        attractionName: true,
        packageName: true,
        visitDate: true,
        totalPrice: true,
      },
    });

    for (const b of attractions) {
      await sendAttractionReminderEmail({
        bookingRef:     b.bookingRef,
        customerName:   b.customerName,
        customerEmail:  b.customerEmail,
        attractionName: b.attractionName,
        packageName:    b.packageName,
        visitDate:      b.visitDate,
        totalPrice:     b.totalPrice,
      });
      attractionCount++;
    }
  } catch (err) {
    console.error('[cron/reminders] Attraction error:', err);
    errors.push(`attractions: ${String(err)}`);
  }

  console.log(`[cron/reminders] Sent: ${transferCount} transfer, ${tourCount} tour, ${attractionCount} attraction reminders`);

  return NextResponse.json({
    success: errors.length === 0,
    sent: { transfers: transferCount, tours: tourCount, attractions: attractionCount },
    errors: errors.length > 0 ? errors : undefined,
    window: { start: start.toISOString(), end: end.toISOString() },
  });
}
