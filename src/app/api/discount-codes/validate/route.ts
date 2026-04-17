import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  const { code, orderAmount = 0 } = await req.json();
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const discount = await prisma.discountCode.findUnique({
    where: { code: (code as string).toUpperCase().trim() },
  });

  if (!discount || !discount.isActive)
    return NextResponse.json({ valid: false, error: 'Invalid discount code' });
  if (discount.expiresAt && discount.expiresAt < new Date())
    return NextResponse.json({ valid: false, error: 'Discount code has expired' });
  if (discount.maxUses && discount.usedCount >= discount.maxUses)
    return NextResponse.json({ valid: false, error: 'Discount code usage limit reached' });
  if (discount.minOrderAmount && orderAmount < discount.minOrderAmount)
    return NextResponse.json({ valid: false, error: `Minimum order ฿${discount.minOrderAmount.toLocaleString()}` });

  const discountAmount = discount.type === 'PERCENTAGE'
    ? Math.round(orderAmount * discount.value / 100)
    : discount.value;

  return NextResponse.json({
    valid: true,
    discount: { id: discount.id, code: discount.code, type: discount.type, value: discount.value, discountAmount },
  });
}
