/**
 * Wipe all blog posts and seed 6 real production posts.
 * Run:  npx tsx prisma/reset-blog.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const POSTS = [
  /* ─────────────────────────────────────────────────────────── 1 ── */
  {
    title: "Bangkok First-Timer's Complete Travel Guide 2025",
    slug: 'bangkok-first-timer-complete-guide-2025',
    excerpt:
      'Everything you need to know before your first trip to Bangkok — the best neighbourhoods to stay, must-visit temples, street food you cannot miss, and how to get around without stress.',
    content: `## Welcome to Bangkok

Bangkok is one of Southeast Asia's most exciting cities. Grand temples, street food at every corner, rooftop bars, floating markets, and a world-class transport network — no two days feel the same.

## Where to Stay

**Sukhumvit** is the most popular area for first-timers. It has direct BTS Skytrain access, hundreds of restaurants, and is close to the airport.

**Silom / Sathorn** is quieter with a more business-district feel — great for couples.

**Khao San Road area** is the classic backpacker hub near the Old City and temples. Budget-friendly, energetic.

## Top Temples to Visit

### Wat Phra Kaew & Grand Palace
The Grand Palace complex is the single most visited site in Thailand. Arrive before 9am to beat crowds. Dress code is strict: cover shoulders and knees.

### Wat Arun (Temple of Dawn)
Just across the Chao Phraya river from the Grand Palace. Best photographed at sunset from the opposite bank.

### Wat Pho
Home to the famous 46-metre Reclining Buddha. Also the birthplace of traditional Thai massage — book a session at the temple school.

## Street Food You Must Try

- **Pad Thai** — stir-fried rice noodles with egg, tofu, tamarind, and peanuts. Order from street carts on Yaowarat Road.
- **Tom Yum Goong** — spicy prawn soup. Every restaurant has it; every restaurant's version is different.
- **Mango Sticky Rice** — sweet glutinous rice with fresh mango. Available everywhere from March to June.
- **Boat Noodles** — small but intensely flavoured bowls served near Bang Pho pier.

## Getting Around

**BTS Skytrain** — fast, air-conditioned, covers most tourist areas. Buy a Rabbit Card for convenience.

**MRT Subway** — connects the train station, Chinatown, and the riverside.

**Grab app** — the local Uber. Always cheaper than taxis that "forget" to use the meter.

**Tuk-tuks** — fun for short rides but agree the price before getting in.

## Day Trips from Bangkok

- **Ayutthaya** (80 km north) — ancient capital with stunning temple ruins. 1.5 hours by train.
- **Damnoen Saduak Floating Market** — colourful canal market, best early morning.
- **Kanchanaburi** — WWII history, Bridge on the River Kwai, waterfalls.

## Getting to Bangkok Airports

Bangkok has two international airports:
- **Suvarnabhumi (BKK)** — main hub, 30 km east of the city
- **Don Mueang (DMK)** — budget airlines, 25 km north

A private transfer with Werest costs from **฿650** and takes your group directly to your hotel — no queues, no shared vans.

## Best Time to Visit

**November to February** is peak season — cool, dry, and comfortable. Book accommodation and transfers early.

**March to May** — hot and dry. Great deals on hotels.

**June to October** — rainy season. Expect afternoon showers but far fewer tourists and lower prices.`,
    featuredImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80&auto=format&fit=crop',
    category: 'BANGKOK' as const,
    tags: ['Bangkok', 'First Timer', 'Travel Guide', 'Temples', 'Street Food'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-19T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 8,
    seoTitle: "Bangkok First-Timer's Complete Guide 2025 | Werest Travel",
    seoDescription: 'First trip to Bangkok? Our complete guide covers the best neighbourhoods, temples, street food, transport and day trips for first-time visitors.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },

  /* ─────────────────────────────────────────────────────────── 2 ── */
  {
    title: 'Bangkok to Pattaya Transfer: The Complete 2025 Guide',
    slug: 'bangkok-to-pattaya-transfer-complete-guide-2025',
    excerpt:
      'Private transfer, bus, or minivan? Everything you need to know about the Bangkok to Pattaya journey — costs, travel times, pickup options and insider tips for a smooth 147 km ride.',
    content: `## Bangkok to Pattaya: Your Options

The Bangkok–Pattaya route is one of the most-travelled corridors in Thailand. Covering **147 km** via Highway 7 (the Eastern Seaboard Motorway), you have four main ways to make the journey.

## Option 1: Private Transfer (Recommended)

A private car or van picks you up directly from your Bangkok hotel, Suvarnabhumi Airport, or Don Mueang Airport and drops you at your Pattaya hotel door. No stops, no strangers.

**Journey time:** 1.5 – 2 hours (traffic permitting)

**Werest prices:**
| Vehicle | Capacity | Price from |
|---------|----------|-----------|
| Sedan   | 1–2 pax  | ฿1,800    |
| SUV     | 1–4 pax  | ฿2,200    |
| Minivan | 1–10 pax | ฿2,800    |

All prices include tolls, meet-and-greet, and flight tracking for airport pickups.

## Option 2: BKK Bus (Ekkamai)

The Eastern Bus Terminal (Ekkamai, on Sukhumvit) runs regular coaches to Pattaya Bus Terminal throughout the day.

- **Fare:** ฿130–฿160
- **Journey time:** 2 – 3.5 hours
- **Downside:** You still need a taxi from Pattaya Bus Terminal to your hotel (another 15–30 min)

## Option 3: Shared Minivan

Minivans depart from Victory Monument and a few hotel hubs. They're cheaper than private transfers but wait to fill seats.

- **Fare:** ฿200–฿300 per person
- **Journey time:** 2 – 3 hours with pickup stops

## Option 4: Self-Drive

Rental cars are available at both airports. Highway 7 is straightforward — just watch for toll booths (฿55–฿65 total).

## Best Pickup Points in Bangkok

- **Suvarnabhumi Airport (BKK)** — Werest drivers wait in Arrival Hall Gate 3 with a name board
- **Don Mueang Airport (DMK)** — meeters wait at the Ground Floor exit
- **Hotel door** — any Bangkok hotel, just share your address at booking

## Tips for a Smooth Journey

1. **Book 3+ hours before departure** to guarantee your preferred vehicle
2. **Add your flight number** when booking from the airport — your driver tracks delays automatically
3. **Highway 7 after 4pm on Fridays** can add 45+ minutes — travel earlier in the day if possible
4. **WhatsApp your driver** to confirm 30 minutes before pickup

## What to Expect on Arrival in Pattaya

Your driver drops you at your exact hotel address. Pattaya is spread across North Pattaya (quiet, family-friendly), Central Pattaya (shopping, dining), and South Pattaya / Jomtien (beach strip). Specify your area when booking.`,
    featuredImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80&auto=format&fit=crop',
    category: 'BANGKOK' as const,
    tags: ['Bangkok', 'Pattaya', 'Transfer', 'Travel Guide', 'Airport Transfer'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-18T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 6,
    seoTitle: 'Bangkok to Pattaya Transfer Guide 2025 | Werest',
    seoDescription: 'Private transfer from Bangkok to Pattaya from ฿1,800. Compare all transport options — cost, time, pickup points and tips for a smooth journey.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },

  /* ─────────────────────────────────────────────────────────── 3 ── */
  {
    title: "Top 10 Things to Do in Phuket: First-Timer's Island Guide",
    slug: 'top-10-things-to-do-phuket-first-timer-guide',
    excerpt:
      "Patong Beach, the Big Buddha, Phi Phi Islands, Old Town and more — the 10 best experiences in Phuket for first-time visitors, with practical tips and transfer advice.",
    content: `## Phuket: Thailand's Largest Island

With over 10 million visitors a year, Phuket is Thailand's most visited island. Gorgeous Andaman beaches, a vibrant food scene, and a massive choice of day trips make it a destination that has something for everyone — families, couples, solo adventurers and luxury seekers alike.

## 1. Patong Beach

Patong is the island's beating heart. 3 km of golden sand, warm turquoise water, and an endless beachfront lined with sun-loungers, restaurants, and water sport vendors. Best visited in the morning before the afternoon crowds arrive.

## 2. Phi Phi Islands Day Trip

A speedboat trip to Koh Phi Phi Don and the famous Maya Bay (from The Beach) is unmissable. Trips typically leave at 8am and return by 5pm. Book in advance — this trip sells out every day in peak season.

## 3. Big Buddha (Phra Phuttha Ming Mongkol Akenakkiri)

The 45-metre white Burmese marble Buddha sits atop Nakkerd Hill and can be seen from almost anywhere on the island. Panoramic views, free entry, and genuinely impressive up close. Wear modest clothing — sleeveless tops and shorts above the knee are not permitted.

## 4. Old Phuket Town

Colourful Sino-Portuguese shophouses, independent cafés, street art murals, and the island's best local food scene. Sunday Walking Street market is the highlight. The area is walkable — explore Thalang, Dibuk, and Phang Nga Roads.

## 5. James Bond Island (Phang Nga Bay)

The iconic limestone pinnacle from The Man with the Golden Gun is a 2-hour boat trip north of Phuket. Combine it with a sea kayak through mangrove caves. Shared tours start from ฿1,000; private longtail from ฿3,500.

## 6. Kata Noi Beach

Quieter and more beautiful than Patong. Kata Noi is a crescent-shaped bay at the south of the island that attracts surfers in the low season. Fewer crowds, cleaner water, and a relaxed café scene.

## 7. Ethical Elephant Experience

Several sanctuaries near Phuket give you close contact with elephants without riding or circus-style shows. Look for places that are members of the Elephant Nature Park network. Half-day visits typically cost ฿2,500–฿3,500 per person.

## 8. Phromthep Cape Sunset

The southernmost tip of Phuket. Arrive 45 minutes before sunset to secure a viewing spot. The 360° panorama over the Andaman Sea is one of the most photographed sights in Thailand.

## 9. Phuket Weekend Night Market (Malin Plaza)

Open Friday–Sunday evenings, this market has 200+ stalls of street food, fresh seafood, clothing, and handicrafts. Located in Patong, 5 minutes' walk from the beach.

## 10. Snorkelling at Coral Island (Koh Hae)

45 minutes by speedboat from Chalong Pier. The water around Coral Island is gin-clear with excellent visibility. Snorkel gear is included in most day trip packages (฿800–฿1,200).

## Getting to and Around Phuket

**From Phuket International Airport:**
Werest offers fixed-price transfers to all major beach areas — Patong, Kata, Karon, Bang Tao, Surin, and more. Prices from **฿650** for a Sedan. No meter, no haggling.

**Around the island:**
- Grab app for taxis (set the price before you go)
- Motorbike rental (฿200–฿300/day) — only if you're experienced
- Songthaews (shared pickups) along the main coastal road — ฿30–฿50 per journey`,
    featuredImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=900&q=80&auto=format&fit=crop',
    category: 'PHUKET' as const,
    tags: ['Phuket', 'Travel Guide', 'Beaches', 'First Timer', 'Things To Do'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-17T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 7,
    seoTitle: 'Top 10 Things to Do in Phuket 2025 | First-Timer Guide | Werest',
    seoDescription: 'Best things to do in Phuket for first-time visitors — Patong Beach, Phi Phi Islands, Big Buddha, Old Town and more. With transfer tips.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },

  /* ─────────────────────────────────────────────────────────── 4 ── */
  {
    title: 'Krabi vs Phuket 2025: Which Thai Island Should You Visit?',
    slug: 'krabi-vs-phuket-which-island-2025',
    excerpt:
      "Can't choose between Krabi and Phuket? We compare beaches, nightlife, budget, activities and transfer options so you can pick the right island for your trip.",
    content: `## Krabi or Phuket — The Most Common Question in Thai Travel

Both destinations sit on the Andaman coast in southern Thailand, just 150 km apart. They share the same turquoise sea and limestone scenery, yet they attract quite different travellers. Here's the honest comparison.

## Beaches

### Phuket ✓ Variety
Kamala, Surin, Bang Tao, Kata Noi, Karon, Patong — six distinct beach vibes within a 30-minute drive. Busy but beautiful.

### Krabi ✓ Scenery
Railay Beach — accessible only by longtail boat because of sheer limestone cliffs — is arguably the most dramatic beach in all of Thailand. Ao Nang is the main beach strip and it's far less crowded than Patong.

**Winner:** Krabi for scenery, Phuket for variety

## Nightlife

Phuket's Patong Beach has **Bangla Road** — Thailand's most famous party strip, with clubs, bars and live music running until 3am.

Krabi has a relaxed bar scene concentrated around Ao Nang Beach Road. A few lively spots, but nothing approaching Patong's scale.

**Winner:** Phuket (by a large margin)

## Activities

**Krabi offers:**
- 4 Islands snorkelling tour (unmissable)
- World-class limestone rock climbing (Railay, Tonsai)
- Longtail boat to Railay Beach
- Tiger Cave Temple (1,237 steps, panoramic summit)
- Sea kayaking through hidden lagoons

**Phuket offers:**
- Phi Phi Islands speedboat day trip
- James Bond Island / Phang Nga Bay
- Big Buddha and Old Town
- Ethical elephant sanctuary
- Fantasea cultural show

**Winner:** Draw — different activity profiles

## Cost

Krabi is consistently **15–25% cheaper** than Phuket for accommodation, food and activities.

A mid-range hotel in Ao Nang: ฿1,200–฿2,500/night
Equivalent in Patong: ฿1,800–฿4,000/night

## Getting There

**Phuket:** International airport (HKT) with direct flights from Bangkok (1h 20m), plus connections from Singapore, Kuala Lumpur, and many European cities.

**Krabi:** Krabi International Airport (KBV) receives flights from Bangkok (1h 15m) and select Asian hubs. Alternatively, fly to Phuket and take the 2.5-hour ferry + transfer combination to Krabi.

Werest covers private transfers from both Phuket Airport and Krabi Airport to all beach areas.

## Who Should Go Where?

| Profile | Choose |
|---------|--------|
| First-time Thailand visitor | **Phuket** — more infrastructure, easier to navigate |
| Couples seeking romance | **Krabi** — dramatic scenery, quieter beaches |
| Party / nightlife seekers | **Phuket** — Bangla Road is unmissable |
| Budget travellers | **Krabi** — 20% cheaper across the board |
| Rock climbers / adventurers | **Krabi** — world-class climbing at Railay |
| Families with young children | **Phuket** — more activity options, calmer beaches at Kata/Karon |
| 10+ days available | **Both** — ferry connections make combining them easy |

## The Verdict

Neither destination is objectively better — they serve different travel styles. If you can only pick one, **choose Phuket** for your first Thailand trip and **Krabi** when you come back.`,
    featuredImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=80&auto=format&fit=crop',
    category: 'KRABI' as const,
    tags: ['Krabi', 'Phuket', 'Island Comparison', 'Travel Guide', '2025'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-16T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 6,
    seoTitle: 'Krabi vs Phuket 2025: Which Thai Island Should You Visit? | Werest',
    seoDescription: 'Krabi or Phuket? Honest comparison of beaches, nightlife, cost, activities and how to get there. Choose the right island for your 2025 trip.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },

  /* ─────────────────────────────────────────────────────────── 5 ── */
  {
    title: 'Pattaya in 3 Days: The Perfect Itinerary for 2025',
    slug: 'pattaya-3-day-perfect-itinerary-2025',
    excerpt:
      'Make the most of 3 days in Pattaya with this day-by-day itinerary covering Sanctuary of Truth, Jomtien Beach, the floating market, island trips, rooftop bars and the best local seafood.',
    content: `## Why 3 Days Is the Perfect Length for Pattaya

Pattaya often gets dismissed as purely a party destination, but the city has transformed enormously. Family resorts, cultural landmarks, excellent seafood, and day trip islands make it an easy 3-day break from Bangkok.

## Day 1 — Art, Culture, and Sunset on the Roof

### Morning: Sanctuary of Truth
Start at the **Sanctuary of Truth** (Prasat Satchatham), Pattaya's most extraordinary sight. This all-wood temple has been under construction since 1981 and is filled with intricately carved religious sculptures. Entry: ฿500. Allow 2 hours.

### Afternoon: Pattaya Floating Market
The **Four Regions Floating Market** is a 5-hectare market built over a lake, with stalls selling food, crafts and souvenirs from Thailand's four regions. Arrive hungry — the grilled satay, mango salads, and coconut desserts are excellent. Entry: ฿200.

### Evening: Rooftop bar on Walking Street
Watch the Pattaya bay light up from **Horizon Rooftop Bar** or the terrace at **Hard Rock Hotel**. Sunset cocktails with Gulf of Thailand views.

## Day 2 — Islands and the Sea

### Full Day: Coral Island (Koh Larn)
Koh Larn is 7 km off the Pattaya coast — a 30-minute ferry from Bali Hai Pier (฿30 each way). The island has six beaches; **Tawaen Beach** is the busiest, **Samae Beach** is the quietest and most scenic. Rent a motorbike on the island (฿200/day) to explore all the beaches.

**Snorkelling:** Crystal-clear water with colourful coral and reef fish around the south shore. Gear rental ฿100 on the beach.

**Where to eat on Koh Larn:** Fresh grilled prawns, som tum and steamed sea bass at the seafood restaurants along Tawaen Beach. Budget ฿300–฿500 per person for a full lunch.

Return to the mainland by 4pm to avoid the evening rush.

### Evening: Jomtien Beach Night Market
Jomtien is Pattaya's quieter, more local beach — popular with Thai families and expat residents. The **Jomtien Night Market** runs from 5pm, with excellent street food and no tourist markup.

## Day 3 — Local Life and a Great Lunch

### Morning: Nong Nooch Tropical Garden
The largest botanical garden in Asia, with 2,500 acres of manicured landscapes, cactus gardens, French gardens, and a famous Thai cultural show (elephant show, Thai boxing, folk dance). Entry: ฿500, show included.

### Afternoon: Naklua Seafood Market
Buy fresh prawns, squid, crab and fish directly from the market, then take it to one of the cook-it-for-you restaurants (just pay a small cooking fee). The most authentic seafood experience in the Pattaya area.

### Evening: Pattaya Viewpoint (Pratumnak Hill)
End your trip with the panoramic view from Pratumnak Hill, overlooking Pattaya Bay, Walking Street, and the islands beyond. Free, and stunning at dusk.

## Getting to Pattaya from Bangkok

A **Werest private transfer** from Suvarnabhumi Airport or central Bangkok takes 1.5–2 hours and costs from **฿1,800** — ideal for groups or anyone with luggage who wants a stress-free arrival.

## Where to Stay

- **North Pattaya:** Quieter, family-friendly, away from Walking Street
- **Central Pattaya / Jomtien:** Best balance of beach access and nightlife
- **Pratumnak Hill:** Hillside luxury resorts with bay views — a short drive from everything`,
    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop',
    category: 'PATTAYA' as const,
    tags: ['Pattaya', 'Itinerary', 'Travel Guide', '3 Days', 'Things To Do'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-15T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 7,
    seoTitle: 'Pattaya 3-Day Itinerary 2025: The Perfect Trip Plan | Werest',
    seoDescription: '3 days in Pattaya? Day-by-day itinerary covering the Sanctuary of Truth, Coral Island, Nong Nooch Gardens and the best local seafood.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },

  /* ─────────────────────────────────────────────────────────── 6 ── */
  {
    title: 'Best Time to Visit Thailand 2025: Month-by-Month Guide',
    slug: 'best-time-to-visit-thailand-month-by-month-2025',
    excerpt:
      'When is the best time to go to Thailand? Our month-by-month breakdown covers weather, crowds, prices and festivals for Bangkok, Phuket, Krabi, Chiang Mai and Koh Samui.',
    content: `## Thailand Has Three Seasons — Not Two

The common mistake is thinking of Thailand as simply "rainy season" vs "dry season." In reality, Thailand's regions have different peak periods, and some months that seem to be "rainy season" are actually excellent times to visit.

## The Three Seasons

**Cool & Dry (November – February):** The best weather nationwide. Comfortable temperatures (25–32°C), minimal rain, and calm seas in the Gulf of Thailand and Andaman coasts. This is peak tourist season — book early.

**Hot & Dry (March – May):** Temperatures rise to 35–40°C. Still dry, but uncomfortably hot in cities. Beaches are fine. Fewer tourists and good hotel deals.

**Monsoon (May – October):** Heavy rains, especially June–September. The Gulf Coast (Koh Samui, Koh Phangan) gets the worst of the rain. The Andaman Coast (Phuket, Krabi) has heavy downpours but often still has sunny mornings. Significant price drops.

## Month-by-Month Breakdown

### November ⭐ BEST TIME
All regions excellent. Loy Krathong festival (floating lanterns on waterways). Waters calm, clear. Still shoulder season pricing in early November.

### December ⭐ PEAK
Excellent everywhere but prices are at their highest. Book accommodation and transfers 2–3 months in advance. Christmas and New Year see resorts fully booked.

### January ⭐ PEAK
Coolest temperatures of the year in the north (Chiang Mai). Beach weather is perfect. King's Cup Regatta in Phuket for sailing fans.

### February ⭐⭐ EXCELLENT
Slightly fewer tourists than January, same great weather. Chinese New Year brings festivals and celebrations in Bangkok's Chinatown.

### March 🌤 GOOD
Getting warmer. Still dry. Good deals starting to emerge as peak season ends. Songkran (Thai New Year water festival) preparations begin.

### April 🎉 FESTIVAL SEASON
**Songkran (13–15 April)** is the world's largest water fight — and one of the most memorable travel experiences in Asia. Bangkok, Chiang Mai, and Pattaya all celebrate intensely.

### May 🌦 SHOULDER
First rains arrive. Andaman coast (Phuket, Krabi) starts to get rough seas — some dive sites close. Gulf Coast (Koh Samui, Phuket) still fine. Great hotel rates.

### June – August 🌧 RAINY WEST / DRY EAST
**Andaman coast:** Heavy monsoon. Phuket and Krabi have frequent rain but still many sunny mornings. Some boats cancel if seas are rough.
**Gulf Coast:** Koh Samui, Koh Phangan, and Koh Tao are in dry season — this is their peak. Bangkok is hot and humid but perfectly fine to visit.

### September 🌧 WETTEST MONTH
Peak of the monsoon. Some coastal areas flood. Best avoided for Phuket and Krabi. However, Bangkok, Chiang Mai, and the Gulf islands (Koh Samui) are workable.

### October 🌤 TRANSITIONING
Rains start to ease. Late October is often beautiful, especially on the Andaman coast. Vegetarian Festival in Phuket (early October) is extraordinary — not for the faint-hearted.

## Regional Quick Reference

| Destination | Best Months | Avoid |
|------------|-------------|-------|
| Bangkok | Nov – Feb | May – Sep (hot & humid) |
| Phuket / Krabi | Nov – Apr | Jun – Oct (rough seas) |
| Koh Samui | Feb – Apr, Jul – Sep | Oct – Dec (Gulf monsoon) |
| Chiang Mai | Nov – Feb, Jul – Sep | Mar – May (smoke season) |
| Pattaya | Nov – Apr | May – Sep |

## Our Recommendation

**First visit to Thailand:** November to February. You get the best weather everywhere, full access to all beaches, and no risk of cancelled boat trips.

**Returning visitors on a budget:** May or October. 30–50% lower hotel rates, and you know what to expect with occasional rain.

Whenever you're travelling, Werest provides private transfers from Bangkok's airports, Phuket Airport, and Krabi Airport — available year-round, all weather conditions, with flight tracking so your driver always knows your arrival time.`,
    featuredImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=80&auto=format&fit=crop',
    category: 'THAILAND' as const,
    tags: ['Thailand', 'Travel Planning', 'Weather', 'Best Time', 'Seasons'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2026-05-14T10:00:00Z'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 8,
    seoTitle: 'Best Time to Visit Thailand 2025: Month-by-Month Guide | Werest',
    seoDescription: 'When to visit Thailand? Month-by-month weather guide for Bangkok, Phuket, Krabi, Koh Samui and Chiang Mai — with festival dates and crowd levels.',
    faqs: null, ctaBlocks: null, relatedServices: null, relatedSlugs: [],
  },
];

async function main() {
  console.log('🗑  Deleting all existing blog posts...');
  const { count } = await prisma.blogPost.deleteMany({});
  console.log(`   Deleted ${count} post(s)\n`);

  console.log('✍️  Seeding 6 real blog posts...\n');
  for (const post of POSTS) {
    await prisma.blogPost.create({ data: post });
    console.log(`   ✓  ${post.title}`);
  }

  console.log('\n✅  Done! 6 posts live in the database.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
