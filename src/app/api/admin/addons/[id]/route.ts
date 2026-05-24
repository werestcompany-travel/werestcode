export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const addon = await prisma.addOn.update({
    where: { id: params.id },
    data: {
      ...(body.name        !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price       !== undefined && { price: Number(body.price) }),
      ...(body.icon        !== undefined && { icon: body.icon || null }),
      ...(body.isActive    !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json({ success: true, addon });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.addOn.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
