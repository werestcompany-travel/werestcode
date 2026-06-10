import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSubscribeForm from '@/components/blog/BlogSubscribeForm'
import { BLOG_CATEGORIES, type BlogPostSummary, formatBlogDate, type BlogCategoryKey } from '@/lib/blog'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const revalidate = 300; // ISR: revalidate every 5 minutes

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
  description:
    'Discover expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond. Practical tips, transfer advice and destination inspiration from the Werest Travel team.',
  alternates: { canonical: 'https://gowerest.com/blog' },
  openGraph: {
    type: 'website',
    title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
    description: 'Expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond.',
    url: 'https://gowerest.com/blog',
  },
}

const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-600',
  PATTAYA:  'from-emerald-400 to-teal-600',
  THAILAND: 'from-red-400 to-rose-600',
  PHUKET:   'from-purple-400 to-violet-600',
  KRABI:    'from-orange-400 to-amber-600',
}

const LIMIT = 12

async function fetchPosts(page = 1, query?: string, category?: string) {
  try {
    const skip = (page - 1) * LIMIT
    const where: Prisma.BlogPostWhereInput = {
      status: 'PUBLISHED',
      ...(query ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      } : {}),
      ...(category ? { category: category as BlogCategoryKey } : {}),
    }
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: LIMIT,
        select: {
          id: true, slug: true, title: true, excerpt: true,
          featuredImage: true, category: true, tags: true,
          publishedAt: true, readingTimeMin: true,
          authorName: true, authorTitle: true,
          seoTitle: true, seoDescription: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ])
    return { posts: posts as BlogPostSummary[], total, pages: Math.ceil(total / LIMIT) }
  } catch {
    return { posts: [] as BlogPostSummary[], total: 0, pages: 1 }
  }
}

interface BlogIndexProps {
  searchParams: { page?: string; q?: string; category?: string }
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const query    = searchParams.q?.trim() || undefined
  const category = searchParams.category || undefined
  const { posts, pages } = await fetchPosts(currentPage, query, category)

  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    params.set('page', String(p))
    if (query)    params.set('q', query)
    if (category) params.set('category', category)
    return `/blog?${params.toString()}`
  }

  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-white">

        {/* ════════════════════════════════════════════
            HERO — centered heading + subscribe form
        ════════════════════════════════════════════ */}
        <section className="pt-28 pb-12 px-4 text-center bg-white">
          <span className="inline-block bg-yellow-300 text-gray-900 text-xs font-extrabold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            Travel Blog
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-tight mb-4">
            Thailand Travel Guides
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Expert tips, itineraries and transfer advice from our Thailand travel team
          </p>
          {/* Subscribe form — connected to API */}
          <BlogSubscribeForm />
        </section>

        {/* ════════════════════════════════════════════
            SEARCH + CATEGORY FILTER
        ════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-4 mb-10">
          {/* Search input — wraps in a GET form so it works without JS */}
          <form method="get" action="/blog" className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              name="q"
              placeholder="Search articles..."
              defaultValue={query}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2534ff]"
            />
            {/* Preserve category param when searching */}
            {category && <input type="hidden" name="category" value={category} />}
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={query ? `/blog?q=${encodeURIComponent(query)}` : '/blog'}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !category
                  ? 'bg-[#2534ff] text-white border-[#2534ff]'
                  : 'border-gray-200 text-gray-600 hover:border-[#2534ff]'
              }`}
            >
              All
            </Link>
            {(Object.entries(BLOG_CATEGORIES) as [BlogCategoryKey, typeof BLOG_CATEGORIES[BlogCategoryKey]][]).map(([key, cat]) => {
              const href = query
                ? `/blog?category=${key}&q=${encodeURIComponent(query)}`
                : `/blog?category=${key}`
              return (
                <Link
                  key={key}
                  href={href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === key
                      ? 'bg-[#2534ff] text-white border-[#2534ff]'
                      : 'border-gray-200 text-gray-600 hover:border-[#2534ff]'
                  }`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RECENT BLOG POSTS — grid only
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">
            {query ? `Results for "${query}"` : category ? `${BLOG_CATEGORIES[category as BlogCategoryKey]?.label ?? category} Posts` : 'Recent Blog Posts'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-10">Expert guides from our Thailand travel team</p>

          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">✍️</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                {query || category ? 'Try adjusting your search or filter.' : 'No published articles yet. Check back soon.'}
              </p>
              {(query || category) && (
                <Link href="/blog" className="inline-flex items-center gap-2 bg-[#2534ff] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1a26e0] transition-colors">
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* 3-column card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  {currentPage > 1 && (
                    <Link href={pageUrl(currentPage - 1)} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white">
                      ← Previous
                    </Link>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={pageUrl(p)} className={['w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-colors', p === currentPage ? 'bg-[#2534ff] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff]'].join(' ')}>
                        {p}
                      </Link>
                    ))}
                  </div>
                  {currentPage < pages && (
                    <Link href={pageUrl(currentPage + 1)} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white">
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

/* ── Blog Post Card ─────────────────────────────────────────────────────────── */

const CATEGORY_BADGE: Record<string, string> = {
  BANGKOK:  'bg-blue-50 text-[#2534ff]',
  PATTAYA:  'bg-emerald-50 text-emerald-700',
  THAILAND: 'bg-red-50 text-red-600',
  PHUKET:   'bg-purple-50 text-purple-700',
  KRABI:    'bg-orange-50 text-orange-600',
}

function BlogPostCard({ post }: { post: BlogPostSummary }) {
  const cat      = BLOG_CATEGORIES[post.category]
  const fallback = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'
  const badge    = CATEGORY_BADGE[post.category] ?? 'bg-gray-100 text-gray-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden shrink-0 rounded-t-2xl">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
        )}
        {/* Category badge overlay */}
        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge} backdrop-blur-sm`}>
          {cat?.label ?? post.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        {/* Date + reading time */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {post.publishedAt && <span>{formatBlogDate(post.publishedAt)}</span>}
          {post.publishedAt && <span>·</span>}
          {post.readingTimeMin && (
            <span>{post.readingTimeMin} min read</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[#2534ff] transition-colors duration-150">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-1.5 text-[#2534ff] text-sm font-semibold pt-1 group-hover:gap-2.5 transition-all duration-150">
          Read Article
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  )
}
