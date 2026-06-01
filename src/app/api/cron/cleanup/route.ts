import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

  // Prune old driver location records
  let deletedLocations = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma as any).driverLocation.deleteMany({
      where: { updatedAt: { lt: cutoff } },
    });
    deletedLocations = result.count;
  } catch {
    // DriverLocation model may not exist
  }

  // Prune expired abandoned bookings (older than 7 days past expiry)
  let deletedAbandoned = 0;
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.abandonedBooking.deleteMany({
      where: { expiresAt: { lt: sevenDaysAgo } },
    });
    deletedAbandoned = result.count;
  } catch {
    // AbandonedBooking model may not exist
  }

  return NextResponse.json({
    ok: true,
    deletedDriverLocations: deletedLocations,
    deletedAbandonedBookings: deletedAbandoned,
    ts: new Date().toISOString(),
  });
}
