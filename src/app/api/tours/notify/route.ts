import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  tourSlug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { email, tourSlug } = parsed.data;

  await prisma.tourNotifyRequest.create({
    data: { email: email.toLowerCase().trim(), tourSlug },
  });

  return NextResponse.json({ success: true });
}
