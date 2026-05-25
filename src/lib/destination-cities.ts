/* ── City image map ─────────────────────────────────────────────────────────── */
export const CITY_IMAGES: Record<string, string> = {
  'Bangkok':        'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80',
  'Bangkok Airport':'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
  'Pattaya':        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80',
  'Chiang Mai':     'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
  'Phuket':         'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80',
  'Krabi':          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
  'Khao Lak':       'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=600&q=80',
  'Khao Sok':       'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
  'Phang-Nga':      'https://images.unsplash.com/photo-1552641150-6b5e3cdd0cf9?auto=format&fit=crop&w=600&q=80',
  'Surat Thani':    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=600&q=80',
  'Koh Samui':      'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=600&q=80',
  'Kanchanaburi':   'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
  'Koh Chang':      'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=600&q=80',
  'Koh Kood':       'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
  'Koh Larn':       'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=600&q=80',
  'Hua Hin':        'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=600&q=80',
  'Ayutthaya':      'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=600&q=80',
  'Chiang Rai':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  'Pai':            'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80',
  'Rayong':         'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
  'Trat':           'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=600&q=80',
  'Koh Phangan':    'https://images.unsplash.com/photo-1520454974749-a8c339e0e4f7?auto=format&fit=crop&w=600&q=80',
  'Koh Tao':        'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=600&q=80',
  'Lampang':        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
}

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface CityRoute {
  fromCity: string
  toCity:   string
  price:    number
  duration: string
  distance: string
}

export interface CityFAQ {
  q: string
  a: string
}

export interface CityConfig {
  slug:        string
  name:        string
  province:    string
  tagline:     string
  description: string
  heroImage:   string
  toursKey:    string   // key to pass to getToursForDestination()
  highlights:  { emoji: string; label: string }[]
  tips:        string[]
  faqs:        CityFAQ[]
  routesFrom:  CityRoute[]
  routesTo:    CityRoute[]
}

