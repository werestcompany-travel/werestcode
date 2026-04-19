import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function POST() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attraction = await db.attractionListing.upsert({
    where: { slug: 'sanctuary-of-truth' },
    update: {},
    create: {
      slug: 'sanctuary-of-truth',
      name: 'Sanctuary of Truth, Pattaya',
      location: 'Pattaya, Chonburi',
      category: 'Historical Sites',
      rating: 4.8,
      reviewCount: '2,847',
      price: 500,
      originalPrice: 650,
      featureImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
      badge: 'Hot deal',
      gradient: 'from-amber-700 to-yellow-500',
      emoji: '🛕',
      href: '/attractions/sanctuary-of-truth',
      isActive: true,
      sortOrder: 0,
      overview: `<p>The <strong>Sanctuary of Truth</strong> is a magnificent all-wood castle-temple standing 105 metres tall on the seafront of Pattaya. Construction began in 1981 and continues to this day — it is a living monument, never truly finished.</p><p>Every surface is carved by hand from teakwood and adorned with intricate sculptures depicting Hindu and Buddhist cosmology. The complex also includes traditional Thai boat rides, cultural shows, and dolphin performances.</p>`,
      highlights: [
        '105-metre all-wooden castle — no metal nails used',
        'Over 40 years of ongoing hand-carving',
        'Seafront location with panoramic Gulf of Thailand views',
        'Traditional Thai boat rides included',
        'Cultural shows & dolphin performances on-site',
        'Photography paradise — stunning at golden hour',
      ],
      included: [
        'Admission ticket',
        'Traditional Thai boat ride',
        'Cultural show access',
        'Complimentary elephant ride (select packages)',
      ],
      excluded: [
        'Hotel pickup & drop-off',
        'Food & beverages',
        'Dolphin show (separate ticket)',
        'Personal shopping',
      ],
      infoItems: [
        'Open daily 08:00 – 17:00',
        'Duration: 2–3 hours recommended',
        'Dress code: shoulders & knees covered (sarongs available on-site)',
        'Photography permitted throughout',
        'Wheelchair accessible on ground floor',
      ],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80', alt: 'Sanctuary of Truth main facade at sunset' },
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', alt: 'Intricate wood carvings detail' },
        { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', alt: 'Aerial view of the sanctuary' },
        { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', alt: 'Seafront panoramic view' },
        { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80', alt: 'Traditional Thai boat ride' },
      ],
      expectSteps: [
        { icon: '🚌', time: '08:00 – 09:00', title: 'Arrival & Entrance', desc: 'Arrive at the sanctuary, collect your tickets at the gate and receive a brief orientation from staff.' },
        { icon: '🛕', time: '09:00 – 11:00', title: 'Explore the Temple', desc: 'Walk through the four wings representing Hindu and Buddhist philosophy. Admire thousands of hand-carved wooden sculptures.' },
        { icon: '⛵', time: '11:00 – 11:30', title: 'Traditional Boat Ride', desc: 'Board a traditional Thai wooden boat and cruise along the coastline for stunning views of the sanctuary from the sea.' },
        { icon: '🎭', time: '11:30 – 12:00', title: 'Cultural Show', desc: 'Watch a live performance featuring traditional Thai dance, music, and martial arts demonstrations.' },
        { icon: '🍽️', time: '12:00 onwards', title: 'Lunch & Leisure', desc: 'Enjoy lunch at the on-site restaurant (own expense) and explore the souvenir shops before departure.' },
      ],
      faqs: [
        { q: 'Is there a dress code?', a: 'Yes. Shoulders and knees must be covered. Sarongs and shawls are available to borrow free of charge at the entrance.' },
        { q: 'How long does a visit take?', a: 'Most visitors spend 2–3 hours. Allow extra time if you plan to watch the cultural show and take the boat ride.' },
        { q: 'Is it wheelchair accessible?', a: 'The ground floor and exterior are accessible. Upper floors involve steep wooden staircases and may not be suitable for mobility-impaired visitors.' },
        { q: 'Can I take photos inside?', a: 'Yes, photography is permitted throughout the sanctuary, including inside the temple halls.' },
        { q: 'What is the cancellation policy?', a: 'Free cancellation up to 24 hours before your visit date. No refund for same-day cancellations.' },
      ],
      packages: {
        create: [
          {
            name: 'Adult Ticket',
            description: 'Standard admission for one adult (12+ years). Includes temple access, boat ride, and cultural show.',
            adultPrice: 500,
            adultOriginal: 650,
            childPrice: 250,
            childOriginal: 325,
            infantPrice: 0,
            popular: true,
            badge: 'Best value',
            includes: ['Temple admission', 'Traditional boat ride', 'Cultural show'],
            isActive: true,
            sortOrder: 0,
          },
          {
            name: 'Premium Package',
            description: 'All-inclusive experience with elephant ride and priority entry.',
            adultPrice: 850,
            adultOriginal: 1100,
            childPrice: 425,
            childOriginal: 550,
            infantPrice: 0,
            popular: false,
            badge: 'Exclusive',
            includes: ['Temple admission', 'Traditional boat ride', 'Cultural show', 'Elephant ride', 'Priority entry'],
            isActive: true,
            sortOrder: 1,
          },
        ],
      },
    },
    include: { packages: true },
  });

  return NextResponse.json({ attraction });
}
