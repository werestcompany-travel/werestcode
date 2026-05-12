export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// GET — single inquiry
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: params.id } });
    if (!inquiry) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, inquiry });
  } catch (err) {
    console.error('[admin/inquiries/[id]] GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update status and/or adminNotes
// Sets lastContactedAt when status changes to CONTACTED
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: { status?: string; adminNotes?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const validStatuses = ['NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'CANCELLED'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Check current status to detect CONTACTED transition
    const current = await prisma.inquiry.findUnique({
      where: { id: params.id },
      select: { status: true },
    });
    if (!current) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const isContactedTransition = body.status === 'CONTACTED' && current.status !== 'CONTACTED';

    const updated = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        ...(body.status
          ? { status: body.status as 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'CANCELLED' }
          : {}),
        ...(body.adminNotes !== undefined ? { adminNotes: body.adminNotes } : {}),
        ...(isContactedTransition ? { lastContactedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err) {
    console.error('[admin/inquiries/[id]] PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
