import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: {
      slug: true, title: true, excerpt: true, publishedAt: true,
      authorName: true, category: true, featuredImage: true,
    },
  })

  const SITE = 'https://www.werest.com'

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Werest Travel Blog — Thailand Travel Tips &amp; Guides</title>
    <link>${SITE}/blog</link>
    <description>Private transfers, day tours and travel tips across Thailand.</description>
    <language>en</language>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <author>werestcompany@gmail.com (${p.authorName})</author>
    </item>`).join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
