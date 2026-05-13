// ─── Tour types & data ────────────────────────────────────────────────────────

export interface TourOption {
  id: string
  time: string           // e.g. "07:00 AM"
  label?: string         // optional label e.g. "Morning departure"
  pricePerPerson: number // adult price in THB
  childPrice: number     // child (3–11) price in THB
  availability: 'available' | 'limited' | 'full'
}

export interface TourItineraryItem {
  step?: string
  title: string
  desc: string
}

export interface TourReview {
  name: string
  country: string
  rating: number
  date: string
  text: string
}

export interface Tour {
  slug: string
  title: string
  subtitle: string
  location: string
  cities: string[]      // destination keywords for matching
  duration: string
  maxGroupSize: number
  languages: string[]
  rating: number
  reviewCount: number
  category: 'day-trip' | 'cultural' | 'adventure' | 'food' | 'nature' | 'water'
  badge?: 'Best Seller' | 'New' | 'Top Rated'
  images: string[]
  highlights: string[]
  description: string
  includes: string[]
  excludes: string[]
  itinerary: TourItineraryItem[]
  options: TourOption[]
  meetingPoint: string
  importantInfo: string[]
  reviews: TourReview[]
  // Feature 5 – Spots & sold-out
  spotsLeft?: number
  soldOut?: boolean
  // Feature 6 – Last booked
  lastBooked?: string
  // Feature 7 – Video preview
  videoUrl?: string
  // Feature 8 – Rating breakdown
  ratingBreakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number }
  // Feature 9 – Frequently booked together
  frequentlyBookedWith?: string[]
  // New fields
  tags?: string[]
  primaryLocation?: string
  subLocation?: string
  priceFrom?: number
  discountPrice?: number
  isFeatured?: boolean
  isPopular?: boolean
  isTrending?: boolean
  instantConfirmation?: boolean
}

// ─── Tour data ─────────────────────────────────────────────────────────────────

