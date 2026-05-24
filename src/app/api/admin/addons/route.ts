export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const addons = await prisma.addOn.findMany({ orderBy: { name: 'asc' } });
  const total  = addons.length;
  const active = addons.filter(a => a.isActive).length;
  return NextResponse.json({ success: true, addons, stats: { total, active } });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, description, price, icon, isActive } = await req.json();
  if (!name || price === undefined) return NextResponse.json({ error: 'name and price required' }, { status: 400 });
  const addon = await prisma.addOn.create({
    data: {
      name,
      description: description ?? '',
      price: Number(price),
      icon: icon ?? null,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json({ success: true, addon });
}
