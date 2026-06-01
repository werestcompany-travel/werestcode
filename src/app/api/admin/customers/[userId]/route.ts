import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      tourBookings:        { orderBy: { createdAt: 'desc' } },
      attractionBookings:  { orderBy: { createdAt: 'desc' } },
      loyaltyTransactions: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Also fetch transfer bookings by customerEmail
  const transferBookings = await prisma.booking.findMany({
    where: { customerEmail: user.email },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ user, transferBookings });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.adminNotes !== undefined) {
    // Save admin notes — stored in a dedicated AdminNote model or as a JSON note
    // Using a simple approach: store as a loyalty transaction note with type ADJUST 0 pts
    // if adminNotes field exists on User, update it directly
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await (prisma.user as any).update({
        where: { id: params.userId },
        data: { adminNotes: body.adminNotes },
      });
      return NextResponse.json({ user: updated });
    } catch {
      return NextResponse.json({ error: 'adminNotes field not yet in DB schema' }, { status: 400 });
    }
  }

  if (body.points !== undefined && body.description) {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.loyaltyTransaction.create({
        data: {
          userId:      params.userId,
          points:      body.points,
          type:        'ADJUST',
          description: body.description,
        },
      });
      return tx.user.update({
        where: { id: params.userId },
        data:  { loyaltyPoints: { increment: body.points } },
      });
    });
    return NextResponse.json({ user: updated });
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
}
