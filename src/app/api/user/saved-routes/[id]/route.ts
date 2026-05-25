export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

// DELETE /api/user/saved-routes/[id] — remove a saved route
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const route = await prisma.savedRoute.findUnique({ where: { id: params.id } });
  if (!route) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (route.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.savedRoute.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/user/saved-routes/[id] — rename a saved route
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const route = await prisma.savedRoute.findUnique({ where: { id: params.id } });
  if (!route) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (route.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { label } = body;
  if (!label || typeof label !== 'string') {
    return NextResponse.json({ error: 'label is required' }, { status: 400 });
  }

  const updated = await prisma.savedRoute.update({
    where: { id: params.id },
    data: { label },
  });
  return NextResponse.json({ route: updated });
}
