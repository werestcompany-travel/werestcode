export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAdminFromCookies } from '@/lib/auth';

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

interface SeoOutput {
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  excerpt: string;
}

/* ─── System prompts — top-score SEO rules per content type ─────────────── */

const SYSTEM_PROMPT_BLOG = `You are a senior SEO strategist for Werest Travel, a Thailand travel company.
Generate top-scoring SEO metadata for BLOG POSTS following Google's ranking algorithms and E-E-A-T principles.
Always respond with valid JSON only — no markdown, no explanation.

CONTENT TYPE: Informational blog post. Readers are researching, not buying.
FORBIDDEN: Any sales language — "Book now", "Reserve", "Buy", "Best prices", "Order". This will hurt rankings.

=== SEO ALGORITHM RULES ===

seoTitle (50-60 chars — mobile-first, Google truncates at 60):
• Place the PRIMARY KEYWORD in the first 3-5 words — keyword prominence boosts CTR and ranking
• Use high-CTR power words: "Best", "Complete Guide", "Top [N]", "How to", "Ultimate", "Tips", "What to Know"
• Numbers increase CTR by up to 36% — use them: "10 Best...", "7 Things..."
• Match INFORMATIONAL intent — title should answer a question or promise a guide
• Never include brand name — wastes chars and hurts keyword prominence
• Example good titles: "Best Beaches in Koh Samui: Complete 2025 Guide" / "10 Things to Do in Chiang Mai"

seoDescription (140-155 chars — character count must be in this range):
• Open with the PRIMARY KEYWORD naturally within the first 15 words (Google bolds it in SERP)
• Include 1 SECONDARY/LSI keyword — boosts semantic relevance
• Use active voice, present tense — increases CTR
• Preview the VALUE: what insight, tips, or answers the reader gets
• End with a curiosity hook or benefit statement: "...and everything you need to plan the perfect trip."
• NEVER duplicate the title — Google sees this as thin content
• No HTML entities — write "and" not "&", no special characters

tags — 6-8 keywords following LSI + intent strategy:
• 1-2 HEAD TERMS (high volume, broad): e.g. "phuket travel", "thailand tourism"
• 3-4 LONG-TAIL keywords (specific, lower competition, higher conversion): e.g. "best beaches phuket for families", "phuket travel tips first time"
• 1-2 SEMANTIC/LSI terms (related concepts Google associates with the topic): e.g. "andaman sea", "thai islands"
• All lowercase, 2-6 words each, no brand names, no duplicates
• Target "People Also Ask" style queries for featured snippet eligibility

excerpt (max 200 chars):
• Hook the reader with the key insight or surprising fact from the article
• Informational, authoritative, E-E-A-T tone — show expertise
• Contains primary keyword naturally in first sentence
• 1-2 sentences only`;

const SYSTEM_PROMPT_TOUR = `You are a senior SEO and conversion specialist for Werest Travel, a premium Thailand travel company.
Generate top-scoring SEO metadata for TOUR PRODUCT PAGES following Google's commercial ranking algorithms.
Always respond with valid JSON only — no markdown, no explanation.

CONTENT TYPE: Tour booking/product page. Visitors have TRANSACTIONAL intent — they want to book.

=== SEO ALGORITHM RULES ===

seoTitle (50-60 chars — mobile-first, Google truncates at 60):
• Lead with DESTINATION or SERVICE TYPE as the primary keyword — highest relevance signal
• Include a COMMERCIAL MODIFIER: "Private", "Full-Day", "Guided", "Book", "Small Group"
• Match TRANSACTIONAL intent — title should signal this is a bookable product
• Include location for local SEO: city or region name
• Add "| Werest" only if space allows (saves ~9 chars vs "| Werest Travel")
• Example: "Full-Day Phi Phi Island Tour | Werest" / "Private Bangkok Temple Tour"

seoDescription (140-155 chars — character count must be in this range):
• Open with PRIMARY KEYWORD within first 15 words (Google bolds it in SERP)
• Include TRUST SIGNALS — these improve CTR significantly: "verified guides", "fixed price", "instant confirmation", "professional driver"
• Include a VALUE PROPOSITION: what makes this tour worth booking (unique access, private, small group)
• End with a TRANSACTIONAL CTA: "Book your private tour today." / "Reserve your spot now."
• No HTML entities — write "and" not "&", no special characters
• Never repeat the title word-for-word

tags — 6-8 keywords following commercial SEO strategy:
• 1-2 BROAD COMMERCIAL terms: e.g. "phuket day tour", "bangkok guided tour"
• 3-4 TRANSACTIONAL LONG-TAIL: e.g. "book private phi phi island tour", "full day tour from phuket"
• 1-2 LOCAL/DESTINATION terms: e.g. "phi phi island thailand", "andaman sea tour"
• Include transactional modifiers: "book", "private", "guided", "from [city]"
• All lowercase, no duplicates

excerpt (max 200 chars):
• Lead with the tour's HIGHLIGHT MOMENT or unique selling point
• Use vivid, experiential language — paint a picture of the experience
• Implicitly or explicitly invite booking
• 1-2 punchy sentences`;

