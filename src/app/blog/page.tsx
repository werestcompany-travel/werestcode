import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowRight, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogCard from '@/components/blog/BlogCard'
import BlogSearchInput from '@/components/blog/BlogSearchInput'
import {
  BLOG_CATEGORIES,
  type BlogCategoryKey,
  type BlogPostSummary,
  formatBlogDate,
  formatReadingTime,
} from '@/lib/blog'

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

// Badge colours
const BADGE_COLORS: Record<string, string> = {
  BANGKOK:  'bg-blue-100 text-[#2534ff]',
  PATTAYA:  'bg-emerald-100 text-emerald-700',
  THAILAND: 'bg-red-100 text-red-700',
  PHUKET:   'bg-purple-100 text-purple-700',
  KRABI:    'bg-orange-100 text-orange-700',
}

// Fallback gradient
const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-600',
  PATTAYA:  'from-emerald-400 to-teal-600',
  THAILAND: 'from-red-400 to-rose-600',
  PHUKET:   'from-purple-400 to-violet-600',
  KRABI:    'from-orange-400 to-amber-600',
}

async function fetchPosts(category?: string, page = 1, q?: string) {
  const params = new URLSearchParams({ limit: '12', page: String(page) })
  if (category) params.set('category', category)
  if (q)        params.set('q', q)

  try {
    const res = await fetch(`${SITE_URL}/api/blog?${params.toString()}`, {
      next: { revalidate: q ? 0 : 60 },
    })
    if (!res.ok) return { posts: [], total: 0, pages: 1, page: 1 }
    const json = await res.json()
    return json.data as { posts: BlogPostSummary[]; total: number; pages: number; page: number }
  } catch {
    return { posts: [], total: 0, pages: 1, page: 1 }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BlogIndexProps {
  searchParams: { category?: string; page?: string; q?: string }
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const rawCategory    = searchParams.category?.toUpperCase() as BlogCategoryKey | undefined
  const activeCategory = rawCategory && BLOG_CATEGORIES[rawCategory] ? rawCategory : undefined
  const currentPage    = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const searchQuery    = searchParams.q?.trim() ?? ''

  const { posts, pages, total } = await fetchPosts(activeCategory, currentPage, searchQuery || undefined)

  // Featured post = first post on page 1 (only show hero when not searching/filtering, page 1)
  const heroPost   = !searchQuery && !activeCategory && currentPage === 1 ? posts[0] : null
  const gridPosts  = heroPost ? posts.slice(1) : posts

  // Editor's Picks = posts 7-8 (indices 6-7 of gridPosts), shown only on page 1 with no filter/search
  const showEditorsPicks = !searchQuery && !activeCategory && currentPage === 1 && gridPosts.length >= 7
  const mainGridPosts    = showEditorsPicks ? gridPosts.slice(0, 6) : gridPosts
  const editorsPosts     = showEditorsPicks ? gridPosts.slice(6, 8) : []

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Thailand Travel Blog | Werest Travel',
    description: 'Expert travel guides for Bangkok, Pattaya, Phuket, Krabi and beyond.',
    url: 'https://www.werest.com/blog',
    publisher: { '@type': 'Organization', name: 'Werest Travel', url: 'https://www.werest.com' },
  }

  // Pagination URL helper — preserves category + search query
  const pageUrl = (p: number) => {
    const ps = new URLSearchParams()
    if (activeCategory) ps.set('category', BLOG_CATEGORIES[activeCategory].slug)
    if (searchQuery)    ps.set('q', searchQuery)
    ps.set('page', String(p))
    return `/blog?${ps.toString()}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ════════════════════════════════════════════
            FEATURED HERO — full-width card (page 1, no filter)
        ════════════════════════════════════════════ */}
        {heroPost && (() => {
          const heroCat     = BLOG_CATEGORIES[heroPost.category]
          const heroBadge   = BADGE_COLORS[heroPost.category] ?? 'bg-gray-100 text-gray-600'
          const heroFallback = FALLBACK_BG[heroPost.category] ?? 'from-gray-400 to-gray-600'
          return (
            <section className="relative w-full mt-[64px]" style={{ minHeight: 480 }}>
              {/* Background */}
              {heroPost.featuredImage ? (
                <Image
                  src={heroPost.featuredImage}
                  alt={heroPost.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${heroFallback}`} />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end py-12 sm:py-16" style={{ minHeight: 480 }}>
                <div className="max-w-2xl">
                  {/* Category badge */}
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${heroBadge}`}>
                    {heroCat?.label ?? heroPost.category}
                  </span>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 line-clamp-3">
                    {heroPost.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-6 line-clamp-3">
                    {heroPost.excerpt}
                  </p>

                  {/* Meta + CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Author / date / read time */}
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {heroPost.authorName[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{heroPost.authorName}</span>
                      {heroPost.publishedAt && (
                        <>
                          <span className="text-white/40">·</span>
                          <span>{formatBlogDate(heroPost.publishedAt)}</span>
                        </>
                      )}
                      <span className="text-white/40">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatReadingTime(heroPost.readingTimeMin)}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/blog/${heroPost.slug}`}
                      className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1e2ce6] transition-colors shrink-0"
                    >
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )
        })()}

        {/* ════════════════════════════════════════════
            STICKY TOP BAR — search + category tabs
        ════════════════════════════════════════════ */}
        <div className={`sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm ${!heroPost ? 'mt-[64px]' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Search row */}
            <div className="py-3 flex items-center gap-4">
              <Suspense>
                <BlogSearchInput />
              </Suspense>

              {searchQuery && (
                <p className="text-sm text-gray-500 hidden sm:block whitespace-nowrap shrink-0">
                  <span className="font-semibold text-gray-900">{total}</span> result{total !== 1 ? 's' : ''} for &quot;<span className="text-[#2534ff] font-semibold">{searchQuery}</span>&quot;
                </p>
              )}
            </div>

            {/* Category tabs — horizontally scrollable */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0 scrollbar-hide -mx-1 px-1">
              <Link
                href={searchQuery ? `/blog?q=${encodeURIComponent(searchQuery)}` : '/blog'}
                className={[
                  'shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                  !activeCategory
                    ? 'border-[#2534ff] text-[#2534ff]'
                    : 'border-transparent text-gray-500 hover:text-gray-900',
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
                        'shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                        isActive
                          ? 'border-[#2534ff] text-[#2534ff]'
                          : 'border-transparent text-gray-500 hover:text-gray-900',
                      ].join(' ')}
                    >
                      {cat.label}
                    </Link>
                  )
                },
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            CONTENT AREA
        ════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Search result count on mobile */}
          {searchQuery && (
            <div className="flex items-center justify-between mb-6 sm:hidden">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{total}</span> result{total !== 1 ? 's' : ''} for &quot;<span className="text-[#2534ff] font-semibold">{searchQuery}</span>&quot;
              </p>
              <Link
                href={activeCategory ? `/blog?category=${BLOG_CATEGORIES[activeCategory].slug}` : '/blog'}
                className="text-sm text-[#2534ff] hover:underline font-medium ml-3 shrink-0"
              >
                Clear
              </Link>
            </div>
          )}

          {/* Empty state */}
          {posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-2xl">
                {searchQuery ? '🔍' : '✍️'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No articles found' : 'No posts yet'}
              </h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? `We couldn't find any articles matching "${searchQuery}". Try different keywords.`
                  : activeCategory
                  ? `No published articles in ${BLOG_CATEGORIES[activeCategory].label} yet. Check back soon.`
                  : 'No published articles yet. Check back soon.'}
              </p>
              {searchQuery && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[#1e2ce6] transition-colors text-sm"
                >
                  Browse all articles
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* ── Main 3-column grid ── */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {mainGridPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* ── Editor's Picks 2-column section ── */}
              {editorsPosts.length > 0 && (
                <div className="mt-14">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-1 h-6 rounded-full bg-[#2534ff]" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Editor&apos;s Picks</h2>
                  </div>

                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                    {editorsPosts.map((post) => {
                      const cat        = BLOG_CATEGORIES[post.category]
                      const badgeColor = BADGE_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'
                      const fallback   = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'
                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-0.5 bg-white"
                        >
                          {/* Image */}
                          <div className="relative w-full sm:w-52 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden">
                            {post.featuredImage ? (
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 640px) 100vw, 208px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex flex-col flex-1 p-5 gap-2.5 justify-center">
                            <span className={`inline-block self-start text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                              {cat?.label ?? post.category}
                            </span>
                            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#2534ff] transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                              <div className="w-5 h-5 rounded-full bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] text-[10px] font-bold shrink-0">
                                {post.authorName[0].toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-600">{post.authorName}</span>
                              {post.publishedAt && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span>{formatBlogDate(post.publishedAt)}</span>
                                </>
                              )}
                              <span className="text-gray-300">·</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 shrink-0" />
                                {formatReadingTime(post.readingTimeMin)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Remaining posts after editor's picks ── */}
              {showEditorsPicks && gridPosts.slice(8).length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                  {gridPosts.slice(8).map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  {currentPage > 1 && (
                    <Link
                      href={pageUrl(currentPage - 1)}
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
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
                          'w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center transition-colors',
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
                      className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
                    >
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
