export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { name:  { contains: q, mode: 'insensitive' } },
      ],
    } : undefined,
    select: { id: true, email: true, name: true, phone: true, loyaltyPoints: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const total = await prisma.user.count();
  return NextResponse.json({ success: true, users, stats: { total } });
}
