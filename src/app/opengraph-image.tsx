import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Werest — Private Transfers, Tours & Attraction Tickets in Thailand';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1266',
          padding: '64px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(37,52,255,0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(37,52,255,0.20)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'auto' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#2534ff',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 900,
              color: '#fff',
            }}
          >
            W
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Werest
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              marginBottom: 24,
            }}
          >
            Travel Thailand<br />
            <span style={{ color: '#7c85ff' }}>the easy way</span>
          </div>

          {/* Service pills */}
          <div style={{ display: 'flex', gap: 12 }}>
            {['Private Transfers', 'Guided Tours', 'Attraction Tickets'].map((s) => (
              <div
                key={s}
                style={{
                  padding: '10px 20px',
                  borderRadius: 50,
                  background: 'rgba(124,133,255,0.18)',
                  border: '1px solid rgba(124,133,255,0.4)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#a5abff',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
