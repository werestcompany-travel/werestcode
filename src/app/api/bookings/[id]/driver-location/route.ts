import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

// ─── GET /api/bookings/[id]/driver-location ───────────────────────────────────
// Public endpoint: customers poll this to see their driver's latest position.

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { driverId: true, currentStatus: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.driverId) {
      return NextResponse.json({ success: true, data: { available: false } });
    }

    const latest = await prisma.driverLocation.findFirst({
      where: {
        driverId: booking.driverId,
        bookingId: params.id,
      },
      orderBy: { createdAt: 'desc' },
      select: { lat: true, lng: true, heading: true, speed: true, createdAt: true },
    });

    if (!latest) {
      // Fall back to driver's current position if no bookingId-scoped entry yet
      const driver = await prisma.driver.findUnique({
        where: { id: booking.driverId },
        select: { currentLat: true, currentLng: true },
      });

      if (!driver?.currentLat || !driver?.currentLng) {
        return NextResponse.json({ success: true, data: { available: false } });
      }

      return NextResponse.json({
        success: true,
        data: {
          available: true,
          lat: driver.currentLat,
          lng: driver.currentLng,
          heading: null,
          speed: null,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        lat: latest.lat,
        lng: latest.lng,
        heading: latest.heading,
        speed: latest.speed,
        updatedAt: latest.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('[bookings/driver-location] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
