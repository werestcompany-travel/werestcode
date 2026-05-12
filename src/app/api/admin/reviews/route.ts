export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// GET — list all reviews (with optional filter)
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'pending' | 'published' | 'all'
  const entityType = searchParams.get('entityType');

  const reviews = await prisma.review.findMany({
    where: {
      ...(status === 'pending'   ? { isPublished: false } : {}),
      ...(status === 'published' ? { isPublished: true  } : {}),
      ...(entityType ? { entityType: entityType as 'TOUR' | 'ATTRACTION' | 'TRANSFER' } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reviews });
}
