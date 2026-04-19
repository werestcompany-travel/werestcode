import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogCard from '@/components/blog/BlogCard'
import CategoryBadge from '@/components/blog/CategoryBadge'
import {
  BLOG_CATEGORIES,
  slugToCategory,
  type BlogPostSummary,
} from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const PUBLIC_SITE_URL = 'https://www.werest.com'

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Object.values(BLOG_CATEGORIES).map(cat => ({
    category: cat.slug,
  }))
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchCategoryPosts(categoryKey: string, page = 1) {
  const params = new URLSearchParams({
    category: categoryKey,
    limit: '12',
    page: String(page),
  })

  try {
    const res = await fetch(`${SITE_URL}/api/blog?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { posts: [], total: 0, pages: 1 }
    const json = await res.json()
    return json.data as { posts: BlogPostSummary[]; total: number; pages: number; page: number }
  } catch {
    return { posts: [], total: 0, pages: 1 }
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const categoryKey = slugToCategory(params.category)
  if (!categoryKey) return { title: 'Category Not Found' }

  const cat = BLOG_CATEGORIES[categoryKey]
  const title = `${cat.label} Travel Blog — Guides & Tips | Werest`
  const description = cat.description
  const canonical = `${PUBLIC_SITE_URL}/blog/category/${cat.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CategoryPageProps {
  params: { category: string }
  searchParams: { page?: string }
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const categoryKey = slugToCategory(params.category)
  if (!categoryKey) notFound()

  const cat = BLOG_CATEGORIES[categoryKey]
  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10))

  const { posts, pages, total } = await fetchCategoryPosts(categoryKey, currentPage)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: PUBLIC_SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${PUBLIC_SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `${PUBLIC_SITE_URL}/blog/category/${cat.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero / header ── */}
        <section className="bg-white border-b border-gray-100 pt-24 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
              <Link href="/" className="hover:text-[#2534ff] transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link href="/blog" className="hover:text-[#2534ff] transition-colors">Blog</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-gray-700 font-medium">{cat.label}</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-3">
                  <CategoryBadge category={categoryKey} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
                  {cat.label} Travel Guides
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                  {cat.description}
                </p>
                {total > 0 && (
                  <p className="text-sm text-gray-400 mt-3">
                    {total} {total === 1 ? 'article' : 'articles'} published
                  </p>
                )}
              </div>
            </div>

            {/* Other category links */}
            <div className="flex flex-wrap gap-2 mt-8">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:border-[#2534ff] hover:text-[#2534ff] transition-colors"
              >
                All Posts
              </Link>
              {(Object.entries(BLOG_CATEGORIES) as [typeof categoryKey, typeof cat][]).map(
                ([key, c]) => (
                  <Link
                    key={key}
                    href={`/blog/category/${c.slug}`}
                    className={[
                      'px-4 py-2 rounded-full text-sm font-semibold border transition-colors',
                      key === categoryKey
                        ? 'bg-[#2534ff] text-white border-[#2534ff]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]',
                    ].join(' ')}
                  >
                    {c.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── Posts grid ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">✍️</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h2>
              <p className="text-gray-500 mb-6">
                No published articles for {cat.label} yet. Check back soon.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors"
              >
                Browse all articles
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={`/blog/category/${cat.slug}?page=${currentPage - 1}`}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
                    >
                      ← Previous
                    </Link>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <Link
                        key={p}
                        href={`/blog/category/${cat.slug}?page=${p}`}
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
                      href={`/blog/category/${cat.slug}?page=${currentPage + 1}`}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors bg-white"
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
