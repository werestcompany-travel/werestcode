import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    await prisma.blogPost.update({
      where: { slug: params.slug },
      data: { viewCount: { increment: 1 } },
    })
    return NextResponse.json({ ok: true })
  } catch {
    // Silently ignore — e.g. post not found
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
