import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { rateLimitAsync, getIP, LIMITS } from '@/lib/rate-limit'

function randomRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return 'WRCNT-' + result
}

const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').trim(),
  email:   z.string().email('Please enter a valid email address').max(255),
  phone:   z.string().max(30, 'Phone must be at most 30 characters').optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be at most 200 characters').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be at most 2000 characters').trim(),
})

export async function POST(req: NextRequest) {
  // Rate limit: 3 contact submissions per hour per IP
  const ip = getIP(req)
  const rl = await rateLimitAsync(`contact:${ip}`, LIMITS.contact)
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid input'
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data

    await prisma.inquiry.create({
      data: {
        ref:         randomRef(),
        fullName:    name,
        email:       email,
        whatsapp:    '',
        destination: subject,
        activities:  message,
        status:      'NEW',
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/contact] error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to send' },
      { status: 500 },
    )
  }
}
