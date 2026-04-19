import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as string | null;
    const category = searchParams.get('category') as string | null;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      publishedAt,
      seoTitle,
      seoDescription,
      authorName,
      authorTitle,
      faqs,
      ctaBlocks,
      relatedServices,
      relatedSlugs,
      readingTimeMin,
    } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'title, content and category are required' },
        { status: 400 },
      );
    }

    const resolvedSlug = slug ? (slug as string).trim() : generateSlug(title);
    const resolvedStatus = status ?? 'DRAFT';
    const resolvedPublishedAt =
      resolvedStatus === 'PUBLISHED' && !publishedAt ? new Date() : publishedAt ?? null;

    const post = await db.blogPost.create({
      data: {
        title,
        slug: resolvedSlug,
        excerpt: excerpt ?? null,
        content,
        featuredImage: featuredImage ?? null,
        category,
        tags: tags ?? [],
        status: resolvedStatus,
        publishedAt: resolvedPublishedAt,
        seoTitle: seoTitle ?? null,
        seoDescription: seoDescription ?? null,
        authorName: authorName ?? 'Werest Travel',
        authorTitle: authorTitle ?? null,
        faqs: faqs ?? null,
        ctaBlocks: ctaBlocks ?? null,
        relatedServices: relatedServices ?? null,
        relatedSlugs: relatedSlugs ?? [],
        readingTimeMin: readingTimeMin ?? 5,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
