export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

// GET ?ref=XXX&token=XXX — customer accepts a quote
// Token = SHA-256(ref + QUOTE_SECRET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref   = searchParams.get('ref');
  const token = searchParams.get('token');

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

  if (!ref || !token) {
    return NextResponse.redirect(new URL('/contact?error=invalid_link', APP_URL));
  }

  // Validate token
  const secret   = process.env.QUOTE_SECRET ?? 'werest-quote-secret';
  const expected = createHash('sha256').update(ref + secret).digest('hex');

  if (token !== expected) {
    return NextResponse.redirect(new URL('/contact?error=invalid_token', APP_URL));
  }

  // Look up inquiry
  const inquiry = await prisma.inquiry.findUnique({ where: { ref } });
  if (!inquiry) {
    return NextResponse.redirect(new URL('/contact?error=not_found', APP_URL));
  }

  // Only allow accepting QUOTED inquiries
  if (inquiry.status !== 'QUOTED') {
    // Already confirmed or in another state — redirect gracefully
    return NextResponse.redirect(
      new URL(`/contact?ref=${encodeURIComponent(ref)}&status=${inquiry.status}`, APP_URL),
    );
  }

  // Confirm the inquiry
  await prisma.inquiry.update({
    where: { ref },
    data: {
      status: 'CONFIRMED',
      lastContactedAt: new Date(),
    },
  });

  // Redirect to contact page with success message
  return NextResponse.redirect(
    new URL(`/contact?accepted=1&ref=${encodeURIComponent(ref)}`, APP_URL),
  );
}
