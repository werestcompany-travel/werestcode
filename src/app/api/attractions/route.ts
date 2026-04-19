import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const attractions = await db.attractionListing.findMany({
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
