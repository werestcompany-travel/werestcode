export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { sendQuoteEmail } from '@/lib/email';

// POST — admin creates and sends a quote for an inquiry
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    lineItems: Array<{ description: string; unitPrice: number; qty: number }>;
    totalAmount: number;
    validDays?: number;
    notes?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Basic validation
  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return NextResponse.json({ success: false, error: 'lineItems is required' }, { status: 400 });
  }
  if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
    return NextResponse.json({ success: false, error: 'totalAmount must be a positive number' }, { status: 400 });
  }

  const validDays = body.validDays ?? 7;
  const validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

  // Load inquiry
  const inquiry = await prisma.inquiry.findUnique({ where: { id: params.id } });
  if (!inquiry) {
    return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
  }

  // Build accept token: SHA-256(ref + QUOTE_SECRET)
  const secret = process.env.QUOTE_SECRET ?? 'werest-quote-secret';
  const token = createHash('sha256').update(inquiry.ref + secret).digest('hex');

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gowerest.com';
  const acceptUrl = `${APP_URL}/api/inquiries/accept?ref=${encodeURIComponent(inquiry.ref)}&token=${token}`;

  // Store quote data in adminNotes as JSON (preserve any existing notes as prefix)
  const quotePayload = {
    __quote: true,
    lineItems: body.lineItems,
    totalAmount: body.totalAmount,
    validDays,
    validUntil: validUntil.toISOString(),
    notes: body.notes ?? null,
    sentAt: new Date().toISOString(),
    sentBy: typeof admin === 'object' && admin !== null && 'email' in admin
      ? (admin as { email: string }).email
      : 'admin',
  };

  const updatedNotes = JSON.stringify(quotePayload);

  const updated = await prisma.inquiry.update({
    where: { id: params.id },
    data: {
      status: 'QUOTED',
      adminNotes: updatedNotes,
      lastContactedAt: new Date(),
    },
  });

  // Send quote email to customer
  try {
    await sendQuoteEmail({
      to: inquiry.email,
      name: inquiry.fullName,
      inquiryRef: inquiry.ref,
      lineItems: body.lineItems,
      totalAmount: body.totalAmount,
      validUntil,
      acceptUrl,
      notes: body.notes,
    });
  } catch (err) {
    console.error('[admin/inquiries/[id]/quote] sendQuoteEmail failed:', err);
    // Don't fail the request — quote is saved, email failure is non-critical
  }

  return NextResponse.json({ success: true, inquiry: updated });
}
