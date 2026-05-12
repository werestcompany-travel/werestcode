import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchTours } from '@/lib/tours'

/**
 * GET /api/search?q=floating+market&type=all
 * type: 'all' | 'tours' | 'attractions' | 'blog'
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = (searchParams.get('q') ?? '').trim()
  const type = searchParams.get('type') ?? 'all'

  if (!q || q.length < 2) {
    return NextResponse.json({ tours: [], attractions: [], blog: [] })
  }

  const results: {
    tours:       unknown[]
    attractions: unknown[]
    blog:        unknown[]
  } = { tours: [], attractions: [], blog: [] }

  // ── Tours (static data) ───────────────────────────────────────────────────
  if (type === 'all' || type === 'tours') {
    results.tours = searchTours(q).slice(0, 8).map(t => ({
      slug:     t.slug,
      title:    t.title,
      subtitle: t.subtitle,
      location: t.location,
      image:    t.images[0],
      rating:   t.rating,
      price:    Math.min(...t.options.map(o => o.pricePerPerson)),
      badge:    t.badge ?? null,
      category: t.category,
    }))
  }

  // ── Attractions (DB) ──────────────────────────────────────────────────────
  if (type === 'all' || type === 'attractions') {
    try {
      const attractions = await prisma.attractionListing.findMany({
        where: {
          isActive: true,
          OR: [
            { name:     { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { overview: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          slug: true, name: true, location: true, category: true,
          price: true, rating: true, featureImage: true, badge: true, emoji: true,
        },
        take: 8,
        orderBy: { sortOrder: 'asc' },
      })
      results.attractions = attractions.map(a => ({
        slug:     a.slug,
        title:    a.name,
        location: a.location,
        category: a.category,
        image:    a.featureImage,
        rating:   a.rating,
        price:    a.price,
        badge:    a.badge,
        emoji:    a.emoji,
      }))
    } catch {
      // DB unavailable — skip
    }
  }

  // ── Blog posts (DB) ───────────────────────────────────────────────────────
  if (type === 'all' || type === 'blog') {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title:   { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { tags:    { has: q.toLowerCase() } },
          ],
        },
        select: {
          slug: true, title: true, excerpt: true, featuredImage: true,
          category: true, publishedAt: true, readingTimeMin: true,
        },
        take: 6,
        orderBy: { publishedAt: 'desc' },
      })
      results.blog = posts.map(p => ({
        slug:      p.slug,
        title:     p.title,
        excerpt:   p.excerpt,
        image:     p.featuredImage,
        category:  p.category,
        date:      p.publishedAt,
        readTime:  p.readingTimeMin,
      }))
    } catch {
      // DB unavailable — skip
    }
  }

  const total = results.tours.length + results.attractions.length + results.blog.length
  return NextResponse.json({ ...results, total, q })
}
