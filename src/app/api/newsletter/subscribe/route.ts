import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  // Rate limit: 3 signups per hour per IP (uses Redis when available, in-memory fallback)
  const ip = getIP(req);
  const rl = await rateLimitAsync(`newsletter:${ip}`, LIMITS.newsletter);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

  const { email } = parsed.data;

  try {
    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase().trim(), source: 'website' },
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    // Unique constraint = already subscribed
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
    }
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
