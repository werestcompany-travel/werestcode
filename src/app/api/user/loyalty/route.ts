import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/db';
import { calcTier, nextTierInfo, TIER_META, TIER_THRESHOLDS } from '@/lib/loyalty';

export async function GET() {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.id },
    select: { loyaltyPoints: true, tierLevel: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const transactions = await prisma.loyaltyTransaction.findMany({
    where:   { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select:  { id: true, points: true, type: true, description: true, bookingRef: true, createdAt: true },
  });

  const tier      = calcTier(user.loyaltyPoints);
  const tierData  = TIER_META[tier];
  const { next, needed, progress } = nextTierInfo(user.loyaltyPoints);

  return NextResponse.json({
    points:       user.loyaltyPoints,
    tier,
    tierMeta:     tierData,
    nextTier:     next,
    nextTierMeta: next ? TIER_META[next] : null,
    needed,
    progress,
    thresholds:   TIER_THRESHOLDS,
    transactions,
  });
}
