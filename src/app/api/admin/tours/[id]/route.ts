import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tour = await prisma.tour.findUnique({ where: { id: params.id } });
  if (!tour) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ tour });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, subtitle, location, cities, duration, maxGroupSize, languages,
            rating, reviewCount, category, badge, images, highlights, description,
            includes, excludes, itinerary, options, meetingPoint, importantInfo,
            reviews, isActive, sortOrder } = body;

    const tour = await prisma.tour.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ tour });
  } catch (err) {
    console.error('[admin/tours PUT]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.tour.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/tours DELETE]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
