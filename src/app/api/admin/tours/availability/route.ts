export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) return null;
  return admin;
}

// GET — list availability overrides for a tour slug
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tourSlug = searchParams.get('tourSlug');
  if (!tourSlug) return NextResponse.json({ error: 'tourSlug required' }, { status: 400 });

  const records = await prisma.tourAvailability.findMany({
    where: { tourSlug },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({ records });
}

// POST — create or upsert an availability override
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    tourSlug?: string;
    date?: string;
    optionId?: string;
    isBlocked?: boolean;
    maxCapacity?: number;
    note?: string;
  };

  const { tourSlug, date, optionId, isBlocked, maxCapacity, note } = body;
  if (!tourSlug || !date) return NextResponse.json({ error: 'tourSlug and date are required' }, { status: 400 });

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  // Find existing record first (optionId can be null)
  const existing = await prisma.tourAvailability.findFirst({
    where: { tourSlug, date: parsedDate, optionId: optionId ?? null },
  });

  const record = existing
    ? await prisma.tourAvailability.update({
        where: { id: existing.id },
        data: {
          isBlocked: isBlocked ?? false,
          maxCapacity: maxCapacity ?? 15,
          note: note ?? null,
        },
      })
    : await prisma.tourAvailability.create({
        data: {
          tourSlug,
          date: parsedDate,
          optionId: optionId ?? null,
          isBlocked: isBlocked ?? false,
          maxCapacity: maxCapacity ?? 15,
          note: note ?? null,
        },
      });

  return NextResponse.json({ success: true, record });
}

// PATCH — update an existing record by id
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    id?: string;
    isBlocked?: boolean;
    maxCapacity?: number;
    note?: string;
  };

  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const record = await prisma.tourAvailability.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json({ success: true, record });
}

// DELETE — remove an override by id
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.tourAvailability.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
