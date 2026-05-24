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
  id:          string;
  category:    'technical' | 'on-page' | 'content';
  perspective: 'desktop' | 'mobile' | 'shared';
  label:       string;
  status:      'pass' | 'warn' | 'fail' | 'skip';
  message:     string;
  detail?:     string;
  score:       number;
  max:         number;
  fixHref?:    string;
}

export interface SeoReport {
  score:         number;       // 0–100
  grade:         'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  earned:        number;
  maxPossible:   number;
  desktopScore:  number;
  desktopGrade:  'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  desktopEarned: number;
  desktopMax:    number;
  mobileScore:   number;
  mobileGrade:   'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  mobileEarned:  number;
  mobileMax:     number;
  checks:        SeoCheck[];
  checkedAt:     string;
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

/** Decode HTML entities so character counts are accurate (e.g. &amp; → &) */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ');
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
      id: 'robots', category: 'technical', perspective: 'shared', label: 'robots.txt',
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
      id: 'sitemap', category: 'technical', perspective: 'shared', label: 'sitemap.xml',
      status: r.ok ? 'pass' : hasSitemapFile ? 'warn' : 'fail',
      message: r.ok
        ? `sitemap.xml accessible — ${urlCount} URLs indexed`
        : hasSitemapFile
        ? 'Defined in code, not yet served at this URL'
        : `sitemap.xml returned ${r.status || 'no response'}`,
      score: r.ok ? 8 : hasSitemapFile ? 6 : 0, max: 8,
    });
  }

  /* 3–8. Homepage checks — fetch once */
  const hp     = await safeFetch(SITE_URL);
  const hpHtml = hp.text;
  const hpOk   = hp.ok;

  /* 3. Homepage title */
  {
    const title = metaContent(hpHtml, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const len = title.length;
    const ok  = hpOk && len >= 45 && len <= 70;
    const warn = hpOk && len > 0 && (len < 45 || len > 70);
    checks.push({
      id: 'hp-title', category: 'technical', perspective: 'shared', label: 'Homepage title tag',
      status: !hpOk ? 'skip' : ok ? 'pass' : warn ? 'warn' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
        : !title    ? 'No <title> tag found'
        : ok        ? `Title is ${len} chars — ideal`
        : `Title is ${len} chars — ${len < 45 ? 'too short (aim 50–70)' : 'too long (aim ≤ 70)'}`,
      detail: title || undefined,
      score: !hpOk ? 8 : ok ? 8 : warn ? 4 : 0,
      max: 8,
    });
  }

  /* 4. Homepage meta description */
  {
    const desc = decodeEntities(metaContent(hpHtml,
      /<meta\s+name=["']description["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']description["']/i,
    ));
    const len = desc.length;
    const ok  = hpOk && len >= 120 && len <= 160;
    const warn = hpOk && len > 0 && (len < 120 || len > 160);
    checks.push({
      id: 'hp-desc', category: 'on-page', perspective: 'shared', label: 'Homepage meta description',
      status: !hpOk ? 'skip' : ok ? 'pass' : warn ? 'warn' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
        : !desc  ? 'No meta description found'
        : ok     ? `Description is ${len} chars — ideal`
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
      id: 'og-tags', category: 'technical', perspective: 'desktop', label: 'Open Graph tags',
      status: !hpOk ? 'skip' : count === 3 ? 'pass' : count >= 1 ? 'warn' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
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
      id: 'canonical', category: 'technical', perspective: 'shared', label: 'Canonical URL',
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
      id: 'https', category: 'technical', perspective: 'shared', label: 'HTTPS enabled',
      status: isHttps ? 'pass' : 'fail',
      message: isHttps ? 'Site uses HTTPS' : 'Site is not using HTTPS',
      score: isHttps ? 4 : 0, max: 4,
    });
  }

  /* 8. Viewport / responsive meta tag */
  {
    const hasViewport = hpOk && /<meta\s[^>]*name=["']viewport["']/i.test(hpHtml);
    checks.push({
      id: 'viewport', category: 'technical', perspective: 'mobile', label: 'Viewport meta tag',
      status: !hpOk ? 'skip' : hasViewport ? 'pass' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
        : hasViewport ? 'Viewport meta tag present — mobile-friendly'
        : 'No viewport meta tag — page may not be mobile-friendly',
      score: !hpOk ? 6 : hasViewport ? 6 : 0, max: 6,
    });
  }

  /* 9. JSON-LD Structured Data */
  {
    const hasJsonLd = hpOk && /<script[^>]+type=["']application\/ld\+json["']/i.test(hpHtml);
    const schemaTypes: string[] = [];
    if (hasJsonLd) {
      // String @type: "TypeName"
      for (const m of hpHtml.matchAll(/"@type"\s*:\s*"([^"]+)"/g))
        schemaTypes.push(m[1]);
      // Array @type: ["Type1","Type2"]
      for (const m of hpHtml.matchAll(/"@type"\s*:\s*\[([^\]]+)\]/g))
        for (const t of m[1].matchAll(/"([^"]+)"/g))
          schemaTypes.push(t[1]);
    }
    const uniqueTypes     = [...new Set(schemaTypes)];
    const hasTravelAgency = uniqueTypes.some(t => t === 'TravelAgency' || t === 'LocalBusiness');
    checks.push({
      id: 'json-ld', category: 'technical', perspective: 'desktop', label: 'Structured data (JSON-LD)',
      status: !hpOk ? 'skip' : !hasJsonLd ? 'fail' : hasTravelAgency ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : !hasJsonLd     ? 'No JSON-LD structured data found — critical for rich results'
        : hasTravelAgency ? `JSON-LD present with TravelAgency / LocalBusiness schema`
        : 'JSON-LD found but missing TravelAgency or LocalBusiness type',
      detail: uniqueTypes.length > 0 ? `Types found: ${uniqueTypes.join(', ')}` : undefined,
      score: !hpOk ? 10 : !hasJsonLd ? 0 : hasTravelAgency ? 10 : 5,
      max: 10,
    });
  }

  /* 10. H1 tag on homepage */
  {
    const h1Match = hpHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1Text  = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
    const h1Count = (hpHtml.match(/<h1[\s>]/gi) ?? []).length;
    checks.push({
      id: 'h1-tag', category: 'on-page', perspective: 'shared', label: 'H1 tag on homepage',
      status: !hpOk ? 'skip' : h1Count === 1 ? 'pass' : h1Count === 0 ? 'fail' : 'warn',
      message: !hpOk    ? 'Could not fetch homepage'
        : h1Count === 0 ? 'No H1 tag found — every page needs exactly one H1'
        : h1Count === 1 ? `H1 present`
        : `${h1Count} H1 tags found — page should have exactly one`,
      detail: h1Text ? h1Text.slice(0, 80) + (h1Text.length > 80 ? '…' : '') : undefined,
      score: !hpOk ? 6 : h1Count === 1 ? 6 : h1Count > 1 ? 3 : 0,
      max: 6,
    });
  }

  /* 11. OG image accessible */
  {
    const ogImage = metaContent(hpHtml,
      /<meta\s+property=["']og:image["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+property=["']og:image["']/i,
    );
    let ogOk = false;
    let ogStatus = 0;
    if (ogImage) {
      // Resolve URL — in dev, rewrite any production-domain URL to localhost
      // so we can actually test the image without deploying.
      const PROD_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.werest.com').replace(/\/$/, '');
      let imgUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;
      if (process.env.NODE_ENV === 'development' && imgUrl.startsWith(PROD_URL)) {
        imgUrl = imgUrl.replace(PROD_URL, SITE_URL);
      }
      const r = await safeFetch(imgUrl, 5000);
      ogOk = r.ok;
      ogStatus = r.status;
    }
    checks.push({
      id: 'og-image', category: 'technical', perspective: 'desktop', label: 'OG image accessible',
      status: !hpOk ? 'skip' : !ogImage ? 'fail' : ogOk ? 'pass' : 'fail',
      message: !hpOk   ? 'Could not fetch homepage'
        : !ogImage     ? 'No og:image tag found — required for social sharing previews'
        : ogOk         ? `OG image loads successfully`
        : `OG image returned ${ogStatus || 'no response'} — fix so social shares show a preview`,
      detail: ogImage || undefined,
      score: !hpOk ? 6 : !ogImage ? 0 : ogOk ? 6 : 0,
      max: 6,
    });
  }

  /* 12. Twitter Card */
  {
    const twCard  = metaContent(hpHtml,
      /<meta\s+name=["']twitter:card["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']twitter:card["']/i,
    );
    const twTitle = metaContent(hpHtml,
      /<meta\s+name=["']twitter:title["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']twitter:title["']/i,
    );
    const count = [twCard, twTitle].filter(Boolean).length;
    checks.push({
      id: 'twitter-card', category: 'technical', perspective: 'desktop', label: 'Twitter / X Card tags',
      status: !hpOk ? 'skip' : count === 2 ? 'pass' : count === 1 ? 'warn' : 'fail',
      message: !hpOk    ? 'Could not fetch homepage'
        : count === 2   ? `Twitter Card (${twCard}) — ready for X/Twitter previews`
        : count === 1   ? 'Partial Twitter Card — add twitter:title and twitter:description'
        : 'No Twitter Card tags found',
      score: !hpOk ? 4 : count === 2 ? 4 : count === 1 ? 2 : 0,
      max: 4,
    });
  }

  /* 13. HTML lang attribute */
  {
    const langMatch = hpHtml.match(/<html[^>]+lang=["']([^"']+)["']/i);
    const lang = langMatch?.[1] ?? '';
    checks.push({
      id: 'html-lang', category: 'technical', perspective: 'shared', label: 'HTML lang attribute',
      status: !hpOk ? 'skip' : lang ? 'pass' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
        : lang ? `lang="${lang}" set — helps search engines & screen readers`
        : 'No lang attribute on <html> — add lang="en" for accessibility & SEO',
      score: !hpOk ? 4 : lang ? 4 : 0,
      max: 4,
    });
  }

  /* 14. Favicon (Desktop) */
  {
    const r = await safeFetch(`${SITE_URL}/favicon.ico`, 4000);
    checks.push({
      id: 'favicon', category: 'technical', perspective: 'desktop',
      label: 'Favicon',
      status: !hpOk ? 'skip' : r.ok ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : r.ok ? 'favicon.ico is accessible — shows in desktop browser tabs and bookmarks'
        : 'favicon.ico not found — desktop browsers show a blank tab icon',
      score: !hpOk ? 5 : r.ok ? 5 : 0, max: 5,
    });
  }

  /* 15. FAQPage structured data (Desktop) */
  {
    const hasFaq = hpOk && hpHtml.includes('"FAQPage"');
    checks.push({
      id: 'schema-faq', category: 'technical', perspective: 'desktop',
      label: 'FAQPage structured data',
      status: !hpOk ? 'skip' : hasFaq ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : hasFaq ? 'FAQPage JSON-LD found — eligible for Google FAQ rich results on desktop'
        : 'No FAQPage schema — adding one can unlock FAQ rich results in desktop SERPs',
      score: !hpOk ? 6 : hasFaq ? 6 : 0, max: 6,
    });
  }

  /* 16. Web Manifest (Desktop) */
  {
    const hasManifestLink = hpOk && /<link[^>]+rel=["']manifest["']/i.test(hpHtml);
    const manifestFile = existsSync(join(process.cwd(), 'public', 'site.webmanifest'));
    checks.push({
      id: 'manifest', category: 'technical', perspective: 'desktop',
      label: 'Web app manifest',
      status: !hpOk ? 'skip' : (hasManifestLink || manifestFile) ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : (hasManifestLink || manifestFile) ? 'site.webmanifest present — enables add-to-homescreen and PWA features'
        : 'No web manifest found — add site.webmanifest for bookmark icons and PWA support',
      score: !hpOk ? 3 : (hasManifestLink || manifestFile) ? 3 : 0, max: 3,
    });
  }

  /* 17. Mobile SERP title length (Mobile) */
  {
    const title = metaContent(hpHtml, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const len   = title.length;
    const ok    = hpOk && len > 0 && len <= 60;
    const warn  = hpOk && len > 60 && len <= 70;
    checks.push({
      id: 'mobile-title', category: 'on-page', perspective: 'mobile',
      label: 'Title length for mobile SERP',
      status: !hpOk ? 'skip' : !title ? 'fail' : ok ? 'pass' : warn ? 'warn' : 'fail',
      message: !hpOk ? 'Could not fetch homepage'
        : !title  ? 'No title tag found'
        : ok      ? `Title is ${len} chars — fits mobile SERP (≤60)`
        : warn    ? `Title is ${len} chars — may be truncated on mobile (aim ≤60)`
        : `Title is ${len} chars — will be cut off on mobile SERPs (aim ≤60)`,
      detail: title ? title.slice(0, 80) : undefined,
      score: !hpOk ? 6 : ok ? 6 : warn ? 3 : 0, max: 6,
    });
  }

  /* 18. Apple Touch Icon (Mobile) */
  {
    const hasAppleIcon = hpOk && /<link[^>]+rel=["']apple-touch-icon["']/i.test(hpHtml);
    checks.push({
      id: 'apple-touch-icon', category: 'technical', perspective: 'mobile',
      label: 'Apple Touch Icon',
      status: !hpOk ? 'skip' : hasAppleIcon ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : hasAppleIcon ? 'Apple touch icon present — shows a branded icon on iOS home screen'
        : 'No apple-touch-icon link — iOS users see a generic screenshot when bookmarking',
      score: !hpOk ? 4 : hasAppleIcon ? 4 : 0, max: 4,
    });
  }

  /* 19. Viewport user-scalable (Mobile) */
  {
    const viewportContent = metaContent(hpHtml,
      /<meta\s+name=["']viewport["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']viewport["']/i,
    );
    const blocksZoom = /user-scalable\s*=\s*no/i.test(viewportContent);
    checks.push({
      id: 'viewport-zoom', category: 'technical', perspective: 'mobile',
      label: 'Pinch-to-zoom not blocked',
      status: !hpOk ? 'skip' : !viewportContent ? 'warn' : blocksZoom ? 'fail' : 'pass',
      message: !hpOk ? 'Could not fetch homepage'
        : !viewportContent ? 'No viewport tag found'
        : blocksZoom ? 'user-scalable=no detected — this fails Google accessibility & mobile usability'
        : 'Viewport allows user scaling — passes mobile usability requirements',
      score: !hpOk ? 4 : blocksZoom ? 0 : viewportContent ? 4 : 2, max: 4,
    });
  }

  /* 20. Theme Color meta (Mobile) */
  {
    const themeColor = metaContent(hpHtml,
      /<meta\s+name=["']theme-color["']\s+content=["']([^"']*?)["']/i,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']theme-color["']/i,
    );
    checks.push({
      id: 'theme-color', category: 'technical', perspective: 'mobile',
      label: 'Theme-color meta tag',
      status: !hpOk ? 'skip' : themeColor ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : themeColor ? `theme-color "${themeColor}" set — browser chrome matches your brand on mobile`
        : 'No theme-color meta tag — add one to brand the mobile browser address bar',
      score: !hpOk ? 3 : themeColor ? 3 : 0, max: 3,
    });
  }

  /* 21. Lazy-loading images (Mobile) */
  {
    const totalImgs = (hpHtml.match(/<img[\s>]/gi) ?? []).length;
    const lazyImgs  = (hpHtml.match(/<img[^>]+loading=["']lazy["']/gi) ?? []).length;
    const hasLazy   = lazyImgs > 0;
    checks.push({
      id: 'lazy-loading', category: 'technical', perspective: 'mobile',
      label: 'Image lazy loading',
      status: !hpOk ? 'skip' : totalImgs === 0 ? 'skip' : hasLazy ? 'pass' : 'warn',
      message: !hpOk ? 'Could not fetch homepage'
        : totalImgs === 0 ? 'No images found on homepage'
        : hasLazy ? `${lazyImgs}/${totalImgs} images use loading="lazy" — improves mobile performance`
        : `None of ${totalImgs} images use loading="lazy" — add to improve mobile load speed`,
      score: !hpOk ? 4 : totalImgs === 0 ? 4 : hasLazy ? 4 : 0, max: 4,
    });
  }

  /* ══════════════════════════════════════════════
     CONTENT SEO (from database)
  ══════════════════════════════════════════════ */

  /* ── Blog posts ──────────────────────────────────────────────────────────── */
  let publishedPosts: {
    id: string; title: string; slug: string;
    seoTitle: string | null; seoDescription: string | null;
    featuredImage: string | null; excerpt: string | null; tags: string[];
  }[] = [];

  try {
    publishedPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true, title: true, slug: true,
        seoTitle: true, seoDescription: true,
        featuredImage: true, excerpt: true, tags: true,
      },
    });
  } catch { /* DB unavailable */ }

  const totalPosts = publishedPosts.length;

  /* 14. Blog SEO titles */
  {
    const missing = publishedPosts.filter(p => !p.seoTitle?.trim()).map(p => p.title);
    const tooLong = publishedPosts.filter(p => (p.seoTitle?.length ?? 0) > 70).map(p => p.title);
    const issues  = [...missing, ...tooLong];
    const pct     = totalPosts > 0 ? Math.round(((totalPosts - issues.length) / totalPosts) * 100) : 100;
    checks.push({
      id: 'blog-seo-title', category: 'content', perspective: 'shared', label: 'Blog posts: SEO title',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: totalPosts === 0    ? 'No published posts'
        : issues.length === 0      ? `All ${totalPosts} posts have SEO title (50–70 chars)`
        : `${issues.length}/${totalPosts} posts need attention`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 10), max: 10,
      fixHref: '/admin/blog',
    });
  }

  /* 15. Blog SEO descriptions */
  {
    const missing = publishedPosts.filter(p => !p.seoDescription?.trim()).map(p => p.title);
    const tooLong = publishedPosts.filter(p => (p.seoDescription?.length ?? 0) > 160).map(p => p.title);
    const issues  = [...missing, ...tooLong];
    const pct     = totalPosts > 0 ? Math.round(((totalPosts - issues.length) / totalPosts) * 100) : 100;
    checks.push({
      id: 'blog-seo-desc', category: 'content', perspective: 'shared', label: 'Blog posts: SEO description',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: totalPosts === 0    ? 'No published posts'
        : issues.length === 0      ? `All ${totalPosts} posts have SEO description (≤160 chars)`
        : `${issues.length}/${totalPosts} posts missing or too long`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 10), max: 10,
      fixHref: '/admin/blog',
    });
  }

  /* 16. Blog featured images */
  {
    const missing = publishedPosts.filter(p => !p.featuredImage).map(p => p.title);
    const pct     = totalPosts > 0 ? Math.round(((totalPosts - missing.length) / totalPosts) * 100) : 100;
    checks.push({
      id: 'blog-images', category: 'content', perspective: 'shared', label: 'Blog posts: featured image',
      status: missing.length === 0 ? 'pass' : missing.length <= 1 ? 'warn' : 'fail',
      message: totalPosts === 0     ? 'No published posts'
        : missing.length === 0      ? `All ${totalPosts} posts have a featured image`
        : `${missing.length}/${totalPosts} posts missing featured image`,
      detail: missing.length > 0 ? missing.slice(0, 3).join(', ') : undefined,
      score: Math.round((pct / 100) * 8), max: 8,
      fixHref: '/admin/blog',
    });
  }

  /* 17. Blog tags */
  {
    const noTags = publishedPosts.filter(p => !p.tags || p.tags.length === 0).map(p => p.title);
    checks.push({
      id: 'blog-tags', category: 'content', perspective: 'shared', label: 'Blog posts: tags',
      status: noTags.length === 0 ? 'pass' : noTags.length <= 1 ? 'warn' : 'fail',
      message: totalPosts === 0    ? 'No published posts'
        : noTags.length === 0      ? `All ${totalPosts} posts have tags`
        : `${noTags.length}/${totalPosts} posts have no tags`,
      detail: noTags.length > 0 ? noTags.slice(0, 3).join(', ') : undefined,
      score: noTags.length === 0 ? 4 : noTags.length === 1 ? 2 : 0, max: 4,
      fixHref: '/admin/blog',
    });
  }

  /* 18. Blog SEO title uniqueness */
  {
    const titlesWithSeo = publishedPosts.filter(p => p.seoTitle?.trim());
    const seen   = new Map<string, string[]>();
    for (const p of titlesWithSeo) {
      const key = p.seoTitle!.trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(p.title);
    }
    const dupes = [...seen.values()].filter(arr => arr.length > 1);
    checks.push({
      id: 'blog-title-unique', category: 'content', perspective: 'shared', label: 'Blog posts: unique SEO titles',
      status: dupes.length === 0 ? 'pass' : 'fail',
      message: totalPosts === 0  ? 'No published posts'
        : dupes.length === 0     ? `All SEO titles are unique — no duplicate content risk`
        : `${dupes.length} duplicate SEO title${dupes.length > 1 ? 's' : ''} found`,
      detail: dupes.length > 0 ? `Duplicates: ${dupes.map(d => d[0]).slice(0, 2).join(', ')}` : undefined,
      score: dupes.length === 0 ? 6 : 0, max: 6,
      fixHref: '/admin/blog',
    });
  }

  /* 19. Blog excerpts */
  {
    const noExcerpt = publishedPosts.filter(p => !p.excerpt?.trim()).map(p => p.title);
    const pct = totalPosts > 0 ? Math.round(((totalPosts - noExcerpt.length) / totalPosts) * 100) : 100;
    checks.push({
      id: 'blog-excerpt', category: 'content', perspective: 'shared', label: 'Blog posts: excerpt',
      status: noExcerpt.length === 0 ? 'pass' : noExcerpt.length <= 1 ? 'warn' : 'fail',
      message: totalPosts === 0       ? 'No published posts'
        : noExcerpt.length === 0      ? `All ${totalPosts} posts have excerpts`
        : `${noExcerpt.length}/${totalPosts} posts missing excerpt`,
      detail: noExcerpt.length > 0 ? noExcerpt.slice(0, 3).join(', ') : undefined,
      score: Math.round((pct / 100) * 4), max: 4,
      fixHref: '/admin/blog',
    });
  }

  /* ── Tours ───────────────────────────────────────────────────────────────── */
  let activeTours: { id: string; title: string; slug: string; metaTitle: string | null; metaDesc: string | null }[] = [];
  try {
    activeTours = await prisma.tour.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, metaTitle: true, metaDesc: true },
    });
  } catch { /* DB unavailable */ }

  const totalTours = activeTours.length;

  /* 20. Tours SEO meta title */
  {
    const missing = activeTours.filter(t => !t.metaTitle?.trim()).map(t => t.title);
    const tooLong = activeTours.filter(t => (t.metaTitle?.length ?? 0) > 70).map(t => t.title);
    const issues  = [...new Set([...missing, ...tooLong])];
    const pct     = totalTours > 0 ? Math.round(((totalTours - issues.length) / totalTours) * 100) : 100;
    checks.push({
      id: 'tours-seo-title', category: 'content', perspective: 'shared', label: 'Tours: SEO meta title',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: totalTours === 0    ? 'No active tours in database'
        : issues.length === 0      ? `All ${totalTours} tours have SEO title (≤70 chars)`
        : `${issues.length}/${totalTours} tours missing or too long`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 10), max: 10,
      fixHref: '/admin/tours',
    });
  }

  /* 21. Tours SEO meta description */
  {
    const missing = activeTours.filter(t => !t.metaDesc?.trim()).map(t => t.title);
    const tooLong = activeTours.filter(t => (t.metaDesc?.length ?? 0) > 160).map(t => t.title);
    const issues  = [...new Set([...missing, ...tooLong])];
    const pct     = totalTours > 0 ? Math.round(((totalTours - issues.length) / totalTours) * 100) : 100;
    checks.push({
      id: 'tours-seo-desc', category: 'content', perspective: 'shared', label: 'Tours: SEO meta description',
      status: issues.length === 0 ? 'pass' : issues.length <= 2 ? 'warn' : 'fail',
      message: totalTours === 0    ? 'No active tours in database'
        : issues.length === 0      ? `All ${totalTours} tours have SEO description (≤160 chars)`
        : `${issues.length}/${totalTours} tours missing or too long`,
      detail: issues.length > 0 ? `Issues: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '…' : ''}` : undefined,
      score: Math.round((pct / 100) * 10), max: 10,
      fixHref: '/admin/tours',
    });
  }

  /* ── Score ── */
  const earned      = checks.reduce((s, c) => s + c.score, 0);
  const maxPossible = checks.reduce((s, c) => s + c.max, 0);
  const score       = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;

  // Desktop: desktop-tagged + shared
  const desktopChecks  = checks.filter(c => c.perspective === 'desktop' || c.perspective === 'shared');
  const desktopEarned  = desktopChecks.reduce((s, c) => s + c.score, 0);
  const desktopMax     = desktopChecks.reduce((s, c) => s + c.max, 0);
  const desktopScore   = desktopMax > 0 ? Math.round((desktopEarned / desktopMax) * 100) : 0;

  // Mobile: mobile-tagged + shared
  const mobileChecks  = checks.filter(c => c.perspective === 'mobile' || c.perspective === 'shared');
  const mobileEarned  = mobileChecks.reduce((s, c) => s + c.score, 0);
  const mobileMax     = mobileChecks.reduce((s, c) => s + c.max, 0);
  const mobileScore   = mobileMax > 0 ? Math.round((mobileEarned / mobileMax) * 100) : 0;

  const report: SeoReport = {
    score,
    grade:         grade(score),
    earned,
    maxPossible,
    desktopScore,
    desktopGrade:  grade(desktopScore),
    desktopEarned,
    desktopMax,
    mobileScore,
    mobileGrade:   grade(mobileScore),
    mobileEarned,
    mobileMax,
    checks,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, data: report });
}
