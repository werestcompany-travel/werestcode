// Fixed-price city-pair data for programmatic SEO route pages.
// Prices computed from lib/pricing.ts: baseFare + pricePerKm × distanceKm
// SEDAN: 500 + 12/km · SUV: 800 + 18/km · MINIVAN: 1200 + 22/km

export interface RouteInfo {
  slug:        string;    // URL slug, e.g. "bangkok-to-pattaya"
  from:        string;    // Display name of origin
  to:          string;    // Display name of destination
  distanceKm:  number;
  durationMin: number;
  description: string;   // Meta description
  highlights:  string[];
  faqs:        { q: string; a: string }[];
}

function sedanPrice(km: number)   { return Math.round(500  + 12 * km); }
function suvPrice(km: number)     { return Math.round(800  + 18 * km); }
function minivanPrice(km: number) { return Math.round(1200 + 22 * km); }

export function routePrices(km: number) {
  return { sedan: sedanPrice(km), suv: suvPrice(km), minivan: minivanPrice(km) };
}

export const ROUTES: RouteInfo[] = [
  {
    slug:        'bangkok-to-pattaya',
    from:        'Bangkok',
    to:          'Pattaya',
    distanceKm:  150,
    durationMin: 150,
    description: 'Fixed-price private transfer from Bangkok to Pattaya. Door-to-door service from your hotel or Suvarnabhumi/Don Mueang airport. From ฿' + sedanPrice(150).toLocaleString() + ' for a Sedan.',
    highlights:  ['Hotel-to-hotel pickup', 'Fixed price — no meters or surge', 'Air-conditioned vehicles', 'Professional English-speaking driver', 'Free cancellation up to 24 h'],
    faqs: [
      { q: 'How long is the drive from Bangkok to Pattaya?', a: 'Approximately 2 hours 30 minutes (150 km) via Highway 7 (Motorway). Traffic around Bangkok can add 30–60 minutes during peak hours (07:00–09:00 and 17:00–19:00 on weekdays).' },
      { q: 'Is there a toll fee?', a: 'Yes — the motorway toll is around ฿60–90. This is included in our quoted price; no surprise extras.' },
      { q: 'Can I be picked up from Suvarnabhumi or Don Mueang?', a: 'Yes, we pick up directly from both Bangkok airports as well as any hotel or address in Bangkok.' },
      { q: 'How many passengers fit?', a: 'Sedan: up to 3 passengers · SUV: up to 6 · Minivan: up to 10. Choose the right vehicle when booking.' },
    ],
  },
  {
    slug:        'bangkok-to-hua-hin',
    from:        'Bangkok',
    to:          'Hua Hin',
    distanceKm:  200,
    durationMin: 210,
    description: 'Private transfer from Bangkok to Hua Hin. Relax in your own vehicle and skip the crowded bus. From ฿' + sedanPrice(200).toLocaleString() + '.',
    highlights:  ['Direct hotel-to-hotel', 'Fixed price, no surprises', 'Air-conditioned + water included', 'Free cancellation 24 h prior'],
    faqs: [
      { q: 'How long is the drive from Bangkok to Hua Hin?', a: 'Around 3–3.5 hours (200 km) via Phetkasem Road / Highway 4. Expect heavier traffic on Friday evenings and public holidays.' },
      { q: 'Do you pick up from Suvarnabhumi Airport?', a: 'Yes — we offer direct transfers from both Suvarnabhumi (BKK) and Don Mueang (DMK) airports.' },
      { q: 'Is there a stop available along the way?', a: 'Yes, you can request a short comfort stop at no extra charge. Just let us know when booking in the special notes field.' },
    ],
  },
  {
    slug:        'bangkok-to-ayutthaya',
    from:        'Bangkok',
    to:          'Ayutthaya',
    distanceKm:  80,
    durationMin: 90,
    description: 'Day trip transfer from Bangkok to the ancient temples of Ayutthaya. Private car with professional driver. From ฿' + sedanPrice(80).toLocaleString() + '.',
    highlights:  ['UNESCO World Heritage site', 'Return transfer available', 'English-speaking driver', 'Flexible pickup time'],
    faqs: [
      { q: 'How far is Ayutthaya from Bangkok?', a: 'About 80 km, taking roughly 1.5 hours by car via Highway 1 (Phahonyothin Road) or the expressway.' },
      { q: 'Can I book a return transfer?', a: 'Yes — book the same route in reverse and we\'ll schedule both pickups. Contact us after booking to coordinate return time.' },
      { q: 'Is a guided tour included?', a: 'The transfer is driver-only. We recommend hiring a local guide at the Ayutthaya Historical Park for the best experience.' },
    ],
  },
  {
    slug:        'bangkok-to-kanchanaburi',
    from:        'Bangkok',
    to:          'Kanchanaburi',
    distanceKm:  130,
    durationMin: 140,
    description: 'Private transfer from Bangkok to Kanchanaburi, home of the Bridge on the River Kwai. From ฿' + sedanPrice(130).toLocaleString() + '.',
    highlights:  ['Visit Bridge on the River Kwai', 'Hotel-to-hotel service', 'Fixed price', 'Return transfer available'],
    faqs: [
      { q: 'How long does it take to drive to Kanchanaburi?', a: 'Roughly 2 hours 20 minutes (130 km) via Highway 323. Early departures avoid Bangkok congestion.' },
      { q: 'Can the driver wait while I sightsee?', a: 'Yes — charter the vehicle for a half-day or full-day and the driver will wait at no extra charge for the duration.' },
    ],
  },
  {
    slug:        'suvarnabhumi-airport-to-pattaya',
    from:        'Suvarnabhumi Airport (BKK)',
    to:          'Pattaya',
    distanceKm:  125,
    durationMin: 110,
    description: 'Private airport transfer from Suvarnabhumi (BKK) to Pattaya. Meet & greet service, name sign at arrivals. From ฿' + sedanPrice(125).toLocaleString() + '.',
    highlights:  ['Meet & greet in arrivals hall', 'Flight tracking — we wait if delayed', 'Complimentary water', 'Fixed price, no meters'],
    faqs: [
      { q: 'How long from Suvarnabhumi to Pattaya?', a: 'Approximately 1 hour 45 minutes (125 km) via Motorway 7. Direct and fast once clear of the airport.' },
      { q: 'What if my flight is late?', a: 'We track your flight in real time and your driver adjusts accordingly. No extra charge for flight delays.' },
      { q: 'Where does the driver meet me?', a: 'In the arrivals hall at Suvarnabhumi, holding a name sign with your name. You will receive the driver\'s contact details in advance.' },
    ],
  },
  {
    slug:        'suvarnabhumi-airport-to-hua-hin',
    from:        'Suvarnabhumi Airport (BKK)',
    to:          'Hua Hin',
    distanceKm:  220,
    durationMin: 240,
    description: 'Direct private transfer from Suvarnabhumi Airport to Hua Hin beach resort. Skip the bus and arrive in comfort. From ฿' + sedanPrice(220).toLocaleString() + '.',
    highlights:  ['Meet & greet at arrivals', 'Flight delay tracking', 'Door-to-door hotel drop-off', 'Free cancellation 24 h'],
    faqs: [
      { q: 'How long is the drive from Suvarnabhumi to Hua Hin?', a: 'About 3 hours 30–4 hours (220 km) via Highway 35 (Rama II). Allow extra time during long weekends.' },
      { q: 'Is there a rest stop available?', a: 'Yes — there are several service stations on Route 4. Your driver can stop for 10–15 minutes on request.' },
    ],
  },
  {
    slug:        'don-mueang-airport-to-pattaya',
    from:        'Don Mueang Airport (DMK)',
    to:          'Pattaya',
    distanceKm:  165,
    durationMin: 170,
    description: 'Private transfer from Don Mueang (DMK) to Pattaya. Name-sign meet and greet, fixed price. From ฿' + sedanPrice(165).toLocaleString() + '.',
    highlights:  ['Name sign at arrivals', 'Flight delay monitoring', 'Air-conditioned vehicle', 'Fixed price, no hidden fees'],
    faqs: [
      { q: 'How long from Don Mueang to Pattaya?', a: 'Around 2 hours 45 minutes (165 km). The route goes via Motorway 7 — note that Don Mueang is north of Bangkok so the drive is longer than from Suvarnabhumi.' },
      { q: 'Can I share this transfer?', a: 'All bookings are private — you get the whole vehicle for your group at a fixed price.' },
    ],
  },
  {
    slug:        'phuket-airport-to-patong',
    from:        'Phuket Airport',
    to:          'Patong Beach',
    distanceKm:  35,
    durationMin: 50,
    description: 'Private airport transfer from Phuket International Airport to Patong Beach. Fast, comfortable, fixed price. From ฿' + sedanPrice(35).toLocaleString() + '.',
    highlights:  ['Meet & greet at arrivals', 'No shared minibus', 'Direct hotel drop-off', 'Flight tracking included'],
    faqs: [
      { q: 'How far is Phuket Airport from Patong?', a: 'About 35 km, taking 45–60 minutes depending on traffic on Route 4026 through Kathu.' },
      { q: 'Is this cheaper than a taxi?', a: 'Our fixed price removes the uncertainty of metered or negotiated taxis. The price is agreed upfront and won\'t change.' },
    ],
  },
  {
    slug:        'phuket-airport-to-kata-karon',
    from:        'Phuket Airport',
    to:          'Kata & Karon Beach',
    distanceKm:  45,
    durationMin: 60,
    description: 'Private transfer from Phuket Airport to Kata and Karon Beach resorts. Direct hotel drop-off, fixed rate. From ฿' + sedanPrice(45).toLocaleString() + '.',
    highlights:  ['Meet & greet', 'All beaches and hotels covered', 'Minivan available for groups', 'Free cancellation'],
    faqs: [
      { q: 'Do you cover all hotels in Kata and Karon?', a: 'Yes — we drop off at any hotel, villa or address in the Kata and Karon area.' },
      { q: 'Can I book for 7+ people?', a: 'Yes, select the Minivan option which seats up to 10 passengers.' },
    ],
  },
  {
    slug:        'phuket-to-krabi',
    from:        'Phuket',
    to:          'Krabi',
    distanceKm:  170,
    durationMin: 160,
    description: 'Private car transfer from Phuket to Krabi. Avoid the ferry + minibus ordeal and travel in comfort. From ฿' + sedanPrice(170).toLocaleString() + '.',
    highlights:  ['Door-to-door, no transfers', 'Scenic coastal route', 'Stop at Sarasin Bridge viewpoint', 'Fixed price'],
    faqs: [
      { q: 'How long is the drive from Phuket to Krabi?', a: 'Approximately 2 hours 30–3 hours (170 km) via Highway 4. Much faster than the ferry route which can take 4–5 hours.' },
      { q: 'Can you stop at scenic spots along the way?', a: 'Yes — ask your driver for a stop at the Sarasin Bridge viewpoint or any other spot. Short stops are included.' },
    ],
  },
  {
    slug:        'phuket-to-khao-lak',
    from:        'Phuket',
    to:          'Khao Lak',
    distanceKm:  80,
    durationMin: 90,
    description: 'Private transfer from Phuket to Khao Lak beach resorts. Skip the crowded minibus and arrive relaxed. From ฿' + sedanPrice(80).toLocaleString() + '.',
    highlights:  ['Hotel pickup anywhere in Phuket', 'Direct hotel drop-off in Khao Lak', 'Air-conditioned SUV or Minivan available'],
    faqs: [
      { q: 'How long is the drive to Khao Lak?', a: 'Roughly 1 hour 30 minutes (80 km) via Highway 4 north. An easy, straightforward journey.' },
      { q: 'Can I book from Phuket Airport directly to Khao Lak?', a: 'Yes — use "Phuket Airport" as your pickup and "Khao Lak" as your destination when booking.' },
    ],
  },
  {
    slug:        'pattaya-to-bangkok',
    from:        'Pattaya',
    to:          'Bangkok',
    distanceKm:  150,
    durationMin: 150,
    description: 'Private transfer from Pattaya back to Bangkok or Suvarnabhumi / Don Mueang airports. Fixed price, no surge. From ฿' + sedanPrice(150).toLocaleString() + '.',
    highlights:  ['Hotel pickup in Pattaya / Jomtien', 'Drop-off to Bangkok airport or hotel', 'Fixed price both ways'],
    faqs: [
      { q: 'Can you pick me up from Jomtien or Na Jomtien?', a: 'Yes — we cover all areas of Pattaya including Jomtien, Na Jomtien, Bang Saray, and nearby resort areas.' },
      { q: 'Can I book a one-way and arrange the return separately?', a: 'Yes — each booking is a single one-way transfer. Simply book the return journey separately.' },
    ],
  },
  {
    slug:        'pattaya-to-u-tapao-airport',
    from:        'Pattaya',
    to:          'U-Tapao Airport (UTP)',
    distanceKm:  50,
    durationMin: 55,
    description: 'Private transfer from Pattaya to U-Tapao Airport. Ideal for AirAsia and Bangkok Air flights to Koh Samui. From ฿' + sedanPrice(50).toLocaleString() + '.',
    highlights:  ['On-time departure guarantee', 'Door-to-airport service', 'Fixed price'],
    faqs: [
      { q: 'How far is U-Tapao Airport from Pattaya?', a: 'About 50 km (55 minutes) south of central Pattaya, toward Rayong and Sattahip.' },
    ],
  },
  {
    slug:        'chiang-mai-to-chiang-rai',
    from:        'Chiang Mai',
    to:          'Chiang Rai',
    distanceKm:  200,
    durationMin: 210,
    description: 'Private car transfer from Chiang Mai to Chiang Rai. Scenic mountain roads, stop at the White Temple or Golden Triangle. From ฿' + sedanPrice(200).toLocaleString() + '.',
    highlights:  ['Optional stop at Wat Rong Khun (White Temple)', 'Scenic mountain highway', 'English-speaking driver', 'Fixed price'],
    faqs: [
      { q: 'How long is Chiang Mai to Chiang Rai?', a: 'About 3 hours 30 minutes (200 km) via Highway 118. The mountain scenery is stunning — worth an early start.' },
      { q: 'Can we stop at Doi Mae Salong or other sights?', a: 'Yes — request stops when booking in the special notes. Multi-stop day trips can also be arranged.' },
    ],
  },
  {
    slug:        'chiang-mai-to-chiang-mai-airport',
    from:        'Chiang Mai City',
    to:          'Chiang Mai Airport (CNX)',
    distanceKm:  8,
    durationMin: 20,
    description: 'Private transfer from your hotel in Chiang Mai to CNX Airport. Punctual, fixed price. From ฿' + sedanPrice(8).toLocaleString() + '.',
    highlights:  ['Flat rate — no traffic surcharge', 'Hotel pickup anywhere in Chiang Mai', 'Professional driver'],
    faqs: [
      { q: 'How far is central Chiang Mai from the airport?', a: 'About 4–8 km, a 15–25 minute drive. The airport is conveniently close to the Old City and Nimmanhaemin area.' },
    ],
  },
  {
    slug:        'hua-hin-to-bangkok',
    from:        'Hua Hin',
    to:          'Bangkok',
    distanceKm:  200,
    durationMin: 210,
    description: 'Private transfer from Hua Hin to Bangkok or Suvarnabhumi Airport. Comfortable, fixed price return journey. From ฿' + sedanPrice(200).toLocaleString() + '.',
    highlights:  ['Hotel pickup in Hua Hin & Cha-am', 'Drop-off anywhere in Bangkok', 'Airport transfer option', 'Early departure available'],
    faqs: [
      { q: 'Can you pick me up from Cha-am?', a: 'Yes — we cover Hua Hin, Cha-am, Pranburi, and surrounding resort areas.' },
      { q: 'What time is the earliest pickup?', a: 'We operate 24/7. Specify your departure time when booking — early morning pickups for airport flights are common.' },
    ],
  },
  {
    slug:        'krabi-to-ao-nang',
    from:        'Krabi Airport',
    to:          'Ao Nang',
    distanceKm:  30,
    durationMin: 40,
    description: 'Private airport transfer from Krabi Airport to Ao Nang Beach. Direct hotel drop-off, fixed price. From ฿' + sedanPrice(30).toLocaleString() + '.',
    highlights:  ['Meet & greet at arrivals', 'Direct Ao Nang hotel drop-off', 'No shared minibus'],
    faqs: [
      { q: 'How far is Krabi Airport from Ao Nang?', a: 'About 30 km, roughly 40 minutes. It\'s a short and easy transfer.' },
      { q: 'Can I also go to Railay or Klong Muang Beach?', a: 'Yes — we cover all Krabi beaches. Select the correct destination when booking.' },
    ],
  },
  {
    slug:        'bangkok-to-rayong',
    from:        'Bangkok',
    to:          'Rayong',
    distanceKm:  180,
    durationMin: 175,
    description: 'Private transfer from Bangkok to Rayong. Direct hotel or industrial estate transfer via Motorway 7. From ฿' + sedanPrice(180).toLocaleString() + '.',
    highlights:  ['Industrial estate drop-off available', 'Mae Phim & Suan Son beach coverage', 'Fixed price, no surge'],
    faqs: [
      { q: 'How long is Bangkok to Rayong by car?', a: 'About 3 hours (180 km) via Motorway 7 to Map Ta Phut. Traffic can add time on weekday mornings.' },
    ],
  },
  {
    slug:        'phuket-to-phang-nga',
    from:        'Phuket',
    to:          'Phang Nga',
    distanceKm:  90,
    durationMin: 80,
    description: 'Private transfer from Phuket to Phang Nga Town or Phang Nga Bay. Comfortable, fixed-rate vehicle. From ฿' + sedanPrice(90).toLocaleString() + '.',
    highlights:  ['Phang Nga Bay day trip option', 'Fixed price', 'English-speaking driver', 'Stop at James Bond Island pier available'],
    faqs: [
      { q: 'How long is Phuket to Phang Nga?', a: 'About 1 hour 20 minutes (90 km) via the Sarasin Bridge and Highway 4.' },
    ],
  },
  {
    slug:        'bangkok-to-samut-prakan',
    from:        'Bangkok',
    to:          'Samut Prakan',
    distanceKm:  30,
    durationMin: 45,
    description: 'Private transfer from Bangkok to Samut Prakan, including the Ancient City and Crocodile Farm. From ฿' + sedanPrice(30).toLocaleString() + '.',
    highlights:  ['Ancient City entrance nearby', 'Hotel-to-hotel service', 'Flat rate'],
    faqs: [
      { q: 'How far is Samut Prakan from central Bangkok?', a: 'About 30 km south, a 45-minute drive via Sukhumvit Road or the expressway.' },
    ],
  },
];

