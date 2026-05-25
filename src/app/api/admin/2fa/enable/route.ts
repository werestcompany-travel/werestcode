export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { decryptSecret, verifyTOTP, generateBackupCodes } from '@/lib/totp';

// POST /api/admin/2fa/enable  body: { token: string }
// Verifies the TOTP token against the stored (unconfirmed) secret.
// On success: sets totpEnabled=true and generates backup codes.
// Returns raw backup codes exactly once — they are NOT stored in plain text.
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { token } = body as { token?: string };
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 });
    }

    const adminRecord = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!adminRecord) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    if (!adminRecord.totpSecret) {
      return NextResponse.json(
        { success: false, error: 'No TOTP secret found. Call /api/admin/2fa/setup first.' },
        { status: 400 },
      );
    }

    if (adminRecord.totpEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA is already enabled.' },
        { status: 409 },
      );
    }

    const decrypted = decryptSecret(adminRecord.totpSecret);
    if (!verifyTOTP(decrypted, token)) {
      return NextResponse.json({ success: false, error: 'Invalid TOTP token' }, { status: 400 });
    }

    // Generate backup codes
    const { raw, hashed } = await generateBackupCodes();

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { totpEnabled: true, backupCodes: hashed },
    });

    return NextResponse.json({
      success: true,
      data: {
        backupCodes: raw, // shown once only — user must save these
        message: 'Two-factor authentication has been enabled.',
      },
    });
  } catch (err) {
    console.error('[admin/2fa/enable] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
