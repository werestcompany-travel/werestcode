import { ImageResponse } from 'next/og';
import { getTourBySlug } from '@/lib/tours';

export const runtime = 'edge';
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

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug);
  return [{ id: params.slug, alt: tour ? `${tour.title} — Werest Tours` : 'Werest Tours Thailand' }];
}

export default function Image({ params }: { params: { slug: string } }) {
  const tour = getTourBySlug(params.slug);

  if (!tour) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: '#0d1266', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 48, fontWeight: 800 }}>Werest Tours</span>
        </div>
      ),
      { ...size },
    );
  }

  const priceFrom = Math.min(...tour.options.map(o => o.pricePerPerson));
  const accentColor = CATEGORY_COLOR[tour.category] ?? '#2534ff';
  const stars = '★'.repeat(Math.round(tour.rating)) + '☆'.repeat(5 - Math.round(tour.rating));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0d1266',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent stripe on left */}
        <div style={{ width: 12, height: '100%', background: accentColor, flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 64px',
            position: 'relative',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `${accentColor}22`,
            }}
          />

          {/* Logo + category badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: '#2534ff',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                W
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#a5abff' }}>Werest Tours</span>
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

          {/* Tour title */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-1px',
                marginBottom: 16,
              }}
            >
              {tour.title}
            </div>
            <div style={{ fontSize: 24, color: '#a5abff', marginBottom: 28 }}>
              {tour.subtitle}
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#fbbf24', fontSize: 22 }}>{stars}</span>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{tour.rating.toFixed(1)}</span>
                <span style={{ color: '#7c85ff', fontSize: 18 }}>({tour.reviewCount} reviews)</span>
              </div>
              <div style={{ width: 1, height: 28, background: '#1825b8' }} />
              <span style={{ color: '#a5abff', fontSize: 20 }}>{tour.duration}</span>
              <div style={{ width: 1, height: 28, background: '#1825b8' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: '#7c85ff', fontSize: 18 }}>From</span>
                <span style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>฿{priceFrom.toLocaleString()}</span>
                <span style={{ color: '#7c85ff', fontSize: 18 }}>/person</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
