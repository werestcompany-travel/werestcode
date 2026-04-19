import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const SITE_URL = 'https://www.werest.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/blog`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/attractions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/tracking`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Blog category pages
  const categoryRoutes: MetadataRoute.Sitemap = [
    'bangkok', 'pattaya', 'thailand', 'phuket', 'krabi',
  ].map(cat => ({
    url: `${SITE_URL}/blog/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    blogRoutes = posts.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during static build — skip dynamic routes
  }

  // Dynamic attraction pages
  let attractionRoutes: MetadataRoute.Sitemap = [];
  try {
    const attractions = await db.attractionListing.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    attractionRoutes = attractions.map(a => ({
      url: `${SITE_URL}/attractions/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // skip
  }

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...attractionRoutes];
}