/* ── City configs ───────────────────────────────────────────────────────────── */
export const CITY_CONFIGS: Record<string, CityConfig> = {

  bangkok: {
    slug: 'bangkok', name: 'Bangkok', province: 'Bangkok', tagline: 'The City of Angels',
    description: 'A dazzling metropolis of ornate temples, legendary street food, sky-high rooftop bars and one of Asia\'s greatest shopping scenes — Bangkok is a city that never stops surprising.',
    heroImage: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Bangkok',
    highlights: [
      { emoji: '🛕', label: 'Grand Palace & Temples' },
      { emoji: '🌊', label: 'Chao Phraya River Cruise' },
      { emoji: '🛒', label: 'Chatuchak Weekend Market' },
      { emoji: '🍜', label: 'World-class Street Food' },
      { emoji: '🌆', label: 'Rooftop Bars & Nightlife' },
      { emoji: '🚤', label: 'Floating Markets Day Trips' },
    ],
    tips: [
      'Take the BTS Skytrain or MRT to avoid Bangkok\'s notorious traffic — especially during rush hour (7–9 AM and 5–8 PM).',
      'Dress modestly when visiting temples — shoulders and knees must be covered. Sarongs are available to borrow at most temples.',
      'Best time to visit is November to February for cool, dry weather. Avoid April (Songkran water festival chaos) if you want a quieter trip.',
      'Agree on a price with tuk-tuk and taxi drivers before getting in — or insist on the meter for licensed taxis.',
    ],
    faqs: [
      { q: 'How do I get from Suvarnabhumi Airport to Bangkok city centre?', a: 'The easiest option is a private transfer (45–60 min, from ฿900), the Airport Rail Link train (30 min to Phaya Thai, ฿45), or a metered taxi from the official taxi stand (60–90 min, ฿250–400 + expressway tolls).' },
      { q: 'What are the best things to do in Bangkok?', a: 'Top attractions include the Grand Palace & Wat Phra Kaew, Wat Pho\'s giant reclining Buddha, the rooftop bars of Silom and Sukhumvit, the weekend market at Chatuchak, and a sunset river cruise on the Chao Phraya.' },
      { q: 'What currency is used and are ATMs widely available?', a: 'Thailand uses the Thai Baht (THB). ATMs are abundant in Bangkok and accept international cards. Most charge a ฿200–220 foreign transaction fee. Notify your bank before travelling.' },
      { q: 'Is Bangkok safe for tourists?', a: 'Bangkok is generally very safe for tourists. Petty theft and scams (such as the "Grand Palace is closed today" scam) are the main concerns. Keep valuables secure and use official transport.' },
      { q: 'How far is Bangkok from Pattaya and Hua Hin?', a: 'Pattaya is about 150 km (1h 45m by private car). Hua Hin is around 200 km (2h 30m). Both are popular day-trip or overnight destinations easily reached with a private transfer.' },
      { q: 'Do I need a visa to visit Thailand?', a: 'Many nationalities receive a 30-day visa-exempt entry or can apply for Thailand\'s e-Visa online. Check the Thai Ministry of Foreign Affairs website for your specific passport.' },
    ],
    routesFrom: [
      { fromCity: 'Bangkok', toCity: 'Pattaya',        price: 1800, duration: '1h 45m', distance: '149 km' },
      { fromCity: 'Bangkok', toCity: 'Hua Hin',        price: 2400, duration: '2h 30m', distance: '200 km' },
      { fromCity: 'Bangkok', toCity: 'Ayutthaya',      price: 1400, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Bangkok', toCity: 'Kanchanaburi',   price: 2000, duration: '2h',     distance: '130 km' },
      { fromCity: 'Bangkok', toCity: 'Koh Chang',      price: 4500, duration: '4h 30m', distance: '310 km' },
      { fromCity: 'Bangkok', toCity: 'Bangkok Airport',price: 900,  duration: '45m',    distance: '30 km'  },
    ],
    routesTo: [
      { fromCity: 'Pattaya',        toCity: 'Bangkok', price: 1800, duration: '1h 45m', distance: '149 km' },
      { fromCity: 'Hua Hin',        toCity: 'Bangkok', price: 2400, duration: '2h 30m', distance: '200 km' },
      { fromCity: 'Ayutthaya',      toCity: 'Bangkok', price: 1400, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Kanchanaburi',   toCity: 'Bangkok', price: 2000, duration: '2h',     distance: '130 km' },
      { fromCity: 'Koh Chang',      toCity: 'Bangkok', price: 4500, duration: '4h 30m', distance: '310 km' },
      { fromCity: 'Bangkok Airport',toCity: 'Bangkok', price: 900,  duration: '45m',    distance: '30 km'  },
    ],
  },

  pattaya: {
    slug: 'pattaya', name: 'Pattaya', province: 'Chonburi', tagline: 'More Than You Expect',
    description: 'Thailand\'s most visited seaside resort has transformed dramatically. Beyond the beaches, discover world-class attractions, go-kart tracks, cultural shows, water parks, golf courses and a surprisingly excellent food scene.',
    heroImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Pattaya',
    highlights: [
      { emoji: '🏖️', label: 'Jomtien & Naklua Beaches' },
      { emoji: '🎭', label: 'Alcazar Cabaret Show' },
      { emoji: '🛥️', label: 'Koh Larn Island Trips' },
      { emoji: '🏎️', label: 'Go-Kart Racing Tracks' },
      { emoji: '🌿', label: 'Nong Nooch Tropical Garden' },
      { emoji: '⛳', label: 'World-class Golf Courses' },
    ],
    tips: [
      'North Pattaya and Naklua area are calmer and more family-friendly than central Pattaya.',
      'Use the baht bus (songthaew) for cheap local transport — just flag one down and hop off wherever you like.',
      'Koh Larn (Coral Island) is only a 30-minute ferry ride and has far cleaner water than Pattaya Beach.',
      'Book Alcazar and other shows in advance — they sell out quickly during high season.',
    ],
    faqs: [
      { q: 'How far is Pattaya from Bangkok?', a: 'Pattaya is approximately 150 km from Bangkok, about 1h 45m by private car via Highway 7. A private transfer from Suvarnabhumi Airport to Pattaya takes about 1h 30m.' },
      { q: 'What is the best beach in Pattaya?', a: 'Pattaya Beach itself is busy but not the cleanest. Jomtien Beach is quieter and more family-friendly. For truly clear water, take a 30-minute ferry to Koh Larn (Coral Island).' },
      { q: 'Is Pattaya family-friendly?', a: 'Yes — Pattaya has plenty of family activities including Nong Nooch Tropical Garden, water parks, Sanctuary of Truth, the Underwater World aquarium, and Cartoon Network Amazone water park.' },
      { q: 'What are the best day trips from Pattaya?', a: 'Popular options include Koh Larn for beaches and snorkelling, a private transfer to Bangkok for shopping/temples, Rayong for local seafood, and the Khao Chi Chan Buddha carved into a cliff face.' },
      { q: 'How do I get from Bangkok Airport to Pattaya?', a: 'A private transfer from Suvarnabhumi Airport to Pattaya takes about 1h 30m and starts from ฿2,100. This is more convenient than the public bus as drivers can take you door-to-door.' },
    ],
    routesFrom: [
      { fromCity: 'Pattaya', toCity: 'Bangkok',         price: 1800, duration: '1h 45m', distance: '149 km' },
      { fromCity: 'Pattaya', toCity: 'Bangkok Airport', price: 2100, duration: '1h 30m', distance: '120 km' },
      { fromCity: 'Pattaya', toCity: 'Koh Chang',       price: 3500, duration: '3h 30m', distance: '230 km' },
      { fromCity: 'Pattaya', toCity: 'Rayong',          price: 1200, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Pattaya', toCity: 'Koh Larn',        price: 600,  duration: '30m',    distance: '15 km'  },
      { fromCity: 'Pattaya', toCity: 'Ayutthaya',       price: 2600, duration: '2h 30m', distance: '185 km' },
    ],
    routesTo: [
      { fromCity: 'Bangkok',         toCity: 'Pattaya', price: 1800, duration: '1h 45m', distance: '149 km' },
      { fromCity: 'Bangkok Airport', toCity: 'Pattaya', price: 2100, duration: '1h 30m', distance: '120 km' },
      { fromCity: 'Koh Chang',       toCity: 'Pattaya', price: 3500, duration: '3h 30m', distance: '230 km' },
      { fromCity: 'Rayong',          toCity: 'Pattaya', price: 1200, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Ayutthaya',       toCity: 'Pattaya', price: 2600, duration: '2h 30m', distance: '185 km' },
    ],
  },

  'chiang-mai': {
    slug: 'chiang-mai', name: 'Chiang Mai', province: 'Chiang Mai', tagline: 'Rose of the North',
    description: 'A cultural treasure in northern Thailand surrounded by misty mountains, ancient temples and lush countryside. Famous for elephant sanctuaries, night markets, cooking classes and some of Thailand\'s best trekking.',
    heroImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Chiang Mai',
    highlights: [
      { emoji: '🐘', label: 'Ethical Elephant Sanctuaries' },
      { emoji: '🛕', label: 'Doi Suthep Temple' },
      { emoji: '🍛', label: 'Thai Cooking Classes' },
      { emoji: '🏔️', label: 'Mountain Trekking' },
      { emoji: '🌙', label: 'Sunday & Night Bazaars' },
      { emoji: '💆', label: 'Traditional Thai Massage' },
    ],
    tips: [
      'November to February is the best time — cool and dry. March–April brings burning season haze.',
      'The Old City moat area has the highest concentration of temples; walk or rent a bicycle to explore.',
      'Book ethical elephant sanctuaries at least 2–3 days in advance — genuine sanctuaries fill up quickly.',
      'Grab Northern Thai specialities: khao soi (curry noodle soup), sai oua (herb sausage) and mango sticky rice from the Night Bazaar.',
    ],
    faqs: [
      { q: 'How do I get from Bangkok to Chiang Mai?', a: 'The most comfortable option is a private transfer (about 8h) or a domestic flight (1h, from ฿700 one-way on budget airlines). Overnight trains are also popular for the experience.' },
      { q: 'How far is Chiang Rai from Chiang Mai?', a: 'Chiang Rai is approximately 200 km from Chiang Mai — about 3 hours by private car. It\'s a popular day trip, famous for the White Temple (Wat Rong Khun) and Blue Temple.' },
      { q: 'What are the top elephant sanctuaries near Chiang Mai?', a: 'Elephant Nature Park, Elephant Jungle Sanctuary, and BLES (Boon Lott\'s Elephant Sanctuary) are widely considered the most ethical. Avoid any sanctuary that offers elephant riding.' },
      { q: 'Is it easy to get around Chiang Mai without a car?', a: 'The Old City is very walkable. Red songthaew shared taxis cover most areas for ฿30–60. Renting a motorbike (฿150–200/day) gives the most freedom for exploring outside the city.' },
      { q: 'What is the best time to visit Chiang Mai?', a: 'November to February is ideal — cool temperatures (15–25°C) and clear skies. November also hosts the spectacular Yi Peng Lantern Festival. Avoid March–May for burning season smoke.' },
    ],
    routesFrom: [
      { fromCity: 'Chiang Mai', toCity: 'Chiang Rai',  price: 1800, duration: '3h',     distance: '200 km' },
      { fromCity: 'Chiang Mai', toCity: 'Pai',          price: 1400, duration: '2h 30m', distance: '130 km' },
      { fromCity: 'Chiang Mai', toCity: 'Lampang',      price: 1200, duration: '1h 30m', distance: '100 km' },
      { fromCity: 'Chiang Mai', toCity: 'Bangkok',      price: 5500, duration: '8h',     distance: '700 km' },
      { fromCity: 'Chiang Mai', toCity: 'Chiang Mai Airport', price: 400, duration: '20m', distance: '5 km' },
    ],
    routesTo: [
      { fromCity: 'Chiang Rai',  toCity: 'Chiang Mai', price: 1800, duration: '3h',     distance: '200 km' },
      { fromCity: 'Pai',         toCity: 'Chiang Mai', price: 1400, duration: '2h 30m', distance: '130 km' },
      { fromCity: 'Lampang',     toCity: 'Chiang Mai', price: 1200, duration: '1h 30m', distance: '100 km' },
      { fromCity: 'Bangkok',     toCity: 'Chiang Mai', price: 5500, duration: '8h',     distance: '700 km' },
    ],
  },

  phuket: {
    slug: 'phuket', name: 'Phuket', province: 'Phuket', tagline: "Thailand's Pearl Island",
    description: 'Crystal-clear waters, powdery white sand beaches, lush jungle interiors and vibrant beach towns. Phuket delivers the quintessential Thailand beach experience with world-class resorts, diving and island-hopping.',
    heroImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Phuket',
    highlights: [
      { emoji: '🏖️', label: 'Patong & Kata Beaches' },
      { emoji: '🤿', label: 'Scuba Diving & Snorkelling' },
      { emoji: '🏝️', label: 'Phi Phi Island Day Trips' },
      { emoji: '🐘', label: 'Elephant Sanctuary' },
      { emoji: '🌅', label: 'Phang Nga Bay' },
      { emoji: '🦑', label: 'Seafood & Sunset Dining' },
    ],
    tips: [
      'High season is November to April — book accommodation early as prices rise sharply in December and January.',
      'Rent a motorbike or hire a driver to explore beyond Patong — the west coast has the best beaches for swimming.',
      'The east coast (Rawai, Chalong) is better for boat trips; the west coast (Patong, Kata, Kamala) has the best beaches.',
      'Always negotiate and confirm prices with tuk-tuk drivers before getting in — metered taxis are limited in Phuket.',
    ],
    faqs: [
      { q: 'How far is Phuket from Krabi?', a: 'Krabi is about 170 km from Phuket — approximately 2 hours by private car. A ferry-and-speedboat option is also available via Koh Phi Phi but takes longer.' },
      { q: 'Which beach in Phuket is best for families?', a: 'Kata Beach and Kamala Beach are the most family-friendly with calmer water and fewer crowds. Patong is more lively and suited to those who want nightlife and shopping close by.' },
      { q: 'How do I get from Phuket Airport to my hotel?', a: 'A private transfer is the easiest option (30–60 min, from ฿800 depending on location). The airport bus serves some areas, and metered taxis are available but must be booked from the official counter.' },
      { q: 'Can I do a day trip to Phi Phi Islands from Phuket?', a: 'Yes — Phi Phi Islands are about 45 minutes by speedboat from Phuket. Day trips depart from Rassada Pier. Book in advance in high season. For a more relaxed experience, consider staying overnight on Koh Phi Phi.' },
      { q: 'What is the best time to visit Phuket?', a: 'November to April offers the best weather with calm seas and sunshine. May to October is the monsoon season with rough seas and some beach closures, but accommodation prices drop significantly.' },
    ],
    routesFrom: [
      { fromCity: 'Phuket', toCity: 'Krabi',       price: 2200, duration: '2h',     distance: '170 km' },
      { fromCity: 'Phuket', toCity: 'Khao Lak',    price: 1800, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Phuket', toCity: 'Phang-Nga',   price: 1600, duration: '1h 15m', distance: '90 km'  },
      { fromCity: 'Phuket', toCity: 'Koh Samui',   price: 4500, duration: '4h + ferry', distance: '280 km' },
      { fromCity: 'Phuket', toCity: 'Surat Thani', price: 3200, duration: '3h',     distance: '240 km' },
      { fromCity: 'Phuket', toCity: 'Bangkok Airport', price: 9000, duration: '10h', distance: '870 km' },
    ],
    routesTo: [
      { fromCity: 'Krabi',       toCity: 'Phuket', price: 2200, duration: '2h',     distance: '170 km' },
      { fromCity: 'Khao Lak',   toCity: 'Phuket', price: 1800, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Phang-Nga',  toCity: 'Phuket', price: 1600, duration: '1h 15m', distance: '90 km'  },
      { fromCity: 'Koh Samui',  toCity: 'Phuket', price: 4500, duration: '4h + ferry', distance: '280 km' },
      { fromCity: 'Surat Thani',toCity: 'Phuket', price: 3200, duration: '3h',     distance: '240 km' },
    ],
  },

  krabi: {
    slug: 'krabi', name: 'Krabi', province: 'Krabi', tagline: 'Limestone Cliffs & Emerald Waters',
    description: 'Dramatic limestone karsts rising from the sea, pristine national park beaches and world-famous rock climbing make Krabi one of Thailand\'s most photogenic destinations. A hub for island-hopping adventures.',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Krabi',
    highlights: [
      { emoji: '🧗', label: 'Rock Climbing at Railay' },
      { emoji: '🏝️', label: 'Four Islands Tour' },
      { emoji: '🌊', label: 'Ao Nang Beach' },
      { emoji: '🦈', label: 'Tiger Cave Temple Hike' },
      { emoji: '🚣', label: 'Kayaking & Sea Caves' },
      { emoji: '🐠', label: 'Snorkelling & Diving' },
    ],
    tips: [
      'Railay Beach is only accessible by long-tail boat from Ao Nang — the 10-minute ride costs ฿100–150 per person.',
      'November to April is ideal weather. May–October brings monsoon rains and rough seas — some islands may be inaccessible.',
      'Climb the 1,237 steps to Tiger Cave Temple (Wat Tham Suea) early morning to avoid heat and get the best views.',
      'Book the Four Islands tour directly at Ao Nang Beach for competitive rates; speedboat tours are faster but longtail boats are more atmospheric.',
    ],
    faqs: [
      { q: 'How do I get from Phuket to Krabi?', a: 'A private car transfer from Phuket to Krabi takes about 2 hours and starts from ฿2,200. Alternatively, there are ferries and speedboats that go via Koh Phi Phi but take longer.' },
      { q: 'Is Railay Beach worth visiting?', a: 'Absolutely — Railay is one of Thailand\'s most stunning beaches with dramatic limestone cliffs. Accessible only by boat (10 min from Ao Nang), it\'s free of vehicles and has a magical atmosphere.' },
      { q: 'What is the best island to visit from Krabi?', a: 'Koh Phi Phi is the most famous (1h by speedboat), Koh Hong offers pristine lagoons, and the Four Islands tour visits Koh Mor, Koh Tup, Koh Chicken and Poda Island in one day.' },
      { q: 'How far is Krabi Airport from Ao Nang?', a: 'Krabi Airport is about 30 km from Ao Nang Beach — approximately 40 minutes by private transfer (from ฿700). The drive passes through Krabi Town.' },
      { q: 'Can I visit Krabi as a day trip from Phuket?', a: 'Yes — a private transfer from Phuket takes 2 hours each way, leaving enough time to visit Ao Nang and Railay Beach. However, staying at least one night allows you to do island trips at a relaxed pace.' },
    ],
    routesFrom: [
      { fromCity: 'Krabi', toCity: 'Phuket',       price: 2200, duration: '2h',     distance: '170 km' },
      { fromCity: 'Krabi', toCity: 'Koh Samui',    price: 3800, duration: '3h 30m + ferry', distance: '220 km' },
      { fromCity: 'Krabi', toCity: 'Surat Thani',  price: 2400, duration: '2h 30m', distance: '190 km' },
      { fromCity: 'Krabi', toCity: 'Khao Lak',     price: 2800, duration: '2h 30m', distance: '210 km' },
      { fromCity: 'Krabi', toCity: 'Phang-Nga',    price: 2000, duration: '1h 45m', distance: '130 km' },
      { fromCity: 'Krabi', toCity: 'Bangkok',      price: 7500, duration: '9h',     distance: '780 km' },
    ],
    routesTo: [
      { fromCity: 'Phuket',      toCity: 'Krabi', price: 2200, duration: '2h',     distance: '170 km' },
      { fromCity: 'Koh Samui',  toCity: 'Krabi', price: 3800, duration: '3h 30m + ferry', distance: '220 km' },
      { fromCity: 'Surat Thani',toCity: 'Krabi', price: 2400, duration: '2h 30m', distance: '190 km' },
      { fromCity: 'Phang-Nga',  toCity: 'Krabi', price: 2000, duration: '1h 45m', distance: '130 km' },
    ],
  },

  'khao-lak': {
    slug: 'khao-lak', name: 'Khao Lak', province: 'Phang-Nga', tagline: 'Pristine Beaches & Similan Islands Gateway',
    description: 'A tranquil alternative to Phuket\'s bustle, Khao Lak offers long unspoiled beaches, world-class diving to the Similan and Surin Islands, lush national parks and a relaxed resort atmosphere perfect for families.',
    heroImage: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Khao Lak',
    highlights: [
      { emoji: '🤿', label: 'Similan Islands Diving' },
      { emoji: '🏖️', label: 'Nang Thong & Bang Niang Beaches' },
      { emoji: '🐘', label: 'Cheow Lan Lake Floating Bungalows' },
      { emoji: '🌿', label: 'Khao Sok National Park' },
      { emoji: '🛥️', label: 'Surin Islands Day Trips' },
      { emoji: '🦋', label: 'Mu Ko Similan National Park' },
    ],
    tips: [
      'The Similan Islands are only open November to May — plan diving trips accordingly.',
      'Stay in Bang Niang area for the best beach access and a good selection of restaurants.',
      'Khao Lak is only 80 km from Phuket Airport — a private transfer takes 1h 30m and is the most convenient arrival option.',
      'Rent a motorbike or hire a driver for the day to explore the waterfalls and national park areas inland.',
    ],
    faqs: [
      { q: 'How far is Khao Lak from Phuket?', a: 'Khao Lak is about 80 km north of Phuket, approximately 1h 30m by private car. It\'s a very popular transfer from Phuket Airport for guests who prefer a quieter beach experience.' },
      { q: 'Can I do the Similan Islands from Khao Lak?', a: 'Yes — Khao Lak is the closest mainland town to the Similan Islands. Day trips and liveaboard diving trips depart from Tap Lamu Pier, about 15 minutes south of Khao Lak town.' },
      { q: 'Is Khao Lak family-friendly?', a: 'Very much so. The beaches are calmer and less crowded than Phuket, the water is clear, and the vibe is peaceful. There are no go-go bars or nightlife — it\'s a genuinely relaxing destination.' },
      { q: 'How do I get from Khao Lak to Khao Sok National Park?', a: 'Khao Sok is about 60 km from Khao Lak — approximately 1 hour by private car. Most resorts can arrange day trips, or you can book a private transfer for a full-day visit.' },
    ],
    routesFrom: [
      { fromCity: 'Khao Lak', toCity: 'Phuket',      price: 1800, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Khao Lak', toCity: 'Phang-Nga',   price: 1200, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Khao Lak', toCity: 'Khao Sok',    price: 1600, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Khao Lak', toCity: 'Krabi',       price: 2800, duration: '2h 30m', distance: '210 km' },
      { fromCity: 'Khao Lak', toCity: 'Surat Thani', price: 2600, duration: '2h',     distance: '175 km' },
    ],
    routesTo: [
      { fromCity: 'Phuket',      toCity: 'Khao Lak', price: 1800, duration: '1h 30m', distance: '80 km'  },
      { fromCity: 'Phang-Nga',  toCity: 'Khao Lak', price: 1200, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Khao Sok',   toCity: 'Khao Lak', price: 1600, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Krabi',      toCity: 'Khao Lak', price: 2800, duration: '2h 30m', distance: '210 km' },
    ],
  },

  'khao-sok': {
    slug: 'khao-sok', name: 'Khao Sok', province: 'Surat Thani', tagline: 'Ancient Rainforest & Turquoise Lake',
    description: 'One of the oldest rainforests on earth, Khao Sok National Park is home to dramatic limestone karsts rising above Cheow Lan Lake, rare wildlife including elephants and gibbons, and breathtaking overnight floating bungalows.',
    heroImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Khao Sok',
    highlights: [
      { emoji: '🦒', label: 'Cheow Lan Lake Overnight' },
      { emoji: '🌿', label: 'Jungle Trekking & Wildlife' },
      { emoji: '🛶', label: 'Kayaking on the Lake' },
      { emoji: '🐘', label: 'Wild Elephant Sightings' },
      { emoji: '🌸', label: 'Rafflesia Giant Flower' },
      { emoji: '🦜', label: 'Hornbill & Bird Watching' },
    ],
    tips: [
      'Stay at least one night on Cheow Lan Lake — floating bungalows at dawn are a magical experience you won\'t forget.',
      'The park is open year-round but June–October (monsoon) brings heavy rain. Dry season November–May is best for hiking.',
      'Bring insect repellent, a rain jacket and quick-dry clothes even in dry season — the jungle is always humid.',
      'Book floating bungalows well in advance for December–January — they fill up months ahead during peak season.',
    ],
    faqs: [
      { q: 'How do I get to Khao Sok from Phuket?', a: 'Khao Sok is about 160 km from Phuket — approximately 2 hours by private car. It\'s also 60 km (1 hour) from Khao Lak and 70 km from Surat Thani.' },
      { q: 'What is the best way to see Cheow Lan Lake?', a: 'The best way is to stay overnight on the lake in a floating bungalow. Day trips by longtail boat are also possible but an overnight stay lets you see the sunrise and early-morning mist on the water.' },
      { q: 'Is Khao Sok good for families with children?', a: 'Yes — boat trips on the lake, gentle riverside walks, and wildlife spotting are all suitable for older children. Very young children may find the jungle heat and insects challenging.' },
      { q: 'Can I visit Khao Sok as a day trip from Khao Lak?', a: 'Yes — the drive from Khao Lak to Khao Sok takes about 1 hour. A full day allows time for a lake boat trip and jungle walk, but staying overnight is strongly recommended.' },
    ],
    routesFrom: [
      { fromCity: 'Khao Sok', toCity: 'Surat Thani', price: 1400, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Khao Sok', toCity: 'Khao Lak',    price: 1600, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Khao Sok', toCity: 'Phuket',      price: 2600, duration: '2h',     distance: '160 km' },
      { fromCity: 'Khao Sok', toCity: 'Koh Samui',   price: 2800, duration: '2h + ferry', distance: '130 km' },
      { fromCity: 'Khao Sok', toCity: 'Krabi',       price: 2800, duration: '2h 30m', distance: '200 km' },
    ],
    routesTo: [
      { fromCity: 'Surat Thani',toCity: 'Khao Sok', price: 1400, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Khao Lak',  toCity: 'Khao Sok', price: 1600, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Phuket',    toCity: 'Khao Sok', price: 2600, duration: '2h',     distance: '160 km' },
      { fromCity: 'Koh Samui', toCity: 'Khao Sok', price: 2800, duration: '2h + ferry', distance: '130 km' },
    ],
  },

  'phang-nga': {
    slug: 'phang-nga', name: 'Phang-Nga', province: 'Phang-Nga', tagline: 'James Bond Island & Limestone Wonders',
    description: 'Home to the iconic James Bond Island (Khao Phing Kan), stunning Phang Nga Bay, sea gypsy villages built on stilts over the water, and extraordinary kayaking routes through hidden sea caves and lagoons.',
    heroImage: 'https://images.unsplash.com/photo-1552641150-6b5e3cdd0cf9?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Phang Nga',
    highlights: [
      { emoji: '🏝️', label: 'James Bond Island' },
      { emoji: '🚣', label: 'Sea Cave Kayaking' },
      { emoji: '🌊', label: 'Phang Nga Bay National Park' },
      { emoji: '🏘️', label: 'Koh Panyee Floating Village' },
      { emoji: '🤿', label: 'Snorkelling & Marine Life' },
      { emoji: '🌄', label: 'Limestone Karst Views' },
    ],
    tips: [
      'The bay is best explored by longtail boat or kayak — join a guided tour from Phang Nga Town Pier.',
      'Visit Koh Panyee floating village for fresh seafood lunch — the school here even has a football pitch on stilts!',
      'November to April is the best season for calm bay conditions and clear water.',
      'Phang-Nga Town is a convenient base between Phuket and Krabi — just 1h 15m from Phuket and 1h 45m from Krabi.',
    ],
    faqs: [
      { q: 'How far is Phang-Nga from Phuket?', a: 'Phang-Nga Town is about 90 km from Phuket — approximately 1 hour 15 minutes by private car. James Bond Island is in Phang Nga Bay and is typically reached by boat from Phang-Nga Town or Phuket.' },
      { q: 'Can I visit Phang-Nga as a day trip from Phuket?', a: 'Yes — a day trip to James Bond Island and Phang Nga Bay from Phuket is one of the most popular excursions in the area. Private speedboat tours depart from Phuket and take about 1 hour to reach the bay.' },
      { q: 'What is the best way to explore Phang Nga Bay?', a: 'Longtail boat tours from Phang-Nga Town offer a traditional experience. For more flexibility, hire a private longtail for the day. Kayaking through sea caves with an experienced guide is a highlight not to miss.' },
    ],
    routesFrom: [
      { fromCity: 'Phang-Nga', toCity: 'Phuket',    price: 1600, duration: '1h 15m', distance: '90 km'  },
      { fromCity: 'Phang-Nga', toCity: 'Krabi',     price: 2000, duration: '1h 45m', distance: '130 km' },
      { fromCity: 'Phang-Nga', toCity: 'Khao Lak',  price: 1200, duration: '1h',     distance: '60 km'  },
      { fromCity: 'Phang-Nga', toCity: 'Khao Sok',  price: 1600, duration: '1h 15m', distance: '80 km'  },
    ],
    routesTo: [
      { fromCity: 'Phuket',  toCity: 'Phang-Nga', price: 1600, duration: '1h 15m', distance: '90 km'  },
      { fromCity: 'Krabi',   toCity: 'Phang-Nga', price: 2000, duration: '1h 45m', distance: '130 km' },
      { fromCity: 'Khao Lak',toCity: 'Phang-Nga', price: 1200, duration: '1h',     distance: '60 km'  },
    ],
  },

  'surat-thani': {
    slug: 'surat-thani', name: 'Surat Thani', province: 'Surat Thani', tagline: 'Gateway to the Gulf Islands',
    description: 'The main transport hub for the Gulf of Thailand islands, Surat Thani connects travellers to Koh Samui, Koh Phangan and Koh Tao. The province also contains Khao Sok National Park and a vibrant riverside night market.',
    heroImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Surat Thani',
    highlights: [
      { emoji: '⛴️', label: 'Ferry to Koh Samui & Koh Phangan' },
      { emoji: '🌿', label: 'Khao Sok National Park' },
      { emoji: '🌙', label: 'Riverside Night Market' },
      { emoji: '🍜', label: 'Local Southern Thai Cuisine' },
      { emoji: '🛕', label: 'Monkey Training School' },
      { emoji: '🚢', label: 'Koh Tao Dive Boat Departures' },
    ],
    tips: [
      'Surat Thani is primarily a transit hub — most travellers connect here to ferries for the islands or private transfers to resorts.',
      'The Don Sak Pier (1h from Surat Thani town) is where most vehicle ferries to Koh Samui depart.',
      'Surat Thani Airport has direct flights to Bangkok, making it a good arrival point for Gulf Coast travel.',
      'Talat Kaset Night Market in town is excellent for cheap, authentic Southern Thai food.',
    ],
    faqs: [
      { q: 'How do I get from Surat Thani to Koh Samui?', a: 'The most convenient option is a combined private transfer + ferry package. The ferry from Don Sak Pier to Koh Samui takes 1h 30m. The total journey from Surat Thani town is about 2h 30m.' },
      { q: 'Is Surat Thani worth visiting in its own right?', a: 'Surat Thani town itself has limited tourist attractions but makes a good base for visiting Khao Sok National Park (1 hour away). Most people use it as a transfer point to the islands.' },
      { q: 'How far is Khao Sok from Surat Thani?', a: 'Khao Sok National Park entrance is about 70 km from Surat Thani — approximately 1 hour by private car. It\'s a very easy combination with island travel.' },
    ],
    routesFrom: [
      { fromCity: 'Surat Thani', toCity: 'Koh Samui',  price: 2200, duration: '2h 30m', distance: '80 km + ferry' },
      { fromCity: 'Surat Thani', toCity: 'Khao Sok',   price: 1400, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Surat Thani', toCity: 'Krabi',      price: 2400, duration: '2h 30m', distance: '190 km' },
      { fromCity: 'Surat Thani', toCity: 'Phuket',     price: 3200, duration: '3h',     distance: '240 km' },
      { fromCity: 'Surat Thani', toCity: 'Khao Lak',   price: 2600, duration: '2h',     distance: '175 km' },
    ],
    routesTo: [
      { fromCity: 'Koh Samui', toCity: 'Surat Thani', price: 2200, duration: '2h 30m', distance: '80 km + ferry' },
      { fromCity: 'Khao Sok',  toCity: 'Surat Thani', price: 1400, duration: '1h',     distance: '70 km'  },
      { fromCity: 'Krabi',     toCity: 'Surat Thani', price: 2400, duration: '2h 30m', distance: '190 km' },
      { fromCity: 'Phuket',    toCity: 'Surat Thani', price: 3200, duration: '3h',     distance: '240 km' },
    ],
  },

  'koh-samui': {
    slug: 'koh-samui', name: 'Koh Samui', province: 'Surat Thani', tagline: 'Tropical Island Paradise',
    description: "Thailand's second-largest island combines luxury resorts, crystal waters, vibrant beach towns and serene wellness retreats. Perfect for honeymoons, family holidays and those seeking island life with international comforts.",
    heroImage: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Koh Samui',
    highlights: [
      { emoji: '🏖️', label: 'Chaweng & Lamai Beaches' },
      { emoji: '🌊', label: 'Ang Thong Marine Park' },
      { emoji: '🐘', label: 'Elephant Trekking & Sanctuary' },
      { emoji: '💆', label: 'Wellness & Spa Retreats' },
      { emoji: '🛥️', label: 'Koh Tao Dive Trips' },
      { emoji: '🌙', label: 'Full Moon Party (Koh Phangan)' },
    ],
    tips: [
      'December to April is peak season with sunshine and calm seas — book resorts 3–6 months ahead.',
      'Rent a motorbike or hire a driver — taxis on Samui are notoriously expensive compared to the mainland.',
      'Big Buddha temple (Wat Phra Yai) and Grandfather & Grandmother Rocks are free and worth a visit.',
      'Take a day trip to Ang Thong Marine National Park — 40+ islands with emerald lagoons and dramatic karsts.',
    ],
    faqs: [
      { q: 'How do I get to Koh Samui from Bangkok?', a: 'The quickest way is to fly directly from Bangkok to Samui Airport (Bangkok Airways, 1h 20m). Alternatively, fly to Surat Thani and take a private transfer + ferry (about 3h total).' },
      { q: 'How do I get from Koh Samui to Koh Phangan?', a: 'Ferries run from Nathon Pier and Big Buddha Pier on Koh Samui to Koh Phangan (30–60 min). Multiple departures daily; tickets from ฿200 one-way.' },
      { q: 'What is the best beach on Koh Samui?', a: 'Chaweng is the most popular with the best facilities. Lamai is more laid-back. Maenam and Bophut (Fisherman\'s Village) are quieter. Silver Beach near Chaweng Noi is a hidden gem.' },
      { q: 'Is it possible to visit Ang Thong Marine Park from Koh Samui?', a: 'Yes — day trips depart from Nathon and Big Buddha Piers. Tours include kayaking, snorkelling and a hike to an emerald lake. Book through your hotel or a reputable tour operator.' },
      { q: 'What is the best time of year for Koh Samui?', a: 'December to April is dry and sunny on the Gulf Coast. November to December can have heavy rains. October is typically the wettest month. Unlike the Andaman Coast, Koh Samui\'s seasons differ from Phuket.' },
    ],
    routesFrom: [
      { fromCity: 'Koh Samui', toCity: 'Surat Thani', price: 2200, duration: '2h 30m', distance: '80 km + ferry' },
      { fromCity: 'Koh Samui', toCity: 'Krabi',       price: 3800, duration: '3h 30m + ferry', distance: '220 km' },
      { fromCity: 'Koh Samui', toCity: 'Phuket',      price: 4500, duration: '4h + ferry', distance: '280 km' },
      { fromCity: 'Koh Samui', toCity: 'Khao Sok',    price: 2800, duration: '2h + ferry', distance: '130 km' },
      { fromCity: 'Koh Samui', toCity: 'Bangkok',     price: 7500, duration: '10h',    distance: '660 km' },
    ],
    routesTo: [
      { fromCity: 'Surat Thani',toCity: 'Koh Samui', price: 2200, duration: '2h 30m', distance: '80 km + ferry' },
      { fromCity: 'Krabi',     toCity: 'Koh Samui', price: 3800, duration: '3h 30m + ferry', distance: '220 km' },
      { fromCity: 'Phuket',    toCity: 'Koh Samui', price: 4500, duration: '4h + ferry', distance: '280 km' },
      { fromCity: 'Bangkok',   toCity: 'Koh Samui', price: 7500, duration: '10h',    distance: '660 km' },
    ],
  },

  kanchanaburi: {
    slug: 'kanchanaburi', name: 'Kanchanaburi', province: 'Kanchanaburi', tagline: 'History, River & Jungle',
    description: 'The historic WWII Bridge on the River Kwai, dramatic jungle waterfalls, ancient temples and the gateway to Thailand\'s western wilderness. Kanchanaburi offers a profound mix of history and stunning natural scenery just 2 hours from Bangkok.',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Kanchanaburi',
    highlights: [
      { emoji: '🌉', label: 'Bridge on the River Kwai' },
      { emoji: '🏛️', label: 'JEATH War Museum & Cemetery' },
      { emoji: '💧', label: 'Erawan National Park Waterfalls' },
      { emoji: '🚂', label: 'Death Railway Train Ride' },
      { emoji: '🐘', label: 'Elephant World Sanctuary' },
      { emoji: '🛶', label: 'River Kwai Floating Raft Houses' },
    ],
    tips: [
      'Visit Erawan National Park early (by 8 AM) — the lower falls get very crowded by mid-morning.',
      'Stay overnight in a riverside raft house on the Kwai Yai River for a uniquely peaceful experience.',
      'The Death Railway Museum and JEATH War Museum both deserve several hours — buy tickets in advance online.',
      'Kanchanaburi is easily combined with a Bangkok day trip (2h each way) or as an overnight stop.',
    ],
    faqs: [
      { q: 'How far is Kanchanaburi from Bangkok?', a: 'Kanchanaburi is about 130 km west of Bangkok — approximately 2 hours by private car via Highway 338. It\'s a popular day trip from Bangkok but also worth an overnight stay.' },
      { q: 'What is the Bridge on the River Kwai?', a: 'The famous steel and concrete bridge was built by Allied POWs and Asian labourers during WWII under Japanese occupation. Today it\'s a symbol of remembrance and you can walk across it. The Death Railway Museum nearby tells the full story.' },
      { q: 'Is Erawan National Park worth visiting?', a: 'Absolutely — Erawan\'s emerald green seven-tiered waterfall is one of Thailand\'s most beautiful. You can swim in crystal-clear pools at most tiers. Level 2 and 3 are the most dramatic. Go early to avoid crowds.' },
      { q: 'Can I visit Kanchanaburi as a day trip from Bangkok?', a: 'Yes — a full day is enough to see the Bridge, war museum and one or two other sites. For Erawan National Park, an overnight stay is better as the park is 65 km further west.' },
    ],
    routesFrom: [
      { fromCity: 'Kanchanaburi', toCity: 'Bangkok',      price: 2000, duration: '2h',     distance: '130 km' },
      { fromCity: 'Kanchanaburi', toCity: 'Hua Hin',      price: 3200, duration: '3h',     distance: '240 km' },
      { fromCity: 'Kanchanaburi', toCity: 'Bangkok Airport', price: 2600, duration: '2h 30m', distance: '165 km' },
    ],
    routesTo: [
      { fromCity: 'Bangkok',        toCity: 'Kanchanaburi', price: 2000, duration: '2h',     distance: '130 km' },
      { fromCity: 'Hua Hin',        toCity: 'Kanchanaburi', price: 3200, duration: '3h',     distance: '240 km' },
      { fromCity: 'Bangkok Airport',toCity: 'Kanchanaburi', price: 2600, duration: '2h 30m', distance: '165 km' },
    ],
  },

  'koh-chang': {
    slug: 'koh-chang', name: 'Koh Chang', province: 'Trat', tagline: "Thailand's Second-Largest Island",
    description: 'A lush, mountainous island of jungle-covered peaks, long powdery beaches, excellent snorkelling reefs and a laid-back atmosphere. Koh Chang is far less commercialised than Phuket or Samui, offering authentic tropical island life.',
    heroImage: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Koh Chang',
    highlights: [
      { emoji: '🏖️', label: 'White Sand & Lonely Beach' },
      { emoji: '🤿', label: 'Snorkelling & Wreck Diving' },
      { emoji: '🌿', label: 'Jungle Trekking & Waterfalls' },
      { emoji: '🐘', label: 'Koh Chang Elephant Camp' },
      { emoji: '🛥️', label: 'Koh Wai & Koh Mak Day Trips' },
      { emoji: '🌅', label: 'Sunset at Kai Bae Beach' },
    ],
    tips: [
      'November to May is the best time — calm seas and sunshine. June–October can be rainy with rough seas.',
      'Rent a motorbike to explore the island at your own pace — the main road circles most of the island.',
      'White Sand Beach (Hat Sai Khao) is the most developed; Lonely Beach has a backpacker vibe; Kai Bae is quieter and family-friendly.',
      'The ferry from Laem Ngop (near Trat) to Koh Chang takes 30 minutes — a private transfer from Bangkok to the ferry takes about 4 hours.',
    ],
    faqs: [
      { q: 'How do I get to Koh Chang from Bangkok?', a: 'The easiest route is a private transfer from Bangkok to Laem Ngop Ferry Terminal (about 4h 30m), then a 30-minute car ferry to Koh Chang. Total journey is about 5 hours. Werest offers door-to-door packages.' },
      { q: 'How far is Koh Chang from Pattaya?', a: 'Pattaya is about 230 km from the Koh Chang ferry terminal — approximately 3 hours 30 minutes by private car. It\'s a doable transfer for those combining beach destinations on the eastern Gulf Coast.' },
      { q: 'What is the best beach on Koh Chang?', a: 'White Sand Beach has the best facilities and longest stretch of sand. Lonely Beach is popular with younger travellers. Kai Bae Beach is quieter and great for families. Bang Bao in the south is a charming fishing village pier.' },
      { q: 'Can I do snorkelling or diving on Koh Chang?', a: 'Yes — the reefs around Koh Chang and nearby islands Koh Wai and Koh Mak have excellent snorkelling. There\'s also a WWII wreck (HTMS Chang) for divers. Several dive schools operate from White Sand Beach.' },
    ],
    routesFrom: [
      { fromCity: 'Koh Chang', toCity: 'Bangkok',         price: 4500, duration: '4h 30m', distance: '310 km' },
      { fromCity: 'Koh Chang', toCity: 'Bangkok Airport', price: 5000, duration: '5h',     distance: '345 km' },
      { fromCity: 'Koh Chang', toCity: 'Pattaya',         price: 3500, duration: '3h 30m', distance: '230 km' },
      { fromCity: 'Koh Chang', toCity: 'Koh Kood',        price: 1200, duration: '1h + speedboat', distance: '40 km' },
    ],
    routesTo: [
      { fromCity: 'Bangkok',        toCity: 'Koh Chang', price: 4500, duration: '4h 30m', distance: '310 km' },
      { fromCity: 'Bangkok Airport',toCity: 'Koh Chang', price: 5000, duration: '5h',     distance: '345 km' },
      { fromCity: 'Pattaya',        toCity: 'Koh Chang', price: 3500, duration: '3h 30m', distance: '230 km' },
      { fromCity: 'Koh Kood',       toCity: 'Koh Chang', price: 1200, duration: '1h + speedboat', distance: '40 km' },
    ],
  },

  'koh-kood': {
    slug: 'koh-kood', name: 'Koh Kood', province: 'Trat', tagline: "Thailand's Pristine Hidden Gem",
    description: 'One of Thailand\'s most unspoiled islands, Koh Kood (Ko Kut) offers pristine white-sand beaches, turquoise water, dense jungle with freshwater waterfalls, and a relaxed atmosphere with almost no mass tourism.',
    heroImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Koh Kood',
    highlights: [
      { emoji: '🏖️', label: 'Ao Tapao & Ao Phrao Beaches' },
      { emoji: '💧', label: 'Klong Chao Waterfall' },
      { emoji: '🤿', label: 'Crystal-clear Snorkelling' },
      { emoji: '🌿', label: 'Jungle Kayaking & Mangroves' },
      { emoji: '🎣', label: 'Local Fishing Village' },
      { emoji: '🌅', label: 'Unspoiled Sunset Views' },
    ],
    tips: [
      'Koh Kood has no ATMs in most areas — bring enough cash from the mainland before arriving.',
      'Peak season is November to April. The island virtually shuts down May–October as most resorts close for monsoon.',
      'There are no 7-Elevens or large supermarkets — resorts are self-contained, which adds to the exclusive feel.',
      'Hire a longtail boat for the day to hop between the quieter beaches and Koh Mak nearby.',
    ],
    faqs: [
      { q: 'How do I get to Koh Kood from Bangkok?', a: 'The most common route is a private transfer from Bangkok to Laem Ngop Pier (Trat, ~4h), then a speedboat to Koh Kood (1h 30m). Werest can arrange a combined private transfer + speedboat package.' },
      { q: 'Is Koh Kood developed for tourism?', a: 'Koh Kood is deliberately low-key — there are boutique resorts and guesthouses but no 7-Elevens, no big hotels and very little nightlife. It\'s perfect for travellers seeking pure, unspoiled island life.' },
      { q: 'What is the best beach on Koh Kood?', a: 'Ao Tapao and Ao Phrao are the most beautiful with powdery white sand and turquoise water. Klong Hin Beach is also stunning and usually quiet. The island\'s west coast gets the best sunsets.' },
    ],
    routesFrom: [
      { fromCity: 'Koh Kood', toCity: 'Bangkok',         price: 5500, duration: '5h 30m', distance: '360 km' },
      { fromCity: 'Koh Kood', toCity: 'Koh Chang',       price: 1200, duration: '1h + speedboat', distance: '40 km' },
      { fromCity: 'Koh Kood', toCity: 'Bangkok Airport', price: 6000, duration: '6h',     distance: '400 km' },
    ],
    routesTo: [
      { fromCity: 'Bangkok',        toCity: 'Koh Kood', price: 5500, duration: '5h 30m', distance: '360 km' },
      { fromCity: 'Koh Chang',      toCity: 'Koh Kood', price: 1200, duration: '1h + speedboat', distance: '40 km' },
      { fromCity: 'Bangkok Airport',toCity: 'Koh Kood', price: 6000, duration: '6h',     distance: '400 km' },
    ],
  },

  'koh-larn': {
    slug: 'koh-larn', name: 'Koh Larn', province: 'Chonburi', tagline: 'Coral Island — Pattaya\'s Beach Paradise',
    description: 'Just 7 km from Pattaya\'s shores, Koh Larn (Coral Island) is a small tropical island with crystal-clear water and far cleaner beaches than the mainland. A perfect half-day or full-day escape from Pattaya.',
    heroImage: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80',
    toursKey: 'Koh Larn',
    highlights: [
      { emoji: '🏖️', label: 'Tawaen & Samae Beaches' },
      { emoji: '🤿', label: 'Snorkelling & Water Sports' },
      { emoji: '🛥️', label: 'Short Ferry from Pattaya' },
      { emoji: '🐠', label: 'Coral Reef Marine Life' },
      { emoji: '🏍️', label: 'Island Motorbike Rental' },
      { emoji: '🌊', label: 'Clear Turquoise Water' },
    ],
    tips: [
      'Take the public speedboat ferry from Bali Hai Pier (Pattaya, ฿30 one-way) or hire a private speedboat (faster).',
      'Arrive early — Tawaen Beach (the main beach) gets very crowded by mid-morning on weekends and public holidays.',
      'Samae Beach and Nual Beach on the south coast are smaller, quieter and prettier than Tawaen.',
      'Bring cash — ATMs are limited and seafood restaurants prefer cash payment.',
    ],
    faqs: [
      { q: 'How do I get to Koh Larn from Pattaya?', a: 'Public ferries run from Bali Hai Pier every 30 minutes (30 min crossing, ฿30 one-way). Private speedboats take 15 minutes. A private transfer from your hotel in Pattaya to Bali Hai Pier takes about 15–20 minutes.' },
      { q: 'Is Koh Larn worth a day trip?', a: 'Yes — the water around Koh Larn is significantly cleaner than Pattaya Beach. A half-day visit (4 hours) is enough to swim and snorkel. For a more relaxed day, stay until sunset.' },
      { q: 'Can I stay overnight on Koh Larn?', a: 'Yes — there are guesthouses and small resorts on the island. Staying overnight lets you enjoy the beaches in the early morning before the day trippers arrive, which is well worth it.' },
      { q: 'How far is Koh Larn from Bangkok?', a: 'Koh Larn is about 150 km from Bangkok. Combined with a Pattaya visit, a private transfer from Bangkok takes about 2 hours to Pattaya and then 30 minutes by ferry to Koh Larn.' },
    ],
    routesFrom: [
      { fromCity: 'Koh Larn', toCity: 'Pattaya',         price: 600,  duration: '30m',    distance: '7 km'   },
      { fromCity: 'Koh Larn', toCity: 'Bangkok',         price: 2400, duration: '2h 15m', distance: '155 km' },
      { fromCity: 'Koh Larn', toCity: 'Bangkok Airport', price: 2700, duration: '2h',     distance: '130 km' },
    ],
    routesTo: [
      { fromCity: 'Pattaya',        toCity: 'Koh Larn', price: 600,  duration: '30m',    distance: '7 km'   },
      { fromCity: 'Bangkok',        toCity: 'Koh Larn', price: 2400, duration: '2h 15m', distance: '155 km' },
      { fromCity: 'Bangkok Airport',toCity: 'Koh Larn', price: 2700, duration: '2h',     distance: '130 km' },
    ],
  },
}
