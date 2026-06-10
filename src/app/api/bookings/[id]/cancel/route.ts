export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = getIP(req);
  const rl = await rateLimitAsync(`cancel:${ip}`, { limit: 5, windowSec: 60 * 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const session = await getUserFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { customerEmail } = body as { customerEmail?: string };

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Verify ownership
  const ownerEmail = session?.email ?? customerEmail;
  if (!ownerEmail || booking.customerEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Policy: must be PENDING or DRIVER_CONFIRMED, and pickup > 24h away
  const cancellableStatuses = ['PENDING', 'DRIVER_CONFIRMED'];
  if (!cancellableStatuses.includes(booking.currentStatus)) {
    return NextResponse.json({ error: 'This booking cannot be cancelled at its current status.' }, { status: 400 });
  }

  const hoursUntilPickup = (new Date(booking.pickupDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilPickup < 24) {
    return NextResponse.json({ error: 'Cancellations must be made at least 24 hours before pickup.' }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { currentStatus: 'CANCELLED', updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: 'Booking cancelled successfully.' });
}
