export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const refund = await prisma.refund.findUnique({ where: { id: params.id } });
  if (!refund) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, refund });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const refund = await prisma.refund.findUnique({ where: { id: params.id } });
  if (!refund) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { action, notes } = body as { action: 'approve' | 'reject' | 'process'; notes?: string };

  let newStatus: string;
  let auditAction: string;

  if (action === 'approve') {
    if (refund.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only PENDING refunds can be approved' }, { status: 400 });
    }
    newStatus   = 'APPROVED';
    auditAction = AUDIT_ACTIONS.REFUND_APPROVE;
  } else if (action === 'reject') {
    if (refund.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only PENDING refunds can be rejected' }, { status: 400 });
    }
    newStatus   = 'REJECTED';
    auditAction = AUDIT_ACTIONS.REFUND_REJECT;
  } else if (action === 'process') {
    if (refund.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only APPROVED refunds can be processed' }, { status: 400 });
    }
    newStatus   = 'PROCESSED';
    auditAction = AUDIT_ACTIONS.REFUND_PROCESS;
  } else {
    return NextResponse.json({ error: 'Invalid action. Must be approve, reject, or process' }, { status: 400 });
  }

  const updated = await prisma.refund.update({
    where: { id: params.id },
    data: {
      status:      newStatus as 'APPROVED' | 'REJECTED' | 'PROCESSED',
      notes:       notes ?? refund.notes,
      ...(action === 'process' ? {
        processedBy: admin.name ?? admin.email,
        processedAt: new Date(),
      } : {}),
    },
  });

  await logAdminAction({
    adminId:    admin.id,
    adminEmail: admin.email,
    action:     auditAction,
    entityType: 'Refund',
    entityId:   refund.id,
    before:     { status: refund.status },
    after:      { status: newStatus, notes },
    req,
  });

  return NextResponse.json({ success: true, refund: updated });
}
