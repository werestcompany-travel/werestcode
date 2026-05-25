export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const bookingId   = searchParams.get('bookingId');
  const bookingType = searchParams.get('bookingType') || undefined;

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
  }

  const where: Record<string, unknown> = { bookingId };
  if (bookingType) where.bookingType = bookingType;

  const refunds = await prisma.refund.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, refunds });
}
