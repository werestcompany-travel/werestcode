import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { discountCodeSchema } from '@/lib/validation/booking';
import { rateLimit, getIP, LIMITS } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = rateLimit(`discount:${ip}`, LIMITS.discountCode);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = discountCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const { code, orderAmount = 0 } = parsed.data;
    const customerEmail: string | undefined = typeof body.customerEmail === 'string' && body.customerEmail.trim()
      ? body.customerEmail.trim()
      : undefined;

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!discount || !discount.isActive)
      return NextResponse.json({ valid: false, error: 'Invalid discount code' });
    if (discount.expiresAt && discount.expiresAt < new Date())
      return NextResponse.json({ valid: false, error: 'Discount code has expired' });
    if (discount.maxUses && discount.usedCount >= discount.maxUses)
      return NextResponse.json({ valid: false, error: 'Discount code usage limit reached' });
    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount)
      return NextResponse.json({ valid: false, error: `Minimum order ฿${discount.minOrderAmount.toLocaleString()}` });

    // newUserOnly check — skip if no customerEmail provided (guest)
    if (discount.newUserOnly && customerEmail) {
      const priorBookings = await prisma.booking.count({
        where: { customerEmail, currentStatus: { not: 'CANCELLED' } },
      });
      if (priorBookings > 0) {
        return NextResponse.json({ valid: false, error: 'This code is for new customers only' }, { status: 400 });
      }
    }

    // perUserLimit check — skip if no customerEmail provided (guest)
    if (discount.perUserLimit !== null && customerEmail) {
      const timesUsed = await prisma.discountRedemption.count({
        where: { discountCodeId: discount.id, customerEmail },
      });
      if (timesUsed >= discount.perUserLimit) {
        return NextResponse.json({ valid: false, error: 'You have already used this discount code' }, { status: 400 });
      }
    }

    const discountAmount = discount.type === 'PERCENTAGE'
      ? Math.round(orderAmount * discount.value / 100)
      : discount.value;

    return NextResponse.json({
      valid: true,
      discount: { id: discount.id, code: discount.code, type: discount.type, value: discount.value, discountAmount },
    });
  } catch (e) {
    console.error('[discount-codes/validate]', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
