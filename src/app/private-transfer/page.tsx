import type { Metadata } from 'next';
import Script from 'next/script';
import PrivateTransferClient from '@/components/home/PrivateTransferClient';

const SITE_URL = 'https://www.werest.com';

export const metadata: Metadata = {
  title: 'Private Transfer Thailand — Airport & City Transfers | Werest Travel',
  description:
    'Book fixed-price private transfers across Thailand. Airport pickups, city-to-city rides, and door-to-door service. Verified drivers, instant confirmation, free cancellation. Bangkok, Phuket, Chiang Mai & more.',
  keywords: [
    'private transfer Thailand',
    'Bangkok airport transfer',
    'Suvarnabhumi airport taxi',
    'Don Mueang airport transfer',
    'Phuket private transfer',
    'private car hire Thailand',
    'airport pickup Thailand',
    'point to point transfer Thailand',
    'door to door transfer Thailand',
  ],
  alternates: { canonical: `${SITE_URL}/private-transfer` },
  openGraph: {
    title: 'Private Transfer Thailand | Werest Travel',
    description: 'Fixed-price private transfers across Thailand. Verified drivers, no surge pricing, instant confirmation.',
    url: `${SITE_URL}/private-transfer`,
    siteName: 'Werest Travel',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Werest Travel — Private Transfers in Thailand' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Transfer Thailand | Werest Travel',
    description: 'Fixed-price private transfers across Thailand. Instant confirmation, free cancellation.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Private Transfer Thailand',
  provider: { '@type': 'Organization', name: 'Werest Travel', url: SITE_URL },
  description: 'Door-to-door private transfers across Thailand with verified drivers and fixed prices.',
  areaServed: { '@type': 'Country', name: 'Thailand' },
  serviceType: 'Private Transfer',
  url: `${SITE_URL}/private-transfer`,
};

export default function PrivateTransferPage() {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <>
      {mapsKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PrivateTransferClient />
    </>
  );
}
