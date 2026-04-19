/**
 * Blog seed — run with:  npx tsx prisma/seed-blog.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONTENT = `
<p>Bangkok is one of Southeast Asia's most electrifying cities — a place where golden spires rise above tangled expressways, street vendors ladle fragrant broth at midnight, and ancient temples stand beside gleaming sky-scrapers. First-time visitors can easily feel overwhelmed by its sheer scale. To cut through the noise, we've hand-picked the seven places that capture everything that makes Bangkok unmissable.</p>

<h2>1. The Grand Palace &amp; Wat Phra Kaew — Bangkok's Most Sacred Site</h2>
<img src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80" alt="The Grand Palace complex in Bangkok, Thailand" />
<p>Built in 1782, the <strong>Grand Palace</strong> served as the official residence of the Thai King for 150 years and remains the spiritual heart of the nation. Spanning 218,400 square metres, the compound is an overwhelming feast of gilded spires, intricate mosaic work, and mythological murals that took generations of Thai craftsmen to complete.</p>
<p>Nestled within the palace walls is <strong>Wat Phra Kaew</strong> (Temple of the Emerald Buddha) — the most revered Buddhist temple in Thailand. The Emerald Buddha itself is a 66 cm jadite statue enshrined high on an elevated throne; the Thai King changes its golden seasonal costume three times a year. The murals encircling the inner walls depict the entire Ramakien epic in stunning detail across 178 panels.</p>
<ul>
  <li><strong>Opening hours:</strong> Daily 08:30 – 15:30</li>
  <li><strong>Admission:</strong> ฿500 (includes Dusit Palace Museum)</li>
  <li><strong>Dress code:</strong> Covered shoulders &amp; knees — free sarong loans at the gate</li>
  <li><strong>Tip:</strong> Arrive before 09:00 to beat tour groups; the palace faces east and morning light is ideal for photos</li>
</ul>

<h2>2. Wat Arun — The Temple of Dawn</h2>
<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80" alt="Wat Arun temple at sunset along the Chao Phraya River Bangkok" />
<p>Across the Chao Phraya River from the Grand Palace stands <strong>Wat Arun Ratchawararam</strong> — the Temple of Dawn. Its 70-metre central prang (tower) is encrusted entirely with fragments of Chinese porcelain and colourful faience tiles, a technique that makes the structure shimmer like crushed diamonds in morning or afternoon sun.</p>
<p>The temple is at its most beautiful viewed from the opposite bank at dusk, when the prang glows amber-gold against the darkening sky. Crossing by the two-baht ferry from Tha Tien Pier is itself an experience — a 90-second ride that feels like stepping back in time.</p>
<ul>
  <li><strong>Opening hours:</strong> Daily 08:00 – 18:00</li>
  <li><strong>Admission:</strong> ฿100</li>
  <li><strong>Best time:</strong> Late afternoon — the setting sun turns the porcelain a deep gold</li>
  <li><strong>Getting there:</strong> Cross-river ferry from Tha Tien Pier (near Wat Pho) for ฿5</li>
</ul>

<h2>3. Wat Pho — Temple of the Reclining Buddha</h2>
<img src="https://images.unsplash.com/photo-1548019534-40b3bfc78a05?auto=format&fit=crop&w=1200&q=80" alt="The golden Reclining Buddha inside Wat Pho temple Bangkok" />
<p><strong>Wat Pho</strong> is Bangkok's oldest and largest temple, pre-dating the city itself, and home to a truly awe-inspiring 46-metre-long Reclining Buddha covered in gold leaf. The statue is so large that it fills an entire hall — you walk alongside it, craning your neck to take in the serene face at one end and the mother-of-pearl inlaid feet (each 3 metres tall) at the other.</p>
<p>Beyond the famous statue, Wat Pho is also considered the birthplace of traditional Thai massage. Its school has operated for over 200 years, and a one-hour massage in the temple compound costs just ฿420 — making it one of the finest and most affordable experiences in Bangkok.</p>
<ul>
  <li><strong>Opening hours:</strong> Daily 08:00 – 18:30</li>
  <li><strong>Admission:</strong> ฿200</li>
  <li><strong>Don't miss:</strong> A traditional Thai massage at the on-site school (฿420 / hour)</li>
  <li><strong>Combine with:</strong> Grand Palace — both are walkable from each other</li>
</ul>

<h2>4. Chatuchak Weekend Market — The World's Largest Outdoor Market</h2>
<img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80" alt="Busy stalls at Chatuchak Weekend Market Bangkok" />
<p>With over <strong>15,000 stalls</strong> spread across 35 acres, <strong>Chatuchak Weekend Market</strong> is arguably the largest outdoor market on earth. Open only on Saturdays and Sundays, it draws some 200,000 visitors per weekend — Thai locals, expats, and travellers all hunting for the same thing: an extraordinary deal.</p>
<p>The market is divided into 27 numbered sections covering everything from vintage clothing and antique ceramics to live plants, art prints, street food, and handmade jewellery. Section 26 is legendary for Thai ceramics; section 7 for vintage fashion; and sections 2–4 for the freshest, cheapest pad thai you will find anywhere in the city.</p>
<ul>
  <li><strong>Open:</strong> Saturday &amp; Sunday, 09:00 – 18:00</li>
  <li><strong>Getting there:</strong> BTS Mo Chit or MRT Chatuchak Park — exit directly into the market</li>
  <li><strong>Tip:</strong> Arrive at 09:00 — heat and crowds peak sharply after 12:00</li>
  <li><strong>Budget:</strong> Bring cash (฿500–฿2,000 for a satisfying morning)</li>
</ul>

<h2>5. Chinatown (Yaowarat) — Bangkok's Neon Night Food Paradise</h2>
<img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80" alt="Yaowarat Road Chinatown Bangkok at night with neon signs" />
<p>Bangkok's <strong>Chinatown</strong>, centred on Yaowarat Road, has been the city's commercial and culinary engine since the late 18th century. By day it is a dense maze of gold shops, medicinal herb stores, and wholesale traders. By night it transforms into one of Asia's most atmospheric street-food corridors, illuminated by hundreds of red neon signs reflected on rain-slicked pavements.</p>
<p>The food here is extraordinary: deep-fried oyster omelettes (hoi tod), fresh crab fried rice cooked to order in enormous woks, pad see ew with chewy egg noodles, and the famous "kao tom" rice porridge eaten after midnight. Do not leave without trying a grilled squid at the Sampeng Lane junction — it is the gold standard.</p>
<ul>
  <li><strong>Best time:</strong> 18:00 – 23:00 when food stalls are in full swing</li>
  <li><strong>Getting there:</strong> MRT Wat Mangkon (direct access to Yaowarat Road)</li>
  <li><strong>Must eat:</strong> Oyster omelette, pad kee mao, fresh seafood, mango sticky rice</li>
  <li><strong>Note:</strong> Particularly magical during Chinese New Year (Jan/Feb) when the entire street lights up with lanterns</li>
</ul>

<h2>6. The Golden Mount &amp; Wat Saket — Bangkok's Best Panoramic View</h2>
<img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" alt="Golden Mount Wat Saket panoramic view over Bangkok rooftops" />
<p><strong>Wat Saket</strong> and its iconic <strong>Golden Mount</strong> offer what is arguably the finest free panoramic view in Bangkok. Built on an artificial hill approximately 80 metres above the surrounding flatlands, the golden chedi at the summit is visible from kilometres away across the old city rooftops.</p>
<p>The climb involves 318 steps winding around the hillside through shaded gardens, past small shrines, hanging bells, and meditation alcoves. At the top, a 360-degree terrace reveals the Chao Phraya River glinting to the west, Wat Pho's orange roofline to the south, and the endless urban sprawl stretching north and east. Visiting at golden hour — about 30 minutes before sunset — is consistently rated among the top Bangkok experiences by returning travellers.</p>
<ul>
  <li><strong>Opening hours:</strong> Daily 07:30 – 19:00</li>
  <li><strong>Admission:</strong> ฿20 (one of Bangkok's best value sights)</li>
  <li><strong>Best time:</strong> One hour before sunset for golden light on the city</li>
  <li><strong>Combine with:</strong> The nearby Khao San Road area for an evening stroll afterward</li>
</ul>

<h2>7. Asiatique The Riverfront — Bangkok's Most Romantic Evening District</h2>
<img src="https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=1200&q=80" alt="Asiatique The Riverfront Bangkok at night with Ferris wheel lights" />
<p>Opened in 2012 on the site of a 100-year-old East Asiatic Company warehouse, <strong>Asiatique The Riverfront</strong> combines open-air shopping, riverside dining, cabaret shows, and a giant Ferris wheel into one sprawling evening destination along the Chao Phraya. It is the kind of place that improves dramatically after 19:00, when fairy lights strung between the warehouse arches reflect on the dark river.</p>
<p>The venue spans two zones: Chinatown Zone (craft shops, spice stalls, Thai silk) and Factory Zone (international restaurants, craft beer bars, live music). The Calypso Cabaret, one of Bangkok's most famous ladyboy shows, performs here nightly. For the best experience, arrive by the <strong>free shuttle boat</strong> from Saphan Taksin BTS station — gliding in by river is infinitely more memorable than arriving by taxi.</p>
<ul>
  <li><strong>Opening hours:</strong> Daily 17:00 – 24:00</li>
  <li><strong>Admission:</strong> Free entry (pay for shows, food, rides)</li>
  <li><strong>Getting there:</strong> Free shuttle boat from Saphan Taksin BTS (runs every 30 min from 16:00)</li>
  <li><strong>Don't miss:</strong> Ferris wheel ride at night (฿250) and riverside dinner at any of the warehouse-front restaurants</li>
</ul>

<h2>Planning Your Bangkok Visit</h2>
<p>All seven places are accessible without a private car, but covering them efficiently across two or three days is much easier when you are not battling Bangkok's notorious traffic on your own. The Grand Palace, Wat Pho, and Wat Arun form a natural riverside cluster best done on day one. Chatuchak demands a weekend morning. Chinatown and the Golden Mount pair perfectly for a full evening. Asiatique is a natural finale on your last night in the city.</p>
<p>A private transfer between your hotel and any of these locations removes the stress of metered taxi negotiations and ensures you arrive on time. Werest Travel offers fixed-price private transfers anywhere in Bangkok — door-to-door, with English-speaking drivers who know exactly where each site's main entrance is located.</p>
`;

const FAQS = [
  {
    q: 'How many days do I need to see the best of Bangkok?',
    a: 'Three full days is ideal for covering the seven must-see places comfortably without rushing. Two days works if you prioritise the riverside cluster (Grand Palace, Wat Pho, Wat Arun) on day one and split Chatuchak, Chinatown, and Asiatique across day two. Extend to four or five days if you want to explore day trips to Ayutthaya or Damnoen Saduak floating market.',
  },
  {
    q: 'What is the best way to get around Bangkok as a tourist?',
    a: 'For the riverside historic district, the Chao Phraya Express Boat is the fastest and most scenic option. For areas further north or east, the BTS Skytrain and MRT metro are reliable and air-conditioned. For door-to-door transfers between sites — especially with luggage or in a group — a private car is the most comfortable option and removes the stress of negotiating fares.',
  },
  {
    q: 'When is the best time of year to visit Bangkok?',
    a: 'November to February is peak season — temperatures are lower (26–32°C), humidity is manageable, and rainfall is minimal. March to May is very hot (35–40°C) but has fewer tourists. June to October is monsoon season with heavy afternoon rains, though mornings are often clear and hotel rates drop significantly.',
  },
  {
    q: 'Is Bangkok safe for tourists?',
    a: 'Bangkok is generally very safe for tourists. Petty theft and scams targeting visitors (most commonly "grand palace is closed today" tuk-tuk scams) are the main risks to be aware of. Book transport through reputable services, keep valuables out of sight in crowded markets, and dress respectfully at temple sites.',
  },
  {
    q: 'How do I get from Bangkok to Pattaya?',
    a: 'The most comfortable way is a private transfer, which takes approximately 90 minutes on the motorway and costs from ฿1,800 for a sedan. Public buses from Ekkamai Bus Terminal take 2–2.5 hours and cost around ฿130, but do not offer door-to-door convenience. Werest Travel provides fixed-price private transfers from any Bangkok hotel or airport directly to your Pattaya accommodation.',
  },
];

const CTA_BLOCKS = [
  {
    title: 'Book Your Bangkok Transfer',
    description: 'Fixed-price private transfers from Suvarnabhumi or Don Mueang Airport to any Bangkok hotel. No surge pricing, no negotiating — just a professional driver waiting for you.',
    href: '/',
    buttonLabel: 'Get Instant Price',
  },
  {
    title: 'Bangkok to Pattaya Transfer',
    description: 'Skip the bus. A private car from Bangkok to Pattaya takes 90 minutes on the motorway — perfect after a long flight or a full day of sightseeing.',
    href: '/results?pickup_address=Bangkok&dropoff_address=Pattaya',
    buttonLabel: 'See Transfer Prices',
  },
];

const RELATED_SERVICES = [
  { title: 'Airport Transfer to Bangkok', href: '/results?pickup_address=Suvarnabhumi+Airport&dropoff_address=Bangkok+City+Centre', description: 'From BKK or DMK to any Bangkok hotel' },
  { title: 'Bangkok to Pattaya', href: '/results?pickup_address=Bangkok&dropoff_address=Pattaya', description: 'Fixed-price private car, ~90 min' },
  { title: 'Bangkok to Hua Hin', href: '/results?pickup_address=Bangkok&dropoff_address=Hua+Hin', description: 'Comfortable ride to the beach, ~2.5 h' },
  { title: 'Bangkok to Ayutthaya', href: '/results?pickup_address=Bangkok&dropoff_address=Ayutthaya', description: 'Day trip to Thailand\'s ancient capital' },
];

async function main() {
  console.log('🌱 Seeding Bangkok blog post…');

  // Upsert by slug so re-running is safe
  await prisma.blogPost.upsert({
    where: { slug: '7-places-you-should-not-miss-in-bangkok' },
    update: {
      status: 'PUBLISHED',
      publishedAt: new Date('2025-01-15T08:00:00Z'),
    },
    create: {
      slug:          '7-places-you-should-not-miss-in-bangkok',
      title:         '7 Places You Should Not Miss in Bangkok',
      excerpt:       'From the gilded spires of the Grand Palace to the neon-lit street-food lanes of Chinatown, Bangkok rewards every kind of traveller. Here are the seven spots that belong on every Bangkok itinerary — with practical tips to make the most of each.',
      content:       CONTENT.trim(),
      featuredImage: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
      category:      'BANGKOK',
      tags:          ['Bangkok', 'Grand Palace', 'temples', 'street food', 'sightseeing', 'Thailand travel', 'Bangkok attractions', 'Chinatown', 'Chatuchak'],
      status:        'PUBLISHED',
      publishedAt:   new Date('2025-01-15T08:00:00Z'),
      seoTitle:      '7 Places You Should Not Miss in Bangkok | Werest Travel',
      seoDescription: 'Grand Palace, Wat Arun, Chatuchak Market, Chinatown and more — the seven unmissable Bangkok attractions with opening hours, admission prices and insider tips.',
      authorName:    'Werest Travel',
      authorTitle:   'Thailand Travel Experts',
      faqs:          FAQS,
      ctaBlocks:     CTA_BLOCKS,
      relatedServices: RELATED_SERVICES,
      relatedSlugs:  [],
      readingTimeMin: 8,
    },
  });

  console.log('✅ Bangkok blog post created at /blog/7-places-you-should-not-miss-in-bangkok');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