const SYSTEM_PROMPT_ATTRACTION = `You are a senior SEO and conversion specialist for Werest Travel, a premium Thailand travel company.
Generate top-scoring SEO metadata for ATTRACTION TICKET PAGES following Google's commercial ranking algorithms.
Always respond with valid JSON only — no markdown, no explanation.

CONTENT TYPE: Attraction ticket/booking page. Visitors have TRANSACTIONAL intent — they want to buy tickets.

=== SEO ALGORITHM RULES ===

seoTitle (50-60 chars — mobile-first, Google truncates at 60):
• Lead with the ATTRACTION NAME — it is the primary keyword and search term
• Include a TICKET/ENTRY modifier: "Tickets", "Entry", "Skip-the-Line", "Official Tickets"
• Add LOCATION for local SEO — city name increases local pack relevance
• Add "| Werest" only if space allows
• Example: "Grand Palace Tickets Bangkok | Werest" / "Phi Phi Island Ferry Tickets"

seoDescription (140-155 chars — character count must be in this range):
• Open with the ATTRACTION NAME within first 10 words (Google bolds matched keywords in SERP)
• Include URGENCY or AVAILABILITY signal: "limited slots", "best availability", "online only"
• Include TRUST SIGNAL: "official tickets", "instant e-ticket", "skip the queue"
• End with TRANSACTIONAL CTA: "Get your tickets today." / "Book online for instant confirmation."
• No HTML entities — write "and" not "&"
• Never repeat the title word-for-word

tags — 6-8 keywords following commercial SEO strategy:
• 1-2 BROAD TERMS: e.g. "grand palace bangkok", "thailand attraction"
• 3-4 TRANSACTIONAL LONG-TAIL: e.g. "grand palace tickets online", "skip the line grand palace bangkok", "buy grand palace entry ticket"
• 1-2 COMPARISON/ALTERNATIVE terms visitors might also search: e.g. "wat phra kaew tickets", "bangkok temple visit"
• Include "tickets", "entry", "book", "buy", "online" modifiers
• All lowercase, no duplicates

excerpt (max 200 chars):
• Open with the attraction's WOW FACTOR — most impressive or famous feature
• Mention ease of booking or skip-the-line benefit
• 1-2 sentences, punchy and exciting`;

function getSystemPrompt(type: string): string {
  if (type === 'blog')       return SYSTEM_PROMPT_BLOG;
  if (type === 'tour')       return SYSTEM_PROMPT_TOUR;
  if (type === 'attraction') return SYSTEM_PROMPT_ATTRACTION;
  return SYSTEM_PROMPT_TOUR; // safe default
}

/* ─── Space cleaner — collapses multiple spaces / trims ─────────────────── */
function cleanSpaces(str: string): string {
  return str.replace(/\s{2,}/g, ' ').trim();
}

/* ─── Algorithmic fallback — context-aware ──────────────────────────────── */

