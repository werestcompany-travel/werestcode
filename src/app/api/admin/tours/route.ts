import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ tours });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, subtitle, location, cities, duration, maxGroupSize, languages,
            rating, reviewCount, category, badge, images, highlights, description,
            includes, excludes, itinerary, options, meetingPoint, importantInfo,
            reviews, isActive, sortOrder } = body;

    if (!title || !location || !category) {
      return NextResponse.json({ error: 'title, location, and category are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Ensure slug uniqueness
    let finalSlug  = slug;
    let suffix     = 1;
    while (await prisma.tour.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${suffix++}`;
    }

    const tour = await prisma.tour.create({
      data: {
        slug:         finalSlug,
        title,
        subtitle:     subtitle ?? null,
        location,
        cities:       Array.isArray(cities)    ? cities    : [],
        duration:     duration ?? '',
        maxGroupSize: parseInt(maxGroupSize)   || 15,
        languages:    Array.isArray(languages) ? languages : ['English'],
        rating:       parseFloat(rating)       || 5.0,
        reviewCount:  parseInt(reviewCount)    || 0,
        category,
        badge:        badge || null,
        images:       Array.isArray(images)    ? images    : [],
        highlights:   Array.isArray(highlights)? highlights: [],
        description:  description ?? '',
        includes:     Array.isArray(includes)  ? includes  : [],
        excludes:     Array.isArray(excludes)  ? excludes  : [],
        itinerary:    itinerary  ?? [],
        options:      options    ?? [],
        meetingPoint: meetingPoint ?? null,
        importantInfo: Array.isArray(importantInfo) ? importantInfo : [],
        reviews:      reviews    ?? [],
        isActive:     isActive   ?? true,
        sortOrder:    parseInt(sortOrder) || 0,
      },
    });

    return NextResponse.json({ tour }, { status: 201 });
  } catch (err) {
    console.error('[admin/tours POST]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
