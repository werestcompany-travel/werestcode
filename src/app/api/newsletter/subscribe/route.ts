import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

// Simple in-request rate limit check (IP-based, best-effort)
const recentRequests = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();
  const recent = (recentRequests.get(ip) ?? []).filter(t => now - t < 60 * 60 * 1000);
  if (recent.length >= 3) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  recentRequests.set(ip, [...recent, now]);

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
