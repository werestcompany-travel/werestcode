export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';
import { generateItinerary } from '@/lib/itinerary/ai-generator';
import type { ItineraryFormData } from '@/lib/itinerary/types';

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 });
  }

  try {
    const form = (await req.json()) as ItineraryFormData;

    if (!form.destination?.trim()) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const generated = await generateItinerary(form);
    return NextResponse.json({ success: true, data: generated });
  } catch (err) {
    console.error('[admin/itinerary/generate] POST error:', err);
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
  }
}
