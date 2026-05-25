export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateTOTPSecret, encryptSecret } from '@/lib/totp';

// POST /api/admin/2fa/setup
// Generates a new TOTP secret for the authenticated admin and stores it (encrypted).
// Does NOT enable 2FA — the admin must call /enable with a valid token first.
export async function POST(_req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminRecord = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!adminRecord) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    const { secret, otpauthUrl } = generateTOTPSecret(admin.email);
    const encryptedSecret = encryptSecret(secret);

    // Store the (unconfirmed) secret; totpEnabled remains false until /enable verifies
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { totpSecret: encryptedSecret },
    });

    return NextResponse.json({
      success: true,
      data: { otpauthUrl, secret },
    });
  } catch (err) {
    console.error('[admin/2fa/setup] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
