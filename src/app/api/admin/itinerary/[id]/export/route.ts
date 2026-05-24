export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { renderItineraryPDF } from '@/lib/itinerary/pdf-renderer';
import type { ItineraryRecord } from '@/lib/itinerary/types';

type Ctx = { params: { id: string } };

export async function POST(_: Request, { params }: Ctx) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const raw = await prisma.generatedItinerary.findUnique({ where: { id: params.id } });
    if (!raw) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cast JSON fields — Prisma returns Json as JsonValue, cast through unknown
    const itinerary: ItineraryRecord = {
      ...(raw as unknown as ItineraryRecord),
      highlights:   Array.isArray(raw.highlights)   ? (raw.highlights   as unknown as string[])                        : [],
      dayBlocks:    Array.isArray(raw.dayBlocks)     ? (raw.dayBlocks    as unknown as ItineraryRecord['dayBlocks'])    : [],
      inclusions:   Array.isArray(raw.inclusions)    ? (raw.inclusions   as unknown as string[])                        : [],
      exclusions:   Array.isArray(raw.exclusions)    ? (raw.exclusions   as unknown as string[])                        : [],
      pricingLines: Array.isArray(raw.pricingLines)  ? (raw.pricingLines as unknown as ItineraryRecord['pricingLines']) : [],
      startDate:    raw.startDate ? raw.startDate.toISOString() : null,
      endDate:      raw.endDate   ? raw.endDate.toISOString()   : null,
      createdAt:    raw.createdAt.toISOString(),
      updatedAt:    raw.updatedAt.toISOString(),
      exportedAt:   raw.exportedAt?.toISOString() ?? null,
      sentAt:       raw.sentAt?.toISOString()     ?? null,
    };

    const pdfBuffer = await renderItineraryPDF(itinerary);

    // Mark as exported
    await prisma.generatedItinerary.update({
      where: { id: params.id },
      data: { exportedAt: new Date() },
    });

    const filename = `werest-itinerary-${raw.ref}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error('[admin/itinerary/id/export] POST error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
