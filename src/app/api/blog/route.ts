export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as string | null;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10), 1);
    const skip = (page - 1) * limit;

    const q = searchParams.get('q')?.trim() ?? '';

    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { title:   { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { tags:    { has: q } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          readingTimeMin: true,
          authorName: true,
          authorTitle: true,
          seoTitle: true,
          seoDescription: true,
        },
      }),
      db.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
