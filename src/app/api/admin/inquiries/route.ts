export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// GET — list all inquiries with optional search/status filter
export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status')?.trim() ?? '';

  try {
    const inquiries = await prisma.inquiry.findMany({
      where: {
        ...(status && status !== 'ALL'
          ? { status: status as 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'CANCELLED' }
          : {}),
        ...(search
          ? {
              OR: [
                { fullName:    { contains: search, mode: 'insensitive' } },
                { email:       { contains: search, mode: 'insensitive' } },
                { destination: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (err) {
    console.error('[admin/inquiries] GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
