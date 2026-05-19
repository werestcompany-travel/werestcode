import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.werest.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All bots: allow public pages, block private/admin/API paths
        userAgent: '*',
        allow: [
          '/',
          '/blog/',
          '/blog/category/',
          '/attractions/',
          '/tours/',
          '/routes/',
          '/booking',
          '/tracking',
          '/about',
          '/contact',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/confirmation/',
          '/account/',
          '/auth/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/results',
        ],
        crawlDelay: 1,
      },
      {
        // Google: no crawl delay, relax a few extra private paths
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/api/', '/confirmation/', '/account/', '/auth/'],
      },
      {
        // Block AI training scrapers
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
