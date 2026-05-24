import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createDriverToken } from '@/lib/driver-auth';

// ─── Simple in-memory rate limiter: 5 attempts per 15 min per IP ──────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

// ─── POST /api/driver/auth ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '127.0.0.1';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { phone } = body as { phone?: string };

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 },
      );
    }

    // Normalise phone: strip spaces/dashes, ensure it starts with +
    const normalised = phone.replace(/[\s\-]/g, '');

    const driver = await prisma.driver.findFirst({
      where: { phone: normalised },
      select: { id: true, name: true, isActive: true },
    });

    if (!driver) {
      return NextResponse.json(
        { success: false, error: 'No driver account found with this phone number.' },
        { status: 401 },
      );
    }

    if (!driver.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your driver account is inactive. Please contact support.' },
        { status: 401 },
      );
    }

    const token = await createDriverToken(driver.id);

    return NextResponse.json({
      success: true,
      data: { token, driverName: driver.name },
    });
  } catch (err) {
    console.error('[driver/auth] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
