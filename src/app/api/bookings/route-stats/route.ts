export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/bookings/route-stats?from=Bangkok&to=Pattaya
// Returns booking count for a given route in the last 30 days.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? '';
  const to   = searchParams.get('to')   ?? '';

  if (!from || !to) {
    return NextResponse.json({ count: 0, route: '' });
  }

  try {
    const { prisma } = await import('@/lib/db');
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const count = await prisma.booking.count({
      where: {
        createdAt: { gte: since },
        currentStatus: { not: 'CANCELLED' },
        pickupAddress:  { contains: from, mode: 'insensitive' },
        dropoffAddress: { contains: to,   mode: 'insensitive' },
      },
    });

    // Don't show misleadingly low numbers
    return NextResponse.json({ count: count >= 10 ? count : 0, route: `${from} → ${to}` });
  } catch {
    return NextResponse.json({ count: 0, route: `${from} → ${to}` });
  }
}
