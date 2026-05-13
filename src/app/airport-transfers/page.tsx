import type { Metadata } from 'next';
import AirportTransfersClient from '@/components/airport-transfers/AirportTransfersClient';

export const metadata: Metadata = {
  title: 'Airport Transfers Thailand — Fixed Price, No Surprises | Werest',
  description:
    'Book fixed-price private airport transfers across Thailand. Professional drivers, meet & greet at arrivals, free flight tracking, and free cancellation. Bangkok, Phuket, Pattaya, Chiang Mai & more.',
  alternates: { canonical: 'https://www.werest.com/airport-transfers' },
  keywords: [
    'airport transfer Thailand',
    'Bangkok airport transfer',
    'Suvarnabhumi airport taxi',
    'Don Mueang airport transfer',
    'Phuket airport transfer',
    'private airport transfer Thailand',
    'airport pickup Thailand',
    'fixed price airport taxi Thailand',
  ],
  openGraph: {
    type: 'website',
    title: 'Airport Transfers Thailand — Fixed Price, No Surprises | Werest',
    description:
      'Fixed-price private airport transfers with verified drivers. Instant confirmation, free cancellation, 24/7 support.',
    url: 'https://www.werest.com/airport-transfers',
    images: [
      {
        url: 'https://www.werest.com/images/og-airport-transfers.jpg',
        width: 1200,
        height: 630,
        alt: 'Werest Private Airport Transfers Thailand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airport Transfers Thailand — Fixed Price | Werest',
    description:
      'Book private airport transfers across Thailand. Fixed price, verified drivers, free cancellation.',
  },
};

export default function AirportTransfersPage() {
  return <AirportTransfersClient />;
}