export function getRoute(slug: string): RouteInfo | undefined {
  return ROUTES.find(r => r.slug === slug);
}

// ─── TransferRoute — richer interface used by /routes/[slug] SEO pages ───────

export interface TransferRoute {
  slug:         string;
  from:         string;        // "Bangkok"
  to:           string;        // "Pattaya"
  fromFull:     string;        // "Bangkok City Centre"
  toFull:       string;        // "Pattaya Beach Road"
  distanceKm:   number;
  durationMin:  number;
  highlights:   string[];      // 3-4 bullet points
  popularFor:   string[];      // tags e.g. ["Beach holidays", "Family trips"]
  faqs:         { q: string; a: string }[];
  priceFromTHB: number;        // base SEDAN price
}

export const ALL_ROUTES: TransferRoute[] = [
  {
    slug:         'bangkok-to-pattaya',
    from:         'Bangkok',
    to:           'Pattaya',
    fromFull:     'Bangkok City Centre',
    toFull:       'Pattaya Beach Road',
    distanceKm:   150,
    durationMin:  120,
    priceFromTHB: 1800,
    highlights: [
      'Hotel-to-hotel door-to-door pickup',
      'Fixed price via Motorway 7 — no meters or surge pricing',
      'Air-conditioned vehicle with complimentary water',
      'Free flight-delay monitoring and 24-hour cancellation',
    ],
    popularFor: ['Beach holidays', 'Family trips', 'Weekend getaways'],
    faqs: [
      { q: 'How long is the drive from Bangkok to Pattaya?', a: 'Approximately 2 hours (150 km) via Highway 7 (Motorway). Traffic around Bangkok can add 30–60 minutes during peak hours on weekdays.' },
      { q: 'Is the motorway toll included?', a: 'Yes — the motorway toll of around ฿60–90 is included in our fixed price. No surprise extras on arrival.' },
      { q: 'Can I be picked up from Suvarnabhumi or Don Mueang airport?', a: 'Yes. We pick up directly from both Bangkok airports as well as any hotel or address in Bangkok.' },
      { q: 'How many passengers fit in each vehicle?', a: 'Sedan: up to 3 passengers with 2 large bags. SUV: up to 6 passengers. Minivan: up to 10 passengers. Choose your vehicle when booking.' },
    ],
  },
  {
    slug:         'pattaya-to-bangkok',
    from:         'Pattaya',
    to:           'Bangkok',
    fromFull:     'Pattaya Beach Road',
    toFull:       'Bangkok City Centre',
    distanceKm:   150,
    durationMin:  120,
    priceFromTHB: 1800,
    highlights: [
      'Hotel pickup anywhere in Pattaya or Jomtien',
      'Drop-off to Bangkok hotel, airport or any address',
      'Fixed price both ways — identical fare',
      'Free cancellation up to 24 hours before pickup',
    ],
    popularFor: ['Return transfers', 'Airport connections', 'Business travel'],
    faqs: [
      { q: 'Can you pick me up from Jomtien or Na Jomtien?', a: 'Yes — we cover all Pattaya areas including Jomtien, Na Jomtien, Bang Saray, and nearby resort zones.' },
      { q: 'Can I be dropped off at Suvarnabhumi or Don Mueang airport?', a: 'Absolutely. Just enter the airport as your drop-off address when booking. No extra charge.' },
      { q: 'What is the earliest pickup time?', a: 'We operate 24/7. You can request early morning pickups to catch flights — simply specify your preferred time when booking.' },
      { q: 'Is the price the same as Bangkok to Pattaya?', a: 'Yes, the fare is identical in both directions. Our pricing is per trip, regardless of direction.' },
    ],
  },
  {
    slug:         'suvarnabhumi-to-pattaya',
    from:         'Suvarnabhumi Airport',
    to:           'Pattaya',
    fromFull:     'Suvarnabhumi Airport (BKK) Arrivals Hall',
    toFull:       'Pattaya Beach Road',
    distanceKm:   120,
    durationMin:  90,
    priceFromTHB: 1600,
    highlights: [
      'Meet & greet in the arrivals hall with name sign',
      'Real-time flight tracking — driver adjusts for delays',
      'Complimentary bottled water and Wi-Fi on board',
      'Fixed price, no meters, no hidden fees',
    ],
    popularFor: ['Airport arrivals', 'Beach holidays', 'Family trips'],
    faqs: [
      { q: 'How long from Suvarnabhumi to Pattaya?', a: 'Approximately 1.5 hours (120 km) via Motorway 7. It is a fast, direct route once clear of the airport area.' },
      { q: 'What if my flight is delayed?', a: 'We track your flight in real time. Your driver will wait at no extra charge if your flight arrives late.' },
      { q: 'Where does the driver meet me?', a: 'In the arrivals hall at Suvarnabhumi, holding a name sign with your name. Driver contact details are sent before your flight lands.' },
      { q: 'Can the driver pick up multiple flights arriving together?', a: 'Yes, if members of your group are on different flights, contact us to coordinate a single pickup after all have landed.' },
    ],
  },
  {
    slug:         'suvarnabhumi-to-hua-hin',
    from:         'Suvarnabhumi Airport',
    to:           'Hua Hin',
    fromFull:     'Suvarnabhumi Airport (BKK) Arrivals Hall',
    toFull:       'Hua Hin Town Centre',
    distanceKm:   200,
    durationMin:  150,
    priceFromTHB: 2500,
    highlights: [
      'Meet & greet at arrivals with name board',
      'Scenic drive south along the Gulf of Thailand coastline',
      'Optional comfort stop at service stations on Route 4',
      'Door-to-door hotel drop-off in Hua Hin or Cha-am',
    ],
    popularFor: ['Beach resorts', 'Long weekends', 'Romantic getaways'],
    faqs: [
      { q: 'How long is the drive from Suvarnabhumi to Hua Hin?', a: 'About 2.5–3 hours (200 km) via Highway 35 (Rama II). Allow extra time on long weekends and Thai public holidays.' },
      { q: 'Is there a comfort stop available?', a: 'Yes — there are several service stations along Route 4. Your driver can stop for 10–15 minutes on request.' },
      { q: 'Do you cover Cha-am beach as well?', a: 'Yes, we drop off at any hotel or address in Cha-am, Hua Hin, Pranburi, or surrounding resort areas.' },
      { q: 'Is flight delay monitoring included?', a: 'Yes — we track your inbound flight and adjust pickup timing at no extra cost if your flight is delayed.' },
    ],
  },
  {
    slug:         'bangkok-to-hua-hin',
    from:         'Bangkok',
    to:           'Hua Hin',
    fromFull:     'Bangkok City Centre',
    toFull:       'Hua Hin Town Centre',
    distanceKm:   210,
    durationMin:  180,
    priceFromTHB: 2400,
    highlights: [
      'Direct hotel-to-hotel service, no transfers or shared minibuses',
      'Scenic drive south through the Gulf coast',
      'Fixed price — no Friday evening surge pricing',
      'Free cancellation up to 24 hours before departure',
    ],
    popularFor: ['Weekend breaks', 'Family beach holidays', 'Romantic escapes'],
    faqs: [
      { q: 'How long is the drive from Bangkok to Hua Hin?', a: 'Around 3 hours (210 km) via Phetkasem Road or Highway 35. Expect heavier traffic on Friday evenings and public holidays.' },
      { q: 'Can I request a pickup from Don Mueang airport instead?', a: 'Yes — enter Don Mueang Airport as your pickup address and Hua Hin as your destination when booking.' },
      { q: 'Is there an option for a short stop along the way?', a: 'Yes, you can request a comfort stop at no extra charge. Add a note when booking.' },
      { q: 'What vehicles are available for large groups?', a: 'We offer Sedans (3 pax), SUVs (6 pax), and Minivans (10 pax). For groups larger than 10, book multiple vehicles.' },
    ],
  },
  {
    slug:         'bangkok-to-kanchanaburi',
    from:         'Bangkok',
    to:           'Kanchanaburi',
    fromFull:     'Bangkok City Centre',
    toFull:       'Kanchanaburi Town Centre',
    distanceKm:   130,
    durationMin:  120,
    priceFromTHB: 1700,
    highlights: [
      'Private door-to-door transfer with no shared minibus stops',
      'Arrive refreshed for the Bridge on the River Kwai sights',
      'Optional half-day or full-day charter available',
      'Return transfer bookable separately',
    ],
    popularFor: ['History tours', 'Day trips', 'WWII memorial sites'],
    faqs: [
      { q: 'How long does it take to drive to Kanchanaburi?', a: 'Roughly 2 hours (130 km) via Highway 323. Early departures avoid Bangkok congestion.' },
      { q: 'Can the driver wait while I sightsee?', a: 'Yes — charter the vehicle for a half-day or full-day and the driver will wait at no extra charge for the agreed duration.' },
      { q: 'Can I visit Erawan Falls on the same trip?', a: 'Yes, with a full-day charter you can include Erawan National Park. Let us know your itinerary when booking.' },
      { q: 'Is the return trip included?', a: 'This is a one-way transfer. Book a separate return journey for the Kanchanaburi to Bangkok direction.' },
    ],
  },
  {
    slug:         'bangkok-to-ayutthaya',
    from:         'Bangkok',
    to:           'Ayutthaya',
    fromFull:     'Bangkok City Centre',
    toFull:       'Ayutthaya Historical Park',
    distanceKm:   80,
    durationMin:  90,
    priceFromTHB: 1200,
    highlights: [
      'Private transfer to the UNESCO World Heritage site',
      'Return transfer available — coordinate timing with driver',
      'English-speaking professional driver',
      'Flexible departure time, even early morning',
    ],
    popularFor: ['History & culture', 'Day trips', 'UNESCO sites'],
    faqs: [
      { q: 'How far is Ayutthaya from Bangkok?', a: 'About 80 km, taking roughly 1.5 hours via Highway 1 or the expressway.' },
      { q: 'Can I book a return transfer?', a: 'Yes — book the same route in reverse and we will schedule both pickups. Contact us after booking to coordinate return time.' },
      { q: 'Is a guided tour included?', a: 'The transfer is driver-only. We recommend hiring a local guide at the Ayutthaya Historical Park entrance for the best experience.' },
      { q: 'Can I visit multiple temples during my stay?', a: 'Yes — a full-day charter with a waiting driver lets you visit Wat Phra Si Sanphet, Wat Mahathat, and other temples at your own pace.' },
    ],
  },
  {
    slug:         'chiang-mai-airport-to-city',
    from:         'Chiang Mai Airport',
    to:           'Chiang Mai City',
    fromFull:     'Chiang Mai International Airport (CNX)',
    toFull:       'Chiang Mai Old City',
    distanceKm:   8,
    durationMin:  20,
    priceFromTHB: 600,
    highlights: [
      'Meet & greet at CNX arrivals with name board',
      'Flat rate, no traffic surcharge, no negotiation needed',
      'Hotel drop-off anywhere in Chiang Mai city or Nimman area',
      'Available 24/7, including late-night arrivals',
    ],
    popularFor: ['Airport arrivals', 'First-time visitors', 'Family travel'],
    faqs: [
      { q: 'How far is Chiang Mai Airport from the Old City?', a: 'About 4–8 km, a 15–25 minute drive. The airport is conveniently close to the Old City and Nimmanhaemin area.' },
      { q: 'Where does the driver meet me?', a: 'In the arrivals hall at CNX with a name sign. You will receive the driver contact details before your flight lands.' },
      { q: 'Do you cover hotels in the Nimman and Santitham areas?', a: 'Yes — we cover all hotels, guesthouses, and addresses within Chiang Mai city, including Nimman, Santitham, and Ping River area.' },
      { q: 'Is there an early morning or late-night surcharge?', a: 'No. Our fixed price applies at all hours, 24 hours a day, 7 days a week.' },
    ],
  },
  {
    slug:         'phuket-airport-to-patong',
    from:         'Phuket Airport',
    to:           'Patong Beach',
    fromFull:     'Phuket International Airport (HKT)',
    toFull:       'Patong Beach, Phuket',
    distanceKm:   30,
    durationMin:  45,
    priceFromTHB: 800,
    highlights: [
      'Meet & greet at HKT arrivals — no shared minibus stress',
      'Direct hotel drop-off anywhere in Patong',
      'Fixed price — no metered taxi negotiation',
      'Flight delay monitoring included',
    ],
    popularFor: ['Beach holidays', 'Nightlife', 'Family vacations'],
    faqs: [
      { q: 'How far is Phuket Airport from Patong Beach?', a: 'About 30 km, taking 45–60 minutes depending on traffic on Route 4026 through Kathu.' },
      { q: 'Is this cheaper than a taxi from the airport?', a: 'Our fixed price removes the uncertainty of metered or negotiated taxis. The price you see is the price you pay.' },
      { q: 'Can I book for a group of 7 or more?', a: 'Yes — select the Minivan option which seats up to 10 passengers with luggage.' },
      { q: 'Do you cover all hotels and resorts in Patong?', a: 'Yes, we drop off at any hotel, resort, villa, or address in Patong Beach.' },
    ],
  },
  {
    slug:         'phuket-airport-to-kata',
    from:         'Phuket Airport',
    to:           'Kata Beach',
    fromFull:     'Phuket International Airport (HKT)',
    toFull:       'Kata Beach, Phuket',
    distanceKm:   35,
    durationMin:  50,
    priceFromTHB: 900,
    highlights: [
      'Private door-to-door transfer from HKT airport',
      'Covers Kata Beach, Kata Noi, and Karon Beach',
      'Minivan available for families and large groups',
      'Flight tracking and free delay accommodation',
    ],
    popularFor: ['Family beach holidays', 'Surf trips', 'Honeymooners'],
    faqs: [
      { q: 'How long is the drive from Phuket Airport to Kata Beach?', a: 'About 35 km, roughly 50–60 minutes depending on traffic through Phuket Town.' },
      { q: 'Do you cover Kata Noi and Karon Beach?', a: 'Yes — we drop off at any hotel or villa in Kata Beach, Kata Noi, and Karon Beach.' },
      { q: 'What luggage allowance is there?', a: 'Sedan: 2 large bags. SUV: 4 large bags. Minivan: 6 large bags. For extra luggage, book the larger vehicle.' },
      { q: 'Can I book a return transfer at the same time?', a: 'Yes — book two separate one-way transfers (outbound and return) and we will coordinate both pickups.' },
    ],
  },
  {
    slug:         'phuket-to-krabi',
    from:         'Phuket',
    to:           'Krabi',
    fromFull:     'Phuket Town Centre',
    toFull:       'Krabi Town Centre',
    distanceKm:   170,
    durationMin:  150,
    priceFromTHB: 2200,
    highlights: [
      'Scenic coastal highway drive — faster than ferry + minibus',
      'Optional stop at Sarasin Bridge viewpoint',
      'Door-to-door hotel-to-hotel service',
      'Fixed price with no ferries or transfer changes',
    ],
    popularFor: ['Island hopping base', 'Rock climbing', 'Adventure travel'],
    faqs: [
      { q: 'How long is the drive from Phuket to Krabi?', a: 'Approximately 2.5–3 hours (170 km) via Highway 4. Much faster than the ferry route which can take 4–5 hours.' },
      { q: 'Can the driver stop at scenic spots along the way?', a: 'Yes — ask your driver for a stop at the Sarasin Bridge viewpoint or any other spot. Short stops are included.' },
      { q: 'Does the transfer cover Ao Nang and Railay Beach?', a: 'Yes, we can drop you at Ao Nang. For Railay Beach, we drop off at the Ao Nang pier — the last 5 minutes is by longtail boat.' },
      { q: 'Is Phuket Airport pickup available?', a: 'Yes — select Phuket Airport as your pickup and Krabi Town or Ao Nang as your destination.' },
    ],
  },
  {
    slug:         'krabi-airport-to-ao-nang',
    from:         'Krabi Airport',
    to:           'Ao Nang',
    fromFull:     'Krabi International Airport (KBV)',
    toFull:       'Ao Nang Beach, Krabi',
    distanceKm:   30,
    durationMin:  40,
    priceFromTHB: 700,
    highlights: [
      'Meet & greet at KBV arrivals with name board',
      'Direct hotel drop-off in Ao Nang and Noppharat Thara',
      'No shared minibus — private vehicle throughout',
      'Covers Klong Muang and Tubkaek beaches',
    ],
    popularFor: ['Beach holidays', 'Island hopping', 'Rock climbing'],
    faqs: [
      { q: 'How far is Krabi Airport from Ao Nang?', a: 'About 30 km, roughly 40 minutes. It is a short and easy transfer.' },
      { q: 'Can I also go to Railay Beach?', a: 'We drop off at the Ao Nang pier. From there, a 5-minute longtail boat ride takes you to Railay Beach.' },
      { q: 'Do you cover Klong Muang and Tubkaek?', a: 'Yes — we service all Krabi beaches including Klong Muang, Tubkaek, and Noppharat Thara.' },
      { q: 'What if my flight arrives late at night?', a: 'We operate 24/7. Your driver will be there regardless of arrival time, and we track flight delays automatically.' },
    ],
  },
  {
    slug:         'samui-airport-to-chaweng',
    from:         'Koh Samui Airport',
    to:           'Chaweng Beach',
    fromFull:     'Samui Airport (USM)',
    toFull:       'Chaweng Beach, Koh Samui',
    distanceKm:   10,
    durationMin:  20,
    priceFromTHB: 500,
    highlights: [
      'Private transfer on the island from USM airport',
      'Covers Chaweng, Chaweng Noi, and Lamai Beach',
      'No shared taxi van — just your group',
      'Available for any flight, including late-night arrivals',
    ],
    popularFor: ['Island holidays', 'Honeymoons', 'Luxury resorts'],
    faqs: [
      { q: 'How far is Samui Airport from Chaweng Beach?', a: 'About 10 km, a 20-minute drive around the northern tip of the island.' },
      { q: 'Do you cover Lamai Beach and Bophut too?', a: 'Yes — we drop off at any hotel or villa on Koh Samui, including Lamai, Bophut, Maenam, and Choeng Mon beaches.' },
      { q: 'Is there a surcharge for late-night flights?', a: 'No. Our fixed price applies at all hours.' },
      { q: 'Can I book from the mainland to Koh Samui?', a: 'The island transfer covers the USM airport to your hotel. For transfers from the mainland, combine with a ferry or flight from Bangkok.' },
    ],
  },
  {
    slug:         'don-mueang-to-bangkok',
    from:         'Don Mueang Airport',
    to:           'Bangkok City',
    fromFull:     'Don Mueang Airport (DMK) Arrivals Hall',
    toFull:       'Bangkok City Centre (Sukhumvit / Silom)',
    distanceKm:   25,
    durationMin:  45,
    priceFromTHB: 700,
    highlights: [
      'Meet & greet at DMK arrivals with name sign',
      'Covers Sukhumvit, Silom, Siam, and all Bangkok hotels',
      'Fixed price with no expressway surcharge',
      'Flight delay tracking — no extra waiting fee',
    ],
    popularFor: ['Budget airline arrivals', 'Business travel', 'City breaks'],
    faqs: [
      { q: 'How far is Don Mueang Airport from central Bangkok?', a: 'About 25 km north of Sukhumvit, a 45–60 minute drive via the expressway (depending on traffic).' },
      { q: 'Is the expressway toll included in the price?', a: 'Yes — all expressway tolls are included in the quoted fixed price.' },
      { q: 'Which areas of Bangkok do you cover?', a: 'We drop off at any hotel, apartment, or address in Bangkok including Sukhumvit, Silom, Khao San Road, and Chatuchak.' },
      { q: 'Can I book this for a departure from Bangkok to Don Mueang?', a: 'Yes — book the reverse direction: Bangkok City to Don Mueang Airport. The fare is the same.' },
    ],
  },
  {
    slug:         'don-mueang-to-pattaya',
    from:         'Don Mueang Airport',
    to:           'Pattaya',
    fromFull:     'Don Mueang Airport (DMK) Arrivals Hall',
    toFull:       'Pattaya Beach Road',
    distanceKm:   140,
    durationMin:  120,
    priceFromTHB: 1800,
    highlights: [
      'Name-sign meet & greet at Don Mueang arrivals',
      'Direct transfer — no Bangkok city transit needed',
      'Fixed price for the full journey via Motorway 7',
      'Flight delay monitoring included at no extra cost',
    ],
    popularFor: ['Budget airline arrivals', 'Beach holidays', 'Family trips'],
    faqs: [
      { q: 'How long from Don Mueang to Pattaya?', a: 'Around 2 hours (140 km). The route crosses Bangkok via the expressway then takes Motorway 7 south to Pattaya.' },
      { q: 'Is it better to fly into Don Mueang or Suvarnabhumi for Pattaya?', a: 'Suvarnabhumi (BKK) is slightly closer to Pattaya, but Don Mueang is served by budget carriers like AirAsia and Nok Air. Both airports have direct private transfers.' },
      { q: 'Can I share this transfer with another group?', a: 'All bookings are private — you get the whole vehicle for your party at a fixed price.' },
      { q: 'Do you cover Jomtien and Na Jomtien?', a: 'Yes — we drop off at any address in the greater Pattaya area including Jomtien, Na Jomtien, and Bang Saray.' },
    ],
  },
];

export function getTransferRoute(slug: string): TransferRoute | undefined {
  return ALL_ROUTES.find(r => r.slug === slug);
}
