/**
 * Booking reminder cron job — runs daily at 08:00 UTC (15:00 Bangkok time).
 * Sends 24-hour-before reminders (email + WhatsApp) for:
 *   - Transfer bookings (pickupDate = tomorrow, status ≠ CANCELLED/COMPLETED)
 *   - Tour bookings (bookingDate = tomorrow, status = CONFIRMED)
 *   - Attraction bookings (visitDate = tomorrow, status = PENDING/CONFIRMED)
 *
 * Protected by CRON_SECRET env var.
 * Vercel cron passes it as: Authorization: Bearer <secret>
 * Admin dashboard passes it as: GET /api/cron/reminders?secret=<secret>
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

// ── WhatsApp helper ────────────────────────────────────────────────────────
async function sendWhatsApp(
  phone: string,
  message: string,
  phoneId: string,
  token: string,
): Promise<boolean> {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return false;
  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: clean,
        type: 'text',
        text: { body: message },
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret via Authorization header only.
  // Query-param secrets (?secret=...) are avoided because full URLs appear in
  // server logs, proxies, and browser history — leaking the secret.
  // Admin dashboard manual triggers must pass: Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { start, end } = getTomorrow();

  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const waToken   = process.env.WHATSAPP_ACCESS_TOKEN;
  const waEnabled = !!(waPhoneId && waToken);

  const tomorrowStr = start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

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
        customerPhone: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupDate: true,
        pickupTime: true,
        vehicleType: true,
        driverName: true,
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

      if (waEnabled) {
        const firstName = b.customerName.split(' ')[0];
        const msg =
          `🌟 *Pickup Reminder — Werest Travel*\n\n` +
          `Hi ${firstName}! Your private transfer is tomorrow.\n\n` +
          `📅 *Date:* ${tomorrowStr}\n` +
          `⏰ *Pickup:* ${b.pickupTime}\n` +
          `📍 *From:* ${b.pickupAddress}\n` +
          `🏁 *To:* ${b.dropoffAddress}\n` +
          `🚗 *Vehicle:* ${b.vehicleType}\n` +
          (b.driverName ? `👤 *Driver:* ${b.driverName}\n` : '') +
          `\n📋 *Ref:* ${b.bookingRef}\n\n` +
          `Reply to this message if you need anything. See you tomorrow! 🙏`;
        await sendWhatsApp(b.customerPhone, msg, waPhoneId!, waToken!);
      }

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
        customerPhone: true,
        tourTitle: true,
        tourTime: true,
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
        optionLabel:   b.optionLabel ?? null,
        bookingDate:   b.bookingDate,
        totalPrice:    b.totalPrice,
      });

      if (waEnabled) {
        const firstName = b.customerName.split(' ')[0];
        const msg =
          `🌟 *Tour Reminder — Werest Travel*\n\n` +
          `Hi ${firstName}! Your tour is tomorrow.\n\n` +
          `🗺️ *Tour:* ${b.tourTitle}\n` +
          `📅 *Date:* ${tomorrowStr}\n` +
          (b.tourTime ? `⏰ *Departure:* ${b.tourTime}\n` : '') +
          `\n📋 *Ref:* ${b.bookingRef}\n\n` +
          `Please be ready 10 minutes before departure. See you tomorrow! 🙏 — Werest Team`;
        await sendWhatsApp(b.customerPhone, msg, waPhoneId!, waToken!);
      }

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

  const totalSent = transferCount + tourCount + attractionCount;
  console.log(`[cron/reminders] Sent: ${transferCount} transfer, ${tourCount} tour, ${attractionCount} attraction reminders`);

  return NextResponse.json({
    success: errors.length === 0,
    sent: totalSent,
    failed: 0,
    breakdown: { transfers: transferCount, tours: tourCount, attractions: attractionCount },
    whatsapp: waEnabled ? 'enabled' : 'disabled — set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN',
    errors: errors.length > 0 ? errors : undefined,
    window: { start: start.toISOString(), end: end.toISOString() },
  });
}
