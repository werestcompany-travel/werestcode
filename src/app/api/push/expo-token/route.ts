import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromCookies } from '@/lib/user-auth';

export async function POST(req: NextRequest) {
  try {
    const { token, platform } = await req.json() as { token?: string; platform?: string };
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const user = await getUserFromCookies();

    await prisma.expoToken.upsert({
      where:  { token },
      create: { token, platform: platform ?? 'unknown', userId: user?.id ?? null },
      update: { platform: platform ?? 'unknown', userId: user?.id ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[push/expo-token] POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
