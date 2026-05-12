import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { VEHICLE_LABELS } from '@/lib/utils';

function pad(n: number) { return String(n).padStart(2, '0'); }

function toIcsDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    '00Z',
  ].join('');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookingId: string } },
) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Build pickup datetime from pickupDate + pickupTime (HH:MM)
  const [hh, mm] = booking.pickupTime.split(':').map(Number);
  const pickupStart = new Date(booking.pickupDate);
  pickupStart.setUTCHours(hh - 7, mm, 0, 0); // Thailand is UTC+7

  const pickupEnd = new Date(pickupStart.getTime() + (booking.durationMin ?? 120) * 60 * 1000);

  const vehicleLabel = VEHICLE_LABELS[booking.vehicleType] ?? booking.vehicleType;
  const summary      = escapeIcs(`Werest Transfer — ${booking.pickupAddress} → ${booking.dropoffAddress}`);
  const description  = escapeIcs(
    `Booking Ref: ${booking.bookingRef}\\nVehicle: ${vehicleLabel}\\nPassengers: ${booking.passengers}\\nPayment on arrival.`
  );
  const location     = escapeIcs(booking.pickupAddress);
  const now          = toIcsDate(new Date());
  const uid          = `${booking.bookingRef}@werest.com`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Werest Travel//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDate(pickupStart)}`,
    `DTEND:${toIcsDate(pickupEnd)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="werest-${booking.bookingRef}.ics"`,
      'Cache-Control':       'no-store',
    },
  });
}
