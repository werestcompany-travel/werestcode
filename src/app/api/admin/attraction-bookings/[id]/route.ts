import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// PATCH — update status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const booking = await db.attractionBooking.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json({ booking });
}

// DELETE — remove booking
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.attractionBooking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
