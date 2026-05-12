export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

// GET /api/user/wishlist — list the current user's wishlist
export async function GET() {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ items: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ items });
}

// POST /api/user/wishlist — add item
export async function POST(req: NextRequest) {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { attractionId, attractionName, attractionUrl } = await req.json();
  if (!attractionId || !attractionName) {
    return NextResponse.json({ error: 'attractionId and attractionName required' }, { status: 400 });
  }

  const item = await prisma.wishlistItem.upsert({
    where: { userId_attractionId: { userId: session.id, attractionId } },
    create: { userId: session.id, attractionId, attractionName, attractionUrl },
    update: {},
  });
  return NextResponse.json({ item });
}

// DELETE /api/user/wishlist?attractionId=xxx — remove item
export async function DELETE(req: NextRequest) {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const attractionId = searchParams.get('attractionId');
  if (!attractionId) {
    return NextResponse.json({ error: 'attractionId required' }, { status: 400 });
  }

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.id, attractionId },
  });
  return NextResponse.json({ ok: true });
}
