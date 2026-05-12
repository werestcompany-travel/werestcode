import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { tours as staticTours } from '@/lib/tours';

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

    if (dbTours.length >= 3) {
      return NextResponse.json({ tours: dbTours });
    }
  } catch {
    // DB unavailable — fall through to static data
  }

  // Fallback to static data
  const fallback = staticTours
    .filter((t) => t.badge === 'Best Seller')
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3)
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      location: t.location,
      rating: t.rating,
      reviewCount: t.reviewCount,
      duration: t.duration,
      maxGroupSize: t.maxGroupSize,
      images: t.images,
      badge: t.badge ?? null,
      options: t.options,
    }));

  return NextResponse.json({ tours: fallback });
}
