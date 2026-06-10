import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';

export async function GET(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as BookingStatus | null;

  try {
    const bookings = await prisma.charterBooking.findMany({
      where: status ? { currentStatus: status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 500, // bound payload — newest 500; add pagination params when volume requires
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('[admin/charter-bookings] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}
