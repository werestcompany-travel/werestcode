export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';
import { getUserFromCookies } from '@/lib/user-auth';

const createReviewSchema = z.object({
  entityType: z.enum(['TOUR', 'ATTRACTION', 'TRANSFER']),
  entityId:   z.string().min(1).max(200),   // slug or ref
  entityName: z.string().min(1).max(200),
  rating:     z.number().int().min(1).max(5),
  title:      z.string().max(120).optional(),
  body:       z.string().min(10).max(2000),
  authorName: z.string().min(2).max(100),
  authorEmail: z.string().email().max(255),
});

// POST — submit a new review (goes into moderation queue)
export async function POST(req: NextRequest) {
  const ip = getIP(req);
  // Reuse booking rate limit: max 20 per hour per IP (reviews are rare)
  const rl = rateLimit(`review:${ip}`, LIMITS.booking);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Validation failed' }, { status: 400 });
  }

  const data = parsed.data;

  // Prevent duplicate review: same email + same entity within 7 days
  const recent = await prisma.review.findFirst({
    where: {
      authorEmail: data.authorEmail.toLowerCase(),
      entityType: data.entityType,
      entityId: data.entityId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) {
    return NextResponse.json({ error: 'You have already submitted a review for this recently.' }, { status: 409 });
  }

  // Try to verify: check if the email matches a booking for this entity
  let verified = false;
  if (data.entityType === 'TRANSFER') {
    const match = await prisma.booking.findFirst({
      where: { bookingRef: data.entityId, customerEmail: { equals: data.authorEmail, mode: 'insensitive' } },
    });
    verified = !!match;
  } else if (data.entityType === 'TOUR') {
    const match = await prisma.tourBooking.findFirst({
      where: { tourSlug: data.entityId, customerEmail: { equals: data.authorEmail, mode: 'insensitive' } },
    });
    verified = !!match;
  } else if (data.entityType === 'ATTRACTION') {
    const match = await prisma.attractionBooking.findFirst({
      where: { attractionId: data.entityId, customerEmail: { equals: data.authorEmail, mode: 'insensitive' } },
    });
    verified = !!match;
  }

  const session = await getUserFromCookies();

  const review = await prisma.review.create({
    data: {
      entityType:  data.entityType,
      entityId:    data.entityId,
      entityName:  data.entityName,
      rating:      data.rating,
      title:       data.title ?? null,
      body:        data.body,
      authorName:  data.authorName,
      authorEmail: data.authorEmail.toLowerCase(),
      verified,
      isPublished: false, // admin must approve
      userId:      session?.id ?? null,
    },
  });

  return NextResponse.json({ success: true, id: review.id, verified });
}

// GET — fetch published reviews for an entity
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entityType');
  const entityId   = searchParams.get('entityId');

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'entityType and entityId required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: {
      entityType: entityType as 'TOUR' | 'ATTRACTION' | 'TRANSFER',
      entityId,
      isPublished: true,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      authorName: true,
      verified: true,
      createdAt: true,
    },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return NextResponse.json({ reviews, avgRating, count: reviews.length });
}
