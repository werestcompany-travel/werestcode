import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey  = process.env.GOOGLE_MAPS_SERVER_API_KEY; // already exists

  if (!placeId || !apiKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 404 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&key=${apiKey}&language=en&reviews_sort=newest`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const place = data.result;
    return NextResponse.json({
      rating: place.rating ?? 0,
      totalReviews: place.user_ratings_total ?? 0,
      reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      reviews: (place.reviews ?? []).slice(0, 5).map((r: {
        author_name: string;
        profile_photo_url?: string;
        rating: number;
        text: string;
        relative_time_description: string;
        author_url?: string;
      }) => ({
        authorName: r.author_name,
        authorPhoto: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        timeDescription: r.relative_time_description,
        profileUrl: r.author_url,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
