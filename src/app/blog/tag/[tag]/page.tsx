import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogCard from '@/components/blog/BlogCard'
import { type BlogPostSummary } from '@/lib/blog'
import { prisma } from '@/lib/db'

const PUBLIC_SITE_URL = 'https://gowerest.com'

export async function generateMetadata({
  params,
}: {
  params: { tag: string }
}): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag)
  return {
    title: `Posts tagged "${tag}" | Werest Travel Blog`,
    description: `Browse all Werest Travel blog articles tagged with "${tag}".`,
    alternates: { canonical: `${PUBLIC_SITE_URL}/blog/tag/${params.tag}` },
  }
}

async function fetchTagPosts(tag: string): Promise<BlogPostSummary[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', tags: { has: tag } },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, slug: true, title: true, excerpt: true,
        featuredImage: true, category: true, tags: true,
        publishedAt: true, readingTimeMin: true, authorName: true,
      },
    })
    return posts as BlogPostSummary[]
  } catch {
    return []
  }
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag   = decodeURIComponent(params.tag)
  const posts = await fetchTagPosts(tag)

  if (posts.length === 0) notFound()

  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/"    className="hover:text-[#2534ff] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/blog" className="hover:text-[#2534ff] transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-gray-500">Tag: {tag}</span>
          </nav>
        </div>

        {/* Header */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Posts tagged &ldquo;{tag}&rdquo;
          </h1>
          <p className="text-gray-400 text-sm">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
