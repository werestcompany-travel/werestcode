export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page       = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit      = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? '50')));
  const action     = searchParams.get('action') || undefined;
  const entityType = searchParams.get('entityType') || undefined;
  const adminId    = searchParams.get('adminId') || undefined;
  const dateFrom   = searchParams.get('dateFrom') || undefined;
  const dateTo     = searchParams.get('dateTo') || undefined;
  const exportCsv  = searchParams.get('export') === 'csv';

  const where: Record<string, unknown> = {};
  if (action)     where.action = action;
  if (entityType) where.entityType = entityType;
  if (adminId)    where.adminId = adminId;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
    };
  }

  if (exportCsv) {
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const header = 'Timestamp,Admin Email,Admin ID,Action,Entity Type,Entity ID,IP\n';
    const rows = logs.map(l =>
      [
        l.createdAt.toISOString(),
        `"${l.adminEmail}"`,
        l.adminId,
        l.action,
        l.entityType,
        l.entityId ?? '',
        l.ip ?? '',
      ].join(',')
    ).join('\n');

    return new NextResponse(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${Date.now()}.csv"`,
      },
    });
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { logs, total, page, limit, pages: Math.ceil(total / limit) },
  });
}
