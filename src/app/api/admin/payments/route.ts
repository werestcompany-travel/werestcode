export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const transactions = await prisma.paymentTransaction.findMany({
    where: status ? { status } : undefined,
    include: {
      booking: { select: { bookingRef: true, customerName: true } },
      attractionBooking: { select: { bookingRef: true, customerName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const total  = await prisma.paymentTransaction.count();
  const paid   = await prisma.paymentTransaction.count({ where: { status: 'PAID' } });
  const failed = await prisma.paymentTransaction.count({ where: { status: 'FAILED' } });
  const revenue = await prisma.paymentTransaction.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } });
  return NextResponse.json({ success: true, transactions, stats: { total, paid, failed, revenue: revenue._sum.amount ?? 0 } });
}
