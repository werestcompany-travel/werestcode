import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = await rateLimitAsync(`push:${ip}`, LIMITS.push);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    const { endpoint, p256dh, auth } = await req.json() as { endpoint?: string; p256dh?: string; auth?: string };
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await getUserFromCookies();

    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      create: { endpoint, p256dh, auth, userId: user?.id ?? null },
      update: { p256dh, auth, userId: user?.id ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[push/subscribe] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json() as { endpoint?: string };
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[push/subscribe] DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
