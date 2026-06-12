export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// ── PUT /api/admin/pricing/dynamic/[id] ───────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const existing = await prisma.dynamicPricingRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

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

  if (ruleType) {
    const VALID_TYPES = ['SURGE', 'DISCOUNT', 'FIXED_SURCHARGE'];
    if (!VALID_TYPES.includes(ruleType)) {
      return NextResponse.json({ error: `ruleType must be one of ${VALID_TYPES.join(', ')}` }, { status: 400 });
    }
  }

  const rule = await prisma.dynamicPricingRule.update({
    where: { id },
    data: {
      ...(name !== undefined        && { name: String(name).trim() }),
      ...(description !== undefined && { description: description ? String(description).trim() : null }),
      ...(ruleType !== undefined    && { ruleType: String(ruleType) }),
      ...(vehicleType !== undefined && { vehicleType: vehicleType && vehicleType !== 'ALL' ? vehicleType : null }),
      ...(multiplier !== undefined  && { multiplier: Number(multiplier) }),
      ...(flatAmount !== undefined  && { flatAmount: flatAmount !== '' && flatAmount !== null ? Number(flatAmount) : null }),
      ...(daysOfWeek !== undefined  && { daysOfWeek: Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [] }),
      ...(startHour !== undefined   && { startHour: startHour !== '' && startHour !== null ? Number(startHour) : null }),
      ...(endHour !== undefined     && { endHour: endHour !== '' && endHour !== null ? Number(endHour) : null }),
      ...(startDate !== undefined   && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined     && { endDate: endDate ? new Date(endDate) : null }),
      ...(pickupKeyword !== undefined  && { pickupKeyword: pickupKeyword ? String(pickupKeyword).trim() : null }),
      ...(dropoffKeyword !== undefined && { dropoffKeyword: dropoffKeyword ? String(dropoffKeyword).trim() : null }),
      ...(isActive !== undefined    && { isActive: Boolean(isActive) }),
      ...(priority !== undefined    && { priority: Number(priority) }),
    },
  });

  return NextResponse.json({ success: true, rule });
}

// ── DELETE /api/admin/pricing/dynamic/[id] ────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const existing = await prisma.dynamicPricingRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

  await prisma.dynamicPricingRule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
