/**
 * Seeds the Tour table from the hardcoded lib/tours.ts catalogue.
 * Run once after adding the Tour model:
 *   npx tsx prisma/seed-tours.ts
 */
import { PrismaClient } from '@prisma/client';
import { tours as TOURS } from '../src/lib/tours';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tours…');
  for (const tour of TOURS) {
    await prisma.tour.upsert({
      where:  { slug: tour.slug },
      update: {},
      create: {
        slug:         tour.slug,
        title:        tour.title,
        subtitle:     tour.subtitle,
        location:     tour.location,
        cities:       tour.cities,
        duration:     tour.duration,
        maxGroupSize: tour.maxGroupSize,
        languages:    tour.languages,
        rating:       tour.rating,
        reviewCount:  tour.reviewCount,
        category:     tour.category,
        badge:        tour.badge ?? null,
        images:       tour.images,
        highlights:   tour.highlights,
        description:  tour.description,
        includes:     tour.includes,
        excludes:     tour.excludes,
        itinerary:    tour.itinerary as object[],
        options:      tour.options   as object[],
        meetingPoint: tour.meetingPoint,
        importantInfo: tour.importantInfo,
        reviews:      tour.reviews   as object[],
        isActive:     true,
        sortOrder:    TOURS.indexOf(tour),
      },
    });
    console.log(`  ✓ ${tour.slug}`);
  }
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
