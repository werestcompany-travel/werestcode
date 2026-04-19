import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attractions = await prisma.attractionListing.findMany({
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ attractions });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { slug, name, location, category, rating, reviewCount, price, originalPrice, badge, gradient, emoji, href, isActive, sortOrder, featureImage } = body;

  if (!slug || !name || !location || !category || price == null)
    return NextResponse.json({ error: 'slug, name, location, category and price are required' }, { status: 400 });

  try {
    const attraction = await prisma.attractionListing.create({
      data: {
        slug: (slug as string).toLowerCase().trim().replace(/\s+/g, '-'),
        name, location, category,
        rating: rating ? Number(rating) : 4.5,
        reviewCount: reviewCount ?? '0',
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        badge: badge || null,
        gradient: gradient ?? 'from-brand-600 to-brand-400',
        emoji: emoji ?? '🎫',
        href: href ?? '#',
        isActive: isActive !== false,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        featureImage: featureImage || null,
      },
      include: { packages: true },
    });
    return NextResponse.json({ attraction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Slug already exists or save failed' }, { status: 409 });
  }
}
