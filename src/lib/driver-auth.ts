import crypto from 'crypto';
import { prisma } from './db';

// ─── Token helpers ────────────────────────────────────────────────────────────

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ─── createDriverToken ────────────────────────────────────────────────────────

export async function createDriverToken(driverId: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString('hex'); // 64-char hex string
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.driverAuthToken.create({
    data: { driverId, tokenHash, expiresAt },
  });

  return raw;
}

// ─── verifyDriverToken ────────────────────────────────────────────────────────

export async function verifyDriverToken(
  rawToken: string,
): Promise<{ id: string; name: string; phone: string; isActive: boolean } | null> {
  const tokenHash = hashToken(rawToken);

  const record = await prisma.driverAuthToken.findUnique({
    where: { tokenHash },
    include: {
      driver: { select: { id: true, name: true, phone: true, isActive: true } },
    },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  return record.driver;
}

// ─── getDriverTokenFromRequest ────────────────────────────────────────────────

export function getDriverTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1] || null;
}
