/**
 * Driver reminders cron — runs every hour.
 * Finds bookings where pickupDate is within the next 3–4 hours, status is
 * DRIVER_CONFIRMED, and the driver details message has not yet been sent.
 * Sends the customer a WhatsApp message with driver + vehicle details.
 *
 * Protected by CRON_SECRET (Authorization: Bearer <secret>).
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendDriverDetailsToCustomer } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 3 * 60 * 60 * 1000); // now + 3h
  const windowEnd   = new Date(now.getTime() + 4 * 60 * 60 * 1000); // now + 4h

  let sent = 0;
  const errors: string[] = [];

  try {
    // We need bookings whose pickup datetime falls in the 3–4 hour window.
    // pickupDate is a Date-only column and pickupTime is "HH:MM", so we fetch
    // candidates by date and filter by reconstructed datetime in application code.
    const candidates = await prisma.booking.findMany({
      where: {
        currentStatus: 'DRIVER_CONFIRMED',
        driverDetailsSentAt: null,
        driverId: { not: null },
        // Broad date window: today or tomorrow in case cron runs near midnight
        pickupDate: {
          gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
          lt:  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2)),
        },
      },
      include: {
        driver: {
          include: { vehicles: { where: { isActive: true }, take: 1 } },
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

    for (const booking of candidates) {
      // Reconstruct pickup datetime from pickupDate + pickupTime "HH:MM"
      const [hh, mm] = booking.pickupTime.split(':').map(Number);
      const pickupDateObj = new Date(booking.pickupDate);
      // pickupDate stored as UTC midnight; interpret as Bangkok local (UTC+7)
      const pickupMs =
        Date.UTC(
          pickupDateObj.getUTCFullYear(),
          pickupDateObj.getUTCMonth(),
          pickupDateObj.getUTCDate(),
          hh - 7, // convert Bangkok HH to UTC
          mm,
        );
      const pickupDatetime = new Date(pickupMs);

      // Check if pickup is within the 3–4 hour window
      if (pickupDatetime < windowStart || pickupDatetime >= windowEnd) continue;

      if (!booking.driver) continue;

      const vehicle = booking.driver.vehicles[0];
      const vehicleModel = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Assigned vehicle';
      const vehiclePlate = vehicle?.plateNumber ?? 'N/A';

      try {
        await sendDriverDetailsToCustomer({
          customerPhone: booking.customerPhone,
          customerName:  booking.customerName,
          bookingRef:    booking.bookingRef,
          driverName:    booking.driver.name,
          driverPhone:   booking.driver.phone,
          vehicleModel,
          vehiclePlate,
          pickupTime:    booking.pickupTime,
          pickupAddress: booking.pickupAddress,
          trackingUrl:   `${appUrl}/tracking/${booking.bookingRef}`,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { driverDetailsSentAt: new Date() },
        });

        sent++;
      } catch (err) {
        console.error(`[cron/driver-reminders] Failed for ${booking.bookingRef}:`, err);
        errors.push(`${booking.bookingRef}: ${String(err)}`);
      }
    }
  } catch (err) {
    console.error('[cron/driver-reminders] Query error:', err);
    errors.push(String(err));
  }

  console.log(`[cron/driver-reminders] Sent ${sent} driver detail messages`);

  return NextResponse.json({
    success: errors.length === 0,
    sent,
    errors: errors.length > 0 ? errors : undefined,
    window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
  });
}
