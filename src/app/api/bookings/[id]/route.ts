import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
        bookingAddOns: { include: { addOn: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error('[bookings/:id] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
