// ─── Blog utilities ───────────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featuredImage: string | null
  category: 'BANGKOK' | 'PATTAYA' | 'THAILAND' | 'PHUKET' | 'KRABI'
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  seoTitle: string | null
  seoDescription: string | null
  authorName: string
  authorTitle: string | null
  faqs: { q: string; a: string }[] | null
  ctaBlocks: { title: string; description: string; href: string; buttonLabel: string }[] | null
  relatedServices: { title: string; href: string; description?: string }[] | null
  relatedSlugs: string[]
  readingTimeMin: number
  createdAt: string
  updatedAt: string
}

export interface BlogPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  featuredImage: string | null
  category: 'BANGKOK' | 'PATTAYA' | 'THAILAND' | 'PHUKET' | 'KRABI'
  publishedAt: string | null
  readingTimeMin: number
  authorName: string
}

// ─── Category config ──────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = {
  BANGKOK: {
    label: 'Bangkok',
    slug: 'bangkok',
    color: 'bg-blue-100 text-[#2534ff]',
    dot: 'bg-[#2534ff]',
    description: 'Guides, tips and transfer advice for Bangkok — temples, nightlife, street food and more.',
  },
  PATTAYA: {
    label: 'Pattaya',
    slug: 'pattaya',
    color: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    description: 'Everything you need to know about Pattaya — beaches, nightlife, day trips and transfers.',
  },
  THAILAND: {
    label: 'Thailand',
    slug: 'thailand',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    description: 'Country-wide travel guides, itineraries and practical advice for exploring Thailand.',
  },
  PHUKET: {
    label: 'Phuket',
    slug: 'phuket',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
    description: 'Island hopping, beaches, restaurants and transport guides for Phuket.',
  },
  KRABI: {
    label: 'Krabi',
    slug: 'krabi',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    description: 'Rock climbing, limestone cliffs, island tours and hidden beaches in Krabi.',
  },
} as const

export type BlogCategoryKey = keyof typeof BLOG_CATEGORIES

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatReadingTime(min: number): string {
  return `${min} min read`
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function slugToCategory(slug: string): BlogCategoryKey | null {
  const entry = Object.entries(BLOG_CATEGORIES).find(
    ([, v]) => v.slug === slug,
  )
  return entry ? (entry[0] as BlogCategoryKey) : null
}

// ─── JSON-LD schema generators ────────────────────────────────────────────────

export function generateBlogSchema(post: BlogPost, siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.authorName,
      ...(post.authorTitle ? { jobTitle: post.authorTitle } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Werest Travel',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: BLOG_CATEGORIES[post.category]?.label ?? post.category,
    timeRequired: `PT${post.readingTimeMin}M`,
  }
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateFAQSchema(faqs: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}
