export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const itinerary = await prisma.generatedItinerary.findUnique({ where: { id: params.id } });
    if (!itinerary) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: itinerary });
  } catch (err) {
    console.error('[admin/itinerary/id] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    const fields = [
      'title', 'subtitle', 'clientName', 'clientEmail', 'destination',
      'destinations', 'travelers', 'hotelCategory', 'language', 'status',
      'overview', 'highlights', 'dayBlocks', 'inclusions', 'exclusions',
      'terms', 'importantNotes', 'pricingLines', 'totalPrice', 'currency',
      'presetId', 'adminNotes',
    ];

    for (const f of fields) {
      if (f in body) data[f] = body[f];
    }

    if ('startDate' in body) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if ('endDate'   in body) data.endDate   = body.endDate   ? new Date(body.endDate)   : null;
    if ('exportedAt' in body) data.exportedAt = body.exportedAt ? new Date(body.exportedAt) : null;
    if ('sentAt'     in body) data.sentAt     = body.sentAt     ? new Date(body.sentAt)     : null;

    const updated = await prisma.generatedItinerary.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[admin/itinerary/id] PATCH error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.generatedItinerary.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/itinerary/id] DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
