import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [vehicles, addOns] = await Promise.all([
      prisma.pricingRule.findMany({ where: { isActive: true }, orderBy: { baseFare: 'asc' } }),
      prisma.addOn.findMany({ where: { isActive: true } }),
    ]);

    return NextResponse.json({ success: true, vehicles, addOns });
  } catch (err) {
    console.error('[pricing] GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
