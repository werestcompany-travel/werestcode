import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BLOG_CATEGORIES, type BlogPostSummary, formatBlogDate } from '@/lib/blog'
import { prisma } from '@/lib/db'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
  description:
    'Discover expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond. Practical tips, transfer advice and destination inspiration from the Werest Travel team.',
  alternates: { canonical: 'https://www.werest.com/blog' },
  openGraph: {
    type: 'website',
    title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
    description: 'Expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond.',
    url: 'https://www.werest.com/blog',
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

async function fetchPosts(page = 1) {
  try {
    const skip = (page - 1) * LIMIT
    const where = { status: 'PUBLISHED' as const }
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
  searchParams: { page?: string }
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const { posts, pages } = await fetchPosts(currentPage)

  const pageUrl = (p: number) => `/blog?page=${p}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ════════════════════════════════════════════
            HERO — centered heading + subscribe form
        ════════════════════════════════════════════ */}
        <section className="pt-28 pb-12 px-4 text-center bg-white">
          <span className="inline-block bg-yellow-300 text-gray-900 text-xs font-extrabold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            Blogs &amp; Articles
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-tight mb-4">
            Blogs &amp; Articles
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Subscribe to learn more about traveling and get the newest tips for upcoming travel
          </p>
          {/* Subscribe form */}
          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 w-full sm:w-auto border border-gray-200 rounded-full px-5 py-3 text-sm text-gray-700 outline-none focus:border-[#2534ff] shadow-sm placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-[#2534ff] hover:bg-[#1e2ce6] text-white font-bold px-7 py-3 rounded-full text-sm transition-colors shadow-md whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </section>

        {/* ════════════════════════════════════════════
            RECENT BLOG POSTS — grid only
        ════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            Recent Blog Post
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">✍️</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                No published articles yet. Check back soon.
              </p>
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

function BlogPostCard({ post }: { post: BlogPostSummary }) {
  const cat      = BLOG_CATEGORIES[post.category]
  const fallback = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0 rounded-2xl">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 pt-4 gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium text-gray-500">{cat?.label ?? post.category}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <span>{formatBlogDate(post.publishedAt)}</span>
            </>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#2534ff] transition-colors duration-150">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-1.5 text-[#2534ff] text-sm font-semibold mt-2 group-hover:gap-2.5 transition-all duration-150">
          View Full Article
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  )
}
