import type { Metadata } from 'next';
import HourlyPageClient from '@/components/hourly/HourlyPageClient';

export const metadata: Metadata = {
  title: 'Private Transfers in Thailand | Fixed Price, No Surprises | Werest Travel',
  description:
    'Book fixed-price private transfers across Thailand. Airport pickups, city-to-city rides, and port transfers with verified English-speaking drivers. Instant confirmation, free cancellation.',
  alternates: { canonical: 'https://gowerest.com/transfers' },
};

export default function TransfersPage() {
  return <HourlyPageClient defaultTab="transfers" />;
}
