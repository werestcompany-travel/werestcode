import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { ROUTES, ALL_ROUTES } from '@/lib/routes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.werest.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/transfers`,                     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/airport-transfers`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/tours`,                         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/attractions`,                   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/blog`,                          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/gift-vouchers`,                 lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/deals`,                         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/corporate`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/partner`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/partners`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/group-booking`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/cancellation-policy`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`,                lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`,              lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/tracking`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Blog category pages
  const categoryRoutes: MetadataRoute.Sitemap = [
    'bangkok', 'pattaya', 'thailand', 'phuket', 'krabi',
  ].map(cat => ({
    url: `${SITE_URL}/blog/category/${cat}`,
    lastModified: now,
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

  // Dynamic tour pages
  let tourRoutes: MetadataRoute.Sitemap = [];
  try {
    const tours = await prisma.tour.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    tourRoutes = tours.map(t => ({
      url: `${SITE_URL}/tours/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
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
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Programmatic SEO route pages — new [slug] TransferRoute pages
  const transferRoutePages: MetadataRoute.Sitemap = ALL_ROUTES.map(r => ({
    url: `${SITE_URL}/routes/${r.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const seen = new Set(routePages.map(r => r.url));
  const dedupedTransferRoutePages = transferRoutePages.filter(r => !seen.has(r.url));

  return [...staticRoutes, ...categoryRoutes, ...tourRoutes, ...blogRoutes, ...attractionRoutes, ...routePages, ...dedupedTransferRoutePages];
}
