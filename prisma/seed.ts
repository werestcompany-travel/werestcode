import { PrismaClient, VehicleType } from '@prisma/client';
import bcrypt from 'bcryptjs';
// Capacity values are owned by vehicles.ts — keep in sync via this import
import { VEHICLE_CONFIGS } from '../src/lib/vehicles';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Pricing rules
  await prisma.pricingRule.deleteMany();
  await prisma.pricingRule.createMany({
    data: [
      {
        vehicleType:   VehicleType.SEDAN,
        name:          VEHICLE_CONFIGS.SEDAN.name,
        description:   VEHICLE_CONFIGS.SEDAN.description,
        maxPassengers: VEHICLE_CONFIGS.SEDAN.maxPassengers,
        maxLuggage:    VEHICLE_CONFIGS.SEDAN.maxLuggage,
        baseFare:      1200,
        pricePerKm:    0,
        imageUrl:      VEHICLE_CONFIGS.SEDAN.imageUrl,
        isActive:      true,
      },
      {
        vehicleType:   VehicleType.SUV,
        name:          VEHICLE_CONFIGS.SUV.name,
        description:   VEHICLE_CONFIGS.SUV.description,
        maxPassengers: VEHICLE_CONFIGS.SUV.maxPassengers,
        maxLuggage:    VEHICLE_CONFIGS.SUV.maxLuggage,
        baseFare:      1800,
        pricePerKm:    0,
        imageUrl:      VEHICLE_CONFIGS.SUV.imageUrl,
        isActive:      true,
      },
      {
        vehicleType:   VehicleType.MINIVAN,
        name:          VEHICLE_CONFIGS.MINIVAN.name,
        description:   VEHICLE_CONFIGS.MINIVAN.description,
        maxPassengers: VEHICLE_CONFIGS.MINIVAN.maxPassengers,
        maxLuggage:    VEHICLE_CONFIGS.MINIVAN.maxLuggage,
        baseFare:      2500,
        pricePerKm:    0,
        imageUrl:      VEHICLE_CONFIGS.MINIVAN.imageUrl,
        isActive:      true,
      },
    ],
  });

  // Add-ons — Child Seat only
  await prisma.addOn.deleteMany();
  await prisma.addOn.createMany({
    data: [
      {
        name: 'Child Seat',
        description: 'Certified child safety seat (up to 18 kg)',
        price: 300,
        icon: '🪑',
        isActive: true,
      },
    ],
  });

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@werest.com' },
    update: {},
    create: {
      email: 'admin@werest.com',
      password: adminPassword,
      name: 'Werest Admin',
      role: 'admin',
    },
  });

  // Sanctuary of Truth attraction
  const sanctuary = await prisma.attractionListing.upsert({
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
      badge: 'Hot deal',
      gradient: 'from-amber-700 to-yellow-500',
      emoji: '🛕',
      href: '/attractions/sanctuary-of-truth',
      isActive: true,
      sortOrder: 0,
      overview: '<p>The <strong>Sanctuary of Truth</strong> is a magnificent all-wood castle-temple standing 105 metres tall on the seafront of Pattaya.</p>',
      highlights: ['105-metre all-wooden castle', 'Over 40 years of ongoing hand-carving', 'Seafront location with panoramic Gulf of Thailand views', 'Traditional Thai boat rides included'],
      included: ['Admission ticket', 'Traditional Thai boat ride', 'Cultural show access'],
      excluded: ['Hotel pickup & drop-off', 'Food & beverages', 'Dolphin show'],
      infoItems: ['Open daily 08:00 – 17:00', 'Duration: 2–3 hours', 'Dress code: shoulders & knees covered'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80', alt: 'Sanctuary of Truth main facade' },
      ],
      expectSteps: [
        { icon: '🚌', time: '08:00 – 09:00', title: 'Arrival & Entrance', desc: 'Arrive and collect your tickets at the gate.' },
        { icon: '🛕', time: '09:00 – 11:00', title: 'Explore the Temple', desc: 'Walk through the four wings and admire thousands of hand-carved wooden sculptures.' },
        { icon: '⛵', time: '11:00 – 11:30', title: 'Traditional Boat Ride', desc: 'Cruise along the coastline for stunning views of the sanctuary from the sea.' },
      ],
      faqs: [
        { q: 'Is there a dress code?', a: 'Yes. Shoulders and knees must be covered. Sarongs are available at the entrance.' },
        { q: 'How long does a visit take?', a: 'Most visitors spend 2–3 hours.' },
      ],
    },
  });

  // Seed packages only if none exist
  const pkgCount = await prisma.attractionPackage.count({ where: { attractionId: sanctuary.id } });
  if (pkgCount === 0) {
    await prisma.attractionPackage.createMany({
      data: [
        {
          attractionId: sanctuary.id,
          name: 'Adult Ticket',
          description: 'Standard admission. Includes temple access, boat ride, and cultural show.',
          adultPrice: 500, adultOriginal: 650,
          childPrice: 250, childOriginal: 325,
          infantPrice: 0, popular: true, badge: 'Best value',
          includes: ['Temple admission', 'Traditional boat ride', 'Cultural show'],
          isActive: true, sortOrder: 0,
        },
        {
          attractionId: sanctuary.id,
          name: 'Premium Package',
          description: 'All-inclusive with elephant ride and priority entry.',
          adultPrice: 850, adultOriginal: 1100,
          childPrice: 425, childOriginal: 550,
          infantPrice: 0, popular: false, badge: 'Exclusive',
          includes: ['Temple admission', 'Traditional boat ride', 'Cultural show', 'Elephant ride', 'Priority entry'],
          isActive: true, sortOrder: 1,
        },
      ],
    });
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
