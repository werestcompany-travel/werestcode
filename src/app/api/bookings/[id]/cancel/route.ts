import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.customerEmail !== session.email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (booking.currentStatus !== 'PENDING') {
    return NextResponse.json({ error: 'Only pending bookings can be cancelled.' }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { currentStatus: 'CANCELLED' },
  });

  return NextResponse.json({ success: true });
}
