import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { ROUTES, ALL_ROUTES } from '@/lib/routes';

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
    const posts = await prisma.blogPost.findMany({
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
    const attractions = await prisma.attractionListing.findMany({
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

  // Programmatic SEO route pages — legacy [route] pages
  const routePages: MetadataRoute.Sitemap = ROUTES.map(r => ({
    url: `${SITE_URL}/routes/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Programmatic SEO route pages — new [slug] TransferRoute pages
  const transferRoutePages: MetadataRoute.Sitemap = ALL_ROUTES.map(r => ({
    url: `${SITE_URL}/routes/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const seen = new Set(routePages.map(r => r.url));
  const dedupedTransferRoutePages = transferRoutePages.filter(r => !seen.has(r.url));

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...attractionRoutes, ...routePages, ...dedupedTransferRoutePages];
}
