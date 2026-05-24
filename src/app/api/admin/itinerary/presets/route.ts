export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const presets = await prisma.itineraryPreset.findMany({
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: presets });
  } catch (err) {
    console.error('[admin/itinerary/presets] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const preset = await prisma.itineraryPreset.create({
      data: {
        name:         body.name.trim(),
        description:  body.description ?? null,
        category:     body.category    ?? 'general',
        destinations: body.destinations ?? [],
        days:         body.days        ?? 3,
        thumbnail:    body.thumbnail   ?? null,
        dayBlocks:    body.dayBlocks   ?? [],
        inclusions:   body.inclusions  ?? [],
        exclusions:   body.exclusions  ?? [],
        terms:        body.terms       ?? null,
        tags:         body.tags        ?? [],
        isActive:     body.isActive    ?? true,
      },
    });
    return NextResponse.json({ success: true, data: preset }, { status: 201 });
  } catch (err) {
    console.error('[admin/itinerary/presets] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
