import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attraction = await prisma.attractionListing.findUnique({
    where: { id: params.id },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!attraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ attraction });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  const updated = await prisma.attractionListing.update({
    where: { id: params.id },
    data: {
      ...(b.name          && { name: b.name }),
      ...(b.slug          && { slug: (b.slug as string).toLowerCase().trim() }),
      ...(b.location      && { location: b.location }),
      ...(b.category      && { category: b.category }),
      ...(b.rating  != null && { rating: Number(b.rating) }),
      ...(b.reviewCount   && { reviewCount: b.reviewCount }),
      ...(b.price   != null && { price: Number(b.price) }),
      ...(b.originalPrice !== undefined && { originalPrice: b.originalPrice ? Number(b.originalPrice) : null }),
      ...(b.badge !== undefined && { badge: b.badge || null }),
      ...(b.gradient      && { gradient: b.gradient }),
      ...(b.emoji         && { emoji: b.emoji }),
      ...(b.href          && { href: b.href }),
      ...(b.isActive !== undefined && { isActive: b.isActive }),
      ...(b.sortOrder != null && { sortOrder: Number(b.sortOrder) }),
      // Rich content fields
      ...(b.overview      !== undefined && { overview: b.overview || null }),
      ...(b.highlights    !== undefined && { highlights: b.highlights }),
      ...(b.included      !== undefined && { included: b.included }),
      ...(b.excluded      !== undefined && { excluded: b.excluded }),
      ...(b.expectSteps   !== undefined && { expectSteps: b.expectSteps }),
      ...(b.faqs          !== undefined && { faqs: b.faqs }),
      ...(b.gallery       !== undefined && { gallery: b.gallery }),
      ...(b.infoItems     !== undefined && { infoItems: b.infoItems }),
      ...(b.featureImage  !== undefined && { featureImage: b.featureImage || null }),
    },
    include: { packages: { orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json({ attraction: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.attractionListing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
