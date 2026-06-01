import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPostTripReviewEmail } from '@/lib/email';
import { sendPostTripReviewRequest } from '@/lib/whatsapp';

// ─── GET /api/cron/post-trip-reviews ─────────────────────────────────────────
// Vercel Cron: runs every day at 08:00 ("0 8 * * *").
// Sends review-request emails for trips that completed yesterday.

export async function GET(req: NextRequest) {
  // Auth
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Calculate yesterday's date window (midnight → midnight local Bangkok = UTC+7)
  // We use UTC dates here; adjust offset as needed in production.
  const now       = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  const dayStart = new Date(
    Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 0, 0, 0),
  );
  const dayEnd = new Date(
    Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 23, 59, 59, 999),
  );

  let sent    = 0;
  const errors: string[] = [];

  try {
    // ── 1. Tour bookings completed yesterday ──────────────────────────────────
    const tourBookings = await prisma.tourBooking.findMany({
      where: {
        status:      'COMPLETED',
        bookingDate: { gte: dayStart, lte: dayEnd },
      },
    });

    for (const tb of tourBookings) {
      try {
        // Skip if already sent
        const existing = await prisma.emailJourneyLog.findUnique({
          where: { bookingRef_journeyType: { bookingRef: tb.bookingRef, journeyType: 'POST_TRIP_REVIEW' } },
        });
        if (existing) continue;

        await sendPostTripReviewEmail({
          to:          tb.customerEmail,
          name:        tb.customerName,
          serviceName: tb.tourTitle,
          serviceType: 'tour',
          entityId:    tb.tourSlug,
          bookingRef:  tb.bookingRef,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
        sendPostTripReviewRequest({
          customerPhone: tb.customerPhone,
          customerName:  tb.customerName,
          bookingRef:    tb.bookingRef,
          serviceType:   'tour',
          destination:   tb.tourTitle,
          reviewUrl:     `${appUrl}/review/write?type=tour&bookingRef=${tb.bookingRef}`,
          googleReviewUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL,
        }).catch((err: unknown) => console.warn('[cron/post-trip-reviews] WhatsApp tour error:', err));

        await prisma.emailJourneyLog.create({
          data: {
            email:       tb.customerEmail,
            bookingRef:  tb.bookingRef,
            journeyType: 'POST_TRIP_REVIEW',
          },
        });

        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`tour/${tb.bookingRef}: ${msg}`);
        console.error('[cron/post-trip-reviews] Tour error', tb.bookingRef, err);
      }
    }

    // ── 2. Transfer bookings completed yesterday ──────────────────────────────
    const transferBookings = await prisma.booking.findMany({
      where: {
        currentStatus: 'COMPLETED',
        pickupDate:    { gte: dayStart, lte: dayEnd },
      },
    });

    for (const booking of transferBookings) {
      try {
        const existing = await prisma.emailJourneyLog.findUnique({
          where: { bookingRef_journeyType: { bookingRef: booking.bookingRef, journeyType: 'POST_TRIP_REVIEW' } },
        });
        if (existing) continue;

        const serviceName = `${booking.pickupAddress} → ${booking.dropoffAddress}`;

        await sendPostTripReviewEmail({
          to:          booking.customerEmail,
          name:        booking.customerName,
          serviceName,
          serviceType: 'transfer',
          entityId:    booking.bookingRef,
          bookingRef:  booking.bookingRef,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
        sendPostTripReviewRequest({
          customerPhone: booking.customerPhone,
          customerName:  booking.customerName,
          bookingRef:    booking.bookingRef,
          serviceType:   'transfer',
          destination:   booking.dropoffAddress.split(',')[0],
          reviewUrl:     `${appUrl}/review/write?type=transfer&bookingRef=${booking.bookingRef}`,
          googleReviewUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL,
        }).catch((err: unknown) => console.warn('[cron/post-trip-reviews] WhatsApp transfer error:', err));

        await prisma.emailJourneyLog.create({
          data: {
            email:       booking.customerEmail,
            bookingRef:  booking.bookingRef,
            journeyType: 'POST_TRIP_REVIEW',
          },
        });

        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`transfer/${booking.bookingRef}: ${msg}`);
        console.error('[cron/post-trip-reviews] Transfer error', booking.bookingRef, err);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('[cron/post-trip-reviews] Fatal error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
