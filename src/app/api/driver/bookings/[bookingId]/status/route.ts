import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDriverToken, getDriverTokenFromRequest } from '@/lib/driver-auth';
import { BookingStatus } from '@/types';
import { STATUS_LABELS } from '@/lib/utils';
import { sendStatusUpdate } from '@/lib/whatsapp';

interface Params {
  params: { bookingId: string };
}

const DRIVER_ALLOWED_STATUSES: BookingStatus[] = [
  'DRIVER_STANDBY',
  'DRIVER_PICKED_UP',
  'COMPLETED',
];

// ─── PATCH /api/driver/bookings/[bookingId]/status ────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const raw = getDriverTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const driver = await verifyDriverToken(raw);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body as { status?: BookingStatus };

    if (!status || !DRIVER_ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Drivers may set: ${DRIVER_ALLOWED_STATUSES.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Verify the booking is assigned to this driver
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      select: {
        id: true,
        driverId: true,
        bookingRef: true,
        customerPhone: true,
        totalPrice: true,
        customerEmail: true,
        customerName: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (booking.driverId !== driver.id) {
      return NextResponse.json(
        { success: false, error: 'You are not assigned to this booking' },
        { status: 403 },
      );
    }

    const updated = await prisma.booking.update({
      where: { id: params.bookingId },
      data: {
        currentStatus: status,
        statusHistory: {
          create: {
            status,
            updatedBy: `driver:${driver.name}`,
          },
        },
      },
      select: { id: true, currentStatus: true },
    });

    // Notify customer via WhatsApp
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tracking?ref=${booking.bookingRef}`;
    sendStatusUpdate(
      booking.customerPhone,
      booking.bookingRef,
      STATUS_LABELS[status],
      trackingUrl,
    ).catch(console.error);

    // Post-trip automation on COMPLETED
    if (status === 'COMPLETED') {
      const { awardLoyaltyPoints, sendReviewRequest } = await import('@/lib/post-trip');
      awardLoyaltyPoints(
        booking.customerEmail,
        booking.totalPrice,
        booking.bookingRef,
        'transfer',
      ).catch(console.error);
      sendReviewRequest(
        booking.customerPhone,
        booking.customerName,
        booking.bookingRef,
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[driver/bookings/status] PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
