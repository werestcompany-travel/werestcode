import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.id },
    select: { loyaltyPoints: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const transactions = await prisma.loyaltyTransaction.findMany({
    where:   { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select:  { id: true, points: true, type: true, description: true, bookingRef: true, createdAt: true },
  });

  return NextResponse.json({
    points:       user.loyaltyPoints,
    transactions,
  });
}
