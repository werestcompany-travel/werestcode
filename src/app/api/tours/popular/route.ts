import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 3600;

export async function GET() {
  try {
    const dbTours = await prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
      take: 3,
      select: {
        slug: true,
        title: true,
        location: true,
        rating: true,
        reviewCount: true,
        duration: true,
        maxGroupSize: true,
        images: true,
        badge: true,
        options: true,
      },
    });

    return NextResponse.json({ tours: dbTours });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
