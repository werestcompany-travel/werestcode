export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { decryptSecret, verifyTOTP } from '@/lib/totp';
import bcrypt from 'bcryptjs';

// POST /api/admin/2fa/disable  body: { token: string, password: string }
// Requires both a valid TOTP token AND the admin's password.
// Clears totpSecret, totpEnabled, and backupCodes.
export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { token, password } = body as { token?: string; password?: string };

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'token and password are required' },
        { status: 400 },
      );
    }

    const adminRecord = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!adminRecord) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    if (!adminRecord.totpEnabled || !adminRecord.totpSecret) {
      return NextResponse.json({ success: false, error: '2FA is not enabled.' }, { status: 400 });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, adminRecord.password);
    if (!passwordValid) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    // Verify TOTP token
    const decryptedSecret = decryptSecret(adminRecord.totpSecret);
    if (!verifyTOTP(decryptedSecret, token)) {
      return NextResponse.json({ success: false, error: 'Invalid TOTP token' }, { status: 401 });
    }

    // Disable 2FA and clear all related fields
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
        backupCodes: [],
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Two-factor authentication has been disabled.' },
    });
  } catch (err) {
    console.error('[admin/2fa/disable] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
