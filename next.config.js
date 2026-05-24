/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer must be treated as an external package so Next.js
  // doesn't try to bundle it (it uses Node.js-specific APIs like canvas/stream).
  // Note: in Next.js 15 this moves to top-level `serverExternalPackages`.
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'sanctuaryoftruthmuseum.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'www.toyota.co.th' },
      // Vercel Blob (production uploads)
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Service-Worker-Allowed', value: '/driver/' }],
      },
      {
        source: '/sw-customer.js',
        headers: [{ key: 'Service-Worker-Allowed', value: '/' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Restrict powerful features — no camera, mic, payment handled externally
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          {
            key: 'Content-Security-Policy',
            // NOTE: 'unsafe-inline'/'unsafe-eval' in script-src are required by:
            //   - Next.js App Router hydration scripts
            //   - Google Maps JS API
            // Removing them requires a nonce/hash strategy — tracked as a future hardening task.
            // All other directives are as strict as possible without breaking functionality.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // img-src: removed bare http: — only https, data URIs, and blobs allowed
              "img-src 'self' data: blob: https:",
              // connect-src: explicit allowlist — no wildcard
              [
                "connect-src 'self'",
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
                "https://graph.facebook.com",
                "https://api.resend.com",
                // Upstash Redis REST API (rate limiting)
                "https://*.upstash.io",
                // Chrome push relay
                "https://fcm.googleapis.com",
              ].join(' '),
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // Only enforce HTTPS upgrade in production
              ...(!isDev ? ["upgrade-insecure-requests"] : []),
            ].join('; '),
          },
          // HSTS only in production
          ...(!isDev ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;
