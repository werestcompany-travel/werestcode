export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const transactions = await prisma.loyaltyTransaction.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const totalEarned   = await prisma.loyaltyTransaction.aggregate({ where: { type: 'EARN' },   _sum: { points: true } });
  const totalRedeemed = await prisma.loyaltyTransaction.aggregate({ where: { type: 'REDEEM' }, _sum: { points: true } });
  return NextResponse.json({
    success: true,
    transactions,
    stats: {
      totalEarned:   totalEarned._sum.points   ?? 0,
      totalRedeemed: totalRedeemed._sum.points ?? 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId, points, description } = await req.json();
  if (!userId || !points || !description) {
    return NextResponse.json({ error: 'userId, points, description required' }, { status: 400 });
  }
  const [tx] = await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: { userId, points: Number(points), type: 'ADJUST', description },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: Number(points) } },
    }),
  ]);
  return NextResponse.json({ success: true, transaction: tx });
}
