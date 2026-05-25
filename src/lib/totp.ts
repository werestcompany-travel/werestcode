import * as OTPAuth from 'otpauth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ISSUER = 'Werest Travel Admin';
const ALGORITHM = 'aes-256-cbc';

// 32-byte key for AES-256 — set TOTP_ENCRYPT_KEY in env as a 64-char hex string
function getEncryptKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPT_KEY ?? '';
  if (!raw && process.env.NODE_ENV === 'production') {
    throw new Error('[totp] TOTP_ENCRYPT_KEY environment variable is not set.');
  }
  // Pad/truncate to 32 bytes
  const key = raw.padEnd(32, '0').slice(0, 32);
  return Buffer.from(key, 'utf8');
}

/**
 * AES-256-CBC encrypt a TOTP secret for storage at rest.
 * Returns "iv:ciphertext" as a hex string.
 */
export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * AES-256-CBC decrypt a stored TOTP secret.
 */
export function decryptSecret(encrypted: string): string {
  const [ivHex, cipherHex] = encrypted.split(':');
  if (!ivHex || !cipherHex) throw new Error('[totp] Invalid encrypted secret format');
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptKey(), iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Generate a new TOTP secret and return the base32 secret + otpauth URL.
 */
export function generateTOTPSecret(adminEmail: string): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = new OTPAuth.Secret({ size: 20 }); // 160-bit = 20 bytes
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: adminEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
  return {
    secret: secret.base32,
    otpauthUrl: totp.toString(),
  };
}

/**
 * Verify a 6-digit TOTP token against a base32 secret.
 * Accepts ±1 time-step window to allow for clock drift.
 */
export function verifyTOTP(base32Secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      label: 'admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(base32Secret) as OTPAuth.Secret,
    });
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * Generate 10 one-time backup codes (8 hex chars each, uppercase).
 * Returns both raw (show to user once) and bcrypt-hashed (store in DB).
 */
export async function generateBackupCodes(): Promise<{ raw: string[]; hashed: string[] }> {
  const raw = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase(),
  );
  const hashed = await Promise.all(raw.map((c) => bcrypt.hash(c, 10)));
  return { raw, hashed };
}

/**
 * Check an input code against the array of hashed backup codes.
 * Returns the index of the matched code (for removal) or -1.
 */
export async function verifyBackupCode(
  inputCode: string,
  hashedCodes: string[],
): Promise<{ valid: boolean; index: number }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(inputCode, hashedCodes[i])) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}
