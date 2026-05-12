export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

interface GuestItem {
  itemId: string;
  itemName: string;
  itemUrl?: string;
  itemType?: string;
  itemImage?: string;
}

export async function POST(req: NextRequest) {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const items: GuestItem[] = body?.items ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ merged: 0 });
  }

  let merged = 0;
  for (const item of items) {
    if (!item.itemId || !item.itemName) continue;
    try {
      await prisma.wishlistItem.upsert({
        where: {
          userId_attractionId: { userId: session.id, attractionId: item.itemId },
        },
        create: {
          userId:         session.id,
          attractionId:   item.itemId,
          attractionName: item.itemName,
          attractionUrl:  item.itemUrl ?? null,
          itemType:       item.itemType ?? 'attraction',
          itemImage:      item.itemImage ?? null,
        },
        update: {},
      });
      merged++;
    } catch {
      // Skip duplicates or bad data silently
    }
  }

  return NextResponse.json({ merged });
}
