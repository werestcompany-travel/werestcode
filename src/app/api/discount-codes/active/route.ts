import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const now = new Date();

  const candidates = await prisma.discountCode.findMany({
    where: {
      isActive: true,
      newUserOnly: false,
      expiresAt: { gt: now },
    },
    select: {
      code: true,
      type: true,
      value: true,
      expiresAt: true,
      description: true,
      maxUses: true,
      usedCount: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const codes = candidates
    .filter((c) => c.maxUses == null || c.usedCount < c.maxUses)
    .map(({ maxUses: _m, usedCount: _u, ...rest }) => rest);

  return NextResponse.json({ codes });
}
