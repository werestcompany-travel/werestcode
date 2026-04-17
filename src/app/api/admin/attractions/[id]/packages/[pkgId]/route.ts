import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; pkgId: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  const updated = await prisma.attractionPackage.update({
    where: { id: params.pkgId },
    data: {
      ...(b.name            && { name: b.name }),
      ...(b.description     !== undefined && { description: b.description || null }),
      ...(b.adultPrice     != null && { adultPrice: Number(b.adultPrice) }),
      ...(b.adultOriginal  !== undefined && { adultOriginal: b.adultOriginal ? Number(b.adultOriginal) : null }),
      ...(b.childPrice     != null && { childPrice: Number(b.childPrice) }),
      ...(b.childOriginal  !== undefined && { childOriginal: b.childOriginal ? Number(b.childOriginal) : null }),
      ...(b.infantPrice    != null && { infantPrice: Number(b.infantPrice) }),
      ...(b.popular        !== undefined && { popular: b.popular }),
      ...(b.badge          !== undefined && { badge: b.badge || null }),
      ...(b.includes       !== undefined && { includes: b.includes }),
      ...(b.isActive       !== undefined && { isActive: b.isActive }),
      ...(b.sortOrder      != null && { sortOrder: Number(b.sortOrder) }),
    },
  });
  return NextResponse.json({ package: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; pkgId: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.attractionPackage.delete({ where: { id: params.pkgId } });
  return NextResponse.json({ success: true });
}
