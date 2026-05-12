export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = await db.attractionBooking.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ bookings });
}
