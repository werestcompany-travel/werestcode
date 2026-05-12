import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import { LocaleProvider } from '@/context/LocaleContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthModalProvider } from '@/context/AuthModalContext';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/* ── Base metadata — page-level exports override these ───────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL('https://www.werest.com'),
  title: {
    default:  'Werest Travel — Private Transfers & Day Trips in Thailand',
    template: '%s | Werest Travel',
  },
  description:
    'Book fixed-price private airport transfers, day trips, and attraction tickets across Thailand. Verified drivers, instant confirmation, free cancellation. Bangkok, Phuket, Chiang Mai & more.',
  keywords: [
    'Thailand transfer', 'private car hire Thailand', 'Bangkok airport transfer',
    'Phuket private transfer', 'Chiang Mai day trip', 'Thailand tour booking',
  ],
  applicationName: 'Werest Travel',
  authors: [{ name: 'Werest Travel', url: 'https://www.werest.com' }],
  creator: 'Werest Travel',
  publisher: 'Werest Travel',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    siteName:    'Werest Travel',
    type:        'website',
    locale:      'en_US',
    title:       'Werest Travel — Private Transfers & Day Trips in Thailand',
    description: 'Fixed-price private transfers and curated day trips across Thailand. Verified drivers, instant confirmation.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Werest Travel — Private Transfers & Day Trips in Thailand' }],
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Werest Travel — Private Transfers & Day Trips in Thailand',
    description: 'Fixed-price private transfers and curated day trips across Thailand.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon.ico',
    apple:       '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

/* ── Root layout ──────────────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2534ff" />

        {/* DNS prefetch for external assets */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* Google Fonts — Thai & Simplified Chinese support */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LocaleProvider>
          <WishlistProvider>
            <AuthModalProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                }}
              />
            </AuthModalProvider>
          </WishlistProvider>
        </LocaleProvider>

        {/* Vercel Analytics */}
        <Analytics />

        {/* GA4 — only loaded when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
