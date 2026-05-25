import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import type { NextRequest } from 'next/server'

interface AuditOptions {
  adminId: string
  adminEmail: string
  action: string           // e.g. 'BOOKING_STATUS_UPDATE'
  entityType: string       // e.g. 'Booking'
  entityId?: string
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
  req?: NextRequest
}

export async function logAdminAction(opts: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId:    opts.adminId,
        adminEmail: opts.adminEmail,
        action:     opts.action,
        entityType: opts.entityType,
        entityId:   opts.entityId ?? null,
        before:     opts.before ?? Prisma.JsonNull,
        after:      opts.after ?? Prisma.JsonNull,
        ip:         opts.req?.headers.get('x-forwarded-for')?.split(',')[0] ?? opts.req?.headers.get('x-real-ip') ?? null,
      }
    })
  } catch (err) {
    // Never throw — audit logging failure must never break the main operation
    console.error('[audit] Failed to write audit log:', err)
  }
}

// Common action constants
export const AUDIT_ACTIONS = {
  BOOKING_STATUS_UPDATE: 'BOOKING_STATUS_UPDATE',
  BOOKING_DRIVER_ASSIGN: 'BOOKING_DRIVER_ASSIGN',
  BOOKING_CANCEL:        'BOOKING_CANCEL',
  REFUND_CREATE:         'REFUND_CREATE',
  REFUND_APPROVE:        'REFUND_APPROVE',
  REFUND_REJECT:         'REFUND_REJECT',
  REFUND_PROCESS:        'REFUND_PROCESS',
  USER_LOYALTY_ADJUST:   'USER_LOYALTY_ADJUST',
  DISCOUNT_CREATE:       'DISCOUNT_CREATE',
  DRIVER_CREATE:         'DRIVER_CREATE',
  DRIVER_UPDATE:         'DRIVER_UPDATE',
} as const
