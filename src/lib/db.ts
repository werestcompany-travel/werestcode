// IMPORTANT: Add ?connection_limit=5&pool_timeout=20 to your DATABASE_URL
// environment variable to prevent Supabase connection pool exhaustion on
// serverless cold starts.
import { PrismaClient } from '@prisma/client';

// Startup guard: on serverless (Vercel) each lambda holds its own connection
// pool. Without pgbouncer (port 6543) + connection_limit, concurrent lambdas
// exhaust Supabase's ~60-connection cap and the site starts throwing P2024.
// This logs loudly at boot instead of failing mysteriously under load.
if (process.env.NODE_ENV === 'production') {
  const url = process.env.DATABASE_URL ?? '';
  const usesPooler = url.includes('pgbouncer=true') || url.includes(':6543');
  const hasLimit   = url.includes('connection_limit=');
  if (!usesPooler || !hasLimit) {
    console.warn(
      '[db] WARNING: DATABASE_URL is not configured for serverless. ' +
      'Use the Supabase transaction pooler (port 6543) with ?pgbouncer=true&connection_limit=1 ' +
      'to avoid connection exhaustion under load.',
    );
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always cache the singleton — prevents connection exhaustion during next build
// (in production serverless each lambda has its own globalThis, so this is a no-op;
//  in the build worker process it prevents dozens of PrismaClient instances)
globalForPrisma.prisma = prisma;

// Aliases so every import style works
export const db = prisma;
export default prisma;
