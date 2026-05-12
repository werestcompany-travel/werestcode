import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
  const now = new Date();
  const stats = {
    total:   codes.length,
    active:  codes.filter(c => c.isActive && (!c.expiresAt || c.expiresAt > now)).length,
    expired: codes.filter(c => c.expiresAt && c.expiresAt <= now).length,
  };
  return NextResponse.json({ codes, stats });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, type, value, description, minOrderAmount, maxUses, expiresAt, isActive, newUserOnly, perUserLimit } = await req.json();
  if (!code || !type || value == null)
    return NextResponse.json({ error: 'Code, type and value are required' }, { status: 400 });

  try {
    const discount = await prisma.discountCode.create({
      data: {
        code: (code as string).toUpperCase().trim(),
        type,
        value: Number(value),
        description: description || null,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
        newUserOnly: newUserOnly === true,
        perUserLimit: perUserLimit ? Number(perUserLimit) : null,
      },
    });
    return NextResponse.json({ discount }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Code already exists or save failed' }, { status: 409 });
  }
}