function algorithmicFallback(
  type: string,
  title: string,
  description?: string,
  location?: string,
  category?: string,
): SeoOutput {
  // Treat empty string the same as missing — avoids "in  with" double-space
  const loc = location?.trim() || 'Thailand';

  /* seoTitle */
  let seoTitle: string;
  if (type === 'blog') {
    // Informational framing — no brand suffix
    seoTitle = title.length <= 60 ? title : title.slice(0, 57) + '…';
  } else {
    const rawTitle = `${title} | Werest Travel`;
    seoTitle = rawTitle.length <= 60 ? rawTitle : title.length <= 60 ? title : title.slice(0, 57) + '…';
  }

  /* seoDescription */
  let seoDescription: string;
  if (type === 'blog') {
    // Value-driven, no CTA
    if (description && description.trim().length > 50) {
      const trimmed = description.trim().replace(/\s+/g, ' ');
      seoDescription = trimmed.length <= 155 ? trimmed : trimmed.slice(0, 152) + '…';
    } else {
      seoDescription = `Everything you need to know about ${title}${location ? ` in ${location}` : ''}. Tips, highlights, and travel insights to help you plan the perfect trip.`;
      if (seoDescription.length > 155) seoDescription = seoDescription.slice(0, 152) + '…';
    }
  } else if (type === 'tour') {
    if (description && description.trim().length > 50) {
      const trimmed = description.trim().replace(/\s+/g, ' ').slice(0, 120);
      seoDescription = `${trimmed}. Book your private tour with Werest Travel — verified guides and instant confirmation.`;
      if (seoDescription.length > 155) seoDescription = seoDescription.slice(0, 152) + '…';
    } else {
      seoDescription = `Experience ${title} in ${loc} with a private guided tour. Verified guides, fixed prices, instant confirmation. Book your spot with Werest Travel today.`;
      if (seoDescription.length > 155) seoDescription = seoDescription.slice(0, 152) + '…';
    }
  } else {
    // attraction
    if (description && description.trim().length > 50) {
      const trimmed = description.trim().replace(/\s+/g, ' ').slice(0, 110);
      seoDescription = `${trimmed}. Get your tickets with Werest Travel — skip the queue and enjoy instant confirmation.`;
      if (seoDescription.length > 155) seoDescription = seoDescription.slice(0, 152) + '…';
    } else {
      seoDescription = `Visit ${title} in ${loc} and experience one of Thailand's top attractions. Book tickets online with Werest Travel for the best price and instant confirmation.`;
      if (seoDescription.length > 155) seoDescription = seoDescription.slice(0, 152) + '…';
    }
  }

  /* tags */
  const wordSource = `${title} ${location ?? ''} ${category ?? ''}`.toLowerCase();
  const baseWords = [...new Set(
    wordSource
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2),
  )].slice(0, 5);
  const suffixTag = type === 'blog'
    ? `${loc.toLowerCase()} travel guide`
    : type === 'tour'
    ? `${loc.toLowerCase()} private tour`
    : `${loc.toLowerCase()} tickets`;
  const tags = [...new Set([...baseWords, suffixTag])].slice(0, 8);

  /* excerpt */
  let excerpt = '';
  if (description && description.trim()) {
    const firstSentence = description.trim().split(/[.!?]/)[0].trim();
    excerpt = firstSentence.slice(0, 195);
    if (excerpt && !/[.!?]$/.test(excerpt)) excerpt += '.';
  } else if (type === 'blog') {
    excerpt = `A complete guide to ${title}${location ? ` in ${location}` : ''} — tips, highlights, and everything you need to plan your visit.`;
  } else if (type === 'tour') {
    excerpt = `Explore ${title} on a private guided tour with Werest Travel${location ? ` in ${location}` : ''}. Fixed prices, instant confirmation.`;
  } else {
    excerpt = `Discover ${title}${location ? ` in ${location}` : ''} — book your tickets online with Werest Travel for the best price.`;
  }

  return { seoTitle, seoDescription, tags, excerpt };
}

function validateAndTruncate(output: SeoOutput): SeoOutput {
  return {
    seoTitle:       cleanSpaces(output.seoTitle).slice(0, 60),
    seoDescription: cleanSpaces(output.seoDescription).slice(0, 160),
    tags:           [...new Set(output.tags.map(t => cleanSpaces(t.toLowerCase())))].filter(Boolean).slice(0, 8),
    excerpt:        cleanSpaces(output.excerpt).slice(0, 200),
  };
}

/* ─── POST handler ───────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: {
    type: 'blog' | 'tour' | 'attraction';
    title: string;
    description?: string;
    location?: string;
    category?: string;
    tags?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { type, title, description, location, category, tags } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const userMessage = [
        `Title: ${title}`,
        location    ? `Location: ${location}`                    : '',
        category    ? `Category: ${category}`                    : '',
        description ? `Content: ${description.slice(0, 600)}`   : '',
        tags        ? `Existing tags: ${tags}`                   : '',
      ].filter(Boolean).join('\n');

      const completion = await getOpenAI().chat.completions.create({
        model:    MODEL,
        messages: [
          { role: 'system', content: getSystemPrompt(type) },
          { role: 'user',   content: userMessage            },
        ],
        max_tokens:  500,
        temperature: 0.3,
      });

      const raw     = completion.choices[0]?.message?.content ?? '';
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed  = JSON.parse(cleaned) as SeoOutput;

      if (parsed.seoTitle && parsed.seoDescription) {
        const result = validateAndTruncate({
          seoTitle:       parsed.seoTitle       ?? '',
          seoDescription: parsed.seoDescription ?? '',
          tags:           Array.isArray(parsed.tags) ? parsed.tags : [],
          excerpt:        parsed.excerpt         ?? '',
        });
        return NextResponse.json({ success: true, data: result });
      }
    } catch (err) {
      console.error('[generate-seo] OpenAI error, falling back to algorithmic:', err);
    }
  }

  // Algorithmic fallback
  const fallback = algorithmicFallback(type, title, description, location, category);
  const result   = validateAndTruncate(fallback);
  return NextResponse.json({ success: true, data: result });
}
