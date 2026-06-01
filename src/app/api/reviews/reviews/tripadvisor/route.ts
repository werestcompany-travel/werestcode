import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TA_LOCATION_ID = '32793839'; // d32793839 from the TripAdvisor URL
const TA_API_KEY = process.env.TRIPADVISOR_API_KEY;

export interface TAReview {
  id: string;
  rating: number;
  title: string;
  text: string;
  published_date: string;
  travel_date: string | null;
  trip_type: string | null;
  url: string;
  user: {
    username: string;
    user_location?: { name: string };
    avatar?: { thumbnail?: string; small?: string; medium?: string };
  };
}

export async function GET() {
  if (!TA_API_KEY) {
    return NextResponse.json(
      { error: 'TRIPADVISOR_API_KEY not configured', reviews: [] },
      { status: 503 }
    );
  }

  try {
    const url =
      `https://api.content.tripadvisor.com/api/v1/location/${TA_LOCATION_ID}/reviews` +
      `?language=en&key=${TA_API_KEY}`;

    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[TripAdvisor API] error', res.status, body);
      return NextResponse.json(
        { error: `TripAdvisor API returned ${res.status}`, reviews: [] },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reviews: TAReview[] = data?.data ?? [];

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    console.error('[TripAdvisor API] fetch failed', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', reviews: [] },
      { status: 500 }
    );
  }
}
