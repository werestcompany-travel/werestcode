export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const preset = await prisma.itineraryPreset.findUnique({ where: { id: params.id } });
    if (!preset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: preset });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await prisma.itineraryPreset.update({
      where: { id: params.id },
      data: {
        name:         body.name,
        description:  body.description,
        category:     body.category,
        destinations: body.destinations,
        days:         body.days,
        dayBlocks:    body.dayBlocks,
        inclusions:   body.inclusions,
        exclusions:   body.exclusions,
        terms:        body.terms,
        tags:         body.tags,
        isActive:     body.isActive,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.itineraryPreset.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
