export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/user-auth';
import { prisma } from '@/lib/db';

const ANON_NAME  = 'Deleted User';
const ANON_PHONE = '';

/**
 * GDPR Article 17 — Right to erasure.
 *
 * Booking records are retained for legal/accounting purposes but fully
 * anonymized (name, email, phone scrubbed). The user row itself is hard
 * deleted, which cascades sessions, tokens, wishlist, saved routes,
 * loyalty transactions and push subscriptions.
 */
export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== 'DELETE') {
    return NextResponse.json(
      { error: 'Confirmation required. Send { "confirm": "DELETE" } to proceed.' },
      { status: 400 },
    );
  }

  const anonEmail = `deleted-${session.id}@anonymized.werest.com`;

  try {
    await prisma.$transaction([
      // Anonymize transfer bookings (matched by email — Booking has no userId)
      prisma.booking.updateMany({
        where: { customerEmail: session.email },
        data:  { customerName: ANON_NAME, customerEmail: anonEmail, customerPhone: ANON_PHONE, specialNotes: null },
      }),
      // Detach + anonymize tour bookings
      prisma.tourBooking.updateMany({
        where: { userId: session.id },
        data:  { userId: null, customerName: ANON_NAME, customerEmail: anonEmail, customerPhone: ANON_PHONE },
      }),
      // Detach + anonymize attraction bookings
      prisma.attractionBooking.updateMany({
        where: { userId: session.id },
        data:  { userId: null, customerName: ANON_NAME, customerEmail: anonEmail, customerPhone: ANON_PHONE },
      }),
      // Hard-delete the user — cascades sessions, tokens, wishlist,
      // saved routes, loyalty transactions, push subscriptions
      prisma.user.delete({ where: { id: session.id } }),
    ]);
  } catch (err) {
    console.error('[delete-account] failed:', err);
    return NextResponse.json({ error: 'Failed to delete account. Please contact support.' }, { status: 500 });
  }

  const res = NextResponse.json({ success: true, message: 'Your account and personal data have been deleted.' });
  res.cookies.set('user_token', '', { path: '/', maxAge: 0 });
  return res;
}
