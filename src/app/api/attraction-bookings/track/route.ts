import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('ref');
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 });

  const booking = await prisma.attractionBooking.findUnique({ where: { bookingRef: ref.toUpperCase() } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

  return NextResponse.json({ booking });
}
