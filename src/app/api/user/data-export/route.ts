export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

/**
 * GDPR Article 20 — Right to data portability.
 * Returns every piece of personal data we hold about the signed-in user
 * as a downloadable JSON file.
 */
export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, transferBookings, tourBookings, attractionBookings, loyaltyTransactions, savedRoutes, wishlist] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.id },
        select: {
          id: true, email: true, name: true, phone: true,
          loyaltyPoints: true, preferredPaymentMethod: true,
          whatsappOptOut: true, emailVerified: true, createdAt: true,
        },
      }),
      prisma.booking.findMany({
        where: { customerEmail: session.email },
        select: {
          bookingRef: true, pickupAddress: true, dropoffAddress: true,
          pickupDate: true, pickupTime: true, passengers: true, luggage: true,
          vehicleType: true, totalPrice: true, currentStatus: true,
          paymentStatus: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tourBooking.findMany({
        where: { userId: session.id },
        select: {
          bookingRef: true, tourTitle: true, bookingDate: true,
          adultQty: true, childQty: true, totalPrice: true,
          status: true, paymentStatus: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.attractionBooking.findMany({
        where: { userId: session.id },
        select: {
          bookingRef: true, attractionName: true, packageName: true,
          visitDate: true, adultQty: true, childQty: true, infantQty: true,
          totalPrice: true, status: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loyaltyTransaction.findMany({
        where: { userId: session.id },
        select: { points: true, type: true, description: true, bookingRef: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedRoute.findMany({
        where: { userId: session.id },
        select: { label: true, pickupAddress: true, dropoffAddress: true, vehicleType: true, createdAt: true },
      }),
      prisma.wishlistItem.findMany({
        where: { userId: session.id },
        select: { attractionId: true, attractionName: true, createdAt: true },
      }),
    ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportedBy: 'Werest Travel — GDPR data export (Article 20)',
    profile: user,
    transferBookings,
    tourBookings,
    attractionBookings,
    loyaltyTransactions,
    savedRoutes,
    wishlist,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type':        'application/json',
      'Content-Disposition': `attachment; filename="werest-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control':       'no-store',
    },
  });
}
