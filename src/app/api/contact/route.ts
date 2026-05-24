import { NextRequest, NextResponse } from 'next/server'
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    const { name, email, subject, message } = body as {
      name?: string
      email?: string
      subject?: string
      message?: string
    }

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 },
      )
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 },
      )
    }

    // Basic length guards to prevent oversized payloads reaching the DB
    if (name.length > 200 || subject.length > 500 || message.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Input exceeds maximum length' },
        { status: 400 },
      )
    }

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
