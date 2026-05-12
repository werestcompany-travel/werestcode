export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// PATCH — approve/reject (publish/unpublish) + add admin notes
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { isPublished?: boolean; adminNotes?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      ...(body.adminNotes  !== undefined ? { adminNotes:  body.adminNotes  } : {}),
    },
  });

  return NextResponse.json({ review: updated });
}

// DELETE — permanently remove a review
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
