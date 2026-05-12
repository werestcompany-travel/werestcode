import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const attractions = await prisma.attractionListing.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true, slug: true, name: true, location: true, category: true,
      rating: true, reviewCount: true, price: true, originalPrice: true,
      badge: true, gradient: true, emoji: true, href: true, featureImage: true,
    },
  });
  return NextResponse.json({ attractions });
}
