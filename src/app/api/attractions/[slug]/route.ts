import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const attraction = await prisma.attractionListing.findUnique({
      where: { slug: params.slug },
      include: { packages: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!attraction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: attraction });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
