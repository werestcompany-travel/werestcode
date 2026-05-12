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

  // ── BANGKOK 1 ──────────────────────────────────────────────────────────────
  {
    slug: 'bangkok-grand-palace-wat-phra-kaew-walking-tour',
    title: 'Grand Palace & Wat Phra Kaew Walking Tour',
    subtitle: 'Explore Thailand\'s most sacred royal complex with an expert local guide',
    location: 'Bangkok, Thailand',
    cities: ['bangkok', 'bkk'],
    duration: '4 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai', 'Chinese', 'Japanese'],
    rating: 4.9,
    reviewCount: 2847,
    category: 'cultural',
    badge: 'Best Seller',
    primaryLocation: 'Bangkok',
    tags: ['cultural', 'temple', 'history', 'walking', 'royal'],
    priceFrom: 1290,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    spotsLeft: 3,
    lastBooked: '2 hours ago',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ratingBreakdown: { 5: 2650, 4: 142, 3: 40, 2: 10, 1: 5 },
    frequentlyBookedWith: ['bangkok-floating-market-thai-cooking-class'],
    images: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
      'https://images.unsplash.com/photo-1512553313200-fe7f7d4c0a26?w=1200&q=80',
    ],
    highlights: [
      'Skip-the-queue entry tickets to the Grand Palace & Wat Phra Kaew included',
      'Expert English-speaking guide with deep knowledge of Thai royal history',
      'Marvel at the Emerald Buddha — Thailand\'s most revered religious icon',
      'Explore the ornate Throne Hall, the Chakri Maha Prasat, and royal pavilions',
      'Learn about Chakri Dynasty history spanning over 200 years',
      'Small group capped at 15 for a personal, unhurried experience',
      'Convenient meeting point near the main entrance on Na Phra Lan Road',
    ],
    description: `Step inside the gilded walls of Bangkok's most iconic landmark on this expertly guided walking tour of the Grand Palace and Wat Phra Kaew (Temple of the Emerald Buddha). Built in 1782, the Grand Palace served as the official residence of Thai kings for over 150 years and remains the spiritual heart of the kingdom today.

Your knowledgeable local guide will lead you through a maze of ornate buildings, sacred temples, and meticulously manicured courtyards while bringing centuries of royal history to life. You'll stand before the revered Emerald Buddha — carved from a single block of green jade and dressed in seasonal robes changed by the King himself — and admire the glittering mosaic-covered chedis and mythical guardian giants that line the temple complex.

Beyond Wat Phra Kaew, discover the opulent Chakri Maha Prasat Throne Hall with its fusion of Thai and European Renaissance architecture, the traditional Thai-style Dusit Maha Prasat, and the reclining Phra Ubosot chapel. Every corner reveals another masterpiece of Thai craftsmanship.

Tickets are included so you never waste time in ticket queues, and the small group size (maximum 15 people) guarantees you hear every word and can ask questions freely. Dress code is enforced at the gate — shoulders and knees must be covered (sarongs available to borrow at the entrance).`,
    includes: [
      'Grand Palace & Wat Phra Kaew entrance tickets (฿500 value)',
      'Professional English-speaking licensed guide',
      'Bottled water (1 per person)',
      'Small-group experience (max 15 people)',
      'Hotel pickup available (Bangkok city centre only, +฿200)',
    ],
    excludes: [
      'Personal expenses and gratuities',
      'Food and additional drinks',
      'Transport to/from meeting point (unless hotel pickup selected)',
      'Sarong rental if required (฿50 deposit, fully refundable)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Meet your guide at Na Phra Lan Gate',
        desc: 'Gather at the designated meeting point outside the main Grand Palace entrance. Your guide will hold a Werest Travel sign. Quick group briefing and dress-code check — sarongs available to borrow if needed.',
      },
      {
        step: '2',
        title: 'Enter Wat Phra Kaew — Temple of the Emerald Buddha',
        desc: 'Enter the most sacred temple in Thailand. Your guide explains the legend of the Emerald Buddha, the significance of its three seasonal robes, and the intricate murals of the Ramakien epic that line the surrounding galleries.',
      },
      {
        step: '3',
        title: 'Guardian Giants & Golden Chedis',
        desc: 'Walk among the towering Yaksha demon guardians and golden chedi spires. Learn why each guardian figure holds a different weapon and what the chedis contain — relics of past kings and sacred Buddhist objects.',
      },
      {
        step: '4',
        title: 'The Chakri Maha Prasat Throne Hall',
        desc: 'Marvel at the grandest building in the complex — a blend of Italian Renaissance and traditional Thai rooflines commissioned by King Rama V after his European tour. Your guide reveals the diplomatic story behind this architectural fusion.',
      },
      {
        step: '5',
        title: 'Dusit Maha Prasat & Royal Pantheon',
        desc: 'Admire the pure Thai-style Dusit Maha Prasat with its four-tiered roof and mother-of-pearl throne inside, then pass the Royal Pantheon where life-size statues of all past Chakri kings are enshrined.',
      },
      {
        step: '6',
        title: 'Wrap-up & Photo Time',
        desc: 'Your guide shares final stories and tips for exploring Bangkok independently. Plenty of time for photos before the tour concludes at the main gate. Optional: continue to nearby Wat Pho (Temple of the Reclining Buddha) just 5 minutes\' walk away.',
      },
    ],
    options: [
      {
        id: 'bkk-gp-morning',
        time: '08:00 AM',
        label: 'Morning Tour (recommended — cooler & fewer crowds)',
        pricePerPerson: 1490,
        childPrice: 990,
        availability: 'available',
      },
      {
        id: 'bkk-gp-midmorning',
        time: '10:00 AM',
        label: 'Mid-Morning Tour',
        pricePerPerson: 1490,
        childPrice: 990,
        availability: 'limited',
      },
      {
        id: 'bkk-gp-afternoon',
        time: '01:00 PM',
        label: 'Afternoon Tour',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Na Phra Lan Road Gate (main visitor entrance), opposite the Ministry of Defence. Look for the Werest Travel sign. BTS: Saphan Taksin + Chao Phraya Express Boat to Tha Chang Pier (N9), 5-min walk.',
    importantInfo: [
      'Dress code strictly enforced: shoulders and knees must be covered for all visitors. Sleeveless tops and shorts above the knee are not permitted. Sarongs available to borrow at the entrance.',
      'The Grand Palace is closed on certain royal ceremony days — we will notify you in advance if your date is affected and offer a full refund or reschedule.',
      'The Emerald Buddha chapel has a "no photography inside" policy. Your guide will remind you before entry.',
      'This tour involves approximately 2.5 km of walking on uneven stone surfaces. Comfortable, closed-toe shoes are strongly recommended.',
      'Children under 3 are free; aged 3–11 qualify for child pricing. Proof of age may be required.',
      'Bangkok temperatures average 33–38 °C. Bring sunscreen, a hat, and stay hydrated.',
      'Maximum group size is 15 people. Book early — morning slots sell out 3–5 days in advance.',
    ],
    reviews: [
      {
        name: 'Sarah M.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-03-14',
        text: 'Absolutely fantastic tour! Our guide Khun Nok was phenomenal — she brought every building to life with stories I\'d never have discovered on my own. The morning time slot was perfect; we were done before the crowds hit. Skip the queue tickets saved us at least 45 minutes. Highly recommend booking the 8am slot.',
      },
      {
        name: 'James T.',
        country: 'Australia',
        rating: 5,
        date: '2025-02-28',
        text: 'Worth every baht. Our guide was incredibly knowledgeable and spoke perfect English. The small group made a real difference — we could ask questions and get personal attention. Wear good shoes, the ground is uneven. Overall a 10/10 experience.',
      },
      {
        name: 'Yuki H.',
        country: 'Japan',
        rating: 5,
        date: '2025-04-02',
        text: 'We had the Japanese-speaking guide and she was exceptional. The detail about the Ramakien murals was incredible — I had no idea the story was so epic. Tickets included, no queuing, small group. This is the best way to see the Grand Palace.',
      },
      {
        name: 'Carlos R.',
        country: 'Spain',
        rating: 4,
        date: '2025-01-19',
        text: 'Great tour overall. The guide was very knowledgeable and passionate. Only minor complaint is that the afternoon was very hot — next time I\'d book the 8am slot. But the content was fantastic and the ticket inclusion made it hassle-free.',
      },
    ],
  },

  // ── BANGKOK 2 ──────────────────────────────────────────────────────────────
  {
    slug: 'bangkok-floating-market-thai-cooking-class',
    title: 'Damnoen Saduak Floating Market & Thai Cooking Class',
    subtitle: 'Paddle through a vibrant canal market, then cook a 4-course Thai feast from scratch',
    location: 'Bangkok & Ratchaburi, Thailand',
    cities: ['bangkok', 'bkk'],
    duration: '8 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.8,
    reviewCount: 1634,
    category: 'food',
    badge: 'Top Rated',
    primaryLocation: 'Bangkok',
    tags: ['food', 'cooking', 'market', 'canal', 'culture'],
    priceFrom: 1290,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '12 hours ago',
    ratingBreakdown: { 5: 1400, 4: 180, 3: 40, 2: 10, 1: 4 },
    images: [
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80',
      'https://images.unsplash.com/photo-1567336273898-ebbf9eb3c3bf?w=1200&q=80',
      'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    ],
    highlights: [
      'Explore Damnoen Saduak — Thailand\'s most famous floating market',
      'Ride a traditional long-tail boat through the canal network',
      'Shop directly from boat vendors selling tropical fruits, pad thai, and coconut ice cream',
      'Visit a local coconut sugar farm and see traditional production methods',
      'Cook 4 authentic Thai dishes in an air-conditioned cooking studio',
      'Take home a printed recipe booklet to recreate your dishes at home',
      'Hotel pickup and drop-off included from Bangkok city centre',
    ],
    description: `Combine two of Thailand's most beloved experiences — the legendary Damnoen Saduak Floating Market and a hands-on Thai cooking class — in one unforgettable full-day adventure departing from Bangkok.

The day begins early with a comfortable air-conditioned minibus ride to Ratchaburi province, arriving before the market reaches peak crowds. Board a traditional wooden rowboat and glide through a maze of narrow canals lined with vendors selling pad thai, fresh papaya salad, grilled coconut pancakes, and exotic tropical fruits direct from their boats. The colours, sounds, and aromas are a photographer's dream.

After the market, visit a traditional coconut sugar farm where you'll watch artisans boil fresh coconut sap in massive woks and pour the syrup into moulds — a craft unchanged for generations. Sample fresh palm sugar straight from the source.

The afternoon is dedicated to cooking. At our partner cooking school's open-air kitchen and studio, you'll shop at the local market for ingredients with your chef-instructor, then cook four dishes of your choice from a menu including Tom Yum Goong, Pad Thai, Green Curry, Som Tum, Mango Sticky Rice, and more. You'll eat everything you cook for lunch, then receive a printed recipe booklet to take home.

Hotel pickup and return transfer is included so you never have to worry about navigation.`,
    includes: [
      'Return transfer from Bangkok hotel (city centre)',
      'Long-tail boat ride through the floating market',
      'Coconut sugar farm visit with tasting',
      'Thai cooking class (4 dishes of your choice)',
      'All cooking ingredients and equipment',
      'Lunch (the dishes you cook)',
      'Printed recipe booklet',
      'Bottled water throughout',
      'English-speaking guide',
    ],
    excludes: [
      'Personal shopping at the floating market',
      'Additional snacks and beverages',
      'Gratuities (appreciated but not required)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (06:30 AM)',
        desc: 'Air-conditioned minibus collects you from your Bangkok hotel lobby. Coffee stop en route at a motorway service area.',
      },
      {
        step: '2',
        title: 'Damnoen Saduak Floating Market (08:00 AM)',
        desc: 'Arrive before the tourist rush. Board a traditional rowboat and explore the main canal network. Buy fresh fruit, try a bowl of boat noodles, or sample coconut ice cream — directly from the vendors\' boats.',
      },
      {
        step: '3',
        title: 'Free Exploration & Shopping (09:15 AM)',
        desc: 'Extra 45 minutes to wander the market\'s covered walkways, browse local handicrafts, and get those perfect canal-boat photos.',
      },
      {
        step: '4',
        title: 'Coconut Sugar Farm Visit (10:15 AM)',
        desc: 'Learn how palm trees are tapped and sap is slow-boiled into Thailand\'s golden palm sugar. Taste fresh samples and buy some to take home if you wish.',
      },
      {
        step: '5',
        title: 'Market Ingredient Shopping (11:30 AM)',
        desc: 'Your chef-instructor walks you through a local fresh market, teaching you to select lemongrass, galangal, kaffir lime leaves, and other key Thai aromatics.',
      },
      {
        step: '6',
        title: 'Hands-on Thai Cooking Class (12:00 PM)',
        desc: 'Cook four dishes step-by-step in an air-conditioned studio kitchen. Dishes vary by menu selection — popular choices include Green Curry with Chicken, Pad Thai with Prawns, Tom Kha Gai, and Mango Sticky Rice. Eat your creations as lunch.',
      },
      {
        step: '7',
        title: 'Return to Bangkok (02:30 PM)',
        desc: 'Relax on the air-conditioned minibus back to Bangkok. Drop-off at your hotel or BTS/MRT station of choice. Expected arrival 03:30–04:00 PM.',
      },
    ],
    options: [
      {
        id: 'bkk-fm-standard',
        time: '06:30 AM',
        label: 'Full Day — Market + Cooking Class (most popular)',
        pricePerPerson: 2490,
        childPrice: 1790,
        availability: 'available',
      },
      {
        id: 'bkk-fm-market-only',
        time: '06:30 AM',
        label: 'Market Only (no cooking class)',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included. If you prefer to meet at our Bangkok office: 88 Silom Road, Bang Rak, Bangkok 10500. BTS Sala Daeng Exit 1, 3-min walk.',
    importantInfo: [
      'Pickup time is 06:30 AM sharp. Please be in your hotel lobby 5 minutes early.',
      'Wear light, breathable clothing. The market area is open-air and can be very warm.',
      'The floating market is most vibrant 07:00–09:30 AM — our schedule is optimised for this window.',
      'Cooking class menus can be adapted for vegetarian and vegan diets. Please specify at booking.',
      'Nut allergies and severe food allergies: please contact us before booking so we can arrange safe alternatives.',
      'Children under 5 are free but must be supervised at all times near the canals.',
      'The return journey can be affected by Bangkok traffic — please allow flexibility in your afternoon plans.',
    ],
    reviews: [
      {
        name: 'Emma L.',
        country: 'Netherlands',
        rating: 5,
        date: '2025-04-10',
        text: 'One of the best days of our whole trip to Thailand! The floating market was magical at that early hour — so colourful and lively. The cooking class in the afternoon was hands-on and delicious. We went home with a full belly and a recipe book. The guides were warm and funny. Book this immediately.',
      },
      {
        name: 'David K.',
        country: 'United States',
        rating: 5,
        date: '2025-03-01',
        text: 'We did the full-day option with market + cooking class and it was worth every baht. The driver picked us up right on time, the market boat ride was so fun, and the cooking class chef was incredible. I\'ve already made the green curry three times since getting home!',
      },
      {
        name: 'Priya S.',
        country: 'India',
        rating: 4,
        date: '2025-02-14',
        text: 'Lovely day out. The floating market is a bit touristy but still a fantastic experience. The coconut farm was a surprise highlight. Cooking class was great fun — they catered perfectly to our vegetarian requirements. Only minor issue was a slight delay in pickup but the guide apologised and made up the time.',
      },
    ],
  },

  // ── PHUKET 1 ───────────────────────────────────────────────────────────────
  {
    slug: 'phuket-phang-nga-bay-sea-cave-kayaking',
    title: 'Phang Nga Bay Sea Cave Kayaking & James Bond Island',
    subtitle: 'Paddle through hidden sea caves, glide past towering limestone karsts, and visit the iconic James Bond Island',
    location: 'Phuket, Thailand',
    cities: ['phuket', 'phang nga'],
    duration: '9 hours',
    maxGroupSize: 16,
    languages: ['English', 'Thai', 'Chinese', 'French', 'German'],
    rating: 4.9,
    reviewCount: 3210,
    category: 'water',
    badge: 'Best Seller',
    primaryLocation: 'Phuket',
    tags: ['kayaking', 'sea cave', 'island', 'water', 'nature'],
    priceFrom: 2890,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    spotsLeft: 2,
    lastBooked: '5 hours ago',
    ratingBreakdown: { 5: 2970, 4: 195, 3: 35, 2: 7, 1: 3 },
    frequentlyBookedWith: ['phuket-old-town-temples-street-food-tour'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200&q=80',
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80',
    ],
    highlights: [
      'Kayak through stunning sea caves and hidden hongs (lagoons) only accessible at low tide',
      'Visit Koh Tapu — the famous "James Bond Island" from The Man with the Golden Gun',
      'Expert kayak guides paddle you safely through the caves — no experience needed',
      'See prehistoric cave paintings and mangrove ecosystems up close',
      'Swim and snorkel in crystal-clear emerald waters',
      'Gourmet Thai buffet lunch served on a floating restaurant',
      'Small-group tour with maximum 16 guests for a personal experience',
    ],
    description: `Phang Nga Bay is one of the most dramatic seascapes on earth — a vast shallow bay studded with over 40 limestone karst islands rising sheer from the emerald water, their interiors hiding secret lagoons called "hongs" that can only be reached by kayak at low tide.

This full-day adventure from Phuket takes you deep into this UNESCO-listed landscape. Lie flat in your kayak as your expert guide paddles you through tunnels that barely clear your head, emerging into cathedral-like chambers open to the sky, filled with birdsong and the drip of stalactites. It's one of the most thrilling and serene experiences Thailand has to offer.

Beyond the caves, visit the legendary Koh Tapu — the jagged pinnacle jutting from the bay that became famous as "James Bond Island" in the 1974 film The Man with the Golden Gun. Browse local Moken (Sea Gypsy) craft stalls on the adjacent island village and hear your guide explain their remarkable seafaring culture.

A delicious Thai buffet lunch with fresh seafood is served on a traditional floating restaurant anchored in the bay. The return journey skirts more limestone formations as you watch the sun paint the karsts golden on the way back to port.

Hotel pickup and return transfers are included from all Phuket hotels.`,
    includes: [
      'Return hotel transfer (all Phuket areas)',
      'Air-conditioned speedboat',
      'Expert kayak guide (tandem kayak — no paddling needed)',
      'All kayaking equipment and life jackets',
      'James Bond Island entry fee',
      'Gourmet Thai buffet lunch on floating restaurant',
      'Fresh tropical fruits and drinking water throughout',
      'Snorkelling equipment',
      'National marine park fee',
    ],
    excludes: [
      'Personal travel insurance',
      'Alcoholic beverages',
      'Gratuities (appreciated)',
      'Personal purchases on the island',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (07:30 AM)',
        desc: 'Air-conditioned minibus collects you from your Phuket hotel. Transfer to Ao Por Pier on the east coast of Phuket island (approximately 45 minutes from Patong).',
      },
      {
        step: '2',
        title: 'Speedboat Departure (09:00 AM)',
        desc: 'Board your private speedboat and skim across the calm morning waters of Phang Nga Bay. The bay is most serene in the morning — perfect for photography.',
      },
      {
        step: '3',
        title: 'Sea Cave Kayaking — Hidden Hongs (10:00 AM)',
        desc: 'At Koh Lawa and Koh Phanak, board inflatable kayaks with your guide. Paddle into collapsed cave systems that open into secret sky-lit lagoons. See prehistoric cave paintings, roosting swiftlets, and mangrove ecosystems.',
      },
      {
        step: '4',
        title: 'James Bond Island — Koh Tapu (11:30 AM)',
        desc: 'Step onto the most photographed rock in Thailand. Your guide recounts the filming of The Man with the Golden Gun and shares the history of how this once-secret bay became famous worldwide. Browse the Sea Gypsy village craft market on Koh Panyee.',
      },
      {
        step: '5',
        title: 'Thai Buffet Lunch (12:30 PM)',
        desc: 'Feast on a generous seafood and Thai buffet lunch on the floating restaurant, with views over the limestone karsts in every direction.',
      },
      {
        step: '6',
        title: 'Snorkelling & Swimming (01:30 PM)',
        desc: 'Anchor at a sheltered cove with crystal-clear visibility. Snorkel above coral gardens and colourful reef fish.',
      },
      {
        step: '7',
        title: 'Return to Phuket (03:00 PM)',
        desc: 'Speedboat back to Ao Por Pier. Transfer to your hotel, arriving approximately 04:30–05:00 PM.',
      },
    ],
    options: [
      {
        id: 'phang-nga-standard',
        time: '07:30 AM',
        label: 'Full Day — Sea Cave Kayaking + James Bond Island',
        pricePerPerson: 2890,
        childPrice: 1990,
        availability: 'available',
      },
      {
        id: 'phang-nga-premium',
        time: '07:30 AM',
        label: 'Premium — Private Boat (couples & families)',
        pricePerPerson: 5990,
        childPrice: 3990,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Phuket areas. Confirm your hotel name and room number at checkout.',
    importantInfo: [
      'This tour operates in inflatble kayaks guided by a professional — no prior kayaking experience needed.',
      'Minimum age for kayaking: 4 years old. Children under 4 must stay in the speedboat during kayaking sections.',
      'Wear quick-dry clothing and bring a change of clothes. You will get wet.',
      'Sea cave passage requires lying flat in the kayak — not suitable for guests with claustrophobia or severe back problems.',
      'Tour may be cancelled or itinerary adjusted due to weather or tidal conditions. Full refund given if cancelled by operator.',
      'Apply sunscreen before boarding — we ask guests not to apply chemical sunscreen in the water to protect the marine ecosystem. Reef-safe sunscreen available onboard.',
      'Bring a waterproof bag or dry bag for your phone and valuables.',
    ],
    reviews: [
      {
        name: 'Olivia B.',
        country: 'Canada',
        rating: 5,
        date: '2025-03-22',
        text: 'INCREDIBLE. I\'ve been to Thailand four times and this was the best single day of all my trips. The sea caves are unlike anything I\'ve ever experienced — the moment you emerge into a hidden lagoon is pure magic. Our guide was funny, safe, and knowledgeable. The lunch was also genuinely delicious. Book this.',
      },
      {
        name: 'Marco F.',
        country: 'Italy',
        rating: 5,
        date: '2025-04-15',
        text: 'Honestly we almost didn\'t book because it seemed like a typical tourist thing, but we\'re so glad we did. The kayaking is what sets this apart from other Phang Nga tours — you access places no big boat can go. The hidden lagoons are absolutely extraordinary.',
      },
      {
        name: 'Lisa W.',
        country: 'Germany',
        rating: 5,
        date: '2025-02-07',
        text: 'Perfect day from start to finish. Pickup was on time, the speedboat was fast and comfortable, the guides were professional. James Bond Island lived up to expectations. The kayaking through the caves was our highlight — definitely not claustrophobic, there\'s more space than photos suggest.',
      },
      {
        name: 'Raj P.',
        country: 'India',
        rating: 4,
        date: '2025-01-30',
        text: 'Fantastic experience. The cave kayaking section was superb and the lunch was really good quality. Only reason for 4 stars is James Bond Island is a bit crowded at midday. But everything else was brilliant. The guide was very informative and funny.',
      },
    ],
  },

  // ── PHUKET 2 ───────────────────────────────────────────────────────────────
  {
    slug: 'phuket-old-town-temples-street-food-tour',
    title: 'Phuket Old Town, Temples & Street Food Walking Tour',
    subtitle: 'Discover Sino-Portuguese architecture, colourful shrines, and authentic local bites on a guided city walk',
    location: 'Phuket Town, Thailand',
    cities: ['phuket', 'phuket town'],
    duration: '4 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.8,
    reviewCount: 892,
    category: 'cultural',
    badge: 'New',
    primaryLocation: 'Phuket',
    subLocation: 'Phuket Town',
    tags: ['cultural', 'street food', 'architecture', 'temple', 'walking'],
    priceFrom: 1190,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '12 hours ago',
    ratingBreakdown: { 5: 760, 4: 95, 3: 27, 2: 7, 1: 3 },
    images: [
      'https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=1200&q=80',
      'https://images.unsplash.com/photo-1617503752587-97d2103a96ea?w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    ],
    highlights: [
      'Stroll the celebrated streets of Phuket Old Town with their rainbow shophouses',
      'Visit three historic temples including the ornate Jui Tui Chinese Taoist Shrine',
      'Taste 8+ authentic local dishes including Oh Tao (oyster omelette) and Mee Hokkien noodles',
      'Learn about the Baba-Nyonya (Peranakan) culture that shaped Phuket\'s unique identity',
      'Visit a traditional Chinese herbal medicine shop',
      'Explore the Saturday/Sunday Walking Street (weekend tours)',
      'Small group max 12 — intimate and unhurried',
    ],
    description: `Phuket Town is the island's best-kept secret — a beautifully preserved historic quarter of Sino-Portuguese shophouses, Taoist temples, heritage hotels, and a food culture unlike anything else in Thailand.

This intimate walking tour digs beneath the tourist surface to show you the real Phuket: the living, breathing culture of the Baba-Nyonya Peranakan community, descendants of Hokkien Chinese merchants who settled in the Malay Peninsula centuries ago and created a unique fusion of Chinese, Malay, and Thai culture.

Your local guide will lead you through the town's most photogenic streets — Thalang Road, Dibuk Road, and Soi Rommanee — where every building tells a story. You'll visit the magnificent Jui Tui Shrine, one of the most important Taoist temples in Southeast Asia, learn about the famous Phuket Vegetarian Festival that transforms the town every October, and step inside a century-old Chinese clan house still used by local families today.

Between sights, stop at eight local eateries and street stalls for tastings: savour Mee Hokkien (thick egg noodles in prawn broth), Oh Tao (Hokkien-style oyster omelette), Phuket-style dim sum, fresh coconut ice cream, and the town's famous Kopitiam coffee brewed in a traditional cloth drip filter. Every bite has a story.`,
    includes: [
      'Expert local guide (English and/or Thai)',
      '8+ food tastings at authentic local spots',
      'Temple entrance fees',
      'Filtered water throughout',
      'Small group (max 12 people)',
    ],
    excludes: [
      'Hotel transport (meeting point only)',
      'Additional food and drinks beyond the tastings',
      'Gratuities',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Meet at Thai Hua Museum (08:30 AM)',
        desc: 'Your guide meets you outside the Thai Hua Museum on Krabi Road. Quick introduction to Phuket Old Town\'s Baba-Nyonya history before heading into the streets.',
      },
      {
        step: '2',
        title: 'Thalang Road & The Shophouses (08:45 AM)',
        desc: 'Walk along Thalang Road, the oldest street in Phuket Town. Your guide explains the five-foot-way design of Sino-Portuguese architecture and the significance of each shophouse\'s colour. First tasting: Phuket-style dim sum from a 70-year-old family bakery.',
      },
      {
        step: '3',
        title: 'Jui Tui Taoist Shrine (09:15 AM)',
        desc: 'Enter one of Thailand\'s most spectacular Chinese shrines. Learn about the Nine Emperor Gods Festival and why Phuket\'s Vegetarian Festival attracts devotees who perform extreme acts of self-mortification in front of this very shrine.',
      },
      {
        step: '4',
        title: 'Soi Rommanee — The Street Art Alley (09:45 AM)',
        desc: 'Wander the most photogenic alley in Phuket Old Town, lined with murals, restored 19th-century buildings, and local antique shops. Tasting stop: Oh Tao oyster omelette at a legendary street stall.',
      },
      {
        step: '5',
        title: 'Chinese Herbal Medicine Shop (10:15 AM)',
        desc: 'Step inside a family-run traditional Chinese medicine shop that has been in business since 1921. Your guide translates the fascinating remedies on display and shares how this practice has been maintained for four generations.',
      },
      {
        step: '6',
        title: 'Kopitiam Coffee & Mee Hokkien Noodles (10:45 AM)',
        desc: 'Settle into a historic kopitiam (traditional coffee house) for Phuket\'s famous cloth-drip coffee and a steaming bowl of Mee Hokkien — thick egg noodles in a rich prawn and pork broth.',
      },
      {
        step: '7',
        title: 'Dibuk Road & Final Tastings (11:15 AM)',
        desc: 'Final stretch along elegant Dibuk Road with its boutique hotels and art galleries. Last tastings: fresh coconut ice cream and Khanom Jeen (rice noodles with fish curry). Tour ends at 12:30 PM.',
      },
    ],
    options: [
      {
        id: 'phuket-town-morning',
        time: '08:30 AM',
        label: 'Morning Tour (recommended)',
        pricePerPerson: 1190,
        childPrice: 790,
        availability: 'available',
      },
      {
        id: 'phuket-town-evening',
        time: '05:00 PM',
        label: 'Evening Walking Street Tour (Sat & Sun only)',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
    ],
    meetingPoint: 'Thai Hua Museum, 28 Krabi Road, Phuket Town 83000. Grab a tuk-tuk from Patong Beach (approx. ฿200–300, 25 min). Street parking available on Krabi Road.',
    importantInfo: [
      'This tour involves 4+ km of walking on uneven footpaths. Flat, comfortable shoes essential.',
      'The tour includes 8+ tastings — please come with a light appetite but not completely empty-stomached.',
      'Vegetarian and vegan options available at all tasting stops — please notify us at booking.',
      'Severe food allergies (shellfish, peanut): please contact us before booking.',
      'Temple dress code: shoulders and knees covered. Light scarves available from the guide.',
      'Morning temperatures in Phuket Town can be pleasant (27–30 °C) but the afternoon gets very hot. The morning tour is strongly recommended.',
      'Weekend evening tours coincide with the Old Town Walking Street market — a different but equally wonderful atmosphere.',
    ],
    reviews: [
      {
        name: 'Hannah G.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-04-18',
        text: 'I\'ve visited Phuket four times and never once visited the Old Town properly. This tour completely opened my eyes. The Baba-Nyonya culture is so rich and the guide was absolutely passionate about sharing it. The food was my favourite part — the oyster omelette was extraordinary.',
      },
      {
        name: 'Thomas D.',
        country: 'France',
        rating: 5,
        date: '2025-03-09',
        text: 'A hidden gem of a tour. Most tourists sit on the beach the whole time but we stumbled on this and had the most culturally enriching morning of our trip. The Jui Tui shrine stories were fascinating. Perfect small group size.',
      },
    ],
  },

  // ── CHIANG MAI 1 ──────────────────────────────────────────────────────────
  {
    slug: 'chiang-mai-elephant-sanctuary-half-day',
    title: 'Chiang Mai Elephant Sanctuary Half-Day Experience',
    subtitle: 'Spend a meaningful morning feeding, bathing, and learning about rescued elephants at an ethical sanctuary',
    location: 'Chiang Mai, Thailand',
    cities: ['chiang mai', 'chiangmai'],
    duration: '5 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 5.0,
    reviewCount: 4120,
    category: 'nature',
    badge: 'Best Seller',
    primaryLocation: 'Chiang Mai',
    tags: ['elephant', 'ethical', 'nature', 'wildlife', 'sanctuary'],
    priceFrom: 2890,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '1 hour ago',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ratingBreakdown: { 5: 3920, 4: 160, 3: 30, 2: 7, 1: 3 },
    frequentlyBookedWith: ['chiang-mai-doi-inthanon-national-park-day-trip'],
    images: [
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&q=80',
      'https://images.unsplash.com/photo-1566903451935-7e8835b9c730?w=1200&q=80',
      'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80',
      'https://images.unsplash.com/photo-1582547298854-ccd3c6c54c04?w=1200&q=80',
    ],
    highlights: [
      'Spend quality time with rescued elephants at a genuine ethical sanctuary — no riding, no hooks',
      'Hand-feed elephants fresh fruit and learn each animal\'s rescue story from the mahout',
      'Walk alongside the herd through the jungle and observe natural elephant behaviour',
      'Join the elephants in their daily mud bath and river swim',
      'Hear from sanctuary founders about the challenges of elephant conservation in Thailand',
      'Enjoy a traditional Northern Thai lunch with other guests',
      'Return transfer from Chiang Mai city included',
    ],
    description: `Thailand is home to thousands of working and captive elephants, many with troubled pasts involving the logging industry or tourism. This half-day experience at one of Chiang Mai's most respected ethical sanctuaries offers you the chance to give something back — spending genuine time with rescued elephants in a caring, natural environment.

No riding, no bullhooks, no circus tricks. Instead, you'll spend a morning the way elephants truly deserve: walking alongside them through lush jungle as they forage, feeding them by hand from a basket of bananas and sugarcane, watching them wade into the river for their favourite daily activity — a long, splashing bath.

Your mahout-guides will introduce each elephant by name and share their individual rescue stories. Some were retired logging elephants; others were rescued from exploitative tourism operations. Hearing their histories makes the morning deeply moving as well as joyful.

After an hour of bathing alongside the elephants, enjoy a delicious traditional Northern Thai buffet lunch with the sanctuary team and fellow guests before heading back to Chiang Mai. This is one of those experiences that stays with you long after the trip ends.`,
    includes: [
      'Return transfer from Chiang Mai city (hotel pickup)',
      'All elephant interaction activities',
      'Fruit basket for feeding elephants',
      'Mahout-guided walk through sanctuary grounds',
      'Traditional Northern Thai lunch',
      'Drinking water throughout',
      'Change of clothes/sanctuary uniform provided',
    ],
    excludes: [
      'Personal travel insurance',
      'Gratuities',
      'Personal drinks and snacks',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (07:30 AM)',
        desc: 'Air-conditioned van collects you from your Chiang Mai city hotel. 45-minute scenic drive into the Mae Wang hills south of the city.',
      },
      {
        step: '2',
        title: 'Sanctuary Orientation (08:30 AM)',
        desc: 'Welcome briefing from the sanctuary team. Learn about the elephants currently in residence, the sanctuary\'s founding story, and guidelines for respectful interaction. Change into your sanctuary uniform.',
      },
      {
        step: '3',
        title: 'Meet the Elephants & Feeding (09:00 AM)',
        desc: 'Walk to the feeding area and meet the herd. Hand-feed bananas, sugarcane, and pineapple to the elephants while your mahout shares each one\'s history. Watch baby elephants play — a guaranteed highlight.',
      },
      {
        step: '4',
        title: 'Jungle Walk (10:00 AM)',
        desc: 'Accompany the elephants on their morning walk through the forested sanctuary grounds. Observe natural foraging behaviour and how the herd interacts. No herding or forcing — this walk follows the elephants\' own pace and direction.',
      },
      {
        step: '5',
        title: 'River Bathing (11:00 AM)',
        desc: 'The elephants\' favourite part of the day. Join them in the river and watch as they splash, roll, and shower each other. You\'ll get wet — and love every second of it.',
      },
      {
        step: '6',
        title: 'Lunch & Debrief (12:00 PM)',
        desc: 'Traditional Northern Thai lunch — khao soi, sticky rice, curries — with the sanctuary team. Browse the small gift shop where 100% of sales go to elephant care.',
      },
      {
        step: '7',
        title: 'Return to Chiang Mai (01:00 PM)',
        desc: 'Transfer back to your hotel, arriving approximately 01:45–02:00 PM.',
      },
    ],
    options: [
      {
        id: 'cm-elephant-half-day',
        time: '07:30 AM',
        label: 'Half-Day Morning Experience',
        pricePerPerson: 2890,
        childPrice: 1990,
        availability: 'available',
      },
      {
        id: 'cm-elephant-full-day',
        time: '07:30 AM',
        label: 'Full-Day Experience (includes afternoon free roam)',
        pricePerPerson: 4490,
        childPrice: 3190,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Chiang Mai city hotels. Confirm hotel name at booking.',
    importantInfo: [
      'This is a 100% ethical elephant sanctuary. We do not allow riding, bullhooks, or performance acts of any kind.',
      'Wear clothes you are happy to get wet and muddy — this is a hands-on experience.',
      'The sanctuary provides a uniform top. Bring long trousers or shorts you can get dirty.',
      'Minimum age: 3 years. Children between 3–12 are welcome and usually love the experience.',
      'Do not wear strong perfume or mosquito spray directly on your skin before approaching the elephants.',
      'DEET-free insect repellent is available at the sanctuary.',
      'Photography is encouraged and your guide will help you get the best shots.',
      'This tour runs every day rain or shine — elephants love the rain!',
    ],
    reviews: [
      {
        name: 'Anna C.',
        country: 'Sweden',
        rating: 5,
        date: '2025-04-05',
        text: 'Hands down the highlight of our entire 3-week Asia trip. Feeding elephants by hand, walking beside them through the jungle, and swimming in the river with them — I was in tears the whole morning (happy tears). The sanctuary is clearly run with genuine love for the animals. Please choose ethical experiences like this one.',
      },
      {
        name: 'Michael B.',
        country: 'United States',
        rating: 5,
        date: '2025-03-18',
        text: 'We visited two elephant sanctuaries on this trip and this was by far the better one. Smaller group, more time with each elephant, the guides knew every animal by name and were so passionate. The lunch was also delicious. Five stars without question.',
      },
      {
        name: 'Sophie T.',
        country: 'Australia',
        rating: 5,
        date: '2025-02-22',
        text: 'Came with my 8-year-old daughter and she absolutely loved it. She still talks about "her elephant" (the baby, apparently). Genuinely touching experience. The guides were so patient with the kids and so knowledgeable. 100% worth the money.',
      },
      {
        name: 'Kevin L.',
        country: 'Singapore',
        rating: 5,
        date: '2025-01-14',
        text: 'Booked last minute and got the full-day option — so glad we did. The afternoon free roam where you just sit with the elephants in the jungle is an experience no words can describe. This is what ethical elephant tourism should look like everywhere.',
      },
    ],
  },

  // ── CHIANG MAI 2 ──────────────────────────────────────────────────────────
  {
    slug: 'chiang-mai-doi-inthanon-national-park-day-trip',
    title: 'Doi Inthanon National Park & Twin Royal Chedis Day Trip',
    subtitle: 'Summit Thailand\'s highest peak, visit stunning twin pagodas, and discover hilltribe villages',
    location: 'Chiang Mai, Thailand',
    cities: ['chiang mai', 'chiangmai', 'doi inthanon'],
    duration: '10 hours',
    maxGroupSize: 14,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 1876,
    category: 'nature',
    badge: 'Top Rated',
    primaryLocation: 'Chiang Mai',
    tags: ['nature', 'hiking', 'waterfall', 'hilltribe', 'national park'],
    priceFrom: 1890,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '3 hours ago',
    ratingBreakdown: { 5: 1620, 4: 195, 3: 45, 2: 12, 1: 4 },
    images: [
      'https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=1200&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80',
    ],
    highlights: [
      'Stand on Thailand\'s highest point — the 2,565m summit of Doi Inthanon',
      'Marvel at the twin Royal Chedis of King Bhumibol and Queen Sirikit',
      'Walk the Kew Mae Pan Nature Trail through cloud forest and meadows',
      'Visit a Karen hilltribe village and learn about traditional highland life',
      'See spectacular waterfalls including Mae Klang and Wachirathan',
      'Bird-watch in one of Asia\'s premier birding destinations (over 380 species)',
      'All national park fees included',
    ],
    description: `Just 80 kilometres south of Chiang Mai, Doi Inthanon National Park rises to 2,565 metres — Thailand's highest summit and a world apart from the tropics below. At the top, the temperature drops to a refreshing 8–15 °C, cloud forest clings to every ridge, and orchids, rhododendrons, and giant mosses carpet the ground.

This full-day guided tour from Chiang Mai covers all the park's highlights in one perfectly paced itinerary. Begin with two spectacular waterfalls: Mae Klang's broad curtain of water and the dramatic Wachirathan cascading 80 metres into a mist-filled pool. Continue to the park's crown jewel — the twin Royal Chedis, a pair of gilded pagodas set in immaculate gardens above the clouds, commissioned to honour the sixtieth birthdays of the late King Bhumibol and Queen Sirikit. The mosaic work and mountain views from the chedis are extraordinary.

The summit itself is a short walk to the brass marker on top of Thailand. On clear days the views stretch north toward Myanmar. In the mist, the cloud forest atmosphere is otherworldly.

En route, visit a Karen hilltribe village where the local community maintains traditional highland agricultural practices, weaving, and ceremonies. Lunch is served at a local restaurant near the park with spectacular valley views.`,
    includes: [
      'Return hotel transfer from Chiang Mai',
      'National park entrance fees',
      'Royal Chedis entrance fees',
      'English-speaking guide',
      'Lunch at a local restaurant',
      'Bottled water',
      'Light jacket loan for the summit (limited — please bring your own if possible)',
    ],
    excludes: [
      'Personal expenses',
      'Snacks and additional beverages',
      'Gratuities',
      'Tram to summit top (optional, ฿30)',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (06:30 AM)',
        desc: 'Early start to beat the crowds. Air-conditioned minibus collects you from your Chiang Mai hotel.',
      },
      {
        step: '2',
        title: 'Mae Klang Waterfall (08:00 AM)',
        desc: 'First stop at the park\'s widest waterfall — a popular picnic spot for local families. Short walk through the forest to viewing platforms.',
      },
      {
        step: '3',
        title: 'Wachirathan Waterfall (08:45 AM)',
        desc: 'Thailand\'s most dramatic waterfall — 80 metres of thundering white water. Walk the mist-soaked trail to the viewing bridge directly in front of the falls.',
      },
      {
        step: '4',
        title: 'Twin Royal Chedis (10:00 AM)',
        desc: 'The park\'s most iconic sight: two gilded pagodas at 2,200m elevation surrounded by manicured gardens. Your guide explains the symbolic meaning of each mosaic panel and the significance of this royal tribute.',
      },
      {
        step: '5',
        title: 'Kew Mae Pan Nature Trail (11:00 AM)',
        desc: 'A 3km loop trail through cloud forest and open meadows — one of Thailand\'s premier birding spots. Keep an eye out for the Giant Nuthatch, Gould\'s Sunbird, and the iconic Mrs Hume\'s Pheasant.',
      },
      {
        step: '6',
        title: 'Summit of Doi Inthanon (12:30 PM)',
        desc: 'Walk to the summit marker — the highest point in Thailand. Take in the cloud-shrouded views and the remarkable páramo-like alpine habitat.',
      },
      {
        step: '7',
        title: 'Lunch (01:00 PM)',
        desc: 'Descend to a local restaurant near the park for a hearty Northern Thai lunch.',
      },
      {
        step: '8',
        title: 'Karen Hilltribe Village (02:30 PM)',
        desc: 'Visit a traditional Karen village where community members demonstrate traditional backstrap weaving and share their unique cultural traditions.',
      },
      {
        step: '9',
        title: 'Return to Chiang Mai (04:00 PM)',
        desc: 'Scenic drive back to Chiang Mai. Arrive hotel approximately 05:30 PM.',
      },
    ],
    options: [
      {
        id: 'doi-inthanon-standard',
        time: '06:30 AM',
        label: 'Full Day Tour (standard)',
        pricePerPerson: 1890,
        childPrice: 1290,
        availability: 'available',
      },
      {
        id: 'doi-inthanon-birding',
        time: '05:30 AM',
        label: 'Early Bird Birding Special (with binoculars & checklist)',
        pricePerPerson: 2490,
        childPrice: 1690,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Chiang Mai city hotels.',
    importantInfo: [
      'The summit temperature is 8–15 °C — dramatically cooler than Chiang Mai. Bring or borrow a warm layer.',
      'The Kew Mae Pan trail is a 3km loop on uneven mountain terrain. Wear sturdy shoes.',
      'The trail is sometimes closed during the rainy season (June–October) due to erosion. We will confirm at booking.',
      'National park fees included: ฿300 adult, ฿150 child.',
      'Camera lens may fog on the summit due to temperature differential. Allow 10 minutes to acclimatise.',
      'Birding option requires very early departure. Please confirm you can make the 05:30 AM pickup.',
    ],
    reviews: [
      {
        name: 'Charlotte B.',
        country: 'France',
        rating: 5,
        date: '2025-03-30',
        text: 'What an absolutely magical day. Going from 30°C in Chiang Mai to standing in the clouds at the summit feeling cool and misty — Thailand never stops surprising you. The twin chedis are stunning. The nature trail was serene. Our guide was brilliant — so knowledgeable about the birds and plants.',
      },
      {
        name: 'James R.',
        country: 'New Zealand',
        rating: 5,
        date: '2025-02-16',
        text: 'Did the early birding option. Worth every extra baht. Had the nature trail almost to ourselves at 7am and saw over 25 species. The Giant Nuthatch was unbelievable. The guide\'s passion for the birds was infectious. Highly recommend for any wildlife lovers.',
      },
    ],
  },

  // ── PATTAYA 1 ──────────────────────────────────────────────────────────────
  {
    slug: 'pattaya-coral-island-speedboat-snorkelling',
    title: 'Coral Island (Koh Larn) Speedboat & Snorkelling Day Trip',
    subtitle: 'Race to Pattaya\'s pristine offshore island for turquoise water, coral gardens, and powdery white beaches',
    location: 'Pattaya, Thailand',
    cities: ['pattaya'],
    duration: '6 hours',
    maxGroupSize: 20,
    languages: ['English', 'Thai', 'Chinese', 'Russian'],
    rating: 4.7,
    reviewCount: 2103,
    category: 'water',
    badge: 'Best Seller',
    primaryLocation: 'Pattaya',
    tags: ['snorkelling', 'island', 'beach', 'speedboat', 'water'],
    priceFrom: 1590,
    isFeatured: true,
    isPopular: false,
    instantConfirmation: true,
    lastBooked: '12 hours ago',
    ratingBreakdown: { 5: 1800, 4: 240, 3: 45, 2: 12, 1: 6 },
    images: [
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
      'https://images.unsplash.com/photo-1584450150050-4b9bdbd29bfa?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    ],
    highlights: [
      'Speedboat transfer to Koh Larn — Pattaya\'s most beautiful island (30 min from shore)',
      'Snorkel above vibrant coral gardens with tropical fish, sea turtles, and rays',
      'Relax on six stunning white-sand beaches around the island',
      'Optional water sports: jet ski, parasailing, sea kayaking (own cost)',
      'Lunch at a beachfront seafood restaurant with fresh catch of the day',
      'All snorkelling equipment provided',
      'Hotel pickup and drop-off from Pattaya included',
    ],
    description: `Just 7.5 kilometres off the coast of Pattaya, Koh Larn (Coral Island) is a world away from the mainland bustle — a small, forested island ringed by six beaches of varying character, from the popular Tawaen Beach with its water-sports action to the secluded Nual Beach favoured by snorkellers.

Your day begins with a private speedboat transfer from the Bali Hai Pier, zipping across the Gulf of Thailand to arrive at the island before the day-tripper crowds from the ferries. Your guide leads you straight to the snorkelling site where visibility of 5–10 metres reveals coral bommies alive with sergeant-majors, parrotfish, angelfish, and — if you're lucky — a resident green sea turtle.

After snorkelling, the island is yours to explore. Six beaches spread around the island offer different experiences: stay at the action-packed main beach for jet ski and parasailing thrills, or walk 20 minutes to the quiet southern beaches for pure relaxation with a coconut under a palm tree.

Lunch is at a beachside restaurant known for its fresh grilled seafood — order the whole grilled fish with lime and chilli for a quintessential Thai beach meal.

The return speedboat deposits you back at Bali Hai Pier in time for a relaxing late afternoon in Pattaya.`,
    includes: [
      'Return speedboat transfer Pattaya ↔ Koh Larn',
      'Snorkelling equipment (mask, fins, life vest)',
      'Guide on the island',
      'Seafood lunch at beachfront restaurant',
      'Return hotel transfer within Pattaya',
      'Bottled water',
    ],
    excludes: [
      'Optional water sports (jet ski ฿500/15min, parasailing ฿400, kayak ฿200/hr)',
      'Alcoholic beverages',
      'Personal shopping',
      'Gratuities',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (08:30 AM)',
        desc: 'Transfer to Bali Hai Pier in South Pattaya (approx 20 minutes from most hotels).',
      },
      {
        step: '2',
        title: 'Speedboat to Koh Larn (09:00 AM)',
        desc: 'Board the private speedboat and enjoy the 30-minute crossing. Keep your eyes open for flying fish alongside the bow.',
      },
      {
        step: '3',
        title: 'Snorkelling at Coral Gardens (09:30 AM)',
        desc: 'Anchor at the best snorkelling site on the island\'s west side. Equip up and explore the coral formations — your guide stays in the water with you.',
      },
      {
        step: '4',
        title: 'Free Beach Time (11:00 AM)',
        desc: 'Choose your beach and enjoy free time. Tawaen Beach for water sports and vibrant atmosphere; Nual or Sang Wan for peace and quiet.',
      },
      {
        step: '5',
        title: 'Lunch at Beachfront Restaurant (12:30 PM)',
        desc: 'Fresh grilled seafood, Thai noodle dishes, and cold drinks. The whole grilled sea bass with garlic is the house speciality.',
      },
      {
        step: '6',
        title: 'Afternoon Free Time (01:30 PM)',
        desc: 'More beach time, water sports, or a motorbike loop of the whole island (bikes available for rent at ฿300/hr).',
      },
      {
        step: '7',
        title: 'Return Speedboat to Pattaya (03:30 PM)',
        desc: 'Board the speedboat and return to Bali Hai Pier, then transfer to your hotel. Back approximately 04:30 PM.',
      },
    ],
    options: [
      {
        id: 'pattaya-coral-standard',
        time: '08:30 AM',
        label: 'Full Day — Speedboat + Snorkelling + Lunch',
        pricePerPerson: 1590,
        childPrice: 990,
        availability: 'available',
      },
      {
        id: 'pattaya-coral-premium',
        time: '08:30 AM',
        label: 'Premium — Private Speedboat (up to 8 pax)',
        pricePerPerson: 3990,
        childPrice: 2990,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included. If self-arranged: Bali Hai Pier, South Pattaya Beach Road, near Royal Garden Plaza.',
    importantInfo: [
      'Minimum age for snorkelling: 5 years. Life vests provided for non-swimmers.',
      'The sea can be choppy November–February. Motion sickness tablets recommended for sensitive travellers.',
      'Apply reef-safe sunscreen only. Chemical sunscreens harm the coral reef — we ask all guests to comply.',
      'Koh Larn can be very busy on weekends and Thai public holidays — consider a weekday visit.',
      'Underwater cameras available for rent (฿300) — ask the guide on the boat.',
      'Tour operates daily, weather permitting.',
    ],
    reviews: [
      {
        name: 'Nina K.',
        country: 'Russia',
        rating: 5,
        date: '2025-04-11',
        text: 'Perfect beach day! The speedboat was so much faster and more comfortable than the public ferry. Snorkelling was great — saw so many fish and the water was very clear. Lunch was fresh and delicious. The guide was helpful and friendly. Will book again on our next Pattaya trip.',
      },
      {
        name: 'Daniel M.',
        country: 'Germany',
        rating: 4,
        date: '2025-03-03',
        text: 'Really enjoyed the day. The private speedboat option was worth it for us as a family of 5. Kids loved the snorkelling. One star off only because the beach was very busy on a Saturday. Recommend going on a weekday if you can.',
      },
    ],
  },

  // ── PATTAYA 2 ──────────────────────────────────────────────────────────────
  {
    slug: 'pattaya-sanctuary-of-truth-city-highlights',
    title: 'Sanctuary of Truth & Pattaya City Highlights Tour',
    subtitle: 'Marvel at the world\'s tallest all-wood temple, then discover the best of Pattaya in a guided afternoon tour',
    location: 'Pattaya, Thailand',
    cities: ['pattaya'],
    duration: '5 hours',
    maxGroupSize: 14,
    languages: ['English', 'Thai', 'Russian', 'Chinese'],
    rating: 4.7,
    reviewCount: 987,
    category: 'cultural',
    primaryLocation: 'Pattaya',
    tags: ['cultural', 'temple', 'architecture', 'city tour', 'history'],
    priceFrom: 1090,
    isFeatured: true,
    isPopular: false,
    instantConfirmation: true,
    lastBooked: '12 hours ago',
    ratingBreakdown: { 5: 820, 4: 120, 3: 35, 2: 8, 1: 4 },
    images: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
      'https://images.unsplash.com/photo-1617503752587-97d2103a96ea?w=1200&q=80',
    ],
    highlights: [
      'Entrance tickets to the Sanctuary of Truth — the world\'s tallest all-wood building (105m)',
      'Guided tour of the Sanctuary with expert commentary on Hindu-Buddhist iconography',
      'Watch master woodcarvers still working on the structure (it\'s been under construction since 1981)',
      'Optional dolphin show at nearby Pattaya Dolphinarium (own cost)',
      'Visit Wat Yansangwararam — a serene royal temple complex',
      'Viewpoint stop at the scenic Pratumnak Hill overlooking Pattaya Bay',
      'Hotel pickup and drop-off included',
    ],
    description: `The Sanctuary of Truth in Pattaya is one of Thailand's most extraordinary structures — a 105-metre-tall temple built entirely from hand-carved wood, without a single nail, bolt, or concrete element. Construction began in 1981 and continues to this day as craftsmen replace weathered sections with fresh carvings, meaning the building is perpetually a work in progress.

Inside and out, every surface is covered in intricate sculptures depicting scenes from Hindu and Buddhist mythology: Brahma, Vishnu, Shiva, the gods of the four winds, scenes from the Ramayana, and the cosmic ocean of creation. The scale and the detail are genuinely breathtaking.

Your knowledgeable guide will decode the iconography, explaining why the building faces four directions representing the four divine truths of Buddhist philosophy, and what each set of mythological figures symbolises. You'll also watch master woodcarvers at work on the building's outer eaves — an unbroken craft tradition maintained on-site.

After the Sanctuary, continue to Wat Yansangwararam — a peaceful royal temple complex whose grounds hold a replica of the Buddha's footprint and a traditional Thai garden — followed by a viewpoint stop at Pratumnak Hill for panoramic views over Pattaya Bay before returning to your hotel.`,
    includes: [
      'Hotel pickup and return transfer',
      'Sanctuary of Truth entrance ticket (฿500 value)',
      'English-speaking licensed guide',
      'Wat Yansangwararam visit',
      'Pratumnak Hill viewpoint',
      'Bottled water',
    ],
    excludes: [
      'Dolphin show / Pattaya Dolphinarium (optional, own cost)',
      'Lunch and beverages',
      'Gratuities',
      'Personal purchases',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (08:30 AM)',
        desc: 'Minibus collects you from your Pattaya hotel.',
      },
      {
        step: '2',
        title: 'Sanctuary of Truth (09:00 AM)',
        desc: 'Two-hour guided visit to the Sanctuary. Start with the exterior for photography — the scale of the wooden spires against the blue sky is remarkable. Enter for the guided interior tour covering all four halls and the mythology of each facade.',
      },
      {
        step: '3',
        title: 'Watch the Woodcarvers at Work (11:00 AM)',
        desc: 'Observe master craftsmen working on replacement carvings for weathered sections — identical to those created 40 years ago by the original artists. Your guide explains the training process that takes 5 years to master.',
      },
      {
        step: '4',
        title: 'Wat Yansangwararam (11:30 AM)',
        desc: 'A tranquil royal temple complex with well-maintained gardens, a replica of the Buddha\'s footprint, a Chinese pagoda, and a peaceful lake. A lovely contrast to the grandeur of the Sanctuary.',
      },
      {
        step: '5',
        title: 'Pratumnak Hill Viewpoint (12:30 PM)',
        desc: 'Drive to the best viewpoint above Pattaya for panoramic photos of the bay, the beach, and the city — a perfect final perspective on Pattaya before returning to your hotel.',
      },
      {
        step: '6',
        title: 'Return to Hotel (01:00 PM)',
        desc: 'Drop-off at your hotel. Tour concludes.',
      },
    ],
    options: [
      {
        id: 'pattaya-sot-morning',
        time: '08:30 AM',
        label: 'Morning Tour',
        pricePerPerson: 1190,
        childPrice: 790,
        availability: 'available',
      },
      {
        id: 'pattaya-sot-afternoon',
        time: '01:30 PM',
        label: 'Afternoon Tour',
        pricePerPerson: 1090,
        childPrice: 690,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Pattaya, Jomtien, and Na Jomtien hotels.',
    importantInfo: [
      'Dress code at the Sanctuary of Truth: shoulders and knees covered. Sarongs available at the entrance.',
      'The Sanctuary of Truth has an uneven wooden floor and many steps. Wear non-slip shoes.',
      'The building is an active construction site — hard hats are provided and must be worn in certain areas.',
      'Children under 3 are free. Aged 3–11 qualify for child pricing.',
      'Photography is permitted everywhere inside and outside the Sanctuary.',
    ],
    reviews: [
      {
        name: 'Elena V.',
        country: 'Russia',
        rating: 5,
        date: '2025-04-08',
        text: 'I had no idea this place existed before arriving in Pattaya — what an incredible surprise. The building is unlike anything in the world. Every single surface is carved wood, every figure tells a story. Our guide was exceptional at explaining the mythology. A must-see.',
      },
      {
        name: 'Ben H.',
        country: 'United Kingdom',
        rating: 4,
        date: '2025-01-25',
        text: 'Fascinating place and well worth doing with a guide — you would miss so much without the explanations. The woodcarvers working on-site were mesmerising to watch. Only 4 stars because the afternoon was very hot and the tour felt slightly rushed at Wat Yansangwararam. But overall excellent.',
      },
    ],
  },

  // ── KRABI 1 ────────────────────────────────────────────────────────────────
  {
    slug: 'krabi-4-islands-snorkelling-tour',
    title: 'Krabi 4 Islands Snorkelling Tour by Longtail Boat',
    subtitle: 'Island-hop between four of Krabi\'s most beautiful islands on a traditional wooden longtail boat',
    location: 'Krabi, Thailand',
    cities: ['krabi', 'ao nang', 'railay'],
    duration: '8 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 1543,
    category: 'water',
    badge: 'Best Seller',
    primaryLocation: 'Krabi',
    subLocation: 'Ao Nang',
    tags: ['snorkelling', 'island', 'longtail boat', 'beach', 'water'],
    priceFrom: 1290,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    spotsLeft: 2,
    lastBooked: '5 hours ago',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ratingBreakdown: { 5: 1330, 4: 160, 3: 40, 2: 9, 1: 4 },
    images: [
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
      'https://images.unsplash.com/photo-1584450150050-4b9bdbd29bfa?w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    ],
    highlights: [
      'Visit four stunning islands: Koh Rok, Koh Tup, Koh Mor, and Koh Chicken',
      'Snorkel in the clearest water in the Andaman Sea with an expert marine guide',
      'Sail on a traditional painted longtail boat — the most authentic island-hopping experience',
      'Walk the famous sandbar that connects Koh Tup and Koh Mor at low tide',
      'Swim in a hidden emerald lagoon at Koh Rok',
      'Delicious Thai lunch served on the beach',
      'All snorkelling equipment included',
    ],
    description: `Krabi province's Andaman coastline holds some of Thailand's most beautiful island waters — and the 4 Islands tour on a traditional longtail boat is the most authentic way to experience them. Unlike the large speedboats that rush tourists between stops, the longtail allows you to savour the journey: feeling the sea breeze, hearing the engine's distinctive rumble, and watching the limestone karsts glide past.

The four islands each offer something distinct. Koh Rok is famous for its gin-clear water and pristine coral gardens — snorkelling visibility often exceeds 15 metres, revealing brain coral, table coral, and schools of clownfish, lionfish, and passing reef sharks. Koh Tup and Koh Mor are connected by a dramatic sandbar that emerges at low tide, creating a natural causeway you can walk between the two. Koh Chicken (Koh Kai) is named for a distinctive rock formation and offers shallow, calm water perfect for confident snorkellers and beginners alike.

An unhurried Thai-style buffet lunch is served on a shaded beach — fresh grilled fish, papaya salad, and coconut rice while the longtail bobs gently in the background. The return journey often catches the best light of the day, the karsts turning gold and pink as the sun arcs west over the Andaman.`,
    includes: [
      'Traditional longtail boat (small group, max 12)',
      'Snorkelling equipment (mask, fins, life vest)',
      'Marine guide in the water with you',
      'Thai lunch on the beach',
      'Fresh fruit and drinking water',
      'Hotel pickup from Ao Nang and Krabi Town',
    ],
    excludes: [
      'National marine park fee (฿200 adult / ฿100 child — paid on arrival)',
      'Alcoholic drinks',
      'Personal expenses',
      'Gratuities',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup & Pier (08:30 AM)',
        desc: 'Transfer from Ao Nang or Krabi Town to the departure pier. Meet your guide and fellow guests, receive snorkelling equipment, and board the longtail boat.',
      },
      {
        step: '2',
        title: 'Koh Rok — Snorkelling (09:15 AM)',
        desc: 'First and best snorkelling stop of the day. Enter calm, crystal-clear water and explore the coral gardens. Your guide points out wildlife — clownfish, parrotfish, sea cucumbers, and — occasionally — blacktip reef sharks in the distance.',
      },
      {
        step: '3',
        title: 'Koh Tup & Koh Mor — The Sandbar Walk (11:00 AM)',
        desc: 'The sandbar connecting these two islands only appears at low tide — our timing is calibrated to catch it. Walk across the bar between the two islands for the ultimate Krabi photograph.',
      },
      {
        step: '4',
        title: 'Beach Lunch (12:00 PM)',
        desc: 'Thai buffet on a shaded stretch of beach: grilled fish, som tum, chicken satay, steamed rice, fresh watermelon.',
      },
      {
        step: '5',
        title: 'Koh Chicken — Swimming & Snorkelling (01:00 PM)',
        desc: 'Calm, sheltered bay with diverse coral. Great for beginners and strong swimmers alike. The distinctive "chicken rock" formation makes a memorable photo backdrop.',
      },
      {
        step: '6',
        title: 'Koh Mor — Free Beach Time (02:00 PM)',
        desc: 'Final beach stop with soft sand and palm-tree shade. Snorkel, swim, relax, or explore the rock pools.',
      },
      {
        step: '7',
        title: 'Return to Pier (03:30 PM)',
        desc: 'Longtail boat back to the pier, then transfer to your Ao Nang or Krabi Town hotel. Arrive approximately 04:30 PM.',
      },
    ],
    options: [
      {
        id: 'krabi-4island-longtail',
        time: '08:30 AM',
        label: 'Longtail Boat (traditional, small group)',
        pricePerPerson: 1290,
        childPrice: 890,
        availability: 'available',
      },
      {
        id: 'krabi-4island-speedboat',
        time: '08:30 AM',
        label: 'Speedboat Option (larger group, faster transfers)',
        pricePerPerson: 1690,
        childPrice: 1190,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup from Ao Nang and Krabi Town hotels included. Railay Beach guests: longtail transfer to mainland pier required (own arrangement, approx ฿100).',
    importantInfo: [
      'National marine park fee (฿200/adult, ฿100/child) is NOT included and is paid directly at the park booth.',
      'This tour is NOT suitable for guests with severe seasickness — the Andaman Sea can be choppy November–April.',
      'The sandbar walk between Koh Tup and Koh Mor depends on tide timing. Our departure time is chosen to maximise the window but cannot be guaranteed.',
      'Minimum snorkelling age: 5 years. Life vests provided for all. Non-swimmers are welcome.',
      'Apply reef-safe sunscreen only. Please do not feed the fish.',
      'Tour does not operate June–October (monsoon season). Check availability at time of booking.',
    ],
    reviews: [
      {
        name: 'Isabelle P.',
        country: 'France',
        rating: 5,
        date: '2025-03-27',
        text: 'The longtail boat is the only way to do this tour — so atmospheric and genuine. The snorkelling at Koh Rok was extraordinary, the clearest water I\'ve ever snorkelled in. Walking the sandbar felt like a travel magazine photo. Lunch was simple but delicious. A perfect Krabi day.',
      },
      {
        name: 'Tom S.',
        country: 'Australia',
        rating: 5,
        date: '2025-02-18',
        text: 'We considered taking the bigger speedboat tour but chose the small longtail option and were so glad. Only 10 of us on the boat, unhurried stops, guide in the water with us the whole time. Saw two blacktip reef sharks gliding past! The sandbar walk is as magical as the photos suggest.',
      },
      {
        name: 'Maria G.',
        country: 'Spain',
        rating: 4,
        date: '2025-01-08',
        text: 'Beautiful islands and excellent snorkelling. We paid the park fee at the booth which was easy. Only note: the marine park fee isn\'t included, so budget ฿200 per person extra. But the tour itself was wonderful and the guide was fantastic with our kids.',
      },
    ],
  },

  // ── KRABI 2 ────────────────────────────────────────────────────────────────
  {
    slug: 'krabi-tiger-cave-temple-mangrove-kayaking',
    title: 'Tiger Cave Temple Climb & Mangrove Kayaking Adventure',
    subtitle: 'Summit the 1,237-step Tiger Cave Temple at sunrise, then kayak through ancient mangrove forests',
    location: 'Krabi, Thailand',
    cities: ['krabi', 'ao nang'],
    duration: '7 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.8,
    reviewCount: 764,
    category: 'adventure',
    badge: 'New',
    primaryLocation: 'Krabi',
    tags: ['adventure', 'hiking', 'kayaking', 'temple', 'mangrove'],
    priceFrom: 890,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '6 hours ago',
    ratingBreakdown: { 5: 650, 4: 80, 3: 22, 2: 8, 1: 4 },
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      'https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=1200&q=80',
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
    ],
    highlights: [
      'Climb 1,237 steps to the summit of Tiger Cave Temple (Wat Tham Seua) for sunrise views',
      'Stand at 278 metres above sea level with 360° panoramic views over Krabi province',
      'Visit the sacred cave temple at the base — home to meditating monks for centuries',
      'Kayak through the mysterious mangrove forests of the Krabi River estuary',
      'Spot monitor lizards, kingfishers, and migratory birds in the mangrove ecosystem',
      'Paddle through narrow tunnel-like waterways carved through the mangrove roots',
      'Traditional Thai breakfast included at a local riverside restaurant',
    ],
    description: `Two of Krabi's greatest experiences — each extraordinary in its own right — combined into one remarkable half-day adventure.

The day begins before dawn with a drive to Wat Tham Seua (Tiger Cave Temple), a forest monastery where monks have meditated in limestone caves for centuries. The famous 1,237-step climb to the hilltop golden Buddha and giant footprint begins in darkness and rewards you at the summit with one of the most breathtaking sunrises in Southern Thailand — the sky turning from purple to pink to gold over an endless panorama of rice paddies, limestone karsts, mangrove forest, and distant islands.

The descent brings you to the temple complex at the base, where monks still practise forest meditation and a resident population of monkeys and birds inhabits the surrounding jungle.

After a traditional Thai breakfast at a riverside restaurant, continue to the Krabi River estuary for a guided kayaking session through the mangrove forest. Your guide navigates you through a labyrinth of narrow waterways between the mangrove roots — a habitat of remarkable biodiversity. Keep your eyes open for the large Bengal monitor lizard (up to 2 metres long), the iridescent common kingfisher, and the extraordinary mudskipper fish that "walks" on the mud between the roots.

The morning ends back at the river with fresh coconut water before your transfer home.`,
    includes: [
      'Hotel pickup from Ao Nang and Krabi Town',
      'Guide for both temple climb and kayaking',
      'Tiger Cave Temple visit (no entrance fee)',
      'Traditional Thai breakfast at riverside restaurant',
      'Kayak, paddle, and life vest',
      'Bottled water and fresh coconut water',
    ],
    excludes: [
      'Personal expenses',
      'Gratuities',
      'Alcoholic beverages',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (05:00 AM)',
        desc: 'Very early start to reach the temple at dawn. Your guide meets you at your hotel with a torch (flashlight) for the pre-dawn walk.',
      },
      {
        step: '2',
        title: 'Temple Base — Cave Exploration (05:30 AM)',
        desc: 'Walk through the forest monastery at the base of the hill. Visit the bat cave and the meditation cave where monks have practised for over 100 years. Watch resident monkeys greet the dawn.',
      },
      {
        step: '3',
        title: 'The 1,237-Step Climb (06:00 AM)',
        desc: 'The famous staircase to the summit. Steep, but achievable for anyone with reasonable fitness. Take it at your own pace — the view at the top makes every step worthwhile. The stone steps are guarded by golden naga serpents all the way up.',
      },
      {
        step: '4',
        title: 'Sunrise at the Summit (07:00 AM)',
        desc: 'The golden Buddha and the giant footprint of the Buddha mark the summit. Watch the sunrise unfold over the entire Krabi landscape — a moment that stays with you forever.',
      },
      {
        step: '5',
        title: 'Descent & Breakfast (07:45 AM)',
        desc: 'Descend at leisure and meet your vehicle for a short drive to a traditional riverside restaurant for a Thai breakfast: jok (rice porridge), khanom pang (Thai toast), and kopi coffee.',
      },
      {
        step: '6',
        title: 'Mangrove Kayaking (09:00 AM)',
        desc: 'Enter the Krabi River mangrove forest by kayak. Your guide navigates you through narrow channels and points out the extraordinary wildlife in this coastal ecosystem.',
      },
      {
        step: '7',
        title: 'Return to Hotel (11:30 AM)',
        desc: 'Fresh coconut water by the river, then transfer back to your hotel. Back by noon.',
      },
    ],
    options: [
      {
        id: 'krabi-tiger-sunrise',
        time: '05:00 AM',
        label: 'Sunrise Temple + Mangrove Kayaking (full experience)',
        pricePerPerson: 1590,
        childPrice: 1090,
        availability: 'available',
      },
      {
        id: 'krabi-kayak-only',
        time: '09:00 AM',
        label: 'Mangrove Kayaking Only (no temple climb)',
        pricePerPerson: 890,
        childPrice: 590,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included from Ao Nang and Krabi Town. Pickup time for sunrise option: 05:00 AM sharp.',
    importantInfo: [
      'The 1,237-step climb takes approximately 45–60 minutes each way. It is strenuous — poles are available at the base.',
      'NOT recommended for guests with heart conditions, severe knee problems, or vertigo.',
      'Minimum age for the temple climb: 8 years old (younger children may find the height and exposure frightening).',
      'Dress code: shoulders covered for temple complex. No dress code on the staircase itself.',
      'Bring your own torch/headlamp for the pre-dawn walk — or ask us to bring one (limited supply).',
      'Kayaking section is suitable for beginners. No experience needed.',
      'Monkeys at the temple base: do NOT feed them and keep food items inside your bag.',
    ],
    reviews: [
      {
        name: 'Amy J.',
        country: 'United States',
        rating: 5,
        date: '2025-04-20',
        text: 'The sunrise from the top is one of the most beautiful things I have ever seen in my life. Getting up at 4:30am seemed insane but by the time we were at the summit I was crying from the sheer beauty. The kayaking afterwards was a perfect, peaceful contrast. An incredible day.',
      },
      {
        name: 'Lucas N.',
        country: 'Brazil',
        rating: 5,
        date: '2025-03-12',
        text: 'Took this with my wife and it became the highlight of our honeymoon. The temple climb is hard but every step is worth it. Then drifting silently through the mangroves afterwards... pure magic. The monitor lizard we spotted was enormous — at least 1.5 metres. Book this.',
      },
    ],
  },

  // ── CHIANG RAI 1 ──────────────────────────────────────────────────────────
  {
    slug: 'chiang-rai-white-temple-golden-triangle-day-trip',
    title: 'White Temple, Blue Temple & Golden Triangle Day Trip',
    subtitle: 'Visit Chiang Rai\'s three unmissable landmarks in one unforgettable guided day',
    location: 'Chiang Rai, Thailand',
    cities: ['chiang rai', 'chiangrai', 'golden triangle'],
    duration: '9 hours',
    maxGroupSize: 14,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.9,
    reviewCount: 2431,
    category: 'cultural',
    badge: 'Best Seller',
    primaryLocation: 'Chiang Rai',
    tags: ['cultural', 'temple', 'history', 'day trip', 'golden triangle'],
    priceFrom: 1790,
    isFeatured: true,
    isPopular: true,
    instantConfirmation: true,
    lastBooked: '4 hours ago',
    ratingBreakdown: { 5: 2250, 4: 130, 3: 38, 2: 9, 1: 4 },
    frequentlyBookedWith: ['chiang-rai-hill-tribe-village-trekking'],
    images: [
      'https://images.unsplash.com/photo-1612977958850-34cbbfe0d8a2?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
    ],
    highlights: [
      'The White Temple (Wat Rong Khun) — Chiang Rai\'s most iconic sight and a living work of art',
      'The Blue Temple (Wat Rong Suea Ten) — a dazzling cobalt-blue interior open since 2016',
      'The Golden Triangle — where Thailand, Laos, and Myanmar converge at the Mekong River',
      'Optional boat ride on the Mekong to the border with Laos (own cost)',
      'Visit to a local opium museum explaining the Golden Triangle\'s complex history',
      'Traditional Northern Thai lunch at a local restaurant',
      'All entrance fees included',
    ],
    description: `Chiang Rai is home to three of the most visually extraordinary temples in Asia, and this day trip from Chiang Rai city covers all three in perfect sequence — from the blinding-white surrealism of Wat Rong Khun to the sapphire-blue otherworldliness of Wat Rong Suea Ten, with the geopolitical drama of the Golden Triangle as a finale.

The White Temple (Wat Rong Khun) is the life's work of artist Chalermchai Kositpipat, who began construction in 1997 using his own funds. Every surface is white (symbolising purity) inlaid with mirror mosaic (representing the Buddha's wisdom shining throughout the universe). The bridge of rebirth crosses a sea of reaching hands, and the interior murals blend traditional Buddhist imagery with contemporary cultural icons — a deliberately provocative statement about modern spirituality that has made this the most talked-about temple in Thailand. Kositpipat is still working and has pledged to continue until his death.

The Blue Temple, completed just a decade ago, is equally extraordinary: a deep cobalt-blue and gold interior housing a massive white Buddha that seems to glow from within. Far less visited than the White Temple, it's a more meditative and peaceful experience.

The Golden Triangle, where the Mekong River marks the border between three countries, is a place that carries enormous historical weight — this was once the world's largest opium-producing region. Your guide brings the complex history to life with stories from the opium trade era and the ongoing challenges of the borderland today.`,
    includes: [
      'White Temple entrance fee (฿100)',
      'Blue Temple entrance fee (free — donation encouraged)',
      'Golden Triangle viewpoint entry',
      'Hall of Opium Museum (audio guide included)',
      'Traditional Northern Thai lunch',
      'English-speaking guide',
      'Air-conditioned transport throughout',
      'Bottled water',
    ],
    excludes: [
      'Mekong boat ride to Laos border (optional, ฿50)',
      'Personal shopping',
      'Gratuities',
      'Alcoholic beverages',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (08:00 AM)',
        desc: 'Air-conditioned minibus collects you from your Chiang Rai hotel.',
      },
      {
        step: '2',
        title: 'White Temple — Wat Rong Khun (08:30 AM)',
        desc: 'Two hours at the White Temple. Your guide provides deep context for the symbolism before letting you explore independently. Visit the gallery showcasing Kositpipat\'s painted artworks and the gift shop he funds through temple sales.',
      },
      {
        step: '3',
        title: 'Blue Temple — Wat Rong Suea Ten (10:45 AM)',
        desc: 'Far quieter than the White Temple, the Blue Temple\'s extraordinary cobalt interior is one of the most photogenic spaces in Thailand. Your guide explains the story of its construction and the young local artists who painted the murals.',
      },
      {
        step: '4',
        title: 'Lunch (12:00 PM)',
        desc: 'Traditional Northern Thai lunch at a local restaurant: khao soi, sai oua (Northern Thai sausage), and laap.',
      },
      {
        step: '5',
        title: 'Golden Triangle (01:30 PM)',
        desc: 'Drive north to the point where Thailand, Laos, and Myanmar meet at the confluence of the Mekong and Ruak Rivers. Your guide explains the geopolitics, history of the opium trade, and current cross-border dynamics.',
      },
      {
        step: '6',
        title: 'Hall of Opium Museum (02:30 PM)',
        desc: 'An award-winning museum that traces the history of the opium trade from ancient Mesopotamia to modern drug policy. Surprisingly moving and thought-provoking — recommended even for those who typically skip museums.',
      },
      {
        step: '7',
        title: 'Optional Mekong Boat Ride (03:30 PM)',
        desc: 'A 30-minute longtail boat ride on the Mekong to the Laos border buoy is available for an additional ฿50 per person. A unique way to experience the river.',
      },
      {
        step: '8',
        title: 'Return to Chiang Rai (04:00 PM)',
        desc: 'Drive back to Chiang Rai city. Arrive hotel approximately 04:30–05:00 PM.',
      },
    ],
    options: [
      {
        id: 'cr-temples-gt-standard',
        time: '08:00 AM',
        label: 'White Temple + Blue Temple + Golden Triangle',
        pricePerPerson: 1790,
        childPrice: 1190,
        availability: 'available',
      },
      {
        id: 'cr-temples-gt-from-cm',
        time: '06:00 AM',
        label: 'Day Trip from Chiang Mai (incl. Chiang Mai transfer)',
        pricePerPerson: 3490,
        childPrice: 2490,
        availability: 'available',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Chiang Rai city hotels. Day-trip-from-Chiang-Mai option includes pickup from Chiang Mai hotels at 06:00 AM.',
    importantInfo: [
      'White Temple dress code strictly enforced: shoulders and knees covered. No exceptions. Appropriate attire available to borrow at the entrance.',
      'Photography is permitted in all exterior areas of the White Temple. Photography inside the main hall is NOT permitted.',
      'The White Temple closes for occasional maintenance and Buddhist holidays. We will notify you in advance and arrange a refund if closure affects your visit.',
      'The Hall of Opium Museum has mild age restrictions — content is educational but some exhibits are intense for young children.',
      'The day-trip-from-Chiang-Mai option is a very long day (6am–8pm). It is worthwhile but physically tiring.',
    ],
    reviews: [
      {
        name: 'Rachel C.',
        country: 'Canada',
        rating: 5,
        date: '2025-04-12',
        text: 'The White Temple blew my mind completely. Photos don\'t do it justice — standing in front of it you almost can\'t believe it\'s real. The Blue Temple was a wonderful surprise, quieter and deeply beautiful. Our guide was incredible — passionate, articulate, and full of fascinating stories. Best guided tour of the trip.',
      },
      {
        name: 'Stefan B.',
        country: 'Germany',
        rating: 5,
        date: '2025-03-05',
        text: 'We did the day trip from Chiang Mai which is a long day but absolutely worth it. Three of the most remarkable buildings in Asia in one day. The Hall of Opium was surprisingly fascinating. Guide was excellent and the minibus was comfortable. 100% recommend.',
      },
      {
        name: 'Yuki M.',
        country: 'Japan',
        rating: 5,
        date: '2025-02-10',
        text: 'Perfect tour. The White Temple is extraordinary — I photographed it for over an hour. The Blue Temple was a beautiful secret. The Golden Triangle was more poignant than I expected once the guide explained the history. The lunch was delicious. Highly recommend.',
      },
    ],
  },

  // ── CHIANG RAI 2 ──────────────────────────────────────────────────────────
  {
    slug: 'chiang-rai-hill-tribe-village-trekking',
    title: 'Chiang Rai Hill Tribe Village Trekking & Local Culture Tour',
    subtitle: 'Trek through lush northern forests and visit authentic Akha, Yao, and Karen hilltribe communities',
    location: 'Chiang Rai, Thailand',
    cities: ['chiang rai', 'chiangmai'],
    duration: '8 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.7,
    reviewCount: 678,
    category: 'adventure',
    primaryLocation: 'Chiang Rai',
    tags: ['trekking', 'hilltribe', 'culture', 'forest', 'adventure'],
    priceFrom: 1890,
    isFeatured: true,
    isPopular: false,
    instantConfirmation: true,
    lastBooked: '12 hours ago',
    ratingBreakdown: { 5: 560, 4: 80, 3: 28, 2: 7, 1: 3 },
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&q=80',
      'https://images.unsplash.com/photo-1512553313200-fe7f7d4c0a26?w=1200&q=80',
      'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200&q=80',
    ],
    highlights: [
      'Guided trek through Northern Thailand\'s forest and hill terrain (8–10 km)',
      'Visit three different hilltribe communities: Akha, Yao (Mien), and Karen',
      'Witness traditional weaving, silversmithing, and farming techniques',
      'Learn about the complex cultural identity and challenges facing hilltribe communities in modern Thailand',
      'Home-cooked hilltribe lunch with a local family',
      'Optional elephant interaction at a responsible hilltribe elephant camp',
      'Small group of maximum 10 people — respectful, low-impact visits',
    ],
    description: `Northern Thailand is home to more than 20 distinct ethnic hilltribe groups, each with its own language, traditions, spiritual practices, and extraordinary handcraft culture. This guided trekking tour from Chiang Rai brings you into genuine contact with three of these communities — the Akha, the Yao (Mien), and the Karen — in a respectful, low-impact visit focused on cultural exchange rather than spectacle.

Your guide, who has worked with these communities for over a decade, leads you along forest trails and rice terrace paths connecting the villages. The Akha village reveals the community's elaborate headdresses worn by women and girls for festivals, their animist spiritual practices, and their distinctive silver jewellery. The Yao village showcases some of the most sophisticated embroidery traditions in Southeast Asia — a craft taught to girls from age five that takes a lifetime to master. The Karen village shows how these communities maintain traditional swidden agriculture alongside modern subsistence farming.

Lunch is prepared and served by a local Akha family in their home — a meal of jungle greens, fermented bamboo shoot, and sticky rice that gives you an insight into daily highland life. Throughout the visit your guide contextualises what you see: the history of migration from southern China and Myanmar, the Thai government's citizenship policies, the challenges of maintaining culture while accessing modern education and healthcare.

This is not a "human zoo" experience. These are real communities with complex modern lives, and the visit is designed to create meaningful exchange. Bring an open mind and leave your preconceptions at home.`,
    includes: [
      'Hotel pickup from Chiang Rai city',
      'Experienced English-speaking local guide',
      'Trek through forest and hill terrain (8–10 km)',
      'Visits to three hilltribe villages',
      'Home-cooked hilltribe lunch',
      'Drinking water and trail snacks',
      'Bamboo walking sticks for steep sections',
    ],
    excludes: [
      'Optional elephant interaction (฿800 per person, own arrangement)',
      'Craft purchases from the villages (encourage purchasing directly — 100% goes to artisans)',
      'Gratuities',
      'Personal travel insurance',
    ],
    itinerary: [
      {
        step: '1',
        title: 'Hotel Pickup (08:00 AM)',
        desc: 'Drive north from Chiang Rai city toward the Mae Fah Luang hills (approximately 1 hour).',
      },
      {
        step: '2',
        title: 'Trek Begins — Forest Trail (09:00 AM)',
        desc: 'Begin the trek on a well-maintained forest trail. Your guide introduces the flora — identifying medicinal plants, edible roots, and explaining how the forest is used by hilltribe communities.',
      },
      {
        step: '3',
        title: 'Akha Village (10:00 AM)',
        desc: 'Visit an Akha village. Watch women at work on their intricate headdresses and bead-work. Your guide translates and facilitates genuine conversation with community members. Opportunity to purchase handicrafts directly.',
      },
      {
        step: '4',
        title: 'Yao (Mien) Village — Embroidery Demonstration (11:15 AM)',
        desc: 'The Yao are famous for their cross-stitch embroidery — one of the most complex textile traditions in Asia. Watch a demonstration by Yao women and learn what each pattern represents.',
      },
      {
        step: '5',
        title: 'Hilltribe Lunch (12:30 PM)',
        desc: 'A simple, delicious lunch prepared by an Akha family in their traditional longhouse: jungle herbs, banana-flower salad, fermented bamboo shoot, sticky rice, and fresh spring water.',
      },
      {
        step: '6',
        title: 'Karen Village (01:30 PM)',
        desc: 'Descend to a Karen village adjacent to the forest. Learn about Karen animist and Buddhist spiritual practices, traditional weaving on backstrap looms, and community agricultural practices.',
      },
      {
        step: '7',
        title: 'Return Trek & Drive Back (03:00 PM)',
        desc: 'Final stretch of trekking back to the vehicles, then drive to Chiang Rai. Arrive hotel approximately 04:30 PM.',
      },
    ],
    options: [
      {
        id: 'cr-hilltribe-standard',
        time: '08:00 AM',
        label: 'Full Day Trek — Three Villages',
        pricePerPerson: 1890,
        childPrice: 1290,
        availability: 'available',
      },
      {
        id: 'cr-hilltribe-2day',
        time: '08:00 AM',
        label: '2-Day Overnight Trek (camping in Karen village)',
        pricePerPerson: 4290,
        childPrice: 2990,
        availability: 'limited',
      },
    ],
    meetingPoint: 'Hotel pickup included from all Chiang Rai city hotels.',
    importantInfo: [
      'This trek covers 8–10 km on uneven forest terrain with elevation changes. A reasonable level of fitness is required.',
      'Wear sturdy, closed-toe shoes with grip. Do not wear sandals or flip-flops on this trek.',
      'Long trousers and long sleeves are recommended to protect against insects and as a sign of respect in the villages.',
      'Photography in the villages: always ask your guide before photographing community members. Some community members prefer not to be photographed and this must be respected.',
      'Do not give sweets, money, or gifts directly to children in the villages. This creates problematic begging dynamics. If you wish to contribute, your guide can arrange a community donation.',
      'The 2-day overnight option includes camping equipment, an additional meal, and a sunrise forest walk. Suitable for adults only.',
      'Insect repellent is strongly recommended.',
    ],
    reviews: [
      {
        name: 'Natalie R.',
        country: 'United Kingdom',
        rating: 5,
        date: '2025-03-20',
        text: 'The most culturally meaningful tour I\'ve done in 20 years of travelling in Asia. Our guide was extraordinary — he built real relationships with the communities and helped us have genuine conversations, not staged encounters. The Yao embroidery was mindblowing. The lunch in the longhouse is a memory I\'ll carry forever.',
      },
      {
        name: 'Pierre M.',
        country: 'France',
        rating: 4,
        date: '2025-02-04',
        text: 'Excellent tour for travellers who want more than temples and beaches. The guide is clearly trusted and respected in the villages — you can feel the difference from a cold tourist operation. Some steep uphill sections — be prepared for a real workout. Very rewarding day.',
      },
    ],
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
