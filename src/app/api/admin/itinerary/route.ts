export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateItineraryRef } from '@/lib/itinerary/types';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const itineraries = await prisma.generatedItinerary.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, ref: true, title: true, subtitle: true,
        clientName: true, clientEmail: true, destination: true, destinations: true,
        startDate: true, endDate: true, travelers: true, hotelCategory: true,
        language: true, status: true, totalPrice: true, currency: true,
        exportedAt: true, sentAt: true, createdAt: true, updatedAt: true,
      },
    });

    const stats = {
      total:     itineraries.length,
      draft:     itineraries.filter(i => i.status === 'draft').length,
      finalized: itineraries.filter(i => i.status === 'finalized').length,
      sent:      itineraries.filter(i => i.status === 'sent').length,
      thisMonth: itineraries.filter(i => {
        const d = new Date(i.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };

    return NextResponse.json({ success: true, data: itineraries, stats });
  } catch (err) {
    console.error('[admin/itinerary] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();

    // Ensure unique ref
    let ref = generateItineraryRef();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.generatedItinerary.findUnique({ where: { ref } });
      if (!existing) break;
      ref = generateItineraryRef();
      attempts++;
    }

    const itinerary = await prisma.generatedItinerary.create({
      data: {
        ref,
        title:          body.title          ?? 'Untitled Itinerary',
        subtitle:       body.subtitle        ?? null,
        clientName:     body.clientName      ?? null,
        clientEmail:    body.clientEmail     ?? null,
        destination:    body.destination     ?? '',
        destinations:   body.destinations    ?? [],
        startDate:      body.startDate       ? new Date(body.startDate) : null,
        endDate:        body.endDate         ? new Date(body.endDate)   : null,
        travelers:      body.travelers       ?? 2,
        hotelCategory:  body.hotelCategory   ?? 'standard',
        language:       body.language        ?? 'en',
        status:         body.status          ?? 'draft',
        overview:       body.overview        ?? null,
        highlights:     body.highlights      ?? [],
        dayBlocks:      body.dayBlocks       ?? [],
        inclusions:     body.inclusions      ?? [],
        exclusions:     body.exclusions      ?? [],
        terms:          body.terms           ?? null,
        importantNotes: body.importantNotes  ?? null,
        pricingLines:   body.pricingLines    ?? [],
        totalPrice:     body.totalPrice      ?? null,
        currency:       body.currency        ?? 'THB',
        presetId:       body.presetId        ?? null,
        aiPromptUsed:   body.aiPromptUsed    ?? null,
        adminNotes:     body.adminNotes      ?? null,
      },
    });

    return NextResponse.json({ success: true, data: itinerary }, { status: 201 });
  } catch (err) {
    console.error('[admin/itinerary] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
