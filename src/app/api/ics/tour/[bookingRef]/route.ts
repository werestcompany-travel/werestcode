export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
  { params }: { params: { bookingRef: string } },
) {
  const booking = await prisma.tourBooking.findUnique({
    where: { bookingRef: params.bookingRef },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // DTSTART = bookingDate at 09:00 Bangkok time (UTC+7 = 02:00Z)
  const dtStart = new Date(booking.bookingDate);
  dtStart.setUTCHours(2, 0, 0, 0); // 09:00 BKK = 02:00Z

  // DTEND = DTSTART + 8 hours (full day tour)
  const dtEnd = new Date(dtStart.getTime() + 8 * 60 * 60 * 1000);

  const guestDesc =
    `${booking.adultQty} adult${booking.adultQty !== 1 ? 's' : ''}` +
    (booking.childQty > 0 ? ` ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}` : '');

  const summary     = escapeIcs(`Werest Tour — ${booking.tourTitle}`);
  const description = escapeIcs(
    `Booking Ref: ${booking.bookingRef}\nOption: ${booking.optionLabel}\nGuests: ${guestDesc}\nPayment on arrival.`,
  );
  const now = toIcsDate(new Date());
  const uid = `${booking.bookingRef}@werest.com`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Werest Travel//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDate(dtStart)}`,
    `DTEND:${toIcsDate(dtEnd)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Thailand',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-P1D',
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
