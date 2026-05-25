export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';
import { rateLimit, getIP } from '@/lib/rate-limit';

interface Params {
  params: { id: string };
}

const MODIFIABLE_STATUSES = ['PENDING', 'DRIVER_CONFIRMED'];
const MIN_HOURS_BEFORE = 24;

// PATCH /api/bookings/[id]/modify — customer modifies a transfer booking
export async function PATCH(req: NextRequest, { params }: Params) {
  const ip = getIP(req);
  const rl = await rateLimit(`modify:${ip}:${params.id}`, { limit: 5, windowSec: 60 * 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many modification attempts. Try again later.' }, { status: 429 });

  const session = await getUserFromRequest(req);

  const body = await req.json();
  const { pickupDate, pickupTime, passengers, luggage, specialNotes, customerEmail } = body;

  // Find the booking
  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Auth: must own booking via session OR matching email
  const isOwner =
    (session && booking.customerEmail.toLowerCase() === session.email.toLowerCase()) ||
    (customerEmail && booking.customerEmail.toLowerCase() === (customerEmail as string).toLowerCase());

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized — you do not own this booking' }, { status: 403 });
  }

  // Status check
  if (!MODIFIABLE_STATUSES.includes(booking.currentStatus)) {
    return NextResponse.json(
      { error: `Booking cannot be modified in status: ${booking.currentStatus}` },
      { status: 400 },
    );
  }

  // Time check: pickup must be >24h away
  const pickupDateTime = new Date(booking.pickupDate);
  const [hours, minutes] = booking.pickupTime.split(':').map(Number);
  pickupDateTime.setHours(hours, minutes, 0, 0);
  const hoursUntilPickup = (pickupDateTime.getTime() - Date.now()) / 3_600_000;

  if (hoursUntilPickup <= MIN_HOURS_BEFORE) {
    return NextResponse.json(
      { error: `Modifications are only allowed more than ${MIN_HOURS_BEFORE} hours before pickup` },
      { status: 400 },
    );
  }

  // Build update data — only allowed fields
  const updateData: Record<string, unknown> = {};
  if (pickupDate !== undefined) updateData.pickupDate = new Date(pickupDate);
  if (pickupTime !== undefined) updateData.pickupTime = pickupTime;
  if (passengers !== undefined) updateData.passengers = Number(passengers);
  if (luggage !== undefined) updateData.luggage = Number(luggage);
  if (specialNotes !== undefined) updateData.specialNotes = specialNotes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No modifiable fields provided' }, { status: 400 });
  }

  // Update booking and add history entry
  const [updated] = await prisma.$transaction([
    prisma.booking.update({ where: { id: params.id }, data: updateData }),
    prisma.bookingStatusHistory.create({
      data: {
        bookingId: params.id,
        status: booking.currentStatus,
        note: 'Customer modified booking',
        updatedBy: session?.email ?? customerEmail ?? 'customer',
      },
    }),
  ]);

  return NextResponse.json({ ok: true, booking: updated });
}
