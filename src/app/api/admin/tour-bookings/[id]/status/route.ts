export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { status?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { status } = body;
  const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING'];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const booking = await prisma.tourBooking.update({
      where: { id: params.id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            updatedBy: admin.name ?? 'Admin',
          },
        },
      },
    });

    // Post-trip automation on COMPLETED
    if (status === 'COMPLETED') {
      const { awardLoyaltyPoints, sendReviewRequest } = await import('@/lib/post-trip');
      awardLoyaltyPoints(booking.customerEmail, booking.totalPrice, booking.bookingRef, 'tour').catch(console.error);
      sendReviewRequest(booking.customerPhone, booking.customerName, booking.bookingRef).catch(console.error);
    }

    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: 'Booking not found or update failed' }, { status: 404 });
  }
}
