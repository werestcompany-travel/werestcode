import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { BookingStatus } from '@/types';
import { STATUS_LABELS } from '@/lib/utils';
import { sendStatusUpdate } from '@/lib/whatsapp';

interface Params {
  params: { id: string };
}

const VALID_STATUSES: BookingStatus[] = [
  'PENDING', 'DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP', 'COMPLETED', 'CANCELLED',
];

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { status, note, updatedBy } = body as {
      status: BookingStatus;
      note?: string;
      updatedBy?: string;
    };

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        currentStatus: status,
        statusHistory: {
          create: {
            status,
            note:      note ?? null,
            updatedBy: updatedBy ?? 'admin',
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
        bookingAddOns: { include: { addOn: true } },
      },
    });

    // WhatsApp notification to customer
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tracking?ref=${booking.bookingRef}`;
    sendStatusUpdate(
      booking.customerPhone,
      booking.bookingRef,
      STATUS_LABELS[status],
      trackingUrl,
    ).catch(console.error);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[status] PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
