export interface AirportRoute {
  from: string
  to:   string
  price: number
  slug: string
}

export interface AirportService {
  name:          string
  shortName:     string
  city:          string
  iataCode:      string
  tagline:       string
  description:   string
  images:        string[]
  fromPrice:     number       // minimum price in THB (sedan)
  duration:      string       // e.g. "30–60 min"
  highlights:    string[]
  included:      string[]
  notIncluded:   string[]
  meetingPoint:  string
  importantInfo: string[]
  faq:           { q: string; a: string }[]
  popularRoutes: AirportRoute[]
}

export const AIRPORT_SERVICES: Record<string, AirportService> = {
  /* ─── Bangkok Suvarnabhumi ──────────────────────────────────────────────── */
  'bkk-suvarnabhumi-airport': {
    name:      'Bangkok Suvarnabhumi International Airport (BKK) Transfer',
    shortName: 'Suvarnabhumi Airport (BKK)',
    city:      'Bangkok',
    iataCode:  'BKK',
    tagline:   'Fixed-price private transfer from/to Bangkok\'s main international gateway',
    description:
      'Skip the taxi queue and travel in comfort with a dedicated private driver waiting in the arrivals hall. Our Suvarnabhumi airport transfer service covers all major hotels, condos, and landmarks across Bangkok and the surrounding provinces — at a guaranteed fixed price with no metering, no surge fees, and no hidden charges. Your driver tracks your flight live and adjusts for delays automatically.',
    images: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    ],
    fromPrice:    600,
    duration:     '30–75 min',
    highlights: [
      'Meet & greet in arrivals hall with name sign',
      'Fixed price — no meters, no surge',
      'Live flight tracking included',
      'Free cancellation up to 24 hours before',
      'Available 24/7 — any time of day or night',
    ],
    included: [
      'Private vehicle (sedan, SUV, minivan, or luxury)',
      'Professional, English-speaking driver',
      'Meet & greet in arrivals hall with name board',
      'Complimentary bottled water',
      'Free flight-delay monitoring',
      'Luggage assistance',
      'All tolls and parking fees',
    ],
    notIncluded: [
      'Gratuity (optional)',
      'Entrance fees to any attractions',
    ],
    meetingPoint:
      'Your driver will be waiting in the arrivals hall (ground floor, Passenger Terminal) holding a sign with your name. You will receive the driver\'s photo, name, and vehicle plate via SMS and email 3–12 hours before pickup.',
    importantInfo: [
      'Booking must be made at least 2 hours before pickup.',
      'Enter your flight number exactly as it appears on your boarding pass.',
      'For multiple stops, please contact us in advance.',
      'Large groups or oversized luggage may require an upgrade to a larger vehicle.',
      'Driver will wait up to 60 minutes after the scheduled pickup (or flight landing + 30 min for arrivals).',
    ],
    faq: [
      {
        q: 'How will I find my driver at the airport?',
        a: 'Your driver will be waiting in the arrivals hall on the ground floor, holding a name board with your name. You\'ll receive a confirmation with the driver\'s photo, name, and vehicle plate 3–12 hours before pickup.',
      },
      {
        q: 'What happens if my flight is delayed?',
        a: 'We track all incoming flights in real time. If your flight is delayed, your driver automatically adjusts the pickup time at no extra cost. No need to call or message.',
      },
      {
        q: 'Can I cancel or modify my booking?',
        a: 'Yes — free cancellation and modifications up to 24 hours before your scheduled pickup time. Changes within 24 hours are subject to availability.',
      },
      {
        q: 'Are all tolls included?',
        a: 'Yes. All expressway tolls and airport parking fees are included in the fixed price. There are no surprise charges on arrival.',
      },
      {
        q: 'Is there a surcharge for late-night pickups?',
        a: 'No. Our pricing is the same 24 hours a day, 7 days a week — including public holidays.',
      },
      {
        q: 'What if I have a lot of luggage?',
        a: 'Please include your luggage details when booking so we can assign the right vehicle size. Oversized items such as surfboards or bicycle boxes may require a minivan.',
      },
    ],
    popularRoutes: [
      { from: 'Suvarnabhumi Airport', to: 'Sukhumvit',            price: 600,  slug: 'bkk-sukhumvit'       },
      { from: 'Suvarnabhumi Airport', to: 'Silom / Sathorn',      price: 650,  slug: 'bkk-silom'           },
      { from: 'Suvarnabhumi Airport', to: 'Khao San Road',        price: 700,  slug: 'bkk-khaosan'         },
      { from: 'Suvarnabhumi Airport', to: 'Pattaya',              price: 1800, slug: 'bkk-pattaya'         },
      { from: 'Suvarnabhumi Airport', to: 'Hua Hin',              price: 2800, slug: 'bkk-huahin'          },
      { from: 'Suvarnabhumi Airport', to: 'Don Mueang Airport',   price: 900,  slug: 'bkk-dmk'             },
    ],
  },

  /* ─── Bangkok Don Mueang ────────────────────────────────────────────────── */
  'dmk-don-mueang-airport': {
    name:      'Bangkok Don Mueang International Airport (DMK) Transfer',
    shortName: 'Don Mueang Airport (DMK)',
    city:      'Bangkok',
    iataCode:  'DMK',
    tagline:   'Fixed-price private transfer from/to Bangkok\'s low-cost carrier hub',
    description:
      'Don Mueang is Bangkok\'s gateway for budget airlines serving domestic and regional routes. Our private transfer service gives you door-to-door comfort at a guaranteed fixed price — no negotiating with taxi touts, no metered surprises. Whether you\'re heading to a hotel in the city centre, a guesthouse near Khao San Road, or connecting to another airport, our drivers will get you there on time.',
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    ],
    fromPrice:    550,
    duration:     '40–90 min',
    highlights: [
      'Meet & greet in arrivals hall with name sign',
      'Fixed price — no meters, no surge',
      'Live flight tracking included',
      'Free cancellation up to 24 hours before',
      'Ideal for inter-airport transfers',
    ],
    included: [
      'Private vehicle (sedan, SUV, or minivan)',
      'Professional, English-speaking driver',
      'Meet & greet in arrivals hall with name board',
      'Complimentary bottled water',
      'Free flight-delay monitoring',
      'All tolls and parking fees',
    ],
    notIncluded: [
      'Gratuity (optional)',
    ],
    meetingPoint:
      'Your driver will be waiting in the arrivals hall of Terminal 1 or 2 (as applicable) holding a sign with your name.',
    importantInfo: [
      'Specify which terminal you arrive at (Terminal 1 for domestic, Terminal 2 for international).',
      'Traffic between Don Mueang and central Bangkok can be heavy during rush hours (07:00–09:00 and 16:30–19:30).',
      'For transfers to Suvarnabhumi Airport, allow at least 2.5 hours.',
    ],
    faq: [
      {
        q: 'Which terminal should I specify?',
        a: 'Domestic flights typically use Terminal 1, while international flights use Terminal 2. Check your boarding pass or airline website for your terminal.',
      },
      {
        q: 'How long does it take to reach central Bangkok?',
        a: 'Journey time varies with traffic. Expect 40–60 minutes outside rush hour and up to 90 minutes during peak times.',
      },
      {
        q: 'Can I book a transfer from DMK to BKK Suvarnabhumi?',
        a: 'Yes — inter-airport transfers are one of our most popular routes. Allow at least 2.5 hours for the journey to be safe.',
      },
    ],
    popularRoutes: [
      { from: 'Don Mueang Airport', to: 'Sukhumvit',          price: 600,  slug: 'dmk-sukhumvit'   },
      { from: 'Don Mueang Airport', to: 'Khao San Road',      price: 550,  slug: 'dmk-khaosan'     },
      { from: 'Don Mueang Airport', to: 'Suvarnabhumi (BKK)', price: 900,  slug: 'dmk-bkk'         },
      { from: 'Don Mueang Airport', to: 'Ayutthaya',          price: 1200, slug: 'dmk-ayutthaya'   },
      { from: 'Don Mueang Airport', to: 'Pattaya',            price: 2000, slug: 'dmk-pattaya'     },
    ],
  },

  /* ─── Phuket ────────────────────────────────────────────────────────────── */
  'hkt-phuket-airport': {
    name:      'Phuket International Airport (HKT) Transfer',
    shortName: 'Phuket Airport (HKT)',
    city:      'Phuket',
    iataCode:  'HKT',
    tagline:   'Private transfer from Phuket Airport to your beach resort — fixed price',
    description:
      'Arrive on the island in style. Our private transfers from Phuket Airport take you directly to any hotel, villa, or pier across the island — from Patong and Kata to Bang Tao, Rawai, and Khao Lak. No shared minibus stops, no waiting. Just you, your vehicle, and the fastest route to your beach.',
    images: [
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
      'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800&q=80',
    ],
    fromPrice:    600,
    duration:     '25–75 min',
    highlights: [
      'Direct to your hotel — no shared stops',
      'Covers all Phuket beach areas and Khao Lak',
      'Fixed price with no surge pricing',
      'Free cancellation up to 24 hours before',
    ],
    included: [
      'Private vehicle (sedan, SUV, or minivan)',
      'Professional driver',
      'Meet & greet in arrivals hall',
      'Complimentary bottled water',
      'Flight tracking',
      'All tolls',
    ],
    notIncluded: [
      'Gratuity (optional)',
      'Pier access or ferry tickets',
    ],
    meetingPoint:
      'Your driver will be in the arrivals hall at the exit of the baggage claim area, holding a sign with your name.',
    importantInfo: [
      'Journey times to the south of the island (Rawai, Chalong) can be 60–75 minutes.',
      'For transfers to Khao Lak or Krabi, select the correct destination when booking.',
      'Ferry connections to nearby islands can be arranged — contact us in advance.',
    ],
    faq: [
      {
        q: 'Can I book a transfer to Khao Lak from Phuket Airport?',
        a: 'Yes — Khao Lak transfers are available and take approximately 75–90 minutes.',
      },
      {
        q: 'What beach areas do you cover?',
        a: 'We cover all areas: Patong, Kata, Karon, Bang Tao, Kamala, Surin, Rawai, Chalong, Phuket Town, and more.',
      },
    ],
    popularRoutes: [
      { from: 'Phuket Airport', to: 'Patong Beach',  price: 700,  slug: 'hkt-patong'    },
      { from: 'Phuket Airport', to: 'Bang Tao',      price: 650,  slug: 'hkt-bangtao'   },
      { from: 'Phuket Airport', to: 'Kata Beach',    price: 750,  slug: 'hkt-kata'      },
      { from: 'Phuket Airport', to: 'Karon Beach',   price: 730,  slug: 'hkt-karon'     },
      { from: 'Phuket Airport', to: 'Rawai',         price: 900,  slug: 'hkt-rawai'     },
      { from: 'Phuket Airport', to: 'Khao Lak',      price: 1400, slug: 'hkt-khaolak'  },
    ],
  },

  /* ─── Chiang Mai ────────────────────────────────────────────────────────── */
  'cnx-chiang-mai-airport': {
    name:      'Chiang Mai International Airport (CNX) Transfer',
    shortName: 'Chiang Mai Airport (CNX)',
    city:      'Chiang Mai',
    iataCode:  'CNX',
    tagline:   'Private transfer from Chiang Mai Airport to your hotel or guesthouse',
    description:
      'Chiang Mai Airport sits just a few kilometres from the Old City moat. Our private transfers get you from arrivals to your accommodation in 10–25 minutes — no tuk-tuk haggling required. We also cover longer routes to Chiang Rai, Pai, and the surrounding hill-tribe villages.',
    images: [
      'https://images.unsplash.com/photo-1599576838688-8a6c11263108?w=1200&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      'https://images.unsplash.com/photo-1569952048591-e3e3f7f0b0f5?w=800&q=80',
    ],
    fromPrice:    350,
    duration:     '10–25 min',
    highlights: [
      'Central Old City in just 10–15 minutes',
      'Fixed price — no bargaining with tuk-tuks',
      'Day trips and long-distance routes available',
      'Free cancellation up to 24 hours before',
    ],
    included: [
      'Private vehicle (sedan or SUV)',
      'Professional driver',
      'Meet & greet in arrivals',
      'Complimentary bottled water',
      'Flight tracking',
    ],
    notIncluded: [
      'Gratuity (optional)',
    ],
    meetingPoint:
      'Your driver will be in the arrivals hall immediately past baggage claim, holding a name sign.',
    importantInfo: [
      'Most destinations in Chiang Mai city are within 10–20 minutes of the airport.',
      'Long-distance transfers to Chiang Rai, Pai, or Golden Triangle are available — book in advance.',
    ],
    faq: [
      {
        q: 'How far is the airport from the Old City?',
        a: 'The airport is approximately 4 km from Tha Phae Gate (the main Old City entrance). Expect 10–15 minutes by car outside rush hour.',
      },
      {
        q: 'Do you offer day trips from Chiang Mai Airport?',
        a: 'Yes — we can arrange transfers combined with day trips to Doi Inthanon, the White Temple, or Chiang Rai. Contact us for a custom quote.',
      },
    ],
    popularRoutes: [
      { from: 'Chiang Mai Airport', to: 'Old City',      price: 350, slug: 'cnx-oldcity'    },
      { from: 'Chiang Mai Airport', to: 'Nimman Road',   price: 350, slug: 'cnx-nimman'     },
      { from: 'Chiang Mai Airport', to: 'Chiang Rai',    price: 2200, slug: 'cnx-chiangrai' },
      { from: 'Chiang Mai Airport', to: 'Pai',           price: 2800, slug: 'cnx-pai'       },
    ],
  },
}

export function getAirportService(slug: string): AirportService | null {
  return AIRPORT_SERVICES[slug] ?? null
}
