import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Clock, Calendar, ChevronRight, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReadingProgress from '@/components/blog/ReadingProgress'
import ArticleBody from '@/components/blog/ArticleBody'
import TableOfContents from '@/components/blog/TableOfContents'
import BlogFAQ from '@/components/blog/BlogFAQ'
import BlogCTA from '@/components/blog/BlogCTA'
import RelatedServices from '@/components/blog/RelatedServices'
import BlogCard from '@/components/blog/BlogCard'
import CategoryBadge from '@/components/blog/CategoryBadge'
import {
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogPostSummary,
  formatBlogDate,
  formatReadingTime,
  generateBlogSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/blog'

const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const PUBLIC_SITE_URL = 'https://www.werest.com'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchPost(
  slug: string,
): Promise<{ post: BlogPost; relatedPosts: BlogPostSummary[] } | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/blog/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success) return null
    return json.data
  } catch {
    return null
  }
}

// ─── Static params stub ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  return [] // ISR — generated on demand
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await fetchPost(params.slug)
  if (!data) return { title: 'Post Not Found' }

  const { post } = data
  const title       = post.seoTitle ?? post.title
  const description = post.seoDescription ?? post.excerpt
  const canonical   = `${PUBLIC_SITE_URL}/blog/${post.slug}`
  const image       = post.featuredImage ?? `${PUBLIC_SITE_URL}/og-image.jpg`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: post.publishedAt ?? post.createdAt,
      modifiedTime:  post.updatedAt,
      authors:       [post.authorName],
      tags:          post.tags,
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const data = await fetchPost(params.slug)
  if (!data) notFound()

  const { post, relatedPosts } = data
  const category = BLOG_CATEGORIES[post.category]

  const articleSchema    = generateBlogSchema(post, PUBLIC_SITE_URL)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home',          url: PUBLIC_SITE_URL },
    { name: 'Blog',          url: `${PUBLIC_SITE_URL}/blog` },
    { name: category.label,  url: `${PUBLIC_SITE_URL}/blog/category/${category.slug}` },
    { name: post.title,      url: `${PUBLIC_SITE_URL}/blog/${post.slug}` },
  ])
  const faqSchema = post.faqs && post.faqs.length > 0 ? generateFAQSchema(post.faqs) : null

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <ReadingProgress />
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ════════════════════════════════════════════
            HERO — full-width featured image with overlay header
        ════════════════════════════════════════════ */}
        <div className="relative w-full" style={{ minHeight: 480 }}>
          {/* Background image */}
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2534ff] to-indigo-900" />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Content on top of image */}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex flex-col items-center text-center">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/60 mb-6 flex-wrap justify-center">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <Link href={`/blog/category/${category.slug}`} className="hover:text-white transition-colors">
                {category.label}
              </Link>
            </nav>

            {/* Category badge */}
            <div className="mb-4">
              <CategoryBadge category={post.category} />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
              {post.excerpt}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {post.authorName[0].toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-sm leading-tight">{post.authorName}</p>
                  {post.authorTitle && <p className="text-[11px] text-white/60 leading-tight">{post.authorTitle}</p>}
                </div>
              </div>

              {post.publishedAt && (
                <>
                  <span className="text-white/30">|</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatBlogDate(post.publishedAt)}</span>
                  </div>
                </>
              )}

              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatReadingTime(post.readingTimeMin)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            ARTICLE BODY — centered narrow column + sticky TOC
        ════════════════════════════════════════════ */}
        <div className="bg-white">
          {/* Outer container — wide enough for content + TOC */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Sticky TOC — floats to the right on xl screens */}
            <aside
              aria-label="Table of contents"
              className="hidden xl:block absolute top-12 right-4 2xl:right-0 w-64"
            >
              <div className="sticky top-24">
                <TableOfContents content={post.content} />
              </div>
            </aside>

            {/* Article text — wide centered column */}
            <article className="max-w-4xl mx-auto py-12">
              <ArticleBody content={post.content} />

              {/* FAQ */}
              {post.faqs && post.faqs.length > 0 && (
                <div className="mt-12">
                  <BlogFAQ faqs={post.faqs} />
                </div>
              )}

              {/* CTA blocks */}
              {post.ctaBlocks && post.ctaBlocks.length > 0 && (
                <div className="mt-8">
                  <BlogCTA blocks={post.ctaBlocks} />
                </div>
              )}

              {/* Related services */}
              {post.relatedServices && post.relatedServices.length > 0 && (
                <div className="mt-8">
                  <RelatedServices services={post.relatedServices} />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#2534ff] text-gray-500 text-xs font-medium rounded-full transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RELATED ARTICLES — full-width section
        ════════════════════════════════════════════ */}
        <section className="bg-gray-50 border-t border-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#2534ff] text-sm font-semibold uppercase tracking-widest mb-1">
                  Keep Reading
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Related Articles
                </h2>
              </div>
              <Link
                href={`/blog/category/${category.slug}`}
                className="hidden sm:flex items-center gap-1.5 text-[#2534ff] font-semibold text-sm hover:opacity-80 transition-opacity"
              >
                More {category.label} guides
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {relatedPosts.length > 0 ? (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {relatedPosts.map(rp => (
                  <BlogCard key={rp.id} post={rp as BlogPostSummary} />
                ))}
              </div>
            ) : (
              /* Empty state — always show something */
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">More {category.label} articles coming soon.</p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors text-sm"
                >
                  Browse all articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Mobile "see more" link */}
            <div className="sm:hidden text-center mt-8">
              <Link
                href={`/blog/category/${category.slug}`}
                className="inline-flex items-center gap-1.5 text-[#2534ff] font-semibold text-sm"
              >
                More {category.label} guides <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
