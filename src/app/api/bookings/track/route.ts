import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // Rate limit: 30 lookups per 5 minutes per IP — prevents enumeration of booking refs
  const ip = getIP(req);
  const rl = await rateLimitAsync(`track:${ip}`, LIMITS.track);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) return NextResponse.json({ success: false, error: 'ref required' }, { status: 400 });

  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: ref.toUpperCase() },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
        bookingAddOns: { include: { addOn: true } },
      },
    });

    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error('[track] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
