import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await prisma.tourBooking.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      bookingRef: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      tourTitle: true,
      optionLabel: true,
      bookingDate: true,
      adultQty: true,
      childQty: true,
      totalPrice: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ bookings });
}
