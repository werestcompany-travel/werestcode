import { NextRequest, NextResponse } from 'next/server';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const rl = await rateLimitAsync(`places:${ip}`, { limit: 60, windowSec: 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const input   = req.nextUrl.searchParams.get('input') ?? '';
  const session = req.nextUrl.searchParams.get('sessiontoken') ?? '';
  const key     = process.env.GOOGLE_MAPS_SERVER_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  if (!input.trim()) return NextResponse.json({ predictions: [] });

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('key', key);
    url.searchParams.set('sessiontoken', session);
    url.searchParams.set('components', 'country:th'); // Thailand only
    url.searchParams.set('language', 'en');
    url.searchParams.set('types', 'geocode|establishment');

    const res  = await fetch(url.toString(), { next: { revalidate: 60 } });
    const data = await res.json() as { predictions: unknown[]; status: string };

    return NextResponse.json({ predictions: data.predictions ?? [], status: data.status });
  } catch {
    return NextResponse.json({ error: 'Places API error' }, { status: 500 });
  }
}
