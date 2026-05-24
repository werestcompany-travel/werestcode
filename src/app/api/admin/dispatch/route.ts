export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Unassigned PENDING bookings
    const unassigned = await prisma.booking.findMany({
      where: {
        driverId: null,
        currentStatus: 'PENDING',
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        bookingAddOns: { include: { addOn: true } },
      },
      orderBy: [{ pickupDate: 'asc' }, { pickupTime: 'asc' }],
    });

    // Assigned bookings (has driver, not completed/cancelled)
    const assigned = await prisma.booking.findMany({
      where: {
        driverId: { not: null },
        currentStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      include: {
        driver: {
          include: { vehicles: { where: { isActive: true } } },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        bookingAddOns: { include: { addOn: true } },
      },
      orderBy: [{ pickupDate: 'asc' }, { pickupTime: 'asc' }],
    });

    // All active drivers with their active bookings today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        vehicles: { where: { isActive: true } },
        bookings: {
          where: {
            pickupDate: { gte: today, lt: tomorrow },
            currentStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          select: {
            id: true,
            bookingRef: true,
            pickupAddress: true,
            dropoffAddress: true,
            pickupDate: true,
            pickupTime: true,
            currentStatus: true,
          },
        },
      },
      orderBy: [{ isOnline: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ unassigned, assigned, drivers });
  } catch (err) {
    console.error('[admin/dispatch] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
