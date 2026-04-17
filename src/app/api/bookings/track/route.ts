import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) return NextResponse.json({ success: false, error: 'ref required' }, { status: 400 });

  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: ref.toUpperCase() },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
        bookingAddOns: { include: { addOn: true } },
      },
    });

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error('[track] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
