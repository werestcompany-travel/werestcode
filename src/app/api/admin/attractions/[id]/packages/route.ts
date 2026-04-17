import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  const { name, adultPrice, childPrice, infantPrice, isActive, sortOrder,
          description, adultOriginal, childOriginal, popular, badge, includes } = b;
  if (!name || adultPrice == null)
    return NextResponse.json({ error: 'Name and adult price are required' }, { status: 400 });

  const pkg = await prisma.attractionPackage.create({
    data: {
      attractionId: params.id,
      name,
      description: description || null,
      adultPrice: Number(adultPrice),
      adultOriginal: adultOriginal ? Number(adultOriginal) : null,
      childPrice: childPrice ? Number(childPrice) : 0,
      childOriginal: childOriginal ? Number(childOriginal) : null,
      infantPrice: infantPrice ? Number(infantPrice) : 0,
      popular: popular === true,
      badge: badge || null,
      includes: includes ?? [],
      isActive: isActive !== false,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    },
  });
  return NextResponse.json({ package: pkg }, { status: 201 });
}
