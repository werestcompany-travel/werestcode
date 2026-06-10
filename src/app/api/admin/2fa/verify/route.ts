export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signAdminToken } from '@/lib/auth';
import { decryptSecret, verifyTOTP, verifyBackupCode } from '@/lib/totp';
import { rateLimitAsync, getIP } from '@/lib/rate-limit';

// POST /api/admin/2fa/verify  body: { token: string, useBackup?: boolean }
// Called as step 2 of admin login when 2FA is required.
// Reads the pending_2fa_admin_id cookie (set in step 1), verifies the code,
// then issues the full admin_token and clears the pending cookie.
export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const rl = await rateLimitAsync(`2fa-verify:${ip}`, { limit: 5, windowSec: 300 });
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429 });

  const pendingAdminId = req.cookies.get('pending_2fa_admin_id')?.value;
  if (!pendingAdminId) {
    return NextResponse.json(
      { success: false, error: 'No pending 2FA session. Please log in again.' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { token, useBackup } = body as { token?: string; useBackup?: boolean };

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 });
    }

    const adminRecord = await prisma.adminUser.findUnique({ where: { id: pendingAdminId } });
    if (!adminRecord) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    if (!adminRecord.totpEnabled || !adminRecord.totpSecret) {
      return NextResponse.json(
        { success: false, error: '2FA is not configured for this account.' },
        { status: 400 },
      );
    }

    const decryptedSecret = decryptSecret(adminRecord.totpSecret);
    let verified = false;

    if (useBackup) {
      // Verify against backup codes
      const { valid, index } = await verifyBackupCode(token.toUpperCase(), adminRecord.backupCodes);
      if (valid && index !== -1) {
        // Remove used backup code
        const updatedCodes = [...adminRecord.backupCodes];
        updatedCodes.splice(index, 1);
        await prisma.adminUser.update({
          where: { id: pendingAdminId },
          data: { backupCodes: updatedCodes },
        });
        verified = true;
      }
    } else {
      verified = verifyTOTP(decryptedSecret, token);
    }

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 401 });
    }

    // Issue the full admin token
    const adminToken = await signAdminToken({
      id: adminRecord.id,
      email: adminRecord.email,
      name: adminRecord.name,
      role: adminRecord.role,
    });

    const res = NextResponse.json({
      success: true,
      data: { name: adminRecord.name },
    });

    // Set the real admin session cookie
    res.cookies.set('admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    // Clear the pending 2FA cookie
    res.cookies.set('pending_2fa_admin_id', '', { maxAge: 0, path: '/' });

    return res;
  } catch (err) {
    console.error('[admin/2fa/verify] POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
