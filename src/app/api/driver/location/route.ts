import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDriverToken, getDriverTokenFromRequest } from '@/lib/driver-auth';

// ─── POST /api/driver/location ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
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
    const { bookingId, lat, lng, heading, speed } = body as {
      bookingId?: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { success: false, error: 'lat and lng (numbers) are required' },
        { status: 400 },
      );
    }

    // Save location history entry and update driver's current position in parallel
    await Promise.all([
      prisma.driverLocation.create({
        data: {
          driverId: driver.id,
          bookingId: bookingId ?? null,
          lat,
          lng,
          heading: heading ?? null,
          speed: speed ?? null,
        },
      }),
      prisma.driver.update({
        where: { id: driver.id },
        data: { currentLat: lat, currentLng: lng },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[driver/location] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
