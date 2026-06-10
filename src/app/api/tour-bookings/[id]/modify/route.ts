export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP } from '@/lib/rate-limit';

interface Params {
  params: { id: string };
}

const MIN_HOURS_BEFORE = 24;

// PATCH /api/tour-bookings/[id]/modify — customer modifies a tour booking
export async function PATCH(req: NextRequest, { params }: Params) {
  const ip = getIP(req);
  const rl = await await rateLimitAsync(`modify-tour:${ip}:${params.id}`, { limit: 5, windowSec: 60 * 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many modification attempts. Try again later.' }, { status: 429 });

  const session = await getUserFromRequest(req);

  const body = await req.json();
  const { bookingDate, adultQty, childQty, notes, customerEmail } = body;

  // Find the booking
  const booking = await prisma.tourBooking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Auth: must own booking via session OR matching email
  const isOwner =
    (session && booking.customerEmail.toLowerCase() === session.email.toLowerCase()) ||
    (customerEmail && booking.customerEmail.toLowerCase() === (customerEmail as string).toLowerCase());

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized — you do not own this booking' }, { status: 403 });
  }

  // Status check: must be CONFIRMED
  if (booking.status !== 'CONFIRMED') {
    return NextResponse.json(
      { error: `Tour booking cannot be modified in status: ${booking.status}` },
      { status: 400 },
    );
  }

  // Time check: booking date must be >24h away
  const bookingDt = new Date(booking.bookingDate);
  const hoursUntilTour = (bookingDt.getTime() - Date.now()) / 3_600_000;
  if (hoursUntilTour <= MIN_HOURS_BEFORE) {
    return NextResponse.json(
      { error: `Modifications are only allowed more than ${MIN_HOURS_BEFORE} hours before the tour` },
      { status: 400 },
    );
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (bookingDate !== undefined) updateData.bookingDate = new Date(bookingDate);
  if (notes !== undefined) updateData.notes = notes;

  const newAdultQty = adultQty !== undefined ? Number(adultQty) : booking.adultQty;
  const newChildQty = childQty !== undefined ? Number(childQty) : booking.childQty;

  if (adultQty !== undefined) updateData.adultQty = newAdultQty;
  if (childQty !== undefined) updateData.childQty = newChildQty;

  // Recalculate totalPrice if quantities changed
  if (adultQty !== undefined || childQty !== undefined) {
    updateData.totalPrice =
      newAdultQty * booking.adultPrice + newChildQty * booking.childPrice;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No modifiable fields provided' }, { status: 400 });
  }

  // Update booking and add status history entry
  const [updated] = await prisma.$transaction([
    prisma.tourBooking.update({ where: { id: params.id }, data: updateData }),
    prisma.tourBookingStatusHistory.create({
      data: {
        tourBookingId: params.id,
        status: booking.status,
        note: 'Customer modified booking',
        updatedBy: session?.email ?? customerEmail ?? 'customer',
      },
    }),
  ]);

  return NextResponse.json({ ok: true, booking: updated });
}
