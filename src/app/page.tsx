import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from '@/components/home/HomePageClient';
import { type BlogPostSummary } from '@/lib/blog';

const SITE_URL_HOME = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function fetchLatestPosts(): Promise<BlogPostSummary[]> {
  try {
    const res = await fetch(`${SITE_URL_HOME}/api/blog?limit=5`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.posts ?? [];
  } catch {
    return [];
  }
}

/* ── Site URL — update when domain is confirmed ── */
const SITE_URL = 'https://www.werest.com';

/* ── Page-level metadata ──────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Private Transfers & Day Trips in Thailand | Werest Travel',
  description:
    'Book fixed-price private airport transfers, day trips, and tours across Thailand. Verified drivers, instant confirmation, free cancellation. Bangkok, Phuket, Chiang Mai & more.',
  keywords: [
    'private transfer Thailand',
    'Bangkok airport transfer',
    'Suvarnabhumi airport taxi',
    'Don Mueang airport transfer',
    'Phuket private transfer',
    'Chiang Mai day trip',
    'Bangkok to Pattaya transfer',
    'Thailand private car hire',
    'Thailand tour booking',
    'airport pickup Thailand',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Private Transfers & Day Trips in Thailand | Werest Travel',
    description:
      'Fixed-price private transfers and curated day trips across Thailand. Verified drivers, no surge pricing, instant confirmation.',
    url: SITE_URL,
    siteName: 'Werest Travel',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Werest Travel — Private Transfers & Day Trips in Thailand',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private Transfers & Day Trips in Thailand | Werest Travel',
    description:
      'Fixed-price private transfers and curated day trips across Thailand. Instant confirmation, free cancellation.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/* ── JSON-LD structured data ──────────────────────────────────────────────── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    /* Organisation */
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Werest Travel',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Thai', 'Chinese'],
        },
      ],
      areaServed: { '@type': 'Country', name: 'Thailand' },
      description:
        'Premium private transfers, day trips, and tours across Thailand with professional drivers and fixed prices.',
      sameAs: [],
    },
    /* Travel agency / local business */
    {
      '@type': ['TravelAgency', 'LocalBusiness'],
      '@id': `${SITE_URL}/#business`,
      name: 'Werest Travel',
      url: SITE_URL,
      description:
        'Book private airport transfers, day trips, and curated tours across Thailand. Fixed prices, instant confirmation, verified professional drivers.',
      priceRange: '฿฿',
      currenciesAccepted: 'THB, USD, EUR, GBP',
      paymentAccepted: 'Cash, Bank Transfer',
      areaServed: { '@type': 'Country', name: 'Thailand' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2000',
        bestRating: '5',
        worstRating: '1',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Transfer & Tour Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private Airport Transfer'  } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'City to City Transfer'     } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Day Trip & Tour Packages'  } },
        ],
      },
    },
    /* Website with SearchAction */
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Werest Travel',
      description: 'Private transfers and day trips in Thailand',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/results?pickup_address={pickup}&dropoff_address={dropoff}`,
        },
        'query-input': 'required name=pickup required name=dropoff',
      },
    },
    /* FAQPage */
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How will I find my driver at the airport?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your driver will be waiting in the arrivals hall holding a name sign with your name on it. You will receive full driver details (name, photo, phone, vehicle plate) 24 hours before pickup.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if my flight is delayed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time at no extra cost. No need to call or message us.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel or change my booking?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — free cancellation and rescheduling up to 24 hours before your scheduled pickup. Changes within 24 hours are subject to availability.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is payment required at the time of booking?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No payment is needed when you book. You pay the driver directly on the day of transfer in cash (Thai Baht) or via bank transfer.',
          },
        },
        {
          '@type': 'Question',
          name: 'What vehicle types are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer Sedan (up to 3 passengers), SUV (up to 6 passengers), and Minivan (up to 10 passengers). All vehicles are air-conditioned and include complimentary water.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you cover routes outside Bangkok?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — we cover all major airports and cities across Thailand including Phuket, Chiang Mai, Koh Samui, Krabi, Pattaya, Hua Hin, and more.',
          },
        },
      ],
    },
  ],
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function Page() {
  const mapsKey     = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const latestPosts = await fetchLatestPosts();

  return (
    <>
      {/* Google Maps — load only if key is present */}
      {mapsKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      )}

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomePageClient latestPosts={latestPosts} />
    </>
  );
}
