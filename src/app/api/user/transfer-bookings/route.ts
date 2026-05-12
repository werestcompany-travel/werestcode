import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { customerEmail: session.email },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      bookingRef: true,
      currentStatus: true,
      pickupAddress: true,
      dropoffAddress: true,
      pickupDate: true,
      pickupTime: true,
      totalPrice: true,
      passengers: true,
      vehicleType: true,
      customerName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ bookings });
}
