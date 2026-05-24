import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDriverToken, getDriverTokenFromRequest } from '@/lib/driver-auth';

// ─── GET /api/driver/bookings — today's bookings assigned to this driver ──────

export async function GET(req: NextRequest) {
  const raw = getDriverTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const driver = await verifyDriverToken(raw);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Today's date range in UTC (covers local Thai time generously)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        driverId: driver.id,
        pickupDate: {
          gte: todayStart,
          lte: todayEnd,
        },
        currentStatus: {
          notIn: ['CANCELLED'],
        },
      },
      orderBy: { pickupTime: 'asc' },
      select: {
        id: true,
        bookingRef: true,
        pickupAddress: true,
        dropoffAddress: true,
        pickupDate: true,
        pickupTime: true,
        passengers: true,
        vehicleType: true,
        customerName: true,
        customerPhone: true,
        currentStatus: true,
        specialNotes: true,
      },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error('[driver/bookings] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
