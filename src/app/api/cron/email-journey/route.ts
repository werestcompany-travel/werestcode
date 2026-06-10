/**
 * Email Journey cron — runs hourly (see vercel.json: "0 * * * *").
 *
 * Job 1 — POST_TRIP_REVIEW
 *   Sends a review-request email 3+ hours after a completed/paid transfer.
 *   One email per bookingRef (idempotent via EmailJourneyLog).
 *
 * Job 2 — RE_ENGAGEMENT
 *   Sends a comeback offer 7 days (±12 h) after the pickup date.
 *   One email per bookingRef (idempotent via EmailJourneyLog).
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import {
  buildReviewRequestEmail,
  buildReEngagementEmail,
} from '@/lib/email-journey-emails';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM    = `${process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Werest Travel'} <noreply@${process.env.NEXT_PUBLIC_EMAIL_DOMAIN ?? 'gowerest.com'}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gowerest.com';

const MAX_PER_RUN = 50;

// ── Auth helper ───────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[cron/email-journey] CRON_SECRET not set — endpoint is unprotected.');
    return true; // allow but warn, mirrors reminders pattern
  }
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

// ── Email sender helper ───────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.warn('[cron/email-journey] RESEND_API_KEY not set — skipping email to', to);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now        = new Date();
  const errors: string[] = [];
  let reviewRequests = 0;
  let reEngagements  = 0;

  // ────────────────────────────────────────────────────────────────────────────
  // Job 1 — Post-trip review requests
  // Criteria: (currentStatus = COMPLETED) OR (paymentStatus = PAID AND pickupDate < now - 3h)
  // Exclude: already has EmailJourneyLog with journeyType = POST_TRIP_REVIEW
  // ────────────────────────────────────────────────────────────────────────────
  try {
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    // Fetch bookingRefs that already received a POST_TRIP_REVIEW email.
    // EmailJourneyLog has no Prisma relation to Booking, so we exclude manually.
    const sentReviewLogs = await prisma.emailJourneyLog.findMany({
      where:  { journeyType: 'POST_TRIP_REVIEW' },
      select: { bookingRef: true },
    });
    const sentReviewRefs = sentReviewLogs.map(l => l.bookingRef);

    const reviewCandidates = await prisma.booking.findMany({
      where: {
        OR: [
          { currentStatus: 'COMPLETED' },
          {
            paymentStatus: 'PAID',
            pickupDate:    { lt: threeHoursAgo },
          },
        ],
        // Exclude already-sent refs
        ...(sentReviewRefs.length > 0 ? { bookingRef: { notIn: sentReviewRefs } } : {}),
      },
      select: {
        bookingRef:    true,
        customerName:  true,
        customerEmail: true,
        pickupDate:    true,
      },
      take: MAX_PER_RUN,
      orderBy: { pickupDate: 'asc' },
    });

    for (const booking of reviewCandidates) {
      try {
        const reviewUrl = `${APP_URL}/review/write?ref=${encodeURIComponent(booking.bookingRef)}&type=TRANSFER`;

        const html = buildReviewRequestEmail({
          customerName: booking.customerName,
          bookingRef:   booking.bookingRef,
          pickupDate:   booking.pickupDate,
          reviewUrl,
        });

        await sendEmail(
          booking.customerEmail,
          'How was your Werest transfer? ⭐',
          html,
        );

        // Record that we sent it (unique constraint on [bookingRef, journeyType] prevents duplicates)
        await prisma.emailJourneyLog.create({
          data: {
            email:       booking.customerEmail,
            bookingRef:  booking.bookingRef,
            journeyType: 'POST_TRIP_REVIEW',
            sentAt:      now,
          },
        });

        reviewRequests++;
      } catch (err) {
        const msg = `review-request ${booking.bookingRef}: ${String(err)}`;
        console.error('[cron/email-journey]', msg);
        errors.push(msg);
      }
    }
  } catch (err) {
    const msg = `job1-query: ${String(err)}`;
    console.error('[cron/email-journey]', msg);
    errors.push(msg);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Job 2 — Re-engagement (7 days ± 12 h after pickupDate)
  // Criteria: paymentStatus = PAID, pickupDate in [now - 7.5d, now - 6.5d]
  // Exclude: already has EmailJourneyLog with journeyType = RE_ENGAGEMENT
  // ────────────────────────────────────────────────────────────────────────────
  try {
    const sevenDaysAgo     = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const windowStart      = new Date(sevenDaysAgo.getTime() - 12 * 60 * 60 * 1000); // -7.5 days
    const windowEnd        = new Date(sevenDaysAgo.getTime() + 12 * 60 * 60 * 1000); // -6.5 days

    // Fetch bookingRefs that already received a RE_ENGAGEMENT email.
    const sentReEngageLogs = await prisma.emailJourneyLog.findMany({
      where:  { journeyType: 'RE_ENGAGEMENT' },
      select: { bookingRef: true },
    });
    const sentReEngageRefs = sentReEngageLogs.map(l => l.bookingRef);

    const reEngagementCandidates = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PAID',
        pickupDate: {
          gte: windowStart,
          lt:  windowEnd,
        },
        // Exclude already-sent refs
        ...(sentReEngageRefs.length > 0 ? { bookingRef: { notIn: sentReEngageRefs } } : {}),
      },
      select: {
        bookingRef:    true,
        customerName:  true,
        customerEmail: true,
        pickupDate:    true,
      },
      take: MAX_PER_RUN,
      orderBy: { pickupDate: 'asc' },
    });

    for (const booking of reEngagementCandidates) {
      try {
        const html = buildReEngagementEmail({
          customerName: booking.customerName,
          bookingRef:   booking.bookingRef,
          discountCode: 'COMEBACK10',
        });

        await sendEmail(
          booking.customerEmail,
          'Your next Thailand adventure awaits 🌴',
          html,
        );

        await prisma.emailJourneyLog.create({
          data: {
            email:       booking.customerEmail,
            bookingRef:  booking.bookingRef,
            journeyType: 'RE_ENGAGEMENT',
            sentAt:      now,
          },
        });

        reEngagements++;
      } catch (err) {
        const msg = `re-engagement ${booking.bookingRef}: ${String(err)}`;
        console.error('[cron/email-journey]', msg);
        errors.push(msg);
      }
    }
  } catch (err) {
    const msg = `job2-query: ${String(err)}`;
    console.error('[cron/email-journey]', msg);
    errors.push(msg);
  }

  console.log(
    `[cron/email-journey] Done — reviewRequests: ${reviewRequests}, reEngagements: ${reEngagements}, errors: ${errors.length}`,
  );

  return NextResponse.json({
    success:        errors.length === 0,
    reviewRequests,
    reEngagements,
    errors:         errors.length > 0 ? errors : undefined,
    ranAt:          now.toISOString(),
  });
}