export const tours: Tour[] = [

  // ── BANGKOK 1 — Grand Palace & Wat Phra Kaew ───────────────────────────────
  {
    slug: 'bangkok-grand-palace-wat-phra-kaew-guided-tour',
    title: 'Grand Palace & Wat Phra Kaew Guided Tour',
    subtitle: 'Step inside Thailand\'s most iconic royal complex with an expert English-speaking guide',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Grand Palace', 'Rattanakosin'],
    duration: '4 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.9,
    reviewCount: 2847,
    category: 'cultural',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1563492065-74e5b4b17f6d?w=800&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    highlights: [
      'Skip-the-line entry included',
      'Free cancellation',
      'Licensed English-speaking guide',
      'Emerald Buddha (Wat Phra Kaew)',
      'Royal Pantheon & Grand Palace halls',
      'Traditional Thai dress loan if needed',
    ],
    description: 'The Grand Palace is the crown jewel of Bangkok — a dazzling complex of throne halls, royal pavilions, and the sacred Temple of the Emerald Buddha (Wat Phra Kaew) that has been the spiritual heart of Thailand since 1782. On this guided tour you\'ll explore the glittering spires, golden chedis, and intricate murals of the Ramakien epic alongside an expert local guide who brings centuries of royal history to life. Entry tickets and skip-the-line access are included so you spend your time marvelling at the architecture, not waiting in queues.',
    includes: [
      'Admission tickets to Grand Palace & Wat Phra Kaew',
      'Licensed English-speaking guide',
      'Small group (max 15 people)',
      'Hotel pickup and drop-off within central Bangkok',
      'Sarong/shoulder cover loan if required',
      'Bottled water',
    ],
    excludes: [
      'Gratuities (optional)',
      'Personal expenses',
      'Lunch',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup & Transfer',
        desc: 'Your guide meets you at your hotel lobby. Travel by air-conditioned minivan to the Rattanakosin Island area.',
      },
      {
        step: '2',
        title: 'Wat Phra Kaew — Temple of the Emerald Buddha',
        desc: 'Enter the holiest temple in Thailand and behold the revered Emerald Buddha, carved from a single block of jade-like jasper. Admire the gold-covered chedis, guardian giants (Yaksha), and the stunning Ramakien mural gallery that circles the entire cloister.',
      },
      {
        step: '3',
        title: 'Grand Palace Throne Halls',
        desc: 'Walk through the majestic Chakri Maha Prasat, a striking fusion of Italian Renaissance and traditional Thai architecture built in 1882. Your guide explains the significance of each hall and shares stories of Thai kings who shaped the nation.',
      },
      {
        step: '4',
        title: 'Royal Pantheon & Outer Court',
        desc: 'Visit the Royal Pantheon housing life-size statues of the Chakri dynasty kings, then stroll the beautifully landscaped outer court with its replica of Angkor Wat.',
      },
      {
        step: '5',
        title: 'Return Transfer',
        desc: 'Minivan drop-off back to your central Bangkok hotel or nearest BTS/MRT station.',
      },
    ],
    options: [
      {
        id: 'grand-palace-morning',
        time: '08:00 AM',
        label: 'Morning departure',
        pricePerPerson: 1490,
        childPrice: 990,
        availability: 'available',
      },
      {
        id: 'grand-palace-midday',
        time: '10:00 AM',
        label: 'Mid-morning departure',
        pricePerPerson: 1490,
        childPrice: 990,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Dress code strictly enforced: covered shoulders and knees required for all visitors. Free sarongs available at the gate.',
      'The Emerald Buddha chapel may be temporarily closed on certain Buddhist holy days.',
      'Comfortable walking shoes recommended — expect 2–3 km of walking on uneven surfaces.',
      'Best visited early morning to avoid peak crowds and midday heat.',
      'Children under 5 are free; bring passport or ID for children\'s pricing.',
    ],
    reviews: [
      {
        name: 'Sophie M.',
        country: 'Australia',
        rating: 5,
        date: '2025-04-10',
        text: 'Absolutely magnificent. Our guide Khun Noi was exceptional — she made every gilded spire and mural come alive with stories. Having skip-the-line access saved at least an hour. Cannot recommend highly enough for a first visit to Bangkok.',
      },
      {
        name: 'Thomas B.',
        country: 'Germany',
        rating: 5,
        date: '2025-03-22',
        text: 'The Grand Palace is genuinely breathtaking. Our guide knew every detail of the Chakri dynasty and the Ramakien epic. Small group size made it feel personal and unhurried. Worth every baht.',
      },
      {
        name: 'Priya K.',
        country: 'United Kingdom',
        rating: 4,
        date: '2025-02-14',
        text: 'Outstanding experience. A bit hot in the open courtyards around midday — I\'d recommend the morning slot. The guide was knowledgeable and the group stayed small which made it comfortable.',
      },
    ],
    lastBooked: '2 hours ago',
    ratingBreakdown: { 5: 2310, 4: 420, 3: 87, 2: 20, 1: 10 },
    frequentlyBookedWith: ['bangkok-wat-pho-wat-arun-temple-tour', 'bangkok-chao-phraya-dinner-cruise'],
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 2 — Wat Pho & Wat Arun ────────────────────────────────────────
  {
    slug: 'bangkok-wat-pho-wat-arun-temple-tour',
    title: 'Wat Pho & Wat Arun Temple Walking Tour',
    subtitle: 'Marvel at the giant Reclining Buddha and cross the river to the iconic Temple of Dawn',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Wat Pho', 'Wat Arun', 'Chao Phraya'],
    duration: '4 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 1923,
    category: 'cultural',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1569569970363-df7b6160d111?w=800&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&q=80',
    ],
    highlights: [
      'Wat Pho — 46-metre Reclining Buddha',
      'Private longtail boat across Chao Phraya',
      'Wat Arun — climb the steep central prang',
      'Free cancellation',
      'Traditional Thai massage intro at Wat Pho',
      'Small group, max 12 people',
    ],
    description: 'Two of Bangkok\'s most beloved temples sit within a short boat ride of each other along the Chao Phraya River. Wat Pho houses the awe-inspiring 46-metre gold-plated Reclining Buddha — one of the largest in Thailand — and is the birthplace of traditional Thai massage. A short longtail boat hop brings you to Wat Arun, the Temple of Dawn, whose porcelain-encrusted prang towers offer panoramic river views from the top. This intimate small-group tour covers both in a single, unhurried morning or afternoon with a knowledgeable local guide.',
    includes: [
      'Admission tickets to Wat Pho and Wat Arun',
      'Licensed English-speaking guide',
      'Private longtail boat crossing (Chao Phraya River)',
      'Hotel pickup and drop-off (central Bangkok)',
      'Bottled water and cold towel',
    ],
    excludes: [
      'Traditional Thai massage at Wat Pho (available on-site, approx. ฿420/30 min)',
      'Gratuities (optional)',
      'Personal expenses',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup',
        desc: 'Air-conditioned minivan picks you up from your central Bangkok hotel and transfers you to the Wat Pho entrance.',
      },
      {
        step: '2',
        title: 'Wat Pho — Temple of the Reclining Buddha',
        desc: 'Explore the largest temple complex in Bangkok. Marvel at the 46-metre gold-plated Reclining Buddha and 394 golden seated Buddha images. Your guide explains the temple\'s 400-year history and its role as Thailand\'s first university. Optionally book a 30-minute traditional Thai massage at the famous Wat Pho massage school.',
      },
      {
        step: '3',
        title: 'Longtail Boat to Wat Arun',
        desc: 'Board a private longtail boat for the quick crossing of the Chao Phraya River — one of Bangkok\'s most iconic experiences.',
      },
      {
        step: '4',
        title: 'Wat Arun — Temple of Dawn',
        desc: 'Climb the steep steps of the 79-metre central prang, encrusted with millions of colourful Chinese porcelain fragments. At the top, enjoy sweeping views of the Chao Phraya and the Bangkok skyline. Your guide recounts the legend of King Taksin who discovered the temple at dawn.',
      },
      {
        step: '5',
        title: 'Return Transfer',
        desc: 'Boat back across the river and minivan drop-off to your hotel or nearest BTS/MRT.',
      },
    ],
    options: [
      {
        id: 'wat-pho-morning',
        time: '08:00 AM',
        label: 'Morning tour',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
      {
        id: 'wat-pho-afternoon',
        time: '01:00 PM',
        label: 'Afternoon tour',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Dress code: covered shoulders and knees required at both temples.',
      'Climbing the prang at Wat Arun requires reasonable mobility — steep stone steps with handrails.',
      'Wat Arun is particularly beautiful at sunrise and just before sunset.',
      'Bring sunscreen; significant time spent in open courtyards.',
    ],
    reviews: [
      {
        name: 'Laura H.',
        country: 'United States',
        rating: 5,
        date: '2025-04-05',
        text: 'This tour blew me away. The Reclining Buddha is simply enormous — photos don\'t do it justice. The longtail boat ride is a thrill and Wat Arun from the top is one of the best views in Bangkok. Our guide was funny, warm, and deeply knowledgeable.',
      },
      {
        name: 'James W.',
        country: 'Canada',
        rating: 5,
        date: '2025-03-18',
        text: 'Perfect half-day activity. Two incredible temples, a boat ride, and an excellent guide. The small group size meant we never felt rushed or herded around. The optional Thai massage at Wat Pho is absolutely worth the extra cost.',
      },
      {
        name: 'Yuki N.',
        country: 'Japan',
        rating: 4,
        date: '2025-02-28',
        text: 'Very enjoyable tour. Wat Arun is especially stunning — the porcelain detail is extraordinary up close. I\'d suggest going in the morning to avoid the afternoon heat at the top of the prang.',
      },
    ],
    lastBooked: '45 minutes ago',
    ratingBreakdown: { 5: 1560, 4: 290, 3: 55, 2: 12, 1: 6 },
    frequentlyBookedWith: ['bangkok-grand-palace-wat-phra-kaew-guided-tour', 'bangkok-street-food-night-tour'],
    isFeatured: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 3 — Ayutthaya Day Trip ────────────────────────────────────────
  {
    slug: 'bangkok-ayutthaya-ancient-capital-day-trip',
    title: 'Ayutthaya Ancient Capital Full-Day Tour from Bangkok',
    subtitle: 'Explore the UNESCO World Heritage ruins of Thailand\'s former royal capital',
    location: 'Bangkok & Ayutthaya, Thailand',
    cities: ['Bangkok', 'Ayutthaya'],
    duration: '10 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.9,
    reviewCount: 3412,
    category: 'day-trip',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=800&q=80',
      'https://images.unsplash.com/photo-1563492065-74e5b4b17f6d?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      'Free cancellation',
      'Wat Mahathat — Buddha head in tree roots',
      'Elephant nature experience (ethical)',
      'River cruise back to Bangkok',
      'Thai lunch included',
    ],
    description: 'Just 80 km north of Bangkok lies Ayutthaya, one of Asia\'s greatest former capitals and a UNESCO World Heritage Site. Founded in 1350, Ayutthaya was home to 33 kings and rivalled London and Paris in its heyday before being sacked by the Burmese in 1767. Today its atmospheric ruins — toppled chedis, headless Buddhas, and the famous tree-entwined Buddha head at Wat Mahathat — tell a story of a civilisation at the height of its power. This full-day tour covers the key temples, includes a traditional Thai lunch, and returns to Bangkok by scenic river cruise.',
    includes: [
      'Round-trip transportation from Bangkok (air-conditioned minivan)',
      'Licensed English-speaking guide',
      'Admission tickets to all temples',
      'Traditional Thai lunch at a local restaurant',
      'Return journey by scenic river cruise',
      'Bottled water throughout',
    ],
    excludes: [
      'Elephant ride (not offered — ethical sanctuary only)',
      'Gratuities (optional)',
      'Personal purchases',
      'Dinner on return',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Bangkok Hotel Pickup (7:00 AM)',
        desc: 'Early pickup from your central Bangkok hotel. Travel 80 km north by air-conditioned minivan along the expressway (approx. 1.5 hours).',
      },
      {
        step: '2',
        title: 'Wat Phra Si Sanphet',
        desc: 'The most important and impressive temple within the former Royal Palace grounds — three massive chedis once contained royal ashes. Your guide explains the grandeur of Ayutthaya at its 17th-century peak.',
      },
      {
        step: '3',
        title: 'Wat Mahathat',
        desc: 'Home to the iconic sandstone Buddha head entwined in the roots of a bodhi tree. Learn how this haunting image came to exist — and the strict photography etiquette required.',
      },
      {
        step: '4',
        title: 'Wat Ratchaburana',
        desc: 'One of Ayutthaya\'s best-preserved prangs. Descend into the underground crypt where 15th-century royal gold treasures were discovered.',
      },
      {
        step: '5',
        title: 'Thai Lunch',
        desc: 'Traditional Thai lunch at a well-regarded local restaurant near the historical park.',
      },
      {
        step: '6',
        title: 'Wat Yai Chai Mongkhon & Wat Phanan Choeng',
        desc: 'A giant 19-metre tall seated Buddha at Wat Yai Chai Mongkhon, then the bustling, incense-filled Wat Phanan Choeng — particularly revered by the Thai-Chinese community.',
      },
      {
        step: '7',
        title: 'River Cruise Return to Bangkok',
        desc: 'Board a comfortable river cruise and glide south along the Chao Phraya, watching the rural landscape gradually give way to Bangkok\'s skyline. Arrive at the pier in central Bangkok (approx. 5:00 PM).',
      },
    ],
    options: [
      {
        id: 'ayutthaya-standard',
        time: '07:00 AM',
        label: 'Full-day tour',
        pricePerPerson: 1890,
        childPrice: 1290,
        availability: 'available',
      },
      {
        id: 'ayutthaya-private',
        time: '07:00 AM',
        label: 'Private tour (exclusive vehicle)',
        pricePerPerson: 3500,
        childPrice: 2500,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Dress code: covered shoulders and knees required at all temple sites.',
      'Wear comfortable walking shoes — uneven ancient stone surfaces throughout.',
      'Total walking distance is approximately 4–5 km.',
      'River cruise return is weather dependent; minivan return may substitute in case of heavy rain.',
      'The Buddha head at Wat Mahathat: photography is permitted but do not pose at the same level as the head — it is considered highly disrespectful.',
    ],
    reviews: [
      {
        name: 'Mark T.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-04-12',
        text: 'The most memorable day of our Thailand trip. Ayutthaya is hauntingly beautiful — the scale of the ruins and the stories behind them are extraordinary. The river cruise back to Bangkok as the sun set was the perfect ending. An absolute must.',
      },
      {
        name: 'Anna S.',
        country: 'Sweden',
        rating: 5,
        date: '2025-03-30',
        text: 'Incredible historic site. Our guide was brilliant — she brought the whole Ayutthaya kingdom to life. The famous Buddha head in the tree roots is even more moving in person than in photos. Thai lunch was delicious too.',
      },
      {
        name: 'David C.',
        country: 'Australia',
        rating: 5,
        date: '2025-02-16',
        text: 'Best day trip from Bangkok, full stop. We saw so much in one day and the river cruise back was a lovely way to end it. Guide was professional and passionate. Highly recommend the private option if you\'re with family.',
      },
    ],
    lastBooked: '1 hour ago',
    ratingBreakdown: { 5: 2810, 4: 490, 3: 78, 2: 22, 1: 12 },
    frequentlyBookedWith: ['bangkok-grand-palace-wat-phra-kaew-guided-tour', 'bangkok-kanchanaburi-river-kwai-day-trip'],
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 4 — Street Food Night Tour ───────────────────────────────────
  {
    slug: 'bangkok-street-food-night-tour',
    title: 'Bangkok Street Food Night Tour by Tuk-Tuk',
    subtitle: 'Taste your way through Bangkok\'s legendary after-dark food scene with a local foodie guide',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Chinatown', 'Yaowarat', 'Silom'],
    duration: '3.5 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.9,
    reviewCount: 2156,
    category: 'food',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
    ],
    highlights: [
      '10+ food tastings included',
      'Free cancellation',
      'Tuk-tuk rides through Yaowarat Chinatown',
      'Pad Thai, mango sticky rice, boat noodles & more',
      'Insider street stalls tourists never find alone',
      'Small group — max 10 people',
    ],
    description: 'Bangkok is one of the world\'s great street food capitals and nowhere does it better than after dark. On this evening tuk-tuk tour you\'ll zip through neon-lit Yaowarat (Chinatown) and Silom with a passionate local guide, stopping at legendary stalls and hidden hawker spots to taste over 10 different dishes — from silky boat noodles and crispy pork belly to sweet mango sticky rice and fresh-pressed sugarcane juice. No tourist traps, no food courts: just real Bangkok flavour.',
    includes: [
      '10+ street food tastings',
      'Tuk-tuk transport between stops',
      'Licensed English-speaking food guide',
      'Bottled water and wet wipes',
      'Small group (max 10 people)',
    ],
    excludes: [
      'Hotel pickup (meeting point in central Bangkok)',
      'Additional food or drinks beyond the tastings',
      'Gratuities (optional)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Meeting Point — Silom Road',
        desc: 'Meet your guide near Sala Daeng BTS station. Brief introduction and allergy check before heading out.',
      },
      {
        step: '2',
        title: 'Silom Night Market Stalls',
        desc: 'Start with crispy pork satay, fresh spring rolls, and a glass of sweet Thai iced tea at a family-run stall that has been operating since the 1970s.',
      },
      {
        step: '3',
        title: 'Tuk-Tuk to Yaowarat (Chinatown)',
        desc: 'Hop into a classic Bangkok tuk-tuk and weave through traffic to the blazing neon of Yaowarat Road — Bangkok\'s Chinatown and Asia\'s most famous street food strip.',
      },
      {
        step: '4',
        title: 'Yaowarat Chinatown Feast',
        desc: 'Taste dim sum, stir-fried crab with curry powder, oyster omelette (hoi tod), and seafood grilled over charcoal at stalls where Bangkok\'s own chefs eat after their shifts.',
      },
      {
        step: '5',
        title: 'Boat Noodles & Pad Thai',
        desc: 'A short walk brings you to a canal-side vendor for the city\'s most famous boat noodles — rich, dark broth with pork blood and crispy shallots. Then a proper plate of wok-fired Pad Thai at a street cart that has been there for 30 years.',
      },
      {
        step: '6',
        title: 'Dessert Finale — Mango Sticky Rice',
        desc: 'Finish with Bangkok\'s best mango sticky rice: perfectly ripe Nam Dok Mai mango on warm glutinous rice, drizzled with salted coconut cream. Bliss.',
      },
    ],
    options: [
      {
        id: 'street-food-evening',
        time: '06:00 PM',
        label: 'Evening tour',
        pricePerPerson: 1350,
        childPrice: 990,
        availability: 'available',
      },
      {
        id: 'street-food-late',
        time: '07:30 PM',
        label: 'Late evening tour',
        pricePerPerson: 1350,
        childPrice: 990,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Sala Daeng BTS station Exit 2, Silom Road, Bangkok. Guide will hold a Werest sign.',
    importantInfo: [
      'Please inform us of any food allergies or dietary restrictions at booking — our guides will do their best to accommodate.',
      'This tour is not suitable for guests with severe shellfish or peanut allergies.',
      'Wear comfortable walking shoes — approximately 3 km of walking between tuk-tuk rides.',
      'Tour operates rain or shine; most stops have covered areas.',
      'Not recommended for children under 5 due to late evening timing.',
    ],
    reviews: [
      {
        name: 'Emma R.',
        country: 'United States',
        rating: 5,
        date: '2025-04-08',
        text: 'The absolute highlight of our Bangkok trip. Our guide Khun Bua knew every vendor by name and the food kept coming — I honestly couldn\'t believe how much was included. The boat noodles alone were worth the price. Do NOT skip this tour.',
      },
      {
        name: 'Carlos M.',
        country: 'Spain',
        rating: 5,
        date: '2025-03-19',
        text: 'I\'ve done food tours in a dozen cities and this is in my top three of all time. Yaowarat at night is electric. The guide\'s commentary on Bangkok food culture added so much context. The tuk-tuk ride through the narrow lanes at night was a bonus thrill.',
      },
      {
        name: 'Rachel T.',
        country: 'New Zealand',
        rating: 5,
        date: '2025-02-22',
        text: 'Phenomenal. 10+ tastings is no exaggeration — we ate non-stop for 3.5 hours. The mango sticky rice at the end was the best I\'ve had in Thailand. Small group kept it personal. Book early — it sells out constantly.',
      },
    ],
    lastBooked: '20 minutes ago',
    spotsLeft: 4,
    ratingBreakdown: { 5: 1820, 4: 278, 3: 42, 2: 10, 1: 6 },
    frequentlyBookedWith: ['bangkok-thai-cooking-class-market-to-table', 'bangkok-chao-phraya-dinner-cruise'],
    isPopular: true,
    isTrending: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 5 — Thai Cooking Class ───────────────────────────────────────
  {
    slug: 'bangkok-thai-cooking-class-market-to-table',
    title: 'Thai Cooking Class — Market to Table',
    subtitle: 'Shop at a local fresh market, then cook 4 authentic Thai dishes in a real home kitchen',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Chatuchak', 'Ladprao'],
    duration: '5 hours',
    maxGroupSize: 8,
    languages: ['English', 'Thai'],
    rating: 4.9,
    reviewCount: 1678,
    category: 'food',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80',
    ],
    highlights: [
      'Cook 4 dishes: take home the recipes',
      'Free cancellation',
      'Guided fresh market visit',
      'Maximum 8 guests — truly hands-on',
      'Vegetarian menu available',
      'Organic produce from the market',
    ],
    description: 'Learn to cook the real Thai food that locals eat at home — not the watered-down tourist version. This highly-rated market-to-table class begins with a guided walk through a colourful local fresh market where your chef host helps you choose and smell the ingredients: lemongrass, kaffir lime leaves, galangal, and fresh Thai chillies. Back at a beautifully equipped home kitchen, you\'ll cook four classic dishes from scratch, eat what you made for lunch, and leave with a printed recipe booklet. Maximum 8 guests ensures everyone gets plenty of hands-on time at the wok.',
    includes: [
      'Guided fresh market visit',
      'All ingredients and cooking equipment',
      'Hands-on cooking of 4 Thai dishes',
      'Full meal of everything you cooked',
      'Printed recipe booklet to take home',
      'Chef host and assistant',
      'Hotel pickup and drop-off (central Bangkok)',
      'Vegetarian/vegan menu available on request',
    ],
    excludes: [
      'Gratuities (optional)',
      'Alcoholic beverages',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup & Market Visit (8:30 AM)',
        desc: 'Your host picks you up and drives to a local neighbourhood fresh market. Walk through the stalls selecting herbs, proteins, and vegetables — your host explains each ingredient and how it\'s used in Thai cooking.',
      },
      {
        step: '2',
        title: 'Arrival at Home Kitchen',
        desc: 'Welcome with a cold Thai iced tea. Receive your apron and recipe booklet. Brief introduction to the four dishes you\'ll be cooking today.',
      },
      {
        step: '3',
        title: 'Dish 1 — Tom Kha Gai (Coconut Soup)',
        desc: 'Learn the balance of sour, salty, spicy, and sweet in Thailand\'s most famous soup. Make the curry paste from scratch using a stone mortar and pestle.',
      },
      {
        step: '4',
        title: 'Dish 2 — Green Curry or Pad Thai (your choice)',
        desc: 'Wok-fire your chosen main dish over high heat, learning proper Thai technique for controlling the flame and building flavour in layers.',
      },
      {
        step: '5',
        title: 'Dish 3 — Som Tam (Green Papaya Salad)',
        desc: 'Master Thailand\'s most beloved salad: pounding the papaya, balancing fish sauce, lime juice, palm sugar, and dried shrimp to your personal preference.',
      },
      {
        step: '6',
        title: 'Dish 4 — Mango Sticky Rice (Dessert)',
        desc: 'Prepare the perfect glutinous rice with salted coconut cream and pair with fresh mango. Plate your dessert for the Instagram shot your friends will envy.',
      },
      {
        step: '7',
        title: 'Lunch & Return Transfer',
        desc: 'Sit together and enjoy everything you cooked as a shared lunch. Return hotel drop-off by approximately 1:30 PM.',
      },
    ],
    options: [
      {
        id: 'cooking-morning',
        time: '08:30 AM',
        label: 'Morning class',
        pricePerPerson: 1790,
        childPrice: 1290,
        availability: 'available',
      },
      {
        id: 'cooking-afternoon',
        time: '01:30 PM',
        label: 'Afternoon class',
        pricePerPerson: 1790,
        childPrice: 1290,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Please inform us of any food allergies or dietary restrictions — we can adapt most dishes.',
      'Full vegetarian and vegan menus available on request.',
      'Not recommended for children under 6 (hot woks and open flames).',
      'Wear comfortable clothes that you don\'t mind getting a little splattered.',
      'Maximum class size is 8 people — book early as this sells out weeks in advance.',
    ],
    reviews: [
      {
        name: 'Jennifer L.',
        country: 'United States',
        rating: 5,
        date: '2025-04-15',
        text: 'Genuinely the best cooking class I\'ve ever done anywhere in the world. Khun Malee is a wonderful teacher — warm, funny, and brilliant at explaining technique. I went home and made Tom Kha for my family two days after getting back. The market section was a lovely bonus.',
      },
      {
        name: 'Henrik J.',
        country: 'Denmark',
        rating: 5,
        date: '2025-03-25',
        text: 'Superb experience from start to finish. The market visit set a perfect tone — understanding where ingredients come from made the cooking so much more meaningful. And the food we made was restaurant-quality. Already booked one for my next visit.',
      },
      {
        name: 'Aisha M.',
        country: 'UAE',
        rating: 5,
        date: '2025-02-10',
        text: 'Took the vegetarian option and it was outstanding. Every dish was adapted perfectly. Our host was incredibly knowledgeable and patient. The recipe booklet is a treasure. 10/10 without hesitation.',
      },
    ],
    lastBooked: '3 hours ago',
    ratingBreakdown: { 5: 1456, 4: 188, 3: 24, 2: 6, 1: 4 },
    frequentlyBookedWith: ['bangkok-street-food-night-tour', 'bangkok-chao-phraya-dinner-cruise'],
    isFeatured: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 6 — Chao Phraya Dinner Cruise ────────────────────────────────
  {
    slug: 'bangkok-chao-phraya-dinner-cruise',
    title: 'Chao Phraya River Dinner Cruise',
    subtitle: 'A romantic dinner cruise past glittering temples and Bangkok\'s iconic riverside skyline',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Chao Phraya', 'Rattanakosin'],
    duration: '2.5 hours',
    maxGroupSize: 50,
    languages: ['English', 'Thai', 'Chinese', 'Japanese'],
    rating: 4.7,
    reviewCount: 3891,
    category: 'water',
    badge: 'New',
    images: [
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    highlights: [
      'International buffet dinner included',
      'Free cancellation',
      'Live traditional Thai music & dance performance',
      'Illuminated views of Wat Arun & Grand Palace',
      'Air-conditioned indoor & open-air deck',
      'Complimentary welcome drink',
    ],
    description: 'As Bangkok transitions from golden afternoon to neon evening, there is no better vantage point than the Chao Phraya River. The River of Kings glides past some of the city\'s most spectacular sights — the glittering spires of the Grand Palace, the illuminated prang of Wat Arun, Asiatique, and the glittering skyline of the modern city. This elegant dinner cruise combines panoramic river views with a lavish international and Thai buffet, live traditional performances, and a welcome cocktail — a perfect evening for couples, families, and special occasions.',
    includes: [
      'Dinner cruise (2.5 hours)',
      'International and Thai buffet dinner',
      'Complimentary welcome drink (soft drink or beer)',
      'Live Thai cultural performance (music and dance)',
      'Air-conditioned lower deck and open-air upper deck',
      'Hotel pickup and drop-off (selected hotels)',
    ],
    excludes: [
      'Additional alcoholic beverages (available for purchase on board)',
      'Gratuities (optional)',
      'Premium window seat (upgradeable at extra cost)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup or Self-Transfer to Pier (6:30 PM)',
        desc: 'Hotel pickup available for select central Bangkok hotels. Alternatively, make your own way to the embarkation pier at Saphan Taksin (Sathorn Pier) via BTS Silom line.',
      },
      {
        step: '2',
        title: 'Welcome & Boarding',
        desc: 'Receive your welcome drink and board the vessel. Staff will show you to your table (window seats available as upgrade). Both indoor air-conditioned and open-air upper-deck seating available.',
      },
      {
        step: '3',
        title: 'Dinner & River Journey',
        desc: 'As you cruise upriver, enjoy the lavish buffet featuring Thai classics (Tom Yam, green curry, pad Thai, satay) alongside international dishes. The kitchen uses fresh market produce daily.',
      },
      {
        step: '4',
        title: 'Cultural Performance',
        desc: 'Mid-cruise, a troupe of talented performers presents traditional Thai dance (Khon and Lakhon) and live classical Thai music — a window into centuries of royal court artistry.',
      },
      {
        step: '5',
        title: 'Illuminated Landmarks',
        desc: 'Glide past the floodlit Grand Palace, Wat Arun reflecting on the water, the historic Memorial Bridge, and the atmospheric riverside communities that have lined the river for centuries.',
      },
      {
        step: '6',
        title: 'Return to Pier & Transfer',
        desc: 'Disembark at Sathorn Pier (approx. 9:00 PM). Hotel drop-off service available for selected hotels.',
      },
    ],
    options: [
      {
        id: 'dinner-cruise-standard',
        time: '07:00 PM',
        label: 'Standard buffet cruise',
        pricePerPerson: 1590,
        childPrice: 990,
        availability: 'available',
      },
      {
        id: 'dinner-cruise-premium',
        time: '07:00 PM',
        label: 'Premium window seat cruise',
        pricePerPerson: 2190,
        childPrice: 1490,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Sathorn Pier (Saphan Taksin BTS station, Exit 2). Hotel pickup available for selected central Bangkok hotels.',
    importantInfo: [
      'Smart casual dress recommended — no beachwear or shorts.',
      'The open-air upper deck can be breezy in the evening; bring a light layer.',
      'Wheelchair accessible on the lower deck with advance notice.',
      'Cruises operate daily year-round, including public holidays.',
      'Children under 3 are free of charge (no seat at the buffet).',
    ],
    reviews: [
      {
        name: 'Sarah & Paul K.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-04-20',
        text: 'Perfect anniversary dinner. The views of Wat Arun lit up at night are absolutely magical. Buffet was plentiful and high quality — especially the Tom Yam. The Thai dance performance was a lovely touch. Would book this every visit to Bangkok.',
      },
      {
        name: 'Lin X.',
        country: 'China',
        rating: 5,
        date: '2025-03-14',
        text: 'So romantic. Sat on the open upper deck and watched the city glide past. The Grand Palace lit up at night is a sight I\'ll never forget. Food was great, service was attentive. Highly recommend the premium window seat.',
      },
      {
        name: 'Roberto F.',
        country: 'Italy',
        rating: 4,
        date: '2025-02-05',
        text: 'Beautiful experience. The upper deck is the right place to be — don\'t sit inside all evening. Food was good, not extraordinary, but the atmosphere more than makes up for it. The cultural performance was a genuine highlight.',
      },
    ],
    lastBooked: '30 minutes ago',
    ratingBreakdown: { 5: 2980, 4: 720, 3: 140, 2: 35, 1: 16 },
    frequentlyBookedWith: ['bangkok-street-food-night-tour', 'bangkok-grand-palace-wat-phra-kaew-guided-tour'],
    isPopular: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 7 — Muay Thai Training & Show ────────────────────────────────
  {
    slug: 'bangkok-muay-thai-training-and-show',
    title: 'Muay Thai Training Session + Ringside Show Ticket',
    subtitle: 'Train with a professional Muay Thai fighter, then watch the real thing at a Bangkok stadium',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Ratchadamnoen', 'Lumphini'],
    duration: '5 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 892,
    category: 'adventure',
    badge: 'New',
    images: [
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
    ],
    highlights: [
      'Train with an actual Muay Thai champion',
      'Free cancellation',
      'Ringside seat at a real stadium fight night',
      'Full training gear provided',
      'Fitness-level flexible — beginners welcome',
      'Certificate of completion',
    ],
    description: 'Muay Thai — the Art of Eight Limbs — is Thailand\'s national sport and a martial art practised for over 2,000 years. This unique experience combines a genuine 90-minute training session at a professional gym under a championship fighter\'s coaching, followed by a transfer to a world-famous Bangkok stadium for a real fight night with a ringside seat. Learn the eight weapons of Muay Thai (fists, elbows, knees, and shins), nail the fundamentals of stance, footwork, and the devastating Thai clinch — then watch champions demonstrate the real thing live in the ring.',
    includes: [
      '90-minute Muay Thai training session (professional trainer)',
      'Full training gear: gloves, wraps, shin guards, shorts',
      'Ringside fight night ticket at Ratchadamnoen or Lumphini Stadium',
      'Transfer from gym to stadium',
      'Certificate of training completion',
      'Bottled water and sports towel',
    ],
    excludes: [
      'Hotel pickup/drop-off (meeting at gym)',
      'Food and additional drinks',
      'Gratuities (optional)',
      'Return transfer from stadium',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Arrive at Training Gym (3:00 PM)',
        desc: 'Meet your trainer at the professional Muay Thai gym. Change into shorts and get your hands wrapped. Safety briefing and introduction to the eight weapons of Muay Thai.',
      },
      {
        step: '2',
        title: 'Warm-Up & Conditioning (30 min)',
        desc: 'Jump rope, shadow boxing, and basic stretching to warm up muscles and get into fight-mode. Trainer assesses your fitness level and adjusts session intensity accordingly.',
      },
      {
        step: '3',
        title: 'Technique Training (45 min)',
        desc: 'Pad work with your trainer on jabs, crosses, kicks, elbows, and knee strikes. Learn the Thai clinch — the devastating close-range technique that defines Muay Thai. Photo and video allowed throughout.',
      },
      {
        step: '4',
        title: 'Cool-Down & Certificate',
        desc: 'Cool down with stretching, receive your certificate of training, change, and have a quick rest before the evening.',
      },
      {
        step: '5',
        title: 'Transfer to Stadium & Fight Night',
        desc: 'Transfer to Ratchadamnoen or Lumphini Stadium. Take your ringside seat and watch multiple Muay Thai bouts featuring professional fighters — the atmosphere, with traditional Sarama music and passionate crowds, is electrifying.',
      },
    ],
    options: [
      {
        id: 'muay-thai-standard',
        time: '03:00 PM',
        label: 'Training + Ringside ticket',
        pricePerPerson: 2490,
        childPrice: 1890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Fairtex Muay Thai Gym or equivalent professional gym (full address confirmed at booking). BTS accessible.',
    importantInfo: [
      'No prior martial arts experience required — beginners are very welcome.',
      'Minimum age: 8 years. Children under 16 require parental consent form.',
      'Inform us of any injuries, joint issues, or health conditions before booking.',
      'Stadium fight nights are typically Tuesday, Friday, and Saturday at Ratchadamnoen; Monday, Wednesday, Thursday, and Saturday at Lumphini.',
      'Exact stadium depends on fight night schedule — confirmed at booking.',
    ],
    reviews: [
      {
        name: 'Mike O.',
        country: 'United States',
        rating: 5,
        date: '2025-04-03',
        text: 'Bucket list experience. My trainer was an actual Thai champion — watching him demonstrate techniques was mind-blowing. The training session was tough but completely doable for a non-fighter. Then watching real Muay Thai ringside with the drums and crowd? Unbelievable.',
      },
      {
        name: 'Lena K.',
        country: 'Germany',
        rating: 5,
        date: '2025-03-10',
        text: 'As a solo female traveller, I wasn\'t sure what to expect. But the trainer was patient, encouraging, and matched the intensity perfectly to my level. The stadium experience afterwards was raw and genuine — completely different from anything I\'d done before.',
      },
    ],
    ratingBreakdown: { 5: 720, 4: 130, 3: 32, 2: 6, 1: 4 },
    frequentlyBookedWith: ['bangkok-street-food-night-tour', 'bangkok-bicycle-hidden-temples-local-life'],
    isTrending: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 8 — Kanchanaburi Day Trip ────────────────────────────────────
  {
    slug: 'bangkok-kanchanaburi-river-kwai-day-trip',
    title: 'Kanchanaburi & Bridge on the River Kwai Day Trip',
    subtitle: 'Visit the historic WWII bridge, war cemetery, and the stunning countryside of Kanchanaburi Province',
    location: 'Bangkok & Kanchanaburi, Thailand',
    cities: ['Bangkok', 'Kanchanaburi', 'River Kwai'],
    duration: '12 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 2234,
    category: 'day-trip',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&q=80',
      'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=800&q=80',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&q=80',
    ],
    highlights: [
      'Walk across the iconic Bridge on the River Kwai',
      'Free cancellation',
      'Kanchanaburi War Cemetery & JEATH Museum',
      'Erawan Waterfall (optional add-on)',
      'Scenic Death Railway train ride',
      'Thai lunch included',
    ],
    description: 'Kanchanaburi Province, 130 km west of Bangkok, is the setting of one of WWII\'s most poignant stories — the construction of the Death Railway by Allied prisoners of war under brutal Japanese occupation. The bridge that spans the River Kwai here is the surviving centrepiece of that tragic history. This full-day tour visits the bridge, the harrowing Kanchanaburi War Cemetery where 6,982 Allied soldiers are buried, the JEATH War Museum, and includes a short ride on the historic Death Railway train through dramatic limestone scenery. A thoughtful, moving, and historically important day trip that no history lover should miss.',
    includes: [
      'Return air-conditioned transport from Bangkok',
      'Licensed English-speaking guide',
      'Admission to JEATH War Museum',
      'Death Railway train ride (short scenic section)',
      'Traditional Thai lunch at a riverside restaurant',
      'Bottled water',
    ],
    excludes: [
      'Erawan Waterfall entrance (optional add-on: +฿200)',
      'Gratuities (optional)',
      'Personal purchases',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Bangkok Hotel Pickup (6:30 AM)',
        desc: 'Early departure from central Bangkok. Travel 130 km west through the rural central plains to Kanchanaburi (approx. 2 hours).',
      },
      {
        step: '2',
        title: 'Kanchanaburi War Cemetery',
        desc: 'Begin at the beautifully maintained cemetery where 6,982 Allied prisoners of war — British, Australian, Dutch, and American — are buried in immaculate rows. A quiet, sobering moment of reflection.',
      },
      {
        step: '3',
        title: 'JEATH War Museum',
        desc: 'Visit the museum built in the shape of a POW bamboo hut. Photographs, weapons, and personal accounts from survivors document the brutal construction of the 415-km Death Railway that cost over 100,000 lives.',
      },
      {
        step: '4',
        title: 'Bridge on the River Kwai',
        desc: 'Walk across the iconic steel bridge — the surviving portion of the original structure, rebuilt after Allied bombing raids. Your guide recounts the extraordinary history that Pierre Boulle immortalised in his novel and David Lean later filmed here.',
      },
      {
        step: '5',
        title: 'Death Railway Scenic Train Ride',
        desc: 'Board the historic Death Railway for a scenic section through dense jungle and across high wooden viaducts above the Kwai Noi River — the same route carved out by POWs.',
      },
      {
        step: '6',
        title: 'Thai Riverside Lunch',
        desc: 'Lunch at a riverside restaurant with views across the Kwai. Fresh Thai dishes: river prawn tom yam, larb, stir-fried vegetables.',
      },
      {
        step: '7',
        title: 'Return to Bangkok',
        desc: 'Depart Kanchanaburi after lunch, arriving back in central Bangkok by approximately 6:30 PM.',
      },
    ],
    options: [
      {
        id: 'kwai-standard',
        time: '06:30 AM',
        label: 'Full-day tour',
        pricePerPerson: 1990,
        childPrice: 1390,
        availability: 'available',
      },
      {
        id: 'kwai-with-erawan',
        time: '06:30 AM',
        label: 'Full-day + Erawan Falls',
        pricePerPerson: 2290,
        childPrice: 1590,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Long day — 6:30 AM to 6:30 PM. A good level of fitness is recommended.',
      'Wear respectful clothing at the war cemetery and museum.',
      'Erawan Waterfall add-on includes swimming — bring swimwear, water shoes, and a towel.',
      'The train section is on heritage rolling stock; it can be bumpy and warm.',
      'Minimum age: 5 years.',
    ],
    reviews: [
      {
        name: 'Andrew P.',
        country: 'Australia',
        rating: 5,
        date: '2025-04-18',
        text: 'A genuinely moving and important day. Our guide handled the WWII history with great sensitivity and depth. Walking the bridge, seeing the cemetery, and riding the Death Railway with that context was profound. The Erawan Falls add-on made it a perfect full day. Not to be missed.',
      },
      {
        name: 'Fiona M.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-03-07',
        text: 'My grandfather was a POW in this region. Visiting the cemetery and walking the railway was deeply emotional. Our guide was wonderful — respectful, knowledgeable, and gave us all the time we needed. The riverside lunch was lovely too.',
      },
      {
        name: 'Hans D.',
        country: 'Netherlands',
        rating: 4,
        date: '2025-01-25',
        text: 'Highly recommended for anyone interested in WWII history. The museum is small but powerful. The train ride is short but the scenery is spectacular. Long day but completely worthwhile.',
      },
    ],
    ratingBreakdown: { 5: 1840, 4: 330, 3: 48, 2: 12, 1: 4 },
    frequentlyBookedWith: ['bangkok-ayutthaya-ancient-capital-day-trip'],
    isFeatured: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 9 — Chinatown Night Tour ─────────────────────────────────────
  {
    slug: 'bangkok-chinatown-flower-market-night-tour',
    title: 'Bangkok Chinatown & Flower Market Night Tour',
    subtitle: 'Wander through the neon-lit lanes of Yaowarat and the fragrant pre-dawn flower market',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Yaowarat', 'Chinatown', 'Pak Klong Talat'],
    duration: '3 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 1102,
    category: 'cultural',
    badge: 'New',
    images: [
      'https://images.unsplash.com/photo-1602190697742-a9b85e89b4f7?w=800&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    ],
    highlights: [
      'Yaowarat neon-lit Chinatown at night',
      'Free cancellation',
      'Pak Klong Talat — Bangkok\'s 24-hour flower market',
      '4–5 street food tastings included',
      'Gold shops, shrines, and hidden temples',
      'Small group — max 10 people',
    ],
    description: 'Bangkok\'s Chinatown (Yaowarat) transforms at night into one of Asia\'s most electrifying street scenes — neon signs in Thai and Chinese script, the smell of roasting duck and steaming char siu, and narrow lanes packed with gold merchants, herbal medicine shops, and century-old shrines. This night walk continues to Pak Klong Talat, Bangkok\'s famous 24-hour flower market where thousands of jasmine garlands, lotus blooms, and orchids arrive from Thailand\'s farms every night to supply the city\'s temples and homes. A deeply atmospheric evening that reveals the real soul of Bangkok.',
    includes: [
      '4–5 street food tastings (dim sum, BBQ pork, golden syrup buns, egg tarts)',
      'Licensed English-speaking guide',
      'Walking tour of Yaowarat Chinatown',
      'Visit to Pak Klong Talat flower market',
      'Hidden temple stops',
      'Bottled water',
    ],
    excludes: [
      'Hotel pickup (meeting point in Chinatown)',
      'Additional food and drinks',
      'Gratuities (optional)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Meet at Wat Traimit — Golden Buddha (6:30 PM)',
        desc: 'Begin at Wat Traimit near the eastern entrance of Chinatown — home to the world\'s largest solid-gold Buddha statue (5.5 tonnes, 18-carat gold). Your guide shares the extraordinary story of how it was discovered by accident in 1955.',
      },
      {
        step: '2',
        title: 'Yaowarat Road — Heart of Chinatown',
        desc: 'Walk along the main neon artery of Chinatown as it comes fully alive. Visit the gold shops that have made Yaowarat the gold-trading capital of Southeast Asia, and duck into lanes of herb and spice merchants.',
      },
      {
        step: '3',
        title: 'Hidden Shrines & Street Food Tastings',
        desc: 'Weave through narrow sois (alleyways) to find ancient Chinese shrines tucked between shophouses. Along the way: BBQ pork belly, steamed dim sum, and the legendary crispy pork from a stall that has been here for 60 years.',
      },
      {
        step: '4',
        title: 'Golden Syrup Buns & Egg Tarts',
        desc: 'Sample the famous golden syrup-filled buns (salapao) from a Chinatown bakery and traditional Chinese egg tarts — perfect with a cup of soy milk.',
      },
      {
        step: '5',
        title: 'Pak Klong Talat — Flower Market',
        desc: 'Walk to Bangkok\'s fragrant 24-hour flower market where trucks arrive overnight from Thailand\'s northern farms. Thousands of marigold and jasmine garlands, pink lotus blossoms, and tropical orchids fill the market in a riot of colour and scent. A photographer\'s paradise.',
      },
    ],
    options: [
      {
        id: 'chinatown-evening',
        time: '06:30 PM',
        label: 'Evening tour',
        pricePerPerson: 1090,
        childPrice: 790,
        availability: 'available',
      },
    ],
    meetingPoint: 'Wat Traimit entrance (Golden Buddha Temple), Yaowarat Road, Bangkok. Near MRT Hua Lamphong station (5-min walk).',
    importantInfo: [
      'Wear comfortable walking shoes — approximately 3 km on foot through busy market streets.',
      'Not recommended for guests with severe nut or shellfish allergies.',
      'Chinatown is especially vibrant during Chinese New Year (late January/February).',
      'Photography is welcome throughout except inside certain shrine interiors.',
    ],
    reviews: [
      {
        name: 'Julia R.',
        country: 'France',
        rating: 5,
        date: '2025-04-22',
        text: 'I\'ve visited Bangkok three times and this tour showed me a Chinatown I\'d never seen. Our guide Khun Chai knew every hidden lane and every vendor family. The flower market at the end was absolutely magical — the colours and smells at night are unforgettable.',
      },
      {
        name: 'David M.',
        country: 'Canada',
        rating: 5,
        date: '2025-03-11',
        text: 'A perfect Bangkok evening. The Chinatown food stops were all outstanding — especially the crispy pork. And the Golden Buddha story was astonishing. I had no idea it existed. Beautifully designed tour.',
      },
    ],
    ratingBreakdown: { 5: 910, 4: 155, 3: 28, 2: 7, 1: 2 },
    frequentlyBookedWith: ['bangkok-street-food-night-tour', 'bangkok-chao-phraya-dinner-cruise'],
    isTrending: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 10 — Amphawa Floating Market ─────────────────────────────────
  {
    slug: 'bangkok-amphawa-floating-market-firefly-tour',
    title: 'Amphawa Floating Market & Firefly Evening Boat Tour',
    subtitle: 'Explore a charming canal market by boat then drift through firefly-lit mangroves at dusk',
    location: 'Bangkok & Amphawa, Samut Songkhram, Thailand',
    cities: ['Bangkok', 'Amphawa', 'Samut Songkhram', 'Damnoen Saduak'],
    duration: '9 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 1567,
    category: 'nature',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    highlights: [
      'Amphawa — Thailand\'s most authentic floating market',
      'Free cancellation',
      'Evening firefly boat through mangroves',
      'Freshly grilled seafood from the canal boats',
      'Makha Bucha temple at dusk',
      'Small group only — max 12',
    ],
    description: 'While Damnoen Saduak gets the tour buses, Amphawa is where Thai people actually go — a wonderfully authentic wooden canalside market full of freshly grilled river prawns, coconut pancakes, and fresh fruit, set among century-old teak shophouses draped with flowering creepers. In the late afternoon the canal boats start up their grills and the market hums with locals. Then, as darkness falls, a traditional wooden longtail takes you through the mangrove waterways where thousands of fireflies light up the trees — a glittering natural phenomenon that has been occurring here for centuries. Truly one of Thailand\'s most magical experiences.',
    includes: [
      'Return air-conditioned transport from Bangkok',
      'Licensed English-speaking guide',
      'Boat transfer on Amphawa canal market',
      'Evening firefly longtail boat tour (1 hour)',
      'Seafood lunch at a riverside restaurant',
      'Bottled water',
    ],
    excludes: [
      'Food and drinks at the market (budget ฿200–400 per person)',
      'Gratuities (optional)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Bangkok Hotel Pickup (8:00 AM)',
        desc: 'Morning departure from central Bangkok. Drive southwest 70 km to Samut Songkhram Province (approx. 90 minutes).',
      },
      {
        step: '2',
        title: 'Mae Klong Railway Market (optional stop)',
        desc: 'Optional stop at the famous railway market where vendors pull back their awnings as the train passes through the middle of the market — one of Thailand\'s most quirky and photogenic sights.',
      },
      {
        step: '3',
        title: 'Riverside Seafood Lunch',
        desc: 'Fresh seafood lunch at a riverside restaurant near Amphawa — grilled river prawns, steamed sea bass, and pad pak boong (morning glory stir-fry).',
      },
      {
        step: '4',
        title: 'Amphawa Floating Market — Afternoon',
        desc: 'As the market wakes up in the afternoon, take a small boat through the canal past vendor boats selling freshly grilled seafood, coconut ice cream, and tod mun pla (fish cakes). Stop to browse the riverside temples and century-old wooden shophouses.',
      },
      {
        step: '5',
        title: 'Sunset at Wat Amphawan Chetiyaram',
        desc: 'Visit the beautiful riverside temple at dusk — watch monks receive alms and enjoy the peaceful golden light on the canal.',
      },
      {
        step: '6',
        title: 'Firefly Evening Boat Tour',
        desc: 'After nightfall, board a quiet longtail boat for a 1-hour tour through the mangrove waterways. As your eyes adjust, thousands of fireflies illuminate the trees in synchronised pulses of light — a breathtaking natural spectacle. Silence is requested to preserve the magic.',
      },
      {
        step: '7',
        title: 'Return to Bangkok',
        desc: 'Return drive to Bangkok, arriving approximately 9:30 PM.',
      },
    ],
    options: [
      {
        id: 'amphawa-standard',
        time: '08:00 AM',
        label: 'Full-day tour with fireflies',
        pricePerPerson: 1690,
        childPrice: 1190,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Long day — 8:00 AM to 9:30 PM. Comfortable footwear and insect repellent recommended.',
      'Firefly viewing is best on darker nights; full moon periods may reduce intensity.',
      'The market is most active Friday–Sunday; the tour runs daily but is especially vibrant on weekends.',
      'Children under 3 are free but must be held by a parent on the longtail boat.',
      'Bring cash (THB) for market purchases — most vendors are cash only.',
    ],
    reviews: [
      {
        name: 'Claire J.',
        country: 'Australia',
        rating: 5,
        date: '2025-04-27',
        text: 'The firefly tour was the most magical thing I have ever seen. Thousands of them, all flashing in rhythm in the pitch black mangroves. Our guide was excellent throughout a very long but wonderful day. Amphawa is so much more authentic and charming than Damnoen Saduak too.',
      },
      {
        name: 'Kevin S.',
        country: 'United States',
        rating: 5,
        date: '2025-03-15',
        text: 'One of the best days of my life. The fireflies alone justify the entire trip to Thailand. The floating market grilled prawns were incredible. Get this on your itinerary — it\'s completely different from anything else in Bangkok.',
      },
      {
        name: 'Isabelle V.',
        country: 'Belgium',
        rating: 5,
        date: '2025-02-21',
        text: 'Breathtaking from start to finish. The railway market stop was hilarious and the fireflies were unbelievable. A very long day but every hour was worth it. Guide was excellent and the group was small and friendly.',
      },
    ],
    lastBooked: '2 hours ago',
    ratingBreakdown: { 5: 1280, 4: 240, 3: 37, 2: 8, 1: 2 },
    frequentlyBookedWith: ['bangkok-ayutthaya-ancient-capital-day-trip'],
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 11 — Bicycle Hidden Temples ──────────────────────────────────
  {
    slug: 'bangkok-bicycle-hidden-temples-local-life',
    title: 'Bangkok by Bicycle: Backstreets, Temples & Local Life',
    subtitle: 'Explore Bangkok\'s hidden communities, gardens, and temples on two wheels with a local guide',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Thonburi', 'Bang Rak', 'Phra Nakhon'],
    duration: '4 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.9,
    reviewCount: 1089,
    category: 'adventure',
    badge: 'New',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
    ],
    highlights: [
      'Explore Thonburi\'s canal communities by bike',
      'Free cancellation',
      'Local market snack stop included',
      'Hidden temples tourists never find alone',
      'Flat, easy cycling — beginner friendly',
      'Maximum 10 guests',
    ],
    description: 'The Bangkok most visitors miss is not the traffic-choked avenues but the quiet lanes and canal paths of Thonburi — the ancient capital that pre-dates Bangkok itself. This early-morning bicycle tour weaves through palm-shaded sois past local fruit sellers, wooden canal houses, century-old Chinese temples, neighbourhood Buddhist shrines, and gardens bursting with tropical plants. Your guide stops at a neighbourhood market for fresh coconut water, passes through Muslim and Christian communities that have lived here for generations, and reveals a city as complex and layered as any on earth. Easy, flat cycling on quiet backstreets — suitable for all fitness levels.',
    includes: [
      'Quality bicycle rental',
      'Licensed cycling guide',
      'Safety helmet',
      'Fresh coconut water and market snack',
      'Small group (max 10)',
    ],
    excludes: [
      'Hotel pickup (meeting point provided)',
      'Additional food and drinks',
      'Gratuities (optional)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Meet at Pier & Bike Fitting (7:00 AM)',
        desc: 'Cross the Chao Phraya by ferry to Thonburi. Collect your bicycle and helmet, complete a quick bike check, and get a route briefing.',
      },
      {
        step: '2',
        title: 'Canal Paths & Wooden Stilt Houses',
        desc: 'Cycle along quiet canal paths past authentic Thonburi communities. Peek through gates at wooden houses built on stilts over the khlong (canal), and watch local life unfold: children in school uniforms, monks collecting alms, vendors setting up fruit stalls.',
      },
      {
        step: '3',
        title: 'Hidden Buddhist Temples',
        desc: 'Visit two neighbourhood temples that appear on no tourist map — serene, intimate, and decorated with beautiful folk murals. Your guide explains the temple community system that has held Thai neighbourhoods together for centuries.',
      },
      {
        step: '4',
        title: 'Neighbourhood Market & Snack Stop',
        desc: 'Stop at a local fresh market for fresh coconut water straight from the shell and a selection of Thai market snacks: bite-size kanom (Thai sweets), roti, and whatever the vendors have that morning.',
      },
      {
        step: '5',
        title: 'Muslim & Portuguese Quarter',
        desc: 'Cycle through the historic Kudee Chin area — home to a Portuguese church built in the 1820s, a mosque, and a Buddhist temple all within 200 metres of each other. An extraordinary window into Bangkok\'s multicultural soul.',
      },
      {
        step: '6',
        title: 'Return Ferry & End of Tour',
        desc: 'Ferry back across the Chao Phraya. Tour concludes at the pier (approx. 11:00 AM).',
      },
    ],
    options: [
      {
        id: 'bicycle-morning',
        time: '07:00 AM',
        label: 'Morning ride',
        pricePerPerson: 1190,
        childPrice: 890,
        availability: 'available',
      },
      {
        id: 'bicycle-late-afternoon',
        time: '04:00 PM',
        label: 'Late afternoon ride',
        pricePerPerson: 1190,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Tha Tien Pier (near Wat Pho), Bangkok. 5-min walk from the Wat Pho entrance.',
    importantInfo: [
      'Minimum height: 140 cm to use the adult bicycles safely.',
      'Morning tour is strongly recommended — cooler temperatures and empty lanes make it the best experience.',
      'Dress code: covered shoulders required when entering temples on the route.',
      'Flat, paved route — no hills. Total cycling distance approx. 12 km at a leisurely pace.',
      'Bring sunscreen and a small day bag for your water bottle.',
    ],
    reviews: [
      {
        name: 'Natalie F.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-04-30',
        text: 'The most unexpected highlight of our Thailand trip. We had no idea this old Bangkok existed under the modern city. Our guide was extraordinary — he knew every community, every story, and every hidden temple. The Portuguese church surrounded by Thailand was genuinely jaw-dropping.',
      },
      {
        name: 'Tom V.',
        country: 'Netherlands',
        rating: 5,
        date: '2025-03-28',
        text: 'Perfect early morning activity. The canals were misty, the streets were quiet, and the atmosphere was just magical. The market stop with fresh coconut water was a lovely touch. Miles better than any tuk-tuk tour.',
      },
      {
        name: 'Mia C.',
        country: 'France',
        rating: 5,
        date: '2025-02-19',
        text: 'A completely different side of Bangkok. The multicultural quarter near Kudee Chin is astonishing — I had no idea that community existed. Guide was passionate and the group was small and lovely. Do the morning slot: the light and the atmosphere are worth waking up early for.',
      },
    ],
    ratingBreakdown: { 5: 920, 4: 140, 3: 22, 2: 5, 1: 2 },
    frequentlyBookedWith: ['bangkok-wat-pho-wat-arun-temple-tour', 'bangkok-street-food-night-tour'],
    isTrending: true,
    instantConfirmation: true,
  },

  // ── BANGKOK 12 — Damnoen Saduak Floating Market ───────────────────────────
  {
    slug: 'bangkok-damnoen-saduak-floating-market-day-trip',
    title: 'Damnoen Saduak Floating Market & Maeklong Railway Market',
    subtitle: 'See colourful vendor boats on Thailand\'s most famous floating market, then the world-famous train market',
    location: 'Bangkok & Ratchaburi, Thailand',
    cities: ['Bangkok', 'Damnoen Saduak', 'Maeklong', 'Ratchaburi'],
    duration: '7 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.7,
    reviewCount: 4213,
    category: 'day-trip',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1543069190-9c54d27a7a50?w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    highlights: [
      'Damnoen Saduak — most photogenic floating market in Thailand',
      'Free cancellation',
      'Maeklong Railway Market — train through the market!',
      'Longtail boat canal tour included',
      'Tropical fruit and local snack tasting',
      'Return transfer from Bangkok included',
    ],
    description: 'Two of Thailand\'s most extraordinary markets in one day — that\'s what this popular day trip from Bangkok delivers. Damnoen Saduak\'s network of canals fills every morning with wooden rowing boats piled high with tropical fruits, freshly cooked pad thai, coconut pancakes, and spices. A longtail boat whisks you through the narrowest canal lanes to the best vendor action. Then it\'s on to Maeklong — the market where vendors have adapted for generations to a train passing through the middle of their stalls four times a day. The awnings retract, the train squeezes through, and within seconds everything snaps back to normal. Wild, chaotic, and utterly brilliant.',
    includes: [
      'Round-trip air-conditioned transport from Bangkok',
      'Licensed English-speaking guide',
      'Longtail boat tour of Damnoen Saduak canals',
      'Fruit and snack tasting at the market',
      'Maeklong Railway Market visit',
      'Bottled water',
    ],
    excludes: [
      'Lunch (food available for purchase at the market, budget ฿150–300)',
      'Shopping at the market',
      'Gratuities (optional)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Bangkok Hotel Pickup (7:00 AM)',
        desc: 'Pick-up from central Bangkok hotels. Drive 100 km southwest to Ratchaburi Province (approx. 90 minutes on the expressway).',
      },
      {
        step: '2',
        title: 'Damnoen Saduak — Longtail Boat Tour',
        desc: 'Board a longtail boat for a thrilling blast through the narrow canal network. Weave past vendor boats paddled by women in traditional pointed straw hats selling fresh fruit, coconut juice, and snacks directly from their boats.',
      },
      {
        step: '3',
        title: 'Floating Market Exploration',
        desc: 'Dock and walk through the covered market section for fresh tropical fruit tasting: rambutan, mangosteen, rose apple, and longan. Watch pad thai being cooked on a tiny boat stove and try a freshly grilled corn on a vendor\'s charcoal grill.',
      },
      {
        step: '4',
        title: 'Transfer to Maeklong Railway Market',
        desc: 'Short drive (30 minutes) to Samut Songkhram Province and the extraordinary Maeklong Railway Market.',
      },
      {
        step: '5',
        title: 'Maeklong Railway Market — Train Watch',
        desc: 'Browse this vibrant produce market where vendors set up their stalls right on the railway tracks. When the train horn sounds, everyone calmly pulls back their awnings and vegetables by a few centimetres, the train rolls through at walking pace, and then within seconds it\'s all back to normal. Happens 4 times daily — your guide times the visit to catch it.',
      },
      {
        step: '6',
        title: 'Return to Bangkok',
        desc: 'Depart Maeklong by approximately 1:30 PM. Return to central Bangkok hotels by 3:00 PM.',
      },
    ],
    options: [
      {
        id: 'floating-market-morning',
        time: '07:00 AM',
        label: 'Morning departure',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel lobby pickup (central Bangkok). Specify your hotel at checkout.',
    importantInfo: [
      'Damnoen Saduak is most lively 7:00–10:00 AM — early departure is essential.',
      'Wear light, cool clothing — very humid in the canal area.',
      'Negotiating with vendors is expected and friendly — have small denomination Thai baht ready.',
      'The railway market train times vary; our guide plans arrival around a scheduled train crossing.',
      'Longtail boat is fast and loud — ear protection provided.',
    ],
    reviews: [
      {
        name: 'Michelle L.',
        country: 'United States',
        rating: 5,
        date: '2025-04-14',
        text: 'The floating market is everything you imagine — colourful, chaotic, and wonderful. The longtail boat ride was a thrill. And the train market was absolutely insane in the best possible way. Watched it go through twice. Our guide was cheerful and kept everything running perfectly.',
      },
      {
        name: 'Wolfgang H.',
        country: 'Germany',
        rating: 4,
        date: '2025-03-05',
        text: 'Classic Thailand experience. The floating market is touristy but genuinely fun and photogenic. The train market is the real highlight — completely mad and very entertaining. Good value for a half-day trip.',
      },
      {
        name: 'Sandra T.',
        country: 'Brazil',
        rating: 5,
        date: '2025-01-30',
        text: 'Fantastic morning. The boat through the narrow canals, the tropical fruit tasting, and that train squeezing between the vegetable stalls — perfect combination. Easy, well-organised, great guide. Definitely book this one.',
      },
    ],
    lastBooked: '15 minutes ago',
    ratingBreakdown: { 5: 3340, 4: 720, 3: 110, 2: 30, 1: 13 },
    frequentlyBookedWith: ['bangkok-ayutthaya-ancient-capital-day-trip', 'bangkok-amphawa-floating-market-firefly-tour'],
    isPopular: true,
    instantConfirmation: true,
  },

]

// ─── Helper functions ──────────────────────────────────────────────────────────

export function getToursForDestination(destination: string): Tour[] {
  const lower = destination.toLowerCase()
  return tours.filter(t =>
    t.cities.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()))
  )
}

export interface TourSearchParams {
  q?:           string
  destination?: string
  category?:    string
  type?:        string
  sort?:        string
  // Feature 1 – Duration filter
  duration?:    'half-day' | 'full-day' | 'multi-day' | string
  // Feature 3 – Price range
  minPrice?:    number
  maxPrice?:    number
  // Feature 4 – Group size
  groupSize?:   number
  // Feature 10 – Language filter
  language?:    string
}

function parseDurationHours(duration: string): number | null {
  // e.g. "4 hours", "10 hours", "2 days"
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*hour/i)
  if (hourMatch) return parseFloat(hourMatch[1])
  const dayMatch = duration.match(/(\d+(?:\.\d+)?)\s*day/i)
  if (dayMatch) return parseFloat(dayMatch[1]) * 24
  return null
}

export function searchTours(
  params: string | TourSearchParams,
  source: Tour[] = tours,
): Tour[] {
  const { q = '', destination = '', category = '', type = '', duration = '', minPrice, maxPrice, groupSize, language = '' } =
    typeof params === 'string' ? { q: params } : params

  let results = source

  if (q) {
    const lower = q.toLowerCase()
    results = results.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.subtitle.toLowerCase().includes(lower) ||
      t.location.toLowerCase().includes(lower) ||
      t.cities.some(c => c.toLowerCase().includes(lower)) ||
      t.category.toLowerCase().includes(lower) ||
      t.highlights.some(h => h.toLowerCase().includes(lower))
    )
  }

  if (destination) {
    const lower = destination.toLowerCase()
    results = results.filter(t =>
      t.cities.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())) ||
      t.location.toLowerCase().includes(lower)
    )
  }

  if (category) {
    results = results.filter(t => t.category === category)
  }

  if (type && !category) {
    results = results.filter(t => t.category === type)
  }

  // Feature 1 – Duration filter
  if (duration) {
    results = results.filter(t => {
      const hours = parseDurationHours(t.duration)
      const dStr  = t.duration.toLowerCase()
      if (duration === 'half-day') {
        // < 5 hours and contains "hour"
        return dStr.includes('hour') && hours !== null && hours < 5
      }
      if (duration === 'full-day') {
        // 5–10 hours OR contains "full day"
        return (hours !== null && hours >= 5 && hours <= 10) || dStr.includes('full day')
      }
      if (duration === 'multi-day') {
        // contains "day" with number > 1
        const dayMatch = t.duration.match(/(\d+)\s*day/i)
        return !!(dayMatch && parseInt(dayMatch[1]) > 1)
      }
      return true
    })
  }

  // Feature 3 – Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    results = results.filter(t => {
      const minOptionPrice = Math.min(...t.options.map(o => o.pricePerPerson))
      if (minPrice !== undefined && minOptionPrice < minPrice) return false
      if (maxPrice !== undefined && minOptionPrice > maxPrice) return false
      return true
    })
  }

  // Feature 4 – Group size
  if (groupSize !== undefined && groupSize > 0) {
    results = results.filter(t => t.maxGroupSize >= groupSize)
  }

  // Feature 10 – Language filter
  if (language) {
    results = results.filter(t =>
      t.languages.some(l => l.toLowerCase() === language.toLowerCase())
    )
  }

  return results
}

export function getTourBySlug(slug: string): Tour | undefined {
  return tours.find(t => t.slug === slug)
}

export function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString('en-US')}`
}
