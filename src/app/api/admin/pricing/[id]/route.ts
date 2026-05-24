export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { baseFare, pricePerKm, maxPassengers, maxLuggage, isActive } = body;
  const rule = await prisma.pricingRule.update({
    where: { id: params.id },
    data: {
      ...(baseFare      !== undefined && { baseFare:      Number(baseFare) }),
      ...(pricePerKm    !== undefined && { pricePerKm:    Number(pricePerKm) }),
      ...(maxPassengers !== undefined && { maxPassengers: Number(maxPassengers) }),
      ...(maxLuggage    !== undefined && { maxLuggage:    Number(maxLuggage) }),
      ...(isActive      !== undefined && { isActive }),
    },
  });
  return NextResponse.json({ success: true, rule });
}
