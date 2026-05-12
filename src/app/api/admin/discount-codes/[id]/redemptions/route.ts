import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const redemptions = await prisma.discountRedemption.findMany({
    where: { discountCodeId: params.id },
    orderBy: { usedAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ redemptions });
}
