export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// ── GET /api/admin/pricing/dynamic ────────────────────────────────────────────
export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await prisma.dynamicPricingRule.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json({ success: true, rules });
}

// ── POST /api/admin/pricing/dynamic ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const {
    name,
    description,
    ruleType,
    vehicleType,
    multiplier,
    flatAmount,
    daysOfWeek,
    startHour,
    endHour,
    startDate,
    endDate,
    pickupKeyword,
    dropoffKeyword,
    isActive,
    priority,
  } = body;

  if (!name || !ruleType) {
    return NextResponse.json({ error: 'name and ruleType are required' }, { status: 400 });
  }

  const VALID_TYPES = ['SURGE', 'DISCOUNT', 'FIXED_SURCHARGE'];
  if (!VALID_TYPES.includes(ruleType)) {
    return NextResponse.json({ error: `ruleType must be one of ${VALID_TYPES.join(', ')}` }, { status: 400 });
  }

  const rule = await prisma.dynamicPricingRule.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      ruleType: String(ruleType),
      vehicleType: vehicleType && vehicleType !== 'ALL' ? vehicleType : null,
      multiplier: multiplier !== undefined ? Number(multiplier) : 1.0,
      flatAmount: flatAmount !== undefined && flatAmount !== '' ? Number(flatAmount) : null,
      daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [],
      startHour: startHour !== undefined && startHour !== '' ? Number(startHour) : null,
      endHour: endHour !== undefined && endHour !== '' ? Number(endHour) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      pickupKeyword: pickupKeyword ? String(pickupKeyword).trim() : null,
      dropoffKeyword: dropoffKeyword ? String(dropoffKeyword).trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      priority: priority !== undefined ? Number(priority) : 0,
    },
  });

  return NextResponse.json({ success: true, rule }, { status: 201 });
}
