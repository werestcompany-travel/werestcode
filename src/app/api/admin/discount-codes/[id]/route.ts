import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.discountCode.update({
    where: { id: params.id },
    data: {
      ...(body.code       && { code: (body.code as string).toUpperCase().trim() }),
      ...(body.type       && { type: body.type }),
      ...(body.value != null && { value: Number(body.value) }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount ? Number(body.minOrderAmount) : null }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses ? Number(body.maxUses) : null }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.newUserOnly !== undefined && { newUserOnly: body.newUserOnly === true }),
      ...(body.perUserLimit !== undefined && { perUserLimit: body.perUserLimit ? Number(body.perUserLimit) : null }),
    },
  });
  return NextResponse.json({ discount: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.discountCode.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
