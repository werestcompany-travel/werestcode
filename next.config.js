/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

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
      // Vercel Blob (production uploads) — wildcard hostname removed; add explicit
      // blob store hostnames here as needed (e.g. '<store-id>.public.blob.vercel-storage.com')
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
          // NOTE: Content-Security-Policy is set per-request in middleware.ts with a
          // per-request nonce so that 'unsafe-inline' is no longer needed for scripts.
          // HSTS only in production
          ...(!isDev ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}, {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
});
