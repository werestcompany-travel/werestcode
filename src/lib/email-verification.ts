import crypto from 'crypto';
import { prisma } from '@/lib/db';

export function generateVerifyToken(): { raw: string; hash: string } {
  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export async function createEmailVerification(userId: string): Promise<string> {
  const { raw, hash } = generateVerifyToken();

  // Delete any existing unused verification tokens for this user
  await prisma.emailVerification.deleteMany({ where: { userId, usedAt: null } });

  await prisma.emailVerification.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return raw;
}

export async function verifyEmailToken(
  token: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const hash   = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.emailVerification.findUnique({ where: { tokenHash: hash } });

  if (!record)        return { success: false, error: 'Invalid or expired verification link.' };
  if (record.usedAt)  return { success: false, error: 'This link has already been used.' };
  if (record.expiresAt < new Date()) {
    return { success: false, error: 'This link has expired. Please request a new one.' };
  }

  // Mark as used and verify user in a transaction
  await prisma.$transaction([
    prisma.emailVerification.update({
      where: { id: record.id },
      data:  { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data:  { emailVerified: true },
    }),
  ]);

  return { success: true, userId: record.userId };
}
