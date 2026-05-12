import type { Metadata } from 'next';
import InquiryPageClient from '@/components/inquiry/InquiryPageClient';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Group Tour Inquiry — Custom Thailand Tours | Werest Travel',
  description:
    'Plan your perfect group tour across Thailand. Tell us your dream itinerary — our local experts craft a personalised trip within 24 hours.',
  keywords: [
    'group tour Thailand', 'custom Thailand tour', 'private group travel Thailand',
    'Thailand itinerary planner', 'bespoke tour Thailand', 'group holiday Thailand',
    'Thailand travel agency', 'custom tour package Thailand',
  ],
  alternates: {
    canonical: 'https://www.werest.com/inquiry',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.werest.com/inquiry',
    title: 'Group Tour Inquiry — Custom Thailand Tours | Werest Travel',
    description:
      'Plan your perfect group tour across Thailand. Tell us your dream itinerary — our local experts craft a personalised trip within 24 hours.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Beautiful Thailand landscape — Werest Travel Group Tours',
      },
    ],
    siteName: 'Werest Travel',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Group Tour Inquiry — Custom Thailand Tours | Werest Travel',
    description:
      'Plan your perfect group tour across Thailand. Local experts craft a personalised itinerary within 24 hours.',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function InquiryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': 'https://www.werest.com/#organization',
        name: 'Werest Travel',
        url: 'https://www.werest.com',
        logo: 'https://www.werest.com/images/logo.png',
        description:
          'Premium travel agency in Thailand specialising in private transfers and custom group tours.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'TH',
          addressLocality: 'Bangkok',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Thai', 'Chinese'],
        },
        sameAs: ['https://www.werest.com'],
      },
      {
        '@type': 'Service',
        '@id': 'https://www.werest.com/inquiry#service',
        name: 'Custom Group Tour Planning',
        provider: { '@id': 'https://www.werest.com/#organization' },
        serviceType: 'Group Tour',
        areaServed: {
          '@type': 'Country',
          name: 'Thailand',
        },
        description:
          'Fully bespoke group tour packages across Thailand. Submit your itinerary preferences and receive a personalised plan within 24 hours from our local experts.',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
          description: 'Custom pricing based on group size, duration, and selected activities.',
        },
        url: 'https://www.werest.com/inquiry',
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.werest.com/inquiry#webpage',
        url: 'https://www.werest.com/inquiry',
        name: 'Group Tour Inquiry — Custom Thailand Tours | Werest Travel',
        description:
          'Plan your perfect group tour across Thailand. Tell us your dream itinerary — our local experts craft a personalised trip within 24 hours.',
        isPartOf: { '@id': 'https://www.werest.com/#organization' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.werest.com' },
            { '@type': 'ListItem', position: 2, name: 'Group Tour Inquiry', item: 'https://www.werest.com/inquiry' },
          ],
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="inquiry-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InquiryPageClient />
    </>
  );
}
