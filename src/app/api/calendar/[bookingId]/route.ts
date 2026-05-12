import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateICalFile } from '@/lib/ical';

export async function GET(_req: NextRequest, { params }: { params: { bookingId: string } }) {
  const booking = await prisma.booking.findUnique({ where: { id: params.bookingId } });
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ical = generateICalFile({
    bookingRef:     booking.bookingRef,
    bookingId:      booking.id,
    customerName:   booking.customerName,
    pickupAddress:  booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate:     booking.pickupDate,
    pickupTime:     booking.pickupTime,
    vehicleType:    booking.vehicleType,
    passengers:     booking.passengers,
  });

  return new NextResponse(ical, {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="werest-${booking.bookingRef}.ics"`,
    },
  });
}
