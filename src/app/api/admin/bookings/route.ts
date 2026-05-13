export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        bookingRef:     true,
        customerName:   true,
        customerPhone:  true,
        pickupAddress:  true,
        dropoffAddress: true,
        pickupDate:     true,
        pickupTime:     true,
        vehicleType:    true,
        totalPrice:     true,
        currentStatus:  true,
        createdAt:      true,
      },
    });

    // Aggregate stats
    type BookingRow = { currentStatus: string; totalPrice: number };
    const total     = bookings.length;
    const pending   = bookings.filter((b: BookingRow) => b.currentStatus === 'PENDING').length;
    const active    = bookings.filter((b: BookingRow) =>
      ['DRIVER_CONFIRMED', 'DRIVER_STANDBY', 'DRIVER_PICKED_UP'].includes(b.currentStatus),
    ).length;
    const completed = bookings.filter((b: BookingRow) => b.currentStatus === 'COMPLETED').length;
    const revenue   = bookings
      .filter((b: BookingRow) => b.currentStatus !== 'CANCELLED')
      .reduce((sum: number, b: BookingRow) => sum + b.totalPrice, 0);

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        stats: { total, pending, active, completed, revenue },
      },
    });
  } catch (err) {
    console.error('[admin/bookings] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
