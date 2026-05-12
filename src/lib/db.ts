import { PrismaClient } from '@prisma/client';

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
