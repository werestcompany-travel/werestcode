import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

/**
 * Payment reconciliation — runs hourly.
 *
 * Finds bookings stuck in AWAITING_PAYMENT for more than 1 hour (the Payso
 * webhook should normally arrive within seconds of payment). A stuck booking
 * means either the customer abandoned at the payment screen (harmless — the
 * abandoned-recovery cron handles re-engagement) OR the customer PAID but the
 * webhook never arrived (revenue-critical: money taken, no confirmation sent).
 *
 * Since we cannot distinguish the two without a Payso status-inquiry API,
 * this cron alerts the admin so a human can check the Payso dashboard and
 * manually confirm any paid-but-stuck bookings. It also captures to Sentry
 * so the trend is visible.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oneHourAgo  = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo   = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Window: stuck for >1h but <24h (older ones were already reported / are stale carts)
  const window = { gte: oneDayAgo, lte: oneHourAgo };

  const [stuckTransfers, stuckTours, stuckAttractions] = await Promise.all([
    prisma.booking.findMany({
      where: { paymentStatus: 'AWAITING_PAYMENT', updatedAt: window },
      select: { bookingRef: true, customerEmail: true, totalPrice: true, updatedAt: true },
      take: 50,
    }),
    prisma.tourBooking.findMany({
      where: { paymentStatus: 'AWAITING_PAYMENT', updatedAt: window },
      select: { bookingRef: true, customerEmail: true, totalPrice: true, updatedAt: true },
      take: 50,
    }),
    prisma.attractionBooking.findMany({
      where: { paymentStatus: 'AWAITING_PAYMENT', updatedAt: window },
      select: { bookingRef: true, customerEmail: true, totalPrice: true, updatedAt: true },
      take: 50,
    }),
  ]);

  const stuck = [
    ...stuckTransfers.map(b => ({ ...b, type: 'transfer' })),
    ...stuckTours.map(b => ({ ...b, type: 'tour' })),
    ...stuckAttractions.map(b => ({ ...b, type: 'attraction' })),
  ];

  if (stuck.length === 0) {
    return NextResponse.json({ ok: true, stuck: 0 });
  }

  // Surface in Sentry so the trend is monitored even if email fails
  Sentry.captureMessage(`payment-reconciliation: ${stuck.length} booking(s) stuck in AWAITING_PAYMENT >1h`, {
    level: 'warning',
    extra: { bookings: stuck.map(b => `${b.type}:${b.bookingRef} ฿${b.totalPrice}`) },
  });

  // Email the admin a digest
  const adminEmail = process.env.ADMIN_EMAIL ?? 'werestcompany@gmail.com';
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const rows = stuck
      .map(b => `<tr><td style="padding:6px 12px;border:1px solid #eee;">${b.type}</td><td style="padding:6px 12px;border:1px solid #eee;font-family:monospace;">${b.bookingRef}</td><td style="padding:6px 12px;border:1px solid #eee;">${b.customerEmail}</td><td style="padding:6px 12px;border:1px solid #eee;">฿${b.totalPrice.toLocaleString()}</td><td style="padding:6px 12px;border:1px solid #eee;">${new Date(b.updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' })}</td></tr>`)
      .join('');
    await resend.emails.send({
      from:    process.env.EMAIL_FROM ?? 'Werest Travel <noreply@gowerest.com>',
      to:      adminEmail,
      subject: `⚠️ ${stuck.length} booking(s) awaiting payment for over 1 hour`,
      html: `
        <h2>Payment reconciliation alert</h2>
        <p>These bookings have been in <b>AWAITING_PAYMENT</b> for over an hour.
        Check the <b>Payso dashboard</b> — if any were actually paid, the webhook
        failed and the booking must be confirmed manually in the admin panel.</p>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><th style="padding:6px 12px;border:1px solid #eee;">Type</th><th style="padding:6px 12px;border:1px solid #eee;">Ref</th><th style="padding:6px 12px;border:1px solid #eee;">Customer</th><th style="padding:6px 12px;border:1px solid #eee;">Amount</th><th style="padding:6px 12px;border:1px solid #eee;">Last update (BKK)</th></tr>
          ${rows}
        </table>`,
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'payment-reconciliation' } });
  }

  return NextResponse.json({ ok: true, stuck: stuck.length });
}
