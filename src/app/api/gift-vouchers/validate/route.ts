export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Rate limit: 10 voucher checks per 15 minutes — prevents brute-force code enumeration
  const ip = getIP(req);
  const rl = await rateLimitAsync(`giftVoucher:${ip}`, LIMITS.giftVoucher);
  if (!rl.allowed) {
    return NextResponse.json({ valid: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false, message: 'Code required' });
  const voucher = await prisma.giftVoucher.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!voucher)          return NextResponse.json({ valid: false, message: 'Invalid gift voucher code' });
  if (!voucher.isActive) return NextResponse.json({ valid: false, message: 'This voucher is no longer active' });
  if (voucher.isUsed)    return NextResponse.json({ valid: false, message: 'This voucher has already been used' });
  if (voucher.expiresAt && new Date() > voucher.expiresAt) {
    return NextResponse.json({ valid: false, message: 'This voucher has expired' });
  }
  return NextResponse.json({
    valid: true,
    value: voucher.value,
    code: voucher.code,
    recipientName: voucher.recipientName,
    message: 'Gift voucher applied!',
  });
}
