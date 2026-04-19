import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const RELATED_SELECT = {
  id:             true,
  slug:           true,
  title:          true,
  excerpt:        true,
  featuredImage:  true,
  category:       true,
  publishedAt:    true,
  readingTimeMin: true,
  authorName:     true,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const post = await db.blogPost.findFirst({
      where: { slug: params.slug, status: 'PUBLISHED' },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    let relatedPosts;

    if (post.relatedSlugs.length > 0) {
      // Explicit related slugs take priority
      relatedPosts = await db.blogPost.findMany({
        where: { slug: { in: post.relatedSlugs }, status: 'PUBLISHED' },
        select: RELATED_SELECT,
        take: 4,
      });
    } else {
      // Fallback: most recent published posts in the same category, excluding self
      relatedPosts = await db.blogPost.findMany({
        where: { category: post.category, status: 'PUBLISHED', id: { not: post.id } },
        select: RELATED_SELECT,
        orderBy: { publishedAt: 'desc' },
        take: 4,
      });
    }

    // If still empty (only post in category), grab latest from any category
    if (relatedPosts.length === 0) {
      relatedPosts = await db.blogPost.findMany({
        where: { status: 'PUBLISHED', id: { not: post.id } },
        select: RELATED_SELECT,
        orderBy: { publishedAt: 'desc' },
        take: 4,
      });
    }

    return NextResponse.json({ success: true, data: { post, relatedPosts } });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
