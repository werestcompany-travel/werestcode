import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDriverToken, getDriverTokenFromRequest } from '@/lib/driver-auth';

// ─── GET /api/driver/me — return driver profile ───────────────────────────────

export async function GET(req: NextRequest) {
  const raw = getDriverTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const driver = await verifyDriverToken(raw);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const full = await prisma.driver.findUnique({
      where: { id: driver.id },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        isOnline: true,
        rating: true,
        totalTrips: true,
        photoUrl: true,
      },
    });

    if (!full) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: full });
  } catch (err) {
    console.error('[driver/me] GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// ─── PATCH /api/driver/me — toggle online status ──────────────────────────────

export async function PATCH(req: NextRequest) {
  const raw = getDriverTokenFromRequest(req);
  if (!raw) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const driver = await verifyDriverToken(raw);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isOnline } = body as { isOnline?: boolean };

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isOnline (boolean) is required' },
        { status: 400 },
      );
    }

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { isOnline },
      select: { id: true, name: true, isOnline: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[driver/me] PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
