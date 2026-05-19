import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReadingProgress from '@/components/blog/ReadingProgress'
import ArticleBody from '@/components/blog/ArticleBody'
import BlogFAQ from '@/components/blog/BlogFAQ'
import BlogCTA from '@/components/blog/BlogCTA'
import RelatedServices from '@/components/blog/RelatedServices'
import {
  BLOG_CATEGORIES,
  type BlogPost,
  type BlogPostSummary,
  formatBlogDate,
  generateBlogSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/blog'

const SITE_URL        = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const PUBLIC_SITE_URL = 'https://www.werest.com'

const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-600',
  PATTAYA:  'from-emerald-400 to-teal-600',
  THAILAND: 'from-red-400 to-rose-600',
  PHUKET:   'from-purple-400 to-violet-600',
  KRABI:    'from-orange-400 to-amber-600',
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

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

export async function generateStaticParams() {
  return []
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await fetchPost(params.slug)
  if (!data) return { title: 'Post Not Found' }

  const { post }     = data
  const title        = post.seoTitle ?? post.title
  const description  = post.seoDescription ?? post.excerpt
  const canonical    = `${PUBLIC_SITE_URL}/blog/${post.slug}`
  const image        = post.featuredImage ?? `${PUBLIC_SITE_URL}/og-image.jpg`

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
  const category  = BLOG_CATEGORIES[post.category]
  const fallback  = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'

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
            BREADCRUMB
        ════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/"    className="hover:text-[#2534ff] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/blog" className="hover:text-[#2534ff] transition-colors">Blog &amp; Article</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href={`/blog/category/${category.slug}`} className="hover:text-[#2534ff] transition-colors">
              {category.label}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-gray-500 line-clamp-1">{post.title}</span>
          </nav>
        </div>

        {/* ════════════════════════════════════════════
            ARTICLE HEADER — split layout (text + image)
        ════════════════════════════════════════════ */}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* ── Left: meta + title + quote ── */}
            <div className="flex flex-col gap-4">
              {/* Category + date row */}
              <div className="flex items-center gap-3">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${category.color}`}>
                  {category.label}
                </span>
                {post.publishedAt && (
                  <span className="text-sm text-gray-400">{formatBlogDate(post.publishedAt)}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {post.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] font-extrabold text-sm shrink-0">
                  {post.authorName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">By: {post.authorName}</p>
                  {post.authorTitle && (
                    <p className="text-xs text-gray-400">{post.authorTitle}</p>
                  )}
                </div>
              </div>

              {/* Excerpt / intro quote */}
              <blockquote className="border-l-4 border-[#2534ff] pl-4 text-gray-700 text-sm sm:text-base leading-relaxed font-medium italic">
                &ldquo;{post.excerpt}&rdquo;
              </blockquote>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: featured image ── */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              {post.featuredImage ? (
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
              )}
            </div>

          </div>
        </header>

        {/* ════════════════════════════════════════════
            ARTICLE BODY — content + right sidebar
        ════════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">

            {/* ── Left: article content with social share strip ── */}
            <div className="relative">
              {/* Social share icons — left margin strip on xl */}
              <div className="hidden xl:flex flex-col gap-3 absolute -left-14 top-0">
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${PUBLIC_SITE_URL}/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com/weresttransfer"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                  style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-[1.8]">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="white"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${PUBLIC_SITE_URL}/blog/${post.slug}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${PUBLIC_SITE_URL}/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>

              {/* Article body */}
              <article className="prose prose-gray max-w-none prose-headings:font-extrabold prose-headings:text-gray-900 prose-a:text-[#2534ff] prose-a:no-underline hover:prose-a:underline">
                <ArticleBody content={post.content} />
              </article>

              {/* Mobile share row */}
              <div className="flex xl:hidden items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mr-1">Share:</p>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="X" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>

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
                    <span key={tag} className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-[#2534ff] text-gray-500 text-xs font-medium rounded-full transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <aside className="flex flex-col gap-8 lg:sticky lg:top-24">

              {/* Author card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2534ff] to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-3">
                  {post.authorName[0].toUpperCase()}
                </div>
                <p className="font-bold text-gray-900 text-base">{post.authorName}</p>
                {post.authorTitle && (
                  <p className="text-gray-400 text-xs mt-0.5">{post.authorTitle}</p>
                )}
                {/* Social links */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#1877F2] hover:text-white text-gray-500 flex items-center justify-center transition-all">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-pink-500 hover:text-white text-gray-500 flex items-center justify-center transition-all">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8]"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#0A66C2] hover:text-white text-gray-500 flex items-center justify-center transition-all">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                </div>
              </div>

              {/* Travel tips / related posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">Travel tips for you</h3>
                  <p className="text-xs text-gray-400 mb-5">Get updated news which provide you tips &amp; tricks of traveling</p>

                  <div className="flex flex-col gap-5">
                    {relatedPosts.slice(0, 4).map((rp) => {
                      const rpFallback = FALLBACK_BG[rp.category] ?? 'from-gray-400 to-gray-600'
                      return (
                        <Link
                          key={rp.id}
                          href={`/blog/${rp.slug}`}
                          className="group flex gap-3 items-start hover:opacity-80 transition-opacity"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
                            {rp.featuredImage ? (
                              <Image
                                src={rp.featuredImage}
                                alt={rp.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${rpFallback}`} />
                            )}
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-[#2534ff] transition-colors leading-snug mb-1">
                              {rp.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-snug">
                              {rp.excerpt}
                            </p>
                            <span className="text-[11px] text-[#2534ff] font-semibold mt-1 inline-block">
                              View Full Article
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

            </aside>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            MORE ARTICLES — bottom row
        ════════════════════════════════════════════ */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 border-t border-gray-100 py-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[#2534ff] text-xs font-bold uppercase tracking-widest mb-1">Keep Reading</p>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">More articles for you</h2>
                </div>
                <Link
                  href={`/blog/category/${category.slug}`}
                  className="hidden sm:flex items-center gap-1.5 text-[#2534ff] font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  More {category.label} guides <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Horizontal scroll on mobile, 3-col grid on desktop */}
              <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
                {relatedPosts.slice(0, 3).map((rp) => {
                  const rpFallback = FALLBACK_BG[rp.category] ?? 'from-gray-400 to-gray-600'
                  const rpCat      = BLOG_CATEGORIES[rp.category]
                  return (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="group shrink-0 w-72 lg:w-auto flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100"
                    >
                      <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
                        {rp.featuredImage ? (
                          <Image
                            src={rp.featuredImage}
                            alt={rp.title}
                            fill
                            sizes="(max-width: 1024px) 288px, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${rpFallback}`} />
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-1.5 flex-1">
                        <p className="text-xs font-semibold text-gray-400">{rpCat?.label ?? rp.category}</p>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#2534ff] transition-colors">
                          {rp.title}
                        </h3>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
                          {rp.excerpt}
                        </p>
                        <span className="text-[#2534ff] text-xs font-semibold mt-1 inline-flex items-center gap-1">
                          View Full Article <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile see more */}
              <div className="sm:hidden text-center mt-6">
                <Link
                  href={`/blog/category/${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-[#2534ff] font-semibold text-sm"
                >
                  More {category.label} guides <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}
