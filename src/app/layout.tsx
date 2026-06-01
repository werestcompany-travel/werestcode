import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { Plus_Jakarta_Sans, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

// Plus Jakarta Sans — Uber Move-style geometric grotesque
const inter = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-thai',
  display: 'swap',
});
// Noto Sans SC loaded via <link> in metadata (next/font doesn't support chinese-simplified subset)
const notoSansSCVariable = '--font-noto-sc';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import { LocaleProvider } from '@/context/LocaleContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import FloatingWidgets from '@/components/FloatingWidgets';
import CookieConsent from '@/components/CookieConsent';
import { ChatProvider } from '@/context/ChatContext';

const GA_ID    = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/* ── Base metadata — page-level exports override these ───────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL('https://www.werest.com'),
  title: {
    default:  'Werest Travel — Private Transfers & Day Trips in Thailand',
    template: '%s | Werest Travel',
  },
  description:
    'Book fixed-price transfers, attraction tickets and tours across Thailand. Verified drivers, instant confirmation, free cancellation. Bangkok, Phuket and more.',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/blog/feed.xml', title: 'Werest Travel Blog' }],
    },
  },
};

/* ── Root layout ──────────────────────────────────────────────────────────── */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read nonce injected by middleware for nonce-based CSP
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? ''

  return (
    <html lang="en" className={`${inter.variable} ${notoSansThai.variable} ${notoSansSCVariable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#2534ff" />

        {/* LocalBusiness / TravelAgency JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['TravelAgency', 'LocalBusiness'],
              name: 'Werest Travel',
              description: 'Private transfers, day tours and attraction tickets across Thailand. Fixed prices, professional drivers, instant confirmation.',
              url: 'https://www.werest.com',
              logo: 'https://www.werest.com/icon-512.png',
              image: 'https://www.werest.com/og-default.jpg',
              telephone: '+66621871392',
              email: 'werestcompany@gmail.com',
              address: { '@type': 'PostalAddress', addressCountry: 'TH', addressRegion: 'Bangkok' },
              geo: { '@type': 'GeoCoordinates', latitude: '13.7563', longitude: '100.5018' },
              areaServed: { '@type': 'Country', name: 'Thailand' },
              openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                opens: '00:00',
                closes: '23:59',
              }],
              priceRange: '฿฿',
              currenciesAccepted: 'THB,USD,EUR,GBP',
              paymentAccepted: 'Credit Card, PromptPay, TrueMoney',
              sameAs: ['https://www.facebook.com/weresttravel', 'https://www.instagram.com/weresttravel'],
            }),
          }}
        />

        {/* DNS prefetch for external assets */}
        {/* Noto Sans SC — next/font doesn't support chinese-simplified subset */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#2534ff] text-white font-semibold px-4 py-2 rounded-lg z-50">
          Skip to main content
        </a>
        <LocaleProvider>
          <WishlistProvider>
            <AuthModalProvider>
              <ChatProvider>
                {children}
                <FloatingWidgets />
                <CookieConsent />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: { borderRadius: '12px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px' },
                  }}
                />
              </ChatProvider>
            </AuthModalProvider>
          </WishlistProvider>
        </LocaleProvider>

        {/* Vercel Analytics */}
        <Analytics />

        {/* PWA Service Worker — scoped per path */}
        <Script id="sw-register" strategy="afterInteractive" nonce={nonce}>
          {`
    if ('serviceWorker' in navigator) {
      var path = window.location.pathname;
      if (path.startsWith('/driver')) {
        navigator.serviceWorker.register('/sw.js', { scope: '/driver/' }).catch(function(){});
      } else {
        navigator.serviceWorker.register('/sw-customer.js', { scope: '/' }).catch(function(){});
      }
    }
  `}
        </Script>

        {/* GA4 — only loaded when NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
              nonce={nonce}
            />
            <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}

        {/* Meta Pixel — only loaded when NEXT_PUBLIC_META_PIXEL_ID is set */}
        {PIXEL_ID && (
          <>
            <Script id="meta-pixel" nonce={nonce} strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
