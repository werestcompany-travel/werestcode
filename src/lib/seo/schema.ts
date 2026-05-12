const SITE = 'https://www.werest.com';

// ─── Tour product ──────────────────────────────────────────────────────────────

export function tourProductSchema(tour: {
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  duration: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  highlights: string[];
  includes: string[];
  options: { pricePerPerson: number }[];
  reviews: { name: string; country: string; rating: number; date: string; text: string }[];
}) {
  const minPrice = Math.min(...tour.options.map(o => o.pricePerPerson));
  const url = `${SITE}/tours/${tour.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${url}#product`,
        name: tour.title,
        description: tour.subtitle,
        image: tour.images,
        url,
        offers: {
          '@type': 'Offer',
          url,
          price: minPrice,
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
          priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          seller: { '@type': 'Organization', name: 'Werest Travel', url: SITE },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tour.rating.toFixed(1),
          reviewCount: tour.reviewCount,
          bestRating: '5',
          worstRating: '1',
        },
        review: tour.reviews.slice(0, 5).map(r => ({
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
          author: { '@type': 'Person', name: r.name },
          reviewBody: r.text,
          datePublished: r.date,
        })),
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Duration', value: tour.duration },
          { '@type': 'PropertyValue', name: 'Languages', value: tour.languages.join(', ') },
          { '@type': 'PropertyValue', name: 'Location', value: tour.location },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Experiences', item: `${SITE}/tours` },
          { '@type': 'ListItem', position: 3, name: tour.title,    item: url },
        ],
      },
    ],
  };
}

// ─── Tour listing ItemList ─────────────────────────────────────────────────────

export function tourListSchema(tours: { slug: string; title: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Experiences & Day Trips in Thailand',
    url: `${SITE}/tours`,
    numberOfItems: tours.length,
    itemListElement: tours.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title,
      url: `${SITE}/tours/${t.slug}`,
    })),
  };
}

// ─── Transfer booking Reservation ─────────────────────────────────────────────

export function bookingReservationSchema(booking: {
  bookingRef: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: Date | string;
  pickupTime: string;
  vehicleType: string;
  totalPrice: number;
  createdAt: Date | string;
}) {
  const pickupDT = typeof booking.pickupDate === 'string'
    ? booking.pickupDate
    : booking.pickupDate.toISOString();
  const createdDT = typeof booking.createdAt === 'string'
    ? booking.createdAt
    : booking.createdAt.toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiReservation',
    reservationId: booking.bookingRef,
    reservationStatus: 'https://schema.org/ReservationConfirmed',
    underName: { '@type': 'Person', name: booking.customerName },
    reservationFor: {
      '@type': 'TaxiService',
      name: `Werest Travel — Private ${booking.vehicleType} Transfer`,
      provider: { '@type': 'Organization', name: 'Werest Travel', url: SITE },
    },
    pickupLocation: { '@type': 'Place', name: booking.pickupAddress },
    dropoffLocation: { '@type': 'Place', name: booking.dropoffAddress },
    pickupTime: pickupDT,
    modifiedTime: createdDT,
    totalPrice: { '@type': 'PriceSpecification', price: booking.totalPrice, priceCurrency: 'THB' },
    url: `${SITE}/confirmation/${booking.bookingRef}`,
  };
}

// ─── City-pair route page ──────────────────────────────────────────────────────

// ─── Tourist Attraction ───────────────────────────────────────────────────────

export function touristAttractionSchema(attraction: {
  slug: string
  name: string
  location: string
  overview?: string | null
  rating: number
  reviewCount: number
  price: number
  featureImage?: string | null
  category: string
}) {
  const url = `${SITE}/attractions/${attraction.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TouristAttraction',
        '@id': `${url}#attraction`,
        name: attraction.name,
        description: attraction.overview ?? `Visit ${attraction.name} in ${attraction.location}`,
        image: attraction.featureImage ? [attraction.featureImage] : [],
        url,
        touristType: attraction.category,
        address: {
          '@type': 'PostalAddress',
          addressLocality: attraction.location,
          addressCountry: 'TH',
        },
        aggregateRating: attraction.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: attraction.rating.toFixed(1),
          reviewCount: attraction.reviewCount,
          bestRating: '5',
          worstRating: '1',
        } : undefined,
        offers: {
          '@type': 'Offer',
          price: attraction.price,
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
          url,
          seller: { '@type': 'Organization', name: 'Werest Travel', url: SITE },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Attractions', item: `${SITE}/attractions` },
          { '@type': 'ListItem', position: 3, name: attraction.name, item: url },
        ],
      },
    ],
  }
}

// ─── City-pair route page ──────────────────────────────────────────────────────

export function routePageSchema(from: string, to: string, priceFrom: number) {
  const slug = `${from.toLowerCase().replace(/\s+/g, '-')}-to-${to.toLowerCase().replace(/\s+/g, '-')}`;
  const url = `${SITE}/routes/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Private Transfer: ${from} to ${to}`,
        description: `Fixed-price private car transfer from ${from} to ${to}. Sedan, SUV and Minivan available. Instant confirmation, free cancellation.`,
        url,
        provider: { '@type': 'Organization', name: 'Werest Travel', url: SITE },
        areaServed: { '@type': 'Country', name: 'Thailand' },
        offers: {
          '@type': 'Offer',
          price: priceFrom,
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Routes', item: `${SITE}/routes` },
          { '@type': 'ListItem', position: 3, name: `${from} → ${to}`, item: url },
        ],
      },
    ],
  };
}
