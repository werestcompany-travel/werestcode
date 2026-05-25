import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY_COLORS: Record<string, { bg: string; label: string }> = {
  BANGKOK:  { bg: '#2534ff', label: 'Bangkok' },
  PATTAYA:  { bg: '#10b981', label: 'Pattaya' },
  THAILAND: { bg: '#ef4444', label: 'Thailand' },
  PHUKET:   { bg: '#8b5cf6', label: 'Phuket' },
  KRABI:    { bg: '#f59e0b', label: 'Krabi' },
};

interface PostData {
  title: string;
  excerpt: string | null;
  category: string;
  authorName: string;
}

async function getPostData(slug: string): Promise<PostData | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug, status: 'PUBLISHED' },
      select: {
        title: true,
        excerpt: true,
        category: true,
        authorName: true,
      },
    });
    return post ?? null;
  } catch {
    return null;
  }
}

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);
  return [{ id: params.slug, alt: post ? `${post.title} — Werest Travel Blog` : 'Werest Travel Blog' }];
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: 700, letterSpacing: 4 }}>
            WEREST TRAVEL
          </span>
          <span style={{ color: '#fff', fontSize: 48, fontWeight: 800 }}>Blog & Travel Guides</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22, marginTop: 8 }}>
            Read on Werest Travel Blog
          </span>
        </div>
      ),
      { ...size },
    );
  }

  const categoryInfo = CATEGORY_COLORS[post.category] ?? { bg: '#4f46e5', label: post.category };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: 300,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: `${categoryInfo.bg}30`,
          }}
        />

        {/* Accent stripe */}
        <div style={{ width: 10, height: '100%', background: categoryInfo.bg, flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 64px',
          }}
        >
          {/* Top: brand + category */}
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

            {/* Category pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 50,
                background: categoryInfo.bg,
                fontSize: 16,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              <span style={{ fontSize: 14, opacity: 0.85 }}>Blog:</span>
              {categoryInfo.label}
            </div>
          </div>

          {/* Article title */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.15,
                letterSpacing: '-1px',
                marginBottom: 20,
              }}
            >
              {post.title}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div
                style={{
                  fontSize: 20,
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.5,
                  marginBottom: 28,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.excerpt}
              </div>
            )}

            {/* Bottom row: author + tagline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 16,
                padding: '14px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: categoryInfo.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {post.authorName[0].toUpperCase()}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 600 }}>
                  By {post.authorName}
                </span>
              </div>

              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17 }}>
                Read on Werest Travel Blog
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
