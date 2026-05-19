export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';
import { getAdminFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/db';

// In development, check the local server so results reflect current code.
// In production, check the live public URL.
const SITE_URL = (
  process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.werest.com')
).replace(/\/$/, '');

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface SeoCheck {
  id:       string;
  category: 'technical' | 'on-page' | 'content';
  label:    string;
  status:   'pass' | 'warn' | 'fail' | 'skip';
  message:  string;
  detail?:  string;
  score:    number;
  max:      number;
  fixHref?: string;
}

export interface SeoReport {
  score:      number;       // 0–100
  grade:      'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  earned:     number;
  maxPossible: number;
  checks:     SeoCheck[];
  checkedAt:  string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function grade(score: number): SeoReport['grade'] {
  if (score >= 95) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

/** Fetch URL with a hard timeout and return { ok, status, text } */
async function safeFetch(url: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const tid   = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res  = await fetch(url, { signal: ctrl.signal, next: { revalidate: 0 } });
    const text = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: '' };
  } finally {
    clearTimeout(tid);
  }
}

/** Pull a meta tag value out of raw HTML */
function metaContent(html: string, ...patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

/* ─── Main audit ─────────────────────────────────────────────────────────── */
export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const checks: SeoCheck[] = [];

  /* ══════════════════════════════════════════════
     TECHNICAL SEO
  ══════════════════════════════════════════════ */

  /* 1. robots.txt */
  {
    const r = await safeFetch(`${SITE_URL}/robots.txt`);
    const hasRobotsFile = existsSync(join(process.cwd(), 'src', 'app', 'robots.ts'));
    checks.push({
      id: 'robots', category: 'technical', label: 'robots.txt',
      status: r.ok ? 'pass' : hasRobotsFile ? 'warn' : 'fail',
      message: r.ok
        ? 'robots.txt is accessible'
        : hasRobotsFile
        ? 'Defined in code, not yet served at this URL'
        : `robots.txt returned ${r.status || 'no response'}`,
      detail: r.ok ? (r.text.slice(0, 120) + (r.text.length > 120 ? '…' : '')) : undefined,
      score: r.ok ? 8 : hasRobotsFile ? 6 : 0, max: 8,
    });
  }

  /* 2. sitemap.xml */
  {
    const r = await safeFetch(`${SITE_URL}/sitemap.xml`);
    const hasSitemapFile = existsSync(join(process.cwd(), 'src', 'app', 'sitemap.ts'));
    const urlCount = r.ok ? (r.text.match(/<url>/g) ?? []).length : 0;
    checks.push({
      id: 'sitemap', category: 'technical', label: 'sitemap.xml',
      status: r.ok ? 'pass' : hasSitemapFile ? 'warn' : 'fail',
      message: r.ok
        ? `sitemap.xml accessible — ${urlCount} URLs indexed`
        : hasSitemapFile
        ? 'Defined in code, not yet served at this URL'
        : `sitemap.xml returned ${r.status || 'no response'}`,
      score: r.ok ? 8 : hasSitemapFile ? 6 : 0, max: 8,
    });
  }

  /* 3–7. Homepage meta tags */
  const hp = await safeFetch(SITE_URL);
  const hpHtml = hp.text;
  const hpOk   = hp.ok;

  /* 3. Homepage title */
  {
    const title = metaContent(hpHtml,
      /<title[^>]*>([\s\S]*?)<\/title>/i,
    );
    const len = title.length;
    const ok  = hpOk && len >= 45 && len <= 70;
    const warn = hpOk && len > 0 && (len < 45 || len > 70);
    checks.push({
      id: 'hp-title', category: 'technical', label: 'Homepage title tag',
      status: !hpOk ? 'skip' : ok ? 'pass' : warn ? 'warn' : 'fail',
      message: !hpOk
        ? 'Could not fetch homepage'
        : !title
        ? 'No <title> tag found'
        : ok
        ? `Title is ${len} chars — ideal`
        : `Title is ${len} chars — ${len < 45 ? 'too short (aim 50–70)' : 'too long (aim ≤ 70)'}`,
      detail: title || undefined,
      score: !hpOk ? 8 : ok ? 8 : warn ? 4 : 0,
      max: 8,
    });
  }

  /* 4. Homepage meta description */
  {
    const desc = metaContent(hpHtml,
      /<meta\s+name=["']description["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']description["']/i,
    );
    const len = desc.length;
    const ok  = hpOk && len >= 120 && len <= 165;
    const warn = hpOk && len > 0 && (len < 120 || len > 165);
    checks.push({
      id: 'hp-desc', category: 'on-page', label: 'Homepage meta description',
      status: !hpOk ? 'skip' : ok ? 'pass' : warn ? 'warn' : 'fail',
      message: !hpOk
        ? 'Could not fetch homepage'
        : !desc
        ? 'No meta description found'
        : ok
        ? `Description is ${len} chars — ideal`
        : `Description is ${len} chars — ${len < 120 ? 'too short (aim 120–160)' : 'too long (aim ≤ 160)'}`,
      detail: desc ? desc.slice(0, 100) + (desc.length > 100 ? '…' : '') : undefined,
      score: !hpOk ? 8 : ok ? 8 : warn ? 4 : 0,
      max: 8,
    });
  }

  /* 5. Open Graph tags */
  {
    const ogTitle = metaContent(hpHtml,
      /<meta\s+property=["']og:title["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+property=["']og:title["']/i,
    );
    const ogDesc = metaContent(hpHtml,
      /<meta\s+property=["']og:description["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+property=["']og:description["']/i,
    );
    const ogImage = metaContent(hpHtml,
      /<meta\s+property=["']og:image["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+property=["']og:image["']/i,
    );
    const present = [!!ogTitle, !!ogDesc, !!ogImage];
    const count   = present.filter(Boolean).length;
    checks.push({
      id: 'og-tags', category: 'technical', label: 'Open Graph tags',
      status: !hpOk ? 'skip' : count === 3 ? 'pass' : count >= 1 ? 'warn' : 'fail',
      message: !hpOk
        ? 'Could not fetch homepage'
        : `${count}/3 OG tags found (title, description, image)`,
      detail: count < 3
        ? `Missing: ${['og:title', 'og:description', 'og:image'].filter((_, i) => !present[i]).join(', ')}`
        : undefined,
      score: !hpOk ? 8 : Math.round((count / 3) * 8),
      max: 8,
    });
  }

  /* 6. Canonical tag */
  {
    const canonical = metaContent(hpHtml,
      /<link\s+rel=["']canonical["']\s+href=["']([^"']*?)["']/i,
      /<link\s+href=["']([^"']*?)["']\s+rel=["']canonical["']/i,
    );
    checks.push({
      id: 'canonical', category: 'technical', label: 'Canonical URL',
      status: !hpOk ? 'skip' : canonical ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage' : canonical ? `Canonical set: ${canonical}` : 'No canonical tag found',
      score: !hpOk ? 4 : canonical ? 4 : 0,
      max: 4,
    });
  }

  /* 7. HTTPS */
  {
    const isHttps = SITE_URL.startsWith('https://');
    checks.push({
      id: 'https', category: 'technical', label: 'HTTPS enabled',
      status: isHttps ? 'pass' : 'fail',
      message: isHttps ? 'Site uses HTTPS' : 'Site is not using HTTPS',
      score: isHttps ? 4 : 0, max: 4,
    });
  }

  /* 8. Viewport / responsive meta tag */
  {
    const hasViewport = hpOk && /<meta\s[^>]*name=["']viewport["']/i.test(hpHtml);
    checks.push({
      id: 'viewport', category: 'technical', label: 'Viewport meta tag',
      status: !hpOk ? 'skip' : hasViewport ? 'pass' : 'fail',
      message: !hpOk
        ? 'Could not fetch homepage'
        : hasViewport
        ? 'Viewport meta tag present — mobile-friendly'
        : 'No viewport meta tag — page may not be mobile-friendly',
      score: !hpOk ? 6 : hasViewport ? 6 : 0, max: 6,
    });
  }

  /* ══════════════════════════════════════════════
     CONTENT SEO (from database)
  ══════════════════════════════════════════════ */

  let publishedPosts: {
    id: string; title: string; slug: string;
    seoTitle: string | null; seoDescription: string | null;
    featuredImage: string | null; excerpt: string | null; tags: string[];
  }[] = [];

  try {
    publishedPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true, seoTitle: true, seoDescription: true, featuredImage: true, excerpt: true, tags: true },
    });
  } catch { /* DB unavailable */ }

  const total = publishedPosts.length;

  /* 8. Blog SEO titles */
  {
    const missing = publishedPosts.filter(p => !p.seoTitle?.trim()).map(p => p.title);
    const tooLong = publishedPosts.filter(p => (p.seoTitle?.length ?? 0) > 70).map(p => p.title);
    const issues  = [...missing, ...tooLong];
    const pct     = total > 0 ? Math.round(((total - issues.length) / total) * 100) : 100;
    checks.push({
      id: 'blog-seo-title', category: 'content', label: 'Blog posts: SEO title',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: total === 0
        ? 'No published posts'
        : issues.length === 0
        ? `All ${total} posts have SEO title (50–70 chars)`
        : `${issues.length}/${total} posts need attention`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 12), max: 12,
      fixHref: '/admin/blog',
    });
  }

  /* 9. Blog SEO descriptions */
  {
    const missing = publishedPosts.filter(p => !p.seoDescription?.trim()).map(p => p.title);
    const tooLong = publishedPosts.filter(p => (p.seoDescription?.length ?? 0) > 165).map(p => p.title);
    const issues  = [...missing, ...tooLong];
    const pct     = total > 0 ? Math.round(((total - issues.length) / total) * 100) : 100;
    checks.push({
      id: 'blog-seo-desc', category: 'content', label: 'Blog posts: SEO description',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: total === 0
        ? 'No published posts'
        : issues.length === 0
        ? `All ${total} posts have SEO description (≤160 chars)`
        : `${issues.length}/${total} posts missing or too long`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 12), max: 12,
      fixHref: '/admin/blog',
    });
  }

  /* 10. Blog featured images */
  {
    const missing = publishedPosts.filter(p => !p.featuredImage).map(p => p.title);
    const pct     = total > 0 ? Math.round(((total - missing.length) / total) * 100) : 100;
    checks.push({
      id: 'blog-images', category: 'content', label: 'Blog posts: featured image',
      status: missing.length === 0 ? 'pass' : missing.length <= 1 ? 'warn' : 'fail',
      message: total === 0
        ? 'No published posts'
        : missing.length === 0
        ? `All ${total} posts have a featured image`
        : `${missing.length}/${total} posts missing featured image`,
      detail: missing.length > 0 ? missing.slice(0, 3).join(', ') : undefined,
      score: Math.round((pct / 100) * 8), max: 8,
      fixHref: '/admin/blog',
    });
  }

  /* 11. Blog tags */
  {
    const noTags = publishedPosts.filter(p => !p.tags || p.tags.length === 0).map(p => p.title);
    checks.push({
      id: 'blog-tags', category: 'content', label: 'Blog posts: tags',
      status: noTags.length === 0 ? 'pass' : noTags.length <= 1 ? 'warn' : 'fail',
      message: total === 0
        ? 'No published posts'
        : noTags.length === 0
        ? `All ${total} posts have tags`
        : `${noTags.length}/${total} posts have no tags`,
      detail: noTags.length > 0 ? noTags.slice(0, 3).join(', ') : undefined,
      score: noTags.length === 0 ? 4 : noTags.length === 1 ? 2 : 0, max: 4,
      fixHref: '/admin/blog',
    });
  }

  /* ── Score ── */
  const earned     = checks.reduce((s, c) => s + c.score, 0);
  const maxPossible = checks.reduce((s, c) => s + c.max, 0);
  const score      = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;

  const report: SeoReport = {
    score,
    grade: grade(score),
    earned,
    maxPossible,
    checks,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, data: report });
}
