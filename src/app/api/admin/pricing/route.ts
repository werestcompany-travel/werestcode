export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rules = await prisma.pricingRule.findMany({ orderBy: { vehicleType: 'asc' } });
  return NextResponse.json({ success: true, rules });
}
