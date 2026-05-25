export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

const MAX_SAVED_ROUTES = 10;

// GET /api/user/saved-routes — list saved routes for logged-in user
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const routes = await prisma.savedRoute.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ routes });
}

// POST /api/user/saved-routes — save a new route
export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.savedRoute.count({ where: { userId: session.id } });
  if (existing >= MAX_SAVED_ROUTES) {
    return NextResponse.json(
      { error: `You can save a maximum of ${MAX_SAVED_ROUTES} routes. Please delete one to add a new one.` },
      { status: 400 },
    );
  }

  const body = await req.json();
  const { label, pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, vehicleType } = body;

  if (!label || !pickupAddress || !dropoffAddress) {
    return NextResponse.json(
      { error: 'label, pickupAddress, and dropoffAddress are required' },
      { status: 400 },
    );
  }

  const route = await prisma.savedRoute.create({
    data: {
      userId: session.id,
      label,
      pickupAddress,
      pickupLat: pickupLat ?? null,
      pickupLng: pickupLng ?? null,
      dropoffAddress,
      dropoffLat: dropoffLat ?? null,
      dropoffLng: dropoffLng ?? null,
      vehicleType: vehicleType ?? null,
    },
  });
  return NextResponse.json({ route }, { status: 201 });
}
