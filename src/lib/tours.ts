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
}

// ─── Tour catalogue ───────────────────────────────────────────────────────────

export const TOURS: Tour[] = [
  // ── Bangkok area ─────────────────────────────────────────────────────────
  {
    slug: 'damnoen-saduak-maeklong-railway',
    title: 'Damnoen Saduak Floating Market & Maeklong Railway Market',
    subtitle: 'Full-day guided day trip from Bangkok with hotel pickup',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Suvarnabhumi', 'Don Mueang', 'Pattaya', 'Hua Hin'],
    duration: '10 hours',
    maxGroupSize: 15,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.8,
    reviewCount: 2341,
    category: 'day-trip',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570184894000-5b6b0b1f1b1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828a2bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Glide through the iconic Damnoen Saduak Floating Market by longtail boat',
      'Watch trains pass through market stalls at the legendary Maeklong Railway Market',
      'Hotel pickup and drop-off included from central Bangkok',
      'Small group (max 15) for a more personal experience',
      'Free cancellation up to 24 hours before the tour starts',
    ],
    description: `Experience two of Thailand's most iconic markets on this unforgettable day trip from Bangkok. Start at the Damnoen Saduak Floating Market, one of the most photographed places in the country, where vendors sell tropical fruits, Thai snacks and souvenirs from wooden boats along narrow canals. Then head to Maeklong Railway Market — a regular fresh produce market that transforms every time a train passes through, with vendors folding back their awnings to let the train roll through stalls.\n\nYour English-speaking guide will share fascinating insights throughout the day, and your hotel pickup and drop-off means you can sit back and enjoy the experience from start to finish.`,
    includes: [
      'Hotel pickup & drop-off (Bangkok area)',
      'Air-conditioned minivan transport',
      'Longtail boat ride at Damnoen Saduak',
      'English-speaking tour guide',
      'Entrance fees to all sites',
      'Bottled water',
    ],
    excludes: [
      'Lunch & personal meals',
      'Gratuities (optional)',
      'Personal shopping expenses',
    ],
    itinerary: [
      { step: '07:00', title: 'Hotel pickup', desc: 'Your guide meets you at your Bangkok hotel lobby and transfers you to the first destination by air-conditioned minivan.' },
      { step: '08:30', title: 'Damnoen Saduak Floating Market', desc: 'Board a longtail boat and explore the colourful floating market, browsing fresh produce, tropical fruits and handmade souvenirs from local vendors.' },
      { step: '10:30', title: 'Free time & snacks', desc: 'Enjoy an hour of free exploration. Try freshly made Pad Thai or coconut ice cream from floating vendors.' },
      { step: '11:30', title: 'Drive to Maeklong', desc: 'Short 30-minute air-conditioned drive to the Maeklong Railway Market.' },
      { step: '12:00', title: 'Maeklong Railway Market', desc: "Walk through the incredible market that spills onto the train tracks. If you're lucky, you'll witness the folding-umbrella routine when the train passes." },
      { step: '13:30', title: 'Return to Bangkok', desc: 'Comfortable minivan journey back to your hotel, arriving approximately 15:00–16:00.' },
    ],
    options: [
      { id: 'morning', time: '07:00 AM', label: 'Morning departure', pricePerPerson: 950, childPrice: 750, availability: 'available' },
      { id: 'midmorning', time: '08:00 AM', label: 'Mid-morning departure', pricePerPerson: 950, childPrice: 750, availability: 'limited' },
    ],
    meetingPoint: 'Pickup from your Bangkok hotel lobby. Please provide hotel name and room number when booking.',
    importantInfo: [
      'Wear comfortable shoes and light clothing — it gets hot and humid',
      'Bring cash (Thai Baht) for market shopping and street food',
      'The tour operates daily except Thai national holidays',
      'Children under 3 travel free (no seat)',
      'Maximum 15 guests per group',
    ],
    reviews: [
      { name: 'Emma W.', country: 'United Kingdom', rating: 5, date: '2024-11', text: 'Absolutely incredible day! The floating market was everything I hoped for and the railway market was mind-blowing. Our guide was fantastic and so knowledgeable.' },
      { name: 'Marc D.', country: 'France', rating: 5, date: '2024-10', text: 'The longtail boat ride was a highlight. Small group so we could ask lots of questions. Hotel pickup made it so convenient.' },
      { name: 'Yuki S.', country: 'Japan', rating: 4, date: '2024-09', text: 'Very well organised tour. The floating market was busy but our guide knew how to navigate the crowds. Highly recommend.' },
    ],
  },

  {
    slug: 'grand-palace-temple-tour',
    title: 'Grand Palace, Wat Pho & Wat Arun — Bangkok Temples Tour',
    subtitle: 'Half-day guided tour of Bangkok\'s most sacred temples with a private longtail boat',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Suvarnabhumi', 'Don Mueang', 'BKK'],
    duration: '5 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 4.9,
    reviewCount: 1876,
    category: 'cultural',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587474397853-c24fcf3d6c48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Visit the Grand Palace — the official residence of the Thai Royal Family',
      'See the Emerald Buddha inside Wat Phra Kaew',
      'Explore the famous reclining Buddha at Wat Pho (46 m long)',
      'Cross the Chao Phraya River to Wat Arun by traditional longtail boat',
      'Expert English-speaking guide with deep knowledge of Thai history',
    ],
    description: `Discover the spiritual heart of Bangkok on this expertly guided half-day tour. Begin at the dazzling Grand Palace complex — the official residence of Thai kings since 1782 — and Wat Phra Kaew, home to the revered Emerald Buddha. Continue to nearby Wat Pho to marvel at the 46-metre reclining Buddha, then hop aboard a longtail boat to cross the Chao Phraya River and explore the iconic Wat Arun (Temple of Dawn) with its intricate porcelain-studded towers.\n\nAll entrance fees, boat transport and a knowledgeable guide are included. Sarongs are provided for free at temple entrances if needed.`,
    includes: [
      'English-speaking guide',
      'All entrance fees (Grand Palace, Wat Pho, Wat Arun)',
      'Longtail boat crossing to Wat Arun',
      'Sarong rental if required',
      'Small group (max 12 people)',
    ],
    excludes: [
      'Hotel pickup (meetup at Grand Palace gate)',
      'Meals & drinks',
      'Personal expenses',
    ],
    itinerary: [
      { step: '08:30', title: 'Meet at Grand Palace main gate', desc: 'Meet your guide at the Tha Chang Pier entrance. Receive your entrance tickets and a brief overview of the day.' },
      { step: '09:00', title: 'Grand Palace & Wat Phra Kaew', desc: 'Explore the magnificent Grand Palace complex and the Chapel of the Emerald Buddha. Your guide shares stories of the Thai monarchy.' },
      { step: '10:30', title: 'Wat Pho', desc: 'A short walk to Wat Pho to see the colossal 46m gilded reclining Buddha and the birthplace of traditional Thai massage.' },
      { step: '11:30', title: 'Longtail boat to Wat Arun', desc: 'Board a traditional longtail boat for the short crossing of the Chao Phraya River.' },
      { step: '11:45', title: 'Wat Arun — Temple of Dawn', desc: 'Climb the steep steps of the central prang for panoramic river views and admire the intricate mosaic decorations.' },
      { step: '13:00', title: 'Tour ends', desc: 'Return by longtail boat to Tha Tien Pier. Your guide can recommend nearby lunch spots.' },
    ],
    options: [
      { id: 'morning', time: '08:30 AM', label: 'Morning tour', pricePerPerson: 850, childPrice: 650, availability: 'available' },
      { id: 'afternoon', time: '01:30 PM', label: 'Afternoon tour', pricePerPerson: 850, childPrice: 650, availability: 'available' },
    ],
    meetingPoint: 'Grand Palace main entrance, Tha Chang Pier, Na Phra Lan Road, Bangkok 10200.',
    importantInfo: [
      'Dress modestly: shoulders and knees must be covered at all temple sites',
      'Avoid visiting on Thai public holidays — crowds are significantly larger',
      'Comfortable walking shoes strongly recommended',
      'The Grand Palace is closed on certain ceremonial days — we will notify you in advance',
    ],
    reviews: [
      { name: 'Anna L.', country: 'Germany', rating: 5, date: '2024-12', text: 'Our guide was absolutely brilliant. We learned so much about Thai culture and history. The Emerald Buddha was breathtaking.' },
      { name: 'Carlos R.', country: 'Spain', rating: 5, date: '2024-11', text: 'Best tour in Bangkok by far. Small group meant we weren\'t rushing and had time for proper photos. 100% recommend.' },
    ],
  },

  {
    slug: 'bangkok-street-food-night-tour',
    title: 'Bangkok Street Food Night Tour — 15 Must-Try Dishes',
    subtitle: 'A guided walk through Bangkok\'s most legendary night markets and street food alleys',
    location: 'Bangkok, Thailand',
    cities: ['Bangkok', 'Suvarnabhumi', 'Don Mueang', 'BKK'],
    duration: '3.5 hours',
    maxGroupSize: 10,
    languages: ['English'],
    rating: 4.9,
    reviewCount: 987,
    category: 'food',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828a2bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1569566030073-5a91ca9c1a2a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Taste 15+ legendary street dishes curated by a local food expert',
      'Explore hidden alleyways and night markets off the tourist trail',
      'Sample Pad Thai, mango sticky rice, satay, boat noodles and more',
      'Small group of max 10 for a personal experience',
      'All food is included in the price',
    ],
    description: `Bangkok is one of the world's greatest street food cities, and this evening tour is your passport to its best bites. Led by a local food expert, you'll explore the vibrant lanes of Bangkok's legendary night market scene — tasting dishes you might never have found on your own.\n\nFrom the snap of a perfectly charred satay skewer to silky mango sticky rice under fairy lights, this 3.5-hour walk covers the essential flavours of Thai cuisine with fascinating context from your guide.`,
    includes: [
      'Expert local food guide',
      'All food tastings (15+ dishes)',
      'Bottled water',
      'Small group (max 10)',
    ],
    excludes: ['Hotel pickup', 'Additional drinks', 'Personal purchases'],
    itinerary: [
      { step: '18:00', title: 'Meet near Victory Monument BTS', desc: 'Kick off with a refreshing coconut ice cream while your guide introduces the neighbourhood.' },
      { step: '18:20', title: 'First market — noodles & soups', desc: 'Dive into boat noodles and Tom Yum Goong at a market famous with locals.' },
      { step: '19:00', title: 'Street vendor alley', desc: 'Try skewers, stuffed wings and fried banana from vendors who have been working the same spot for decades.' },
      { step: '19:40', title: 'Night market stretch', desc: 'Sample grilled seafood, green papaya salad and the famous Thai pork belly with jasmine rice.' },
      { step: '20:30', title: 'Dessert finale', desc: 'End with mango sticky rice and a sweet roti pancake dripping in condensed milk.' },
      { step: '21:30', title: 'Tour ends', desc: 'Tour concludes near the BTS station. Your guide can point you to the nearest taxi rank.' },
    ],
    options: [
      { id: 'evening', time: '06:00 PM', label: 'Evening (sunset start)', pricePerPerson: 1290, childPrice: 990, availability: 'available' },
      { id: 'lateevening', time: '07:30 PM', label: 'Late evening', pricePerPerson: 1290, childPrice: 990, availability: 'limited' },
    ],
    meetingPoint: 'Victory Monument BTS station exit 4, Bangkok',
    importantInfo: [
      'Come hungry — you will eat a lot!',
      'Vegetarian options available on request',
      'Wear comfortable walking shoes',
      'Tour operates in all weather (Bangkok evenings are usually pleasant)',
    ],
    reviews: [
      { name: 'Sophie T.', country: 'Australia', rating: 5, date: '2024-12', text: 'The best experience of my trip to Bangkok. Our guide was hilarious and so knowledgeable about Thai food. We ate SO much.' },
      { name: 'James K.', country: 'USA', rating: 5, date: '2024-10', text: 'Incredible variety of food and fantastic local knowledge. I discovered dishes I\'ve been dreaming about ever since.' },
    ],
  },

  {
    slug: 'ayutthaya-temples-day-trip',
    title: 'Ayutthaya Ancient Temples — Day Trip from Bangkok',
    subtitle: 'Explore the ruined city of Ayutthaya, a UNESCO World Heritage Site, by tuk-tuk',
    location: 'Ayutthaya, Thailand',
    cities: ['Bangkok', 'Suvarnabhumi', 'Don Mueang', 'Ayutthaya'],
    duration: '11 hours',
    maxGroupSize: 14,
    languages: ['English', 'Thai'],
    rating: 4.7,
    reviewCount: 1423,
    category: 'cultural',
    images: [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Visit the ancient capital of Ayutthaya, a UNESCO World Heritage Site',
      'Explore temples by local tuk-tuk for an authentic experience',
      'See the famous Buddha head entwined in tree roots at Wat Mahathat',
      'Hotel pickup and drop-off from Bangkok included',
      'Expert English-speaking historian guide',
    ],
    description: `Once the glittering capital of the Kingdom of Siam, Ayutthaya was sacked by the Burmese in 1767 and left in magnificent ruins. Today a UNESCO World Heritage Site, this ancient city sits on an island at the confluence of three rivers and is one of Thailand's most historically significant destinations.\n\nOn this full-day trip from Bangkok, you'll explore the most spectacular ruins by tuk-tuk, including Wat Mahathat (home to the famous Buddha head in tree roots), Wat Ratchaburana and Wat Phra Si Sanphet.`,
    includes: [
      'Air-conditioned minivan transfer from Bangkok',
      'Local tuk-tuk tour of ruins',
      'English-speaking guide',
      'All entrance fees',
      'Hotel pickup & drop-off',
      'Bottled water',
    ],
    excludes: ['Lunch', 'Personal shopping', 'Gratuities'],
    itinerary: [
      { step: '07:00', title: 'Bangkok hotel pickup', desc: 'Hotel pickup by air-conditioned minivan.' },
      { step: '08:30', title: 'Arrive in Ayutthaya', desc: 'Arrival at the ancient city. Brief orientation from your guide.' },
      { step: '09:00', title: 'Wat Mahathat', desc: 'Visit the 14th-century monastery and photograph the iconic Buddha head entwined in Bodhi tree roots.' },
      { step: '10:00', title: 'Wat Phra Si Sanphet', desc: 'Explore the former royal temple with its three iconic bell-shaped chedis.' },
      { step: '11:00', title: 'Wat Ratchaburana & Wat Lokaya Sutha', desc: 'Discover the large reclining Buddha and impressive prangs of Ratchaburana.' },
      { step: '12:30', title: 'Lunch break (own expense)', desc: 'Free time for lunch at a riverside restaurant (not included).' },
      { step: '14:00', title: 'Remaining temples + river view', desc: 'Continue exploring at your own pace with your guide.' },
      { step: '15:30', title: 'Return to Bangkok', desc: 'Minivan journey back to Bangkok, arriving approximately 17:00.' },
    ],
    options: [
      { id: 'morning', time: '07:00 AM', label: 'Full-day tour', pricePerPerson: 1190, childPrice: 890, availability: 'available' },
    ],
    meetingPoint: 'Your Bangkok hotel lobby (hotel pickup included)',
    importantInfo: [
      'Shoulders and knees must be covered when entering temples',
      'Bring sunscreen and a hat — limited shade at some sites',
      'The return time is approximate and depends on traffic',
    ],
    reviews: [
      { name: 'Laura B.', country: 'Canada', rating: 5, date: '2024-11', text: 'One of the best days in Thailand. The ruins are breathtaking and our guide brought the history alive.' },
    ],
  },

  // ── Phuket area ───────────────────────────────────────────────────────────
  {
    slug: 'phi-phi-islands-speedboat',
    title: 'Phi Phi Islands Speedboat Day Trip from Phuket',
    subtitle: 'Visit Maya Bay, snorkel in crystal waters and explore the Phi Phi archipelago',
    location: 'Phuket, Thailand',
    cities: ['Phuket', 'Patong', 'Karon', 'Kata', 'Bang Tao', 'Krabi', 'Ao Nang', 'Kamala', 'Rawai'],
    duration: '10 hours',
    maxGroupSize: 20,
    languages: ['English', 'Thai', 'Chinese'],
    rating: 4.8,
    reviewCount: 3102,
    category: 'water',
    badge: 'Best Seller',
    images: [
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559628129-67cf63b72248?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Speed to the Phi Phi archipelago in a modern, comfortable speedboat',
      'Swim and snorkel in the emerald waters of Maya Bay (The Beach)',
      'Visit Monkey Beach and snorkel at Loh Samah Bay',
      'Explore Phi Phi Leh\'s Viking Cave',
      'Buffet lunch included on Phi Phi Don Island',
      'Snorkelling gear provided',
    ],
    description: `The Phi Phi Islands are among the most beautiful in the world, and this day trip lets you experience them in style aboard a modern speedboat. Glide past dramatic limestone karsts to reach Maya Bay — the setting for the film The Beach — for swimming and snorkelling in water so clear you can see 10 metres to the seabed.\n\nYour day includes visits to multiple snorkelling spots, Monkey Beach, Viking Cave and a buffet lunch on Phi Phi Don Island, the largest and most inhabited of the islands.`,
    includes: [
      'Return speedboat transfer from Phuket',
      'Buffet lunch on Phi Phi Don',
      'Snorkelling equipment (mask, fins, life vest)',
      'English-speaking guide',
      'Marine park fees',
      'Bottled water & soft drinks on board',
    ],
    excludes: ['Hotel pickup (transfer to pier available +฿300)', 'Alcoholic drinks', 'Personal snorkelling fins (upgrade available)'],
    itinerary: [
      { step: '07:30', title: 'Depart Ao Po Grand Marina', desc: 'Board your speedboat and receive a safety briefing. Enjoy tea and coffee as you depart.' },
      { step: '09:00', title: 'Loh Samah Bay — snorkelling stop 1', desc: 'First snorkelling stop with excellent coral and marine life.' },
      { step: '09:45', title: 'Maya Bay — The Beach', desc: 'Arrive at the iconic Maya Bay for swimming and free time on the beach.' },
      { step: '11:00', title: 'Viking Cave & Monkey Beach', desc: 'See the ancient cave paintings at Viking Cave and stop at Monkey Beach.' },
      { step: '12:00', title: 'Lunch on Phi Phi Don', desc: 'Enjoy a generous Thai and international buffet lunch at a beachfront restaurant.' },
      { step: '13:30', title: 'Phi Phi Don free time', desc: 'Explore the village, browse shops or rent a kayak independently.' },
      { step: '15:00', title: 'Return to Phuket', desc: 'Speedboat return to Ao Po Grand Marina, arriving approximately 16:30.' },
    ],
    options: [
      { id: 'standard', time: '07:30 AM', label: 'Standard tour', pricePerPerson: 1650, childPrice: 1250, availability: 'available' },
      { id: 'premium', time: '07:30 AM', label: 'Premium (smaller group, max 12)', pricePerPerson: 2200, childPrice: 1700, availability: 'limited' },
    ],
    meetingPoint: 'Ao Po Grand Marina, Phuket (shuttle from hotel +฿300 extra)',
    importantInfo: [
      'Bring sunscreen, sunglasses and a light layer for the speedboat ride',
      'Not recommended for people prone to seasickness',
      'Maya Bay entry fee included',
      'Children under 12 must wear a life jacket at all times on the boat',
    ],
    reviews: [
      { name: 'Rachel G.', country: 'New Zealand', rating: 5, date: '2024-11', text: 'Absolutely stunning. Maya Bay was like something out of a dream. The speedboat was modern and the guide was great fun.' },
      { name: 'Ben C.', country: 'UK', rating: 4, date: '2024-10', text: 'Amazing day out. Water visibility was superb for snorkelling. Gets busy at Maya Bay but still magical.' },
    ],
  },

  {
    slug: 'james-bond-island-phang-nga',
    title: 'James Bond Island & Phang Nga Bay — Sea Canoe & Kayak Tour',
    subtitle: 'Paddle through sea caves and hollow caves (hongs) in one of Asia\'s most stunning bays',
    location: 'Phang Nga, Thailand',
    cities: ['Phuket', 'Patong', 'Karon', 'Bang Tao', 'Krabi'],
    duration: '8 hours',
    maxGroupSize: 16,
    languages: ['English', 'Thai'],
    rating: 4.7,
    reviewCount: 1654,
    category: 'water',
    images: [
      'https://images.unsplash.com/photo-1559628129-67cf63b72248?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Paddle through hidden sea caves and hongs (hollow caves) by kayak',
      'Visit Khao Phing Kan — the iconic "James Bond Island" from The Man with the Golden Gun',
      'Explore the spectacular karst limestone landscape of Phang Nga Bay',
      'Traditional lunch on a floating village',
      'Sea kayak equipment and safety gear included',
    ],
    description: `Phang Nga Bay is one of Thailand's most dramatic seascapes — a UNESCO-listed landscape of emerald water studded with vertiginous karst limestone islands. On this full-day adventure, glide through hidden sea caves and hongs (caverns open to the sky) by inflatable kayak, stopping at the famous "James Bond Island" and a traditional fishing village built on stilts.`,
    includes: ['Return boat transfer', 'Sea kayak equipment', 'Guide', 'Thai buffet lunch', 'Marine park fees', 'Drinking water'],
    excludes: ['Hotel pickup (+฿350)', 'Gratuities', 'Personal expenses'],
    itinerary: [
      { step: '08:00', title: 'Depart from pier', desc: 'Board your longtail boat and head into Phang Nga Bay.' },
      { step: '09:30', title: 'Sea cave kayaking', desc: 'Enter the first set of hongs by inflatable kayak — your guide will paddle you through.' },
      { step: '11:00', title: 'James Bond Island', desc: 'Visit Khao Phing Kan and the distinctive leaning rock Khao Ta Pu.' },
      { step: '12:30', title: 'Floating village lunch', desc: 'Enjoy a Thai buffet lunch at Koh Panyee, a fishing village built entirely on stilts.' },
      { step: '14:00', title: 'More kayaking & swimming', desc: 'Return to kayaking with time for swimming at a quiet beach.' },
      { step: '16:00', title: 'Return to Phuket', desc: 'Boat return to the pier, arriving approximately 17:30.' },
    ],
    options: [
      { id: 'standard', time: '08:00 AM', pricePerPerson: 1450, childPrice: 1100, availability: 'available' },
    ],
    meetingPoint: 'Bang Rong Pier, Phuket (hotel shuttle available)',
    importantInfo: ['Wear light, quick-dry clothing', 'Bring water shoes', 'Not recommended for those with back problems'],
    reviews: [
      { name: 'Isabel M.', country: 'Portugal', rating: 5, date: '2024-12', text: 'The kayaking through the caves was absolutely magical. James Bond Island was impressive and the floating village was fascinating.' },
    ],
  },

  // ── Chiang Mai area ───────────────────────────────────────────────────────
  {
    slug: 'elephant-sanctuary-chiang-mai',
    title: 'Elephant Nature Park — Half-Day Ethical Elephant Sanctuary',
    subtitle: 'Feed, bathe and walk alongside rescued elephants in their natural habitat',
    location: 'Chiang Mai, Thailand',
    cities: ['Chiang Mai', 'Chiang Rai', 'Pai', 'Golden Triangle', 'Lampang'],
    duration: '5 hours',
    maxGroupSize: 12,
    languages: ['English', 'Thai'],
    rating: 5.0,
    reviewCount: 2876,
    category: 'nature',
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1599825978887-74ea98c6a0de?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      '100% ethical — no riding, no hooks, no shows',
      'Hand-feed rescued elephants bananas and sugar cane',
      'Observe elephants in their natural habitat along the river',
      'Learn about elephant conservation from expert mahouts',
      'Hotel pickup and drop-off included',
    ],
    description: `This half-day experience at an ethical elephant sanctuary gives you up-close time with rescued elephants in a natural forest setting — with no riding, no bullhooks, and no performances. Instead, you'll hand-feed the herd, walk alongside them through the jungle, and observe their natural behaviour as they wade through rivers.\n\nYour visit directly supports the care and rehabilitation of elephants rescued from the tourism and logging industries.`,
    includes: ['Hotel pickup & drop-off', 'Guide & mahout presentations', 'Fruit for feeding', 'Vegetarian Thai lunch', 'Drinking water'],
    excludes: ['Personal purchases at sanctuary shop', 'Gratuities'],
    itinerary: [
      { step: '08:00', title: 'Hotel pickup', desc: 'Air-conditioned minivan picks you up from your Chiang Mai hotel.' },
      { step: '09:00', title: 'Welcome & orientation', desc: 'Arrive at the sanctuary. Brief from the team about the elephants and ethical guidelines.' },
      { step: '09:30', title: 'Elephant feeding & interaction', desc: 'Hand-feed bananas and sugar cane. Walk alongside the herd as they roam.' },
      { step: '10:30', title: 'River time & bathing', desc: 'Watch and assist as the elephants wade and play in the river.' },
      { step: '11:30', title: 'Vegetarian lunch', desc: 'Enjoy a delicious Thai vegetarian lunch in the sanctuary\'s open-air sala.' },
      { step: '12:30', title: 'Return to Chiang Mai', desc: 'Minivan returns to your hotel, arriving approximately 13:30.' },
    ],
    options: [
      { id: 'morning', time: '08:00 AM', label: 'Morning session', pricePerPerson: 2490, childPrice: 1990, availability: 'available' },
      { id: 'afternoon', time: '01:00 PM', label: 'Afternoon session', pricePerPerson: 2490, childPrice: 1990, availability: 'limited' },
    ],
    meetingPoint: 'Your Chiang Mai hotel (hotel pickup included)',
    importantInfo: [
      'Wear dark or muted clothing — bright colours can startle the elephants',
      'Bring insect repellent and comfortable shoes',
      'No riding of elephants under any circumstances',
      'Children under 5 are not permitted at this sanctuary',
    ],
    reviews: [
      { name: 'Hannah P.', country: 'Canada', rating: 5, date: '2024-12', text: 'The most special experience of my entire trip to Thailand. Seeing these majestic animals living freely was deeply moving.' },
      { name: 'Tom S.', country: 'USA', rating: 5, date: '2024-11', text: 'Worth every baht. Beautifully run, ethical and emotionally overwhelming. I cried. The elephants were incredible.' },
    ],
  },

  {
    slug: 'thai-cooking-class-chiang-mai',
    title: 'Authentic Thai Cooking Class in Chiang Mai with Farm Visit',
    subtitle: 'Learn to cook 6 traditional Thai dishes, starting at a local organic farm market',
    location: 'Chiang Mai, Thailand',
    cities: ['Chiang Mai', 'Chiang Rai', 'Pai'],
    duration: '5 hours',
    maxGroupSize: 10,
    languages: ['English', 'Thai'],
    rating: 4.9,
    reviewCount: 1234,
    category: 'food',
    images: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828a2bb?auto=format&fit=crop&w=800&q=80',
    ],
    highlights: [
      'Start at a local organic farm market to select fresh ingredients',
      'Cook 6 authentic Northern Thai dishes from scratch',
      'Small class of max 10 — lots of individual attention',
      'Take home a full recipe booklet',
      'Vegetarian and vegan menus available',
    ],
    description: `Begin this hands-on cooking class with a visit to a local organic farm market where you'll select the freshest herbs, spices and vegetables alongside your chef instructor. Return to a traditional Thai kitchen and spend the next few hours learning to cook six classic dishes — including a Northern Thai-style Khao Soi curry, freshly made spring rolls and a classic Pad Thai.\n\nBy the end of the class, you'll sit down to eat everything you've made. And yes, you get to take the recipes home.`,
    includes: ['Organic farm market visit', 'All ingredients', 'Cooking instruction', 'Lunch of dishes you prepare', 'Recipe booklet', 'Small group (max 10)'],
    excludes: ['Hotel pickup', 'Additional drinks'],
    itinerary: [
      { step: '09:00', title: 'Farm market visit', desc: 'Visit a local organic farm to select fresh herbs, vegetables and spices with your instructor.' },
      { step: '09:45', title: 'Introduction & knife skills', desc: 'Learn basic Thai knife skills and the role of each herb and spice.' },
      { step: '10:15', title: 'Cook dishes 1–3', desc: 'Make fresh spring rolls, Tom Kha soup and green papaya salad.' },
      { step: '11:15', title: 'Cook dishes 4–6', desc: 'Prepare Khao Soi curry, Pad Thai and coconut sticky rice dessert.' },
      { step: '12:30', title: 'Enjoy your feast', desc: 'Sit together and eat everything you\'ve cooked. Extra dishes go home with you.' },
      { step: '13:30', title: 'Class ends', desc: 'Receive your recipe booklet. Free time to explore the surrounding area.' },
    ],
    options: [
      { id: 'morning', time: '09:00 AM', pricePerPerson: 1100, childPrice: 850, availability: 'available' },
      { id: 'afternoon', time: '02:00 PM', pricePerPerson: 1100, childPrice: 850, availability: 'available' },
    ],
    meetingPoint: 'School entrance, Nimman area, Chiang Mai (GPS coordinates sent on booking)',
    importantInfo: ['Vegetarian, vegan and gluten-free menus available on request', 'Wear comfortable clothes you don\'t mind getting a little dirty'],
    reviews: [
      { name: 'Clara V.', country: 'Belgium', rating: 5, date: '2024-12', text: 'I can\'t believe how much we cooked in such a short time. The instructor was so patient and the food was amazing.' },
    ],
  },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Return tours relevant to a destination string (dropoff address) */
