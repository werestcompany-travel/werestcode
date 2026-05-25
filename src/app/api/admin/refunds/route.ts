export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit  = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? '50')));
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;
  if (search)  where.bookingRef = { contains: search, mode: 'insensitive' };

  const skip = (page - 1) * limit;

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.refund.count({ where }),
  ]);

  // Status counts
  const counts = await prisma.refund.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  const statusCounts: Record<string, number> = { PENDING: 0, APPROVED: 0, PROCESSED: 0, REJECTED: 0 };
  for (const c of counts) statusCounts[c.status] = c._count.status;

  return NextResponse.json({
    success: true,
    data: { refunds, total, page, limit, pages: Math.ceil(total / limit), statusCounts },
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { bookingRef, bookingType, bookingId, amount, reason } = body;

  if (!bookingRef || !bookingType || !bookingId || !amount || !reason) {
    return NextResponse.json({ error: 'bookingRef, bookingType, bookingId, amount, and reason are required' }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
  }

  const refund = await prisma.refund.create({
    data: {
      bookingRef,
      bookingType,
      bookingId,
      amount:  Number(amount),
      reason,
      status:  'PENDING',
    },
  });

  await logAdminAction({
    adminId:    admin.id,
    adminEmail: admin.email,
    action:     AUDIT_ACTIONS.REFUND_CREATE,
    entityType: 'Refund',
    entityId:   refund.id,
    after:      { bookingRef, bookingType, bookingId, amount: Number(amount), reason },
    req,
  });

  return NextResponse.json({ success: true, refund }, { status: 201 });
}
