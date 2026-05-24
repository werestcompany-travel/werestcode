/**
 * Blog seed — run with:  npx tsx prisma/seed-blog.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSTS = [
  {
    title: 'Bangkok Airport Transfer Guide: Suvarnabhumi vs Don Mueang',
    slug: 'bangkok-airport-transfer-guide-suvarnabhumi-don-mueang',
    excerpt:
      'Everything you need to know about getting from Bangkok airports to your hotel — pricing, vehicle types, and why a private transfer beats the taxi queue.',
    content: `## Bangkok Has Two International Airports

Suvarnabhumi (BKK) handles most international flights and is located about 30 km east of the city center. Don Mueang (DMK) is the hub for low-cost carriers like AirAsia and Nok Air, located 25 km north.

Both airports can take 45–90 minutes to reach central Bangkok depending on traffic — and Bangkok traffic is famously unpredictable.

## Your Transfer Options Compared

| Option | Pros | Cons |
|--------|------|------|
| Metered taxi | Cheap | Queue + meter + expressway surcharge |
| Public bus | Very cheap | Luggage hassle, slow |
| Airport Rail Link (Suvarnabhumi only) | Fast | Doesn't go to most hotels, heavy luggage issue |
| **Private transfer** | Door-to-door, fixed price, meet & greet | Slightly higher cost |

## Why Private Transfers Make Sense

When you land after a long flight, the last thing you want is to argue with a driver or navigate an unfamiliar transport system with luggage.

A private transfer from Werest gives you:
- **Fixed price** — no surprises, negotiated before you travel
- **Meet & greet** — driver holds a sign with your name inside the arrivals hall
- **Vehicle choice** — Sedan (1–2 pax), SUV (1–4 pax), Minivan (1–10 pax)
- **Flight tracking** — your driver monitors your flight and adjusts for delays

## Suvarnabhumi to Central Bangkok: What to Expect

The drive from Suvarnabhumi to Sukhumvit typically takes:
- **Off-peak** (10am–4pm): 40–55 minutes
- **Rush hour** (7–9am, 5–8pm): 60–90 minutes

Cost for a private transfer: from ฿800 for a Sedan to ฿1,200 for an SUV. All tolls and parking included.

## Don Mueang to Central Bangkok

Don Mueang is further north, so transfers to Sukhumvit take slightly longer:
- **Off-peak**: 50–70 minutes
- **Rush hour**: 75–110 minutes

A common option for budget travelers is taking the A1 express bus to Mo Chit BTS, then BTS to your hotel. But with luggage, a private transfer at around ฿900–1,100 is often worth it.

## How to Book Your Transfer

1. Visit [Werest Private Transfers](/transfers)
2. Enter your pickup address (or select airport) and drop-off hotel
3. Choose your vehicle type based on group size
4. Confirm and receive instant booking reference

Your driver will be waiting at arrivals — look for the Werest sign with your name.

## Tips for Your Bangkok Airport Transfer

- **Save the driver's contact number** — you'll receive it in your confirmation
- **Flights delayed?** Your driver monitors your flight — no extra charge for delays up to 60 minutes
- **Early morning arrivals?** Not a problem — we operate 24/7
- **More than 10 passengers?** Contact us for coach/bus options

## Ready to Book?

Skip the queue and travel in comfort. [Book your private Bangkok airport transfer](/booking) today — instant confirmation, fixed price, professional driver.`,
    featuredImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
    category: 'BANGKOK' as const,
    tags: ['bangkok airport transfer', 'suvarnabhumi transfer', 'don mueang transfer', 'bangkok private transfer', 'bkk airport taxi', 'thailand travel tips'],
    status: 'DRAFT' as const,
    publishedAt: null,
    authorName: 'Werest Team',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 6,
    seoTitle: 'Bangkok Airport Transfer Guide: Suvarnabhumi vs Don Mueang',
    seoDescription: 'Compare your Bangkok airport transfer options. Private transfers from BKK and DMK with fixed prices, meet & greet service, and 24/7 availability.',
    faqs: null,
    ctaBlocks: null,
    relatedServices: null,
    relatedSlugs: [],
  },
  {
    title: 'Bangkok to Pattaya Transfer: The Complete Guide for 2025',
    slug: 'bangkok-to-pattaya-transfer-guide-2025',
    excerpt:
      'Everything you need to know about getting from Bangkok to Pattaya by private transfer — journey time, costs, best pickup points, and pro tips for a smooth ride.',
    content: `## How to Get from Bangkok to Pattaya

The Bangkok to Pattaya route is one of the most popular private transfers in Thailand, covering roughly **147 km** along Highway 7 (the motorway). With a private car, the journey takes around **1.5 to 2 hours** depending on traffic.

## Why Choose a Private Transfer?

Private transfers give you total flexibility. Unlike buses or minivans, your driver picks you up directly from your hotel, airport, or any Bangkok address and drops you at your Pattaya destination — no stops, no strangers, no waiting around.

### Vehicle Options

- **Sedan** — ideal for 1–3 passengers with light luggage
- **SUV** — comfortable for up to 4 passengers with more bags
- **Minivan** — perfect for families or groups of up to 10

## Best Pickup Points in Bangkok

- **Suvarnabhumi Airport (BKK)** — most common; meeters wait in the arrival hall
- **Don Mueang Airport (DMK)** — great for budget airline arrivals
- **Sukhumvit / Silom hotels** — door-to-door from your hotel lobby

## Cost

Private transfers from Bangkok to Pattaya with Werest start from **฿1,800 for a Sedan**. Prices are fixed — no surge pricing, no hidden fees.

## Tips for a Smooth Journey

1. Book at least 3 hours before departure for guaranteed availability
2. Confirm your driver's WhatsApp number after booking
3. For airport pickups, add your flight number so the driver tracks delays automatically
4. Highway 7 toll costs are included in your Werest price

## Ready to Book?

Use the Werest booking form to get an instant quote and confirm your transfer in under 2 minutes.`,
    featuredImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80',
    category: 'BANGKOK' as const,
    tags: ['Bangkok', 'Pattaya', 'Transfer', 'Travel Guide'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2025-04-10'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 5,
    seoTitle: 'Bangkok to Pattaya Transfer Guide 2025 | Werest Travel',
    seoDescription: 'Private transfer from Bangkok to Pattaya — journey time, cost, pickup points and booking tips. Fixed prices from ฿1,800.',
    faqs: null,
    ctaBlocks: null,
    relatedServices: null,
    relatedSlugs: [],
  },
  {
    title: "Top 10 Things to Do in Phuket: A First-Timer's Island Guide",
    slug: 'top-10-things-to-do-in-phuket-first-timer-guide',
    excerpt:
      "Patong Beach, Phi Phi Islands, Big Buddha, and more — here are the 10 best experiences in Phuket for first-time visitors, with practical tips and transfer advice.",
    content: `## Phuket: Thailand's Largest Island

Phuket is Thailand's most visited island — and for good reason. Gorgeous beaches, world-class food, vibrant nightlife, and stunning viewpoints make it a destination that has something for everyone.

## 1. Patong Beach

Patong is the island's beating heart. Golden sand, warm Andaman water, and endless beachfront restaurants. Best visited in the morning before it gets crowded.

## 2. Phi Phi Islands Day Trip

A speedboat day trip to Koh Phi Phi Don and the famous Maya Bay is unmissable. Book early — this trip sells out daily.

## 3. Big Buddha

The 45-metre white marble Buddha sits atop Nakkerd Hill and offers panoramic views over the island. Free entry; dress modestly.

## 4. Old Phuket Town

Colourful Sino-Portuguese shophouses, independent cafés, street art, and the best local food scene on the island.

## 5. James Bond Island (Phang Nga Bay)

Koh Tapu — the limestone pinnacle made famous by the Roger Moore Bond film — is just 2 hours from Phuket by boat.

## 6. Kata Noi Beach

Quieter and more beautiful than Patong, Kata Noi is a crescent-shaped bay that gets dramatically less crowded after September.

## 7. Elephant Sanctuary

Choose an ethical sanctuary that prioritises elephant welfare. These half-day visits give you close contact with these majestic animals responsibly.

## 8. Phromthep Cape Sunset

The southernmost point of Phuket offers an iconic 360° sunset view. Arrive 45 minutes early to get a good spot.

## 9. Phuket Fantasea

A Las Vegas-style cultural show combining Thai mythology with acrobatics, elephants, and stunning set design. Great for families.

## 10. Snorkelling at Coral Island

Just 45 minutes by speedboat, Coral Island (Koh Hae) has crystal-clear water perfect for snorkelling.

## Getting Around Phuket

Werest offers fixed-price private transfers from Phuket International Airport to all major beach areas — Patong, Kata, Karon, Bang Tao, and more.`,
    featuredImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&q=80',
    category: 'PHUKET' as const,
    tags: ['Phuket', 'Travel Guide', 'Beaches', 'First Timer', 'Things To Do'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2025-04-22'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 7,
    seoTitle: 'Top 10 Things to Do in Phuket 2025 | First-Timer Guide | Werest',
    seoDescription: 'Best things to do in Phuket for first-time visitors — Patong Beach, Phi Phi Islands, Big Buddha, Old Town and more.',
    faqs: null,
    ctaBlocks: null,
    relatedServices: null,
    relatedSlugs: [],
  },
  {
    title: 'Krabi vs Phuket: Which Thai Island Should You Visit in 2025?',
    slug: 'krabi-vs-phuket-which-island-to-visit-2025',
    excerpt:
      "Can't decide between Krabi and Phuket? We compare beaches, nightlife, prices, activities and transport so you can choose the right island for your Thailand trip.",
    content: `## Krabi vs Phuket: The Ultimate Comparison

Thailand is blessed with too many incredible islands to visit in one trip. Two destinations that regularly top every traveller's shortlist are **Krabi** and **Phuket**.

## Beaches

**Phuket wins** for sheer variety. Kamala, Surin, Bang Tao, Kata Noi, and Patong all offer different vibes within a 30-minute drive.

**Krabi wins** for scenery. Railay Beach — accessible only by longtail boat — is arguably the most dramatic beach in Thailand.

## Nightlife

Phuket's Patong Beach has Bangla Road — Thailand's most famous party strip. Krabi has a relaxed bar scene but nothing approaching Patong's scale.

## Activities

Both destinations offer excellent day trips:

- **Krabi:** 4 Islands snorkelling, world-class rock climbing, Railay Beach longtail
- **Phuket:** Phi Phi Islands, James Bond Island, Phang Nga Bay kayaking

## Cost

Krabi is **10–20% cheaper** than Phuket for accommodation, food and activities.

## Getting There

**Phuket:** International airport with direct flights from Bangkok (1h 20m).

**Krabi:** Krabi International Airport, or ferry + transfer from Phuket (2–3 hours). Werest covers transfers in both destinations.

## Who Should Go Where?

- **Choose Phuket** if you want variety, nightlife, and more developed infrastructure.
- **Choose Krabi** if you want dramatic scenery, rock climbing, and better value.
- **Choose both** if you have 10+ days — ferry connections make combining them easy.`,
    featuredImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80',
    category: 'KRABI' as const,
    tags: ['Krabi', 'Phuket', 'Travel Guide', 'Island Comparison'],
    status: 'PUBLISHED' as const,
    publishedAt: new Date('2025-05-01'),
    authorName: 'Werest Travel',
    authorTitle: 'Thailand Travel Expert',
    readingTimeMin: 6,
    seoTitle: 'Krabi vs Phuket 2025: Which Island Should You Visit? | Werest',
    seoDescription: 'Krabi or Phuket? We compare beaches, nightlife, cost and activities to help you choose the right Thai island for 2025.',
    faqs: null,
    ctaBlocks: null,
    relatedServices: null,
    relatedSlugs: [],
  },
];

async function main() {
  console.log('Seeding 3 example blog posts...\n');
  for (const post of POSTS) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      console.log(`  ⏭  Skipping "${post.title}" — already exists`);
      continue;
    }
    await prisma.blogPost.create({ data: post });
    console.log(`  ✓  Created: "${post.title}"`);
  }
  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
