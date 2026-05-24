export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// PATCH — update status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const booking = await prisma.attractionBooking.update({
    where: { id: params.id },
    data: { status },
  });

  // Post-trip automation on CONFIRMED (final positive state for attraction bookings)
  if (status === 'CONFIRMED') {
    const { awardLoyaltyPoints, sendReviewRequest } = await import('@/lib/post-trip');
    awardLoyaltyPoints(booking.customerEmail, booking.totalPrice, booking.bookingRef, 'attraction').catch(console.error);
    sendReviewRequest(booking.customerPhone, booking.customerName, booking.bookingRef).catch(console.error);
  }

  return NextResponse.json({ booking });
}

// DELETE — remove booking
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.attractionBooking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
