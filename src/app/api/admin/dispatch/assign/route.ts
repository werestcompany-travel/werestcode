export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { bookingId, driverId } = body as { bookingId: string; driverId: string };

    if (!bookingId || !driverId) {
      return NextResponse.json(
        { error: 'bookingId and driverId are required' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          driverId: driver.id,
          driverName: driver.name,
          currentStatus: 'DRIVER_CONFIRMED',
        },
      }),
      prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          status: 'DRIVER_CONFIRMED',
          note: `Manually assigned by ${admin.name}`,
          updatedBy: `admin:${admin.name}`,
        },
      }),
    ]);

    return NextResponse.json({ booking: updatedBooking });
  } catch (err) {
    console.error('[admin/dispatch/assign] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
