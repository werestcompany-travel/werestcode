import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAbandonedBookingEmail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gowerest.com';

// ─── GET /api/cron/abandoned-recovery ────────────────────────────────────────
// Vercel Cron: runs every hour ("0 * * * *").
// 1. Sends recovery emails to abandoned bookings older than 1 hour.
// 2. Cleans up bookings that expired more than 7 days ago.

export async function GET(req: NextRequest) {
  // Authenticate via Vercel Cron / CRON_SECRET
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now       = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  let sent    = 0;
  let deleted = 0;
  const errors: string[] = [];

  try {
    // 1. Find abandoned bookings eligible for recovery email
    const candidates = await prisma.abandonedBooking.findMany({
      where: {
        recoveryEmailSentAt: null,
        customerEmail:       { not: null },
        createdAt:           { lt: oneHourAgo },
        expiresAt:           { gt: now },
        recoveredAt:         null,
      },
    });

    for (const record of candidates) {
      try {
        if (!record.customerEmail) continue;

        const resumeUrl =
          record.bookingType === 'tour'
            ? `${APP_URL}/tours/checkout?resume=${record.sessionToken}`
            : `${APP_URL}/booking?resume=${record.sessionToken}`;

        await sendAbandonedBookingEmail({
          to:          record.customerEmail,
          name:        record.customerName ?? 'Traveller',
          bookingType: record.bookingType as 'transfer' | 'tour',
          partialData: record.data as Record<string, unknown>,
          resumeUrl,
        });

        await prisma.abandonedBooking.update({
          where: { id: record.id },
          data:  { recoveryEmailSentAt: new Date() },
        });

        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`record ${record.id}: ${msg}`);
        console.error('[cron/abandoned-recovery] Error sending to', record.customerEmail, err);
      }
    }

    // 2. Delete expired bookings older than 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const cleanup = await prisma.abandonedBooking.deleteMany({
      where: { expiresAt: { lt: sevenDaysAgo } },
    });
    deleted = cleanup.count;

    return NextResponse.json({
      success: true,
      sent,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('[cron/abandoned-recovery] Fatal error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
