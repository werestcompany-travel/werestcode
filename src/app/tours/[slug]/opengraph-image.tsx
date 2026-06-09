import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY_COLOR: Record<string, string> = {
  'day-trip':  '#f59e0b',
  'cultural':  '#8b5cf6',
  'adventure': '#10b981',
  'food':      '#ef4444',
  'nature':    '#22c55e',
  'water':     '#06b6d4',
};

interface TourData {
  title: string;
  subtitle: string | null;
  location: string;
  duration: string;
  rating: number;
  reviewCount: number;
  category: string;
  badge: string | null;
  options: { pricePerPerson: number }[];
}

async function getTourData(slug: string): Promise<TourData | null> {
  // Try DB first
  try {
    const dbTour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        title: true,
        subtitle: true,
        location: true,
        duration: true,
        rating: true,
        reviewCount: true,
        category: true,
        badge: true,
        options: true,
      },
    });
    if (dbTour) {
      return {
        ...dbTour,
        options: (dbTour.options as unknown as { pricePerPerson: number }[]) ?? [],
      };
    }
  } catch {
    // DB error
  }

  return null;
}

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const tour = await getTourData(params.slug);
  return [{ id: params.slug, alt: tour ? `${tour.title} — Werest Travel` : 'Werest Travel Thailand' }];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const tour = await getTourData(params.slug);

  if (!tour) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #2534ff 0%, #1a26cc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span style={{ color: '#a5abff', fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>
            WEREST TRAVEL
          </span>
          <span style={{ color: '#fff', fontSize: 48, fontWeight: 800 }}>Thailand Tours & Experiences</span>
        </div>
      ),
      { ...size },
    );
  }

  const priceFrom = tour.options.length > 0
    ? Math.min(...tour.options.map(o => o.pricePerPerson))
    : 0;
  const accentColor = CATEGORY_COLOR[tour.category] ?? '#2534ff';
  const stars = '★'.repeat(Math.round(tour.rating)) + '☆'.repeat(5 - Math.round(tour.rating));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #2534ff 0%, #1a26cc 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `${accentColor}25`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Accent stripe */}
        <div style={{ width: 10, height: '100%', background: accentColor, flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 64px',
          }}
        >
          {/* Top: brand label + badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                W
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.75)', letterSpacing: 2 }}>
                WEREST TRAVEL
              </span>
            </div>
            {tour.badge && (
              <div
                style={{
                  padding: '8px 20px',
                  borderRadius: 50,
                  background: accentColor,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {tour.badge}
              </div>
            )}
          </div>

          {/* Tour title + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
            <div
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-1px',
                marginBottom: 14,
              }}
            >
              {tour.title}
            </div>
            {tour.subtitle && (
              <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.65)', marginBottom: 28 }}>
                {tour.subtitle}
              </div>
            )}

            {/* Bottom row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 16,
                padding: '16px 24px',
              }}
            >
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.85)', fontSize: 18 }}>
                <span style={{ fontSize: 20 }}>📍</span>
                {tour.location}
              </div>

              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />

              {/* Price */}
              {priceFrom > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>From</span>
                    <span style={{ color: '#fff', fontSize: 26, fontWeight: 900 }}>
                      ฿{priceFrom.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
                </>
              )}

              {/* Stars + rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#fbbf24', fontSize: 20 }}>{stars}</span>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{tour.rating.toFixed(1)}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
                  ({tour.reviewCount.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
