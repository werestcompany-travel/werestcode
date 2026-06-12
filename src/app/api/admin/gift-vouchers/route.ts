export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'GV-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const vouchers   = await prisma.giftVoucher.findMany({ orderBy: { createdAt: 'desc' } });
  const total      = vouchers.length;
  const active     = vouchers.filter(v => v.isActive && !v.isUsed).length;
  const used       = vouchers.filter(v => v.isUsed).length;
  const totalValue = vouchers.filter(v => !v.isUsed && v.isActive).reduce((s, v) => s + v.value, 0);
  return NextResponse.json({ success: true, vouchers, stats: { total, active, used, totalValue } });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { value, recipientName, recipientEmail, purchaserEmail, message, expiresAt } = body;
  if (!value) return NextResponse.json({ error: 'value required' }, { status: 400 });
  const code = genCode();
  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      value: Number(value),
      recipientName:  recipientName  || null,
      recipientEmail: recipientEmail || null,
      purchaserEmail: purchaserEmail || null,
      message:        message        || null,
      expiresAt:      expiresAt ? new Date(expiresAt) : null,
    },
  });
  return NextResponse.json({ success: true, voucher });
}
