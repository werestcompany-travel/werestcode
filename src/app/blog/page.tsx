import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogCard from '@/components/blog/BlogCard'
import BlogSearchInput from '@/components/blog/BlogSearchInput'
import { BLOG_CATEGORIES, type BlogCategoryKey, type BlogPostSummary } from '@/lib/blog'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
  description:
    'Discover expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond. Practical tips, transfer advice and destination inspiration from the Werest Travel team.',
  alternates: {
    canonical: 'https://www.werest.com/blog',
  },
  openGraph: {
    type: 'website',
    title: 'Thailand Travel Blog — Tips, Guides & Transfer Advice | Werest',
    description:
      'Expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond. Practical tips and destination inspiration from Werest Travel.',
    url: 'https://www.werest.com/blog',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

async function fetchPosts(category?: string, page = 1, q?: string) {
  const params = new URLSearchParams({ limit: '12', page: String(page) })
  if (category) params.set('category', category)
  if (q)        params.set('q', q)

  try {
    const res = await fetch(`${SITE_URL}/api/blog?${params.toString()}`, {
      next: { revalidate: q ? 0 : 60 }, // no cache for search results
    })
    if (!res.ok) return { posts: [], total: 0, pages: 1 }
    const json = await res.json()
    return json.data as { posts: BlogPostSummary[]; total: number; pages: number; page: number }
  } catch {
    return { posts: [], total: 0, pages: 1 }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogIndexProps {
  searchParams: { category?: string; page?: string; q?: string }
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const rawCategory  = searchParams.category?.toUpperCase() as BlogCategoryKey | undefined
  const activeCategory = rawCategory && BLOG_CATEGORIES[rawCategory] ? rawCategory : undefined
  const currentPage  = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const searchQuery  = searchParams.q?.trim() ?? ''

  const { posts, pages, total } = await fetchPosts(activeCategory, currentPage, searchQuery || undefined)

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Thailand Travel Blog | Werest Travel',
    description: 'Expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond.',
    url: 'https://www.werest.com/blog',
    publisher: { '@type': 'Organization', name: 'Werest Travel', url: 'https://www.werest.com' },
  }

  // Build pagination URL helper (preserves category + search query)
  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', BLOG_CATEGORIES[activeCategory].slug)
    if (searchQuery)    params.set('q', searchQuery)
    params.set('page', String(p))
    return `/blog?${params.toString()}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <section className="bg-[#2534ff] pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2">
                  Travel Insights
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Thailand Travel Blog
                </h1>
                <p className="text-white/70 text-base mt-2 max-w-xl">
                  Expert guides, insider tips and transfer advice for Bangkok, Pattaya, Phuket, Krabi and beyond.
                </p>
              </div>

              {/* Search box */}
              <div className="sm:w-72 shrink-0">
                <Suspense>
                  <BlogSearchInput />
                </Suspense>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={searchQuery ? `/blog?q=${encodeURIComponent(searchQuery)}` : '/blog'}
                className={[
                  'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                  !activeCategory
                    ? 'bg-white text-[#2534ff] border-white'
                    : 'bg-white/15 text-white border-white/30 hover:bg-white/25',
                ].join(' ')}
              >
                All Posts
              </Link>

              {(Object.entries(BLOG_CATEGORIES) as [BlogCategoryKey, typeof BLOG_CATEGORIES[BlogCategoryKey]][]).map(
                ([key, cat]) => {
                  const isActive = activeCategory === key
                  const href = searchQuery
                    ? `/blog?category=${cat.slug}&q=${encodeURIComponent(searchQuery)}`
                    : `/blog?category=${cat.slug}`
                  return (
                    <Link
                      key={key}
                      href={href}
                      className={[
                        'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                        isActive
                          ? 'bg-white text-[#2534ff] border-white'
                          : 'bg-white/15 text-white border-white/30 hover:bg-white/25',
                      ].join(' ')}
                    >
                      {cat.label}
                    </Link>
                  )
                },
              )}
            </div>
          </div>
        </section>

        {/* ── Posts grid ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Search result summary */}
          {searchQuery && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                {total > 0
                  ? <><span className="font-semibold text-gray-900">{total}</span> result{total !== 1 ? 's' : ''} for "<span className="font-semibold text-[#2534ff]">{searchQuery}</span>"</>
                  : <>No results for "<span className="font-semibold text-[#2534ff]">{searchQuery}</span>"</>
                }
              </p>
              <Link
                href={activeCategory ? `/blog?category=${BLOG_CATEGORIES[activeCategory].slug}` : '/blog'}
                className="text-sm text-[#2534ff] hover:underline font-medium"
              >
                Clear search
              </Link>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">{searchQuery ? '🔍' : '✍️'}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No articles found' : 'No posts yet'}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `We couldn't find any articles matching "${searchQuery}". Try different keywords.`
                  : activeCategory
                  ? `No published articles in ${BLOG_CATEGORIES[activeCategory].label} yet. Check back soon.`
                  : 'No published articles yet. Check back soon.'}
              </p>
              {searchQuery && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors text-sm"
                >
                  Browse all articles
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {currentPage > 1 && (
                <Link
                  href={pageUrl(currentPage - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
                >
                  ← Previous
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={[
                      'w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors',
                      p === currentPage
                        ? 'bg-[#2534ff] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff]',
                    ].join(' ')}
                  >
                    {p}
                  </Link>
                ))}
              </div>

              {currentPage < pages && (
                <Link
                  href={pageUrl(currentPage + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