export function getToursForDestination(destination: string): Tour[] {
  if (!destination) return TOURS.slice(0, 4)
  const dest = destination.toLowerCase()
  const matched = TOURS.filter(tour =>
    tour.cities.some(city => {
      const c = city.toLowerCase()
      return dest.includes(c) || c.includes(dest.split(/[, ]/)[0].toLowerCase())
    }),
  )
  return matched.length > 0 ? matched.slice(0, 6) : TOURS.slice(0, 4)
}

/** Search / filter tours by text query, destination, category and trip type */
export function searchTours(params: {
  q?:           string
  destination?: string
  category?:    string
  type?:        string
}): Tour[] {
  let tours = [...TOURS]

  // Destination filter — matches cities array, location field, or title
  if (params.destination?.trim()) {
    const dest = params.destination.trim().toLowerCase()
    tours = tours.filter(t =>
      t.cities.some(c => {
        const cl = c.toLowerCase()
        return dest.includes(cl) || cl.includes(dest.split(/[,\s]+/)[0])
      }) ||
      t.location.toLowerCase().includes(dest) ||
      t.title.toLowerCase().includes(dest),
    )
  }

  // Category filter
  if (params.category?.trim()) {
    tours = tours.filter(t => t.category === params.category)
  }

  // Free-text search — title, subtitle, description, highlights, location
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase()
    tours = tours.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.highlights.some(h => h.toLowerCase().includes(q)) ||
      t.cities.some(c => c.toLowerCase().includes(q)),
    )
  }

  return tours
}

/** Return a single tour by slug */
export function getTourBySlug(slug: string): Tour | undefined {
  return TOURS.find(t => t.slug === slug)
}

/** Format THB price */
export function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString()}`
}
