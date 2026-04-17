import { PrismaClient, VehicleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Pricing rules
  await prisma.pricingRule.deleteMany();
  await prisma.pricingRule.createMany({
    data: [
      {
        vehicleType: VehicleType.SEDAN,
        name: 'Sedan',
        description: 'Toyota Camry or similar – perfect for couples and solo travellers',
        maxPassengers: 3,
        maxLuggage: 3,
        baseFare: 1200,
        pricePerKm: 0,
        imageUrl: '/images/sedan.png',
        isActive: true,
      },
      {
        vehicleType: VehicleType.SUV,
        name: 'SUV',
        description: 'Toyota Fortuner or similar – spacious for small families',
        maxPassengers: 6,
        maxLuggage: 5,
        baseFare: 1800,
        pricePerKm: 0,
        imageUrl: '/images/suv.png',
        isActive: true,
      },
      {
        vehicleType: VehicleType.MINIVAN,
        name: 'Minivan',
        description: 'Toyota Commuter or similar – best for groups and large luggage',
        maxPassengers: 10,
        maxLuggage: 10,
        baseFare: 2500,
        pricePerKm: 0,
        imageUrl: '/images/minivan.png',
        isActive: true,
      },
    ],
  });

  // Add-ons
  await prisma.addOn.deleteMany();
  await prisma.addOn.createMany({
    data: [
      {
        name: 'Child Seat',
        description: 'Certified child safety seat (up to 18 kg)',
        price: 200,
        icon: '🪑',
        isActive: true,
      },
      {
        name: 'Extra Stop',
        description: 'One additional stop along the route (up to 15 min)',
        price: 150,
        icon: '📍',
        isActive: true,
      },
      {
        name: 'Meet & Greet',
        description: 'Driver will meet you inside the terminal with a name sign',
        price: 300,
        icon: '🪧',
        isActive: true,
      },
      {
        name: 'Waiting Time (1hr)',
        description: 'Driver waits up to 1 hour beyond scheduled pickup',
        price: 250,
        icon: '⏳',
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

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
