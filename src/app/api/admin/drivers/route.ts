export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const drivers = await prisma.driver.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      include: { vehicles: { where: { isActive: true } } },
    });
    return NextResponse.json({ drivers });
  } catch (err) {
    console.error('[admin/drivers] GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, phone, licenseNumber, languages, photoUrl, notes } = await req.json();
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const driver = await prisma.driver.create({
      data: {
        name: String(name).trim(),
        phone: String(phone).trim(),
        licenseNumber: licenseNumber || null,
        languages: Array.isArray(languages) ? languages : ['Thai'],
        photoUrl: photoUrl || null,
        notes: notes || null,
      },
    });
    return NextResponse.json({ driver }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes('Unique') ? 'Phone already registered' : 'Server error';
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
