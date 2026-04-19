'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, ChevronLeft } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  status: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  authorName: string;
  authorTitle: string | null;
  faqs: { q: string; a: string }[] | null;
  ctaBlocks: { title: string; description: string; href: string; buttonLabel: string }[] | null;
  relatedServices: { title: string; href: string; description?: string }[] | null;
  relatedSlugs: string[];
  readingTimeMin: number;
}

export type BlogPostFormData = Omit<BlogPost, 'id'>;

export interface BlogEditorProps {
  initialData?: Partial<BlogPost>;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  loading: boolean;
  mode: 'create' | 'edit';
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CATEGORIES = ['BANGKOK', 'PATTAYA', 'THAILAND', 'PHUKET', 'KRABI'];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
      {children}
    </label>
  );
}

const inputCls =
  'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] w-full bg-white';

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function BlogEditor({ initialData, onSubmit, loading, mode }: BlogEditorProps) {
  const router = useRouter();

  /* ── Form state ── */
  const [title, setTitle]             = useState(initialData?.title ?? '');
  const [slug, setSlug]               = useState(initialData?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt]         = useState(initialData?.excerpt ?? '');
  const [content, setContent]         = useState(initialData?.content ?? '');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage ?? '');
  const [category, setCategory]       = useState(initialData?.category ?? CATEGORIES[0]);
  const [tags, setTags]               = useState((initialData?.tags ?? []).join(', '));
  const [authorName, setAuthorName]   = useState(initialData?.authorName ?? 'Werest Travel');
  const [authorTitle, setAuthorTitle] = useState(initialData?.authorTitle ?? '');
  const [readingTimeMin, setReadingTimeMin] = useState(String(initialData?.readingTimeMin ?? 5));
  const [seoTitle, setSeoTitle]       = useState(initialData?.seoTitle ?? '');
  const [seoDesc, setSeoDesc]         = useState(initialData?.seoDescription ?? '');
  const [status, setStatus]           = useState(initialData?.status ?? 'DRAFT');
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : '',
  );
  const [relatedSlugs, setRelatedSlugs] = useState((initialData?.relatedSlugs ?? []).join(', '));

  // Content blocks
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    initialData?.faqs?.length ? initialData.faqs : [],
  );
  const [ctaBlocks, setCtaBlocks] = useState<
    { title: string; description: string; href: string; buttonLabel: string }[]
  >(initialData?.ctaBlocks?.length ? initialData.ctaBlocks : []);
  const [relatedServices, setRelatedServices] = useState<
    { title: string; href: string; description: string }[]
  >(
    initialData?.relatedServices?.length
      ? initialData.relatedServices.map((s) => ({ description: '', ...s }))
      : [],
  );

  /* ── Auto-slug from title ── */
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  /* ── Build payload and submit ── */
  async function handleSubmit(overrideStatus?: string) {
    const payload: BlogPostFormData = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      featuredImage: featuredImage || null,
      category,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: overrideStatus ?? status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      seoTitle: seoTitle || null,
      seoDescription: seoDesc || null,
      authorName: authorName || 'Werest Travel',
      authorTitle: authorTitle || null,
      faqs: faqs.filter((f) => f.q.trim()).length > 0 ? faqs.filter((f) => f.q.trim()) : null,
      ctaBlocks:
        ctaBlocks.filter((c) => c.title.trim()).length > 0
          ? ctaBlocks.filter((c) => c.title.trim())
          : null,
      relatedServices:
        relatedServices.filter((s) => s.title.trim()).length > 0
          ? relatedServices.filter((s) => s.title.trim())
          : null,
      relatedSlugs: relatedSlugs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      readingTimeMin: parseInt(readingTimeMin, 10) || 5,
    };
    await onSubmit(payload);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold text-sm">
            {mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}
          </span>
          {mode === 'edit' && initialData?.status && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                initialData.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700'
                  : initialData.status === 'ARCHIVED'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {initialData.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {mode === 'create' ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={loading}
                className="px-4 py-2 bg-[#2534ff] hover:bg-[#1a26e0] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publish
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading}
              className="px-5 py-2 bg-[#2534ff] hover:bg-[#1a26e0] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">

        {/* ── Section 1: Content ── */}
        <SectionCard title="Content">
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Top 10 Things to Do in Bangkok"
              className={`${inputCls} text-lg font-semibold`}
            />
          </div>

          {/* Slug */}
          <div>
            <Label>Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">/blog/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="auto-generated-from-title"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
            {slug && (
              <p className="text-xs text-gray-400 mt-1">
                Preview:{' '}
                <span className="text-[#2534ff]">https://werest.com/blog/{slug}</span>
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <Label>Excerpt * (2–3 sentences)</Label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary that appears in blog listing cards and SEO previews…"
              rows={3}
              className={inputCls}
            />
          </div>

          {/* Content */}
          <div>
            <Label>Content * (HTML or plain text)</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your full article here. HTML tags like <h2>, <p>, <ul>, <strong> are supported."
              rows={20}
              className={`${inputCls} font-mono text-xs leading-relaxed`}
            />
          </div>

          {/* Featured Image */}
          <div>
            <Label>Featured Image URL</Label>
            <input
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={`${inputCls} font-mono text-xs`}
            />
            {featuredImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-40 relative bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Featured image preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Section 2: Settings ── */}
        <SectionCard title="Settings">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <Label>Category *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Reading time */}
            <div>
              <Label>Reading Time (minutes)</Label>
              <input
                type="number"
                min="1"
                max="60"
                value={readingTimeMin}
                onChange={(e) => setReadingTimeMin(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (comma-separated)</Label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Bangkok, street food, travel tips, budget travel"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author name */}
            <div>
              <Label>Author Name</Label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Werest Travel"
                className={inputCls}
              />
            </div>

            {/* Author title */}
            <div>
              <Label>Author Title</Label>
              <input
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                placeholder="Travel Expert"
                className={inputCls}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: SEO ── */}
        <SectionCard title="SEO">
          <div>
            <Label>SEO Title</Label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Leave blank to use article title"
              className={inputCls}
            />
            <p className={`text-xs mt-1 ${seoTitle.length > 60 ? 'text-red-500' : seoTitle.length > 50 ? 'text-amber-500' : 'text-gray-400'}`}>
              {seoTitle.length} / 60 chars
              {seoTitle.length > 60 ? ' — too long' : seoTitle.length >= 50 && seoTitle.length <= 60 ? ' — ideal' : ''}
            </p>
          </div>

          <div>
            <Label>SEO Description</Label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="A compelling meta description (150–160 chars) that appears in search results…"
              rows={3}
              className={inputCls}
            />
            <p className={`text-xs mt-1 ${seoDesc.length > 160 ? 'text-red-500' : seoDesc.length > 150 ? 'text-amber-500' : 'text-gray-400'}`}>
              {seoDesc.length} / 160 chars
              {seoDesc.length > 160 ? ' — too long' : seoDesc.length >= 150 && seoDesc.length <= 160 ? ' — ideal' : ''}
            </p>
          </div>
        </SectionCard>

        {/* ── Section 4: Content Blocks ── */}
        <SectionCard title="Content Blocks">

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>FAQs ({faqs.length}/10)</Label>
              {faqs.length < 10 && (
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                  className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:text-[#1a26e0] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ
                </button>
              )}
            </div>
            {faqs.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">
                No FAQs yet. Click "Add FAQ" to create one.
              </p>
            )}
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">FAQ {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                  <input
                    value={faq.q}
                    onChange={(e) =>
                      setFaqs(faqs.map((f, j) => (j === i ? { ...f, q: e.target.value } : f)))
                    }
                    placeholder="Question?"
                    className={`${inputCls} font-semibold`}
                  />
                  <textarea
                    value={faq.a}
                    onChange={(e) =>
                      setFaqs(faqs.map((f, j) => (j === i ? { ...f, a: e.target.value } : f)))
                    }
                    rows={3}
                    placeholder="Answer…"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5" />

          {/* CTA Blocks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>CTA Blocks ({ctaBlocks.length}/3)</Label>
              {ctaBlocks.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setCtaBlocks([
                      ...ctaBlocks,
                      { title: '', description: '', href: '', buttonLabel: 'Learn More' },
                    ])
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:text-[#1a26e0] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add CTA Block
                </button>
              )}
            </div>
            {ctaBlocks.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">
                No CTA blocks yet. Add one to promote a service within the article.
              </p>
            )}
            <div className="space-y-3">
              {ctaBlocks.map((cta, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">CTA Block {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setCtaBlocks(ctaBlocks.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={cta.title}
                      onChange={(e) =>
                        setCtaBlocks(
                          ctaBlocks.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)),
                        )
                      }
                      placeholder="CTA Title"
                      className={inputCls}
                    />
                    <input
                      value={cta.buttonLabel}
                      onChange={(e) =>
                        setCtaBlocks(
                          ctaBlocks.map((c, j) =>
                            j === i ? { ...c, buttonLabel: e.target.value } : c,
                          ),
                        )
                      }
                      placeholder="Button Label (e.g. Book Now)"
                      className={inputCls}
                    />
                  </div>
                  <input
                    value={cta.description}
                    onChange={(e) =>
                      setCtaBlocks(
                        ctaBlocks.map((c, j) =>
                          j === i ? { ...c, description: e.target.value } : c,
                        ),
                      )
                    }
                    placeholder="Short description…"
                    className={inputCls}
                  />
                  <input
                    value={cta.href}
                    onChange={(e) =>
                      setCtaBlocks(
                        ctaBlocks.map((c, j) => (j === i ? { ...c, href: e.target.value } : c)),
                      )
                    }
                    placeholder="Link URL (e.g. /attractions/sanctuary-of-truth)"
                    className={`${inputCls} font-mono text-xs`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5" />

          {/* Related Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Related Services</Label>
              <button
                type="button"
                onClick={() =>
                  setRelatedServices([
                    ...relatedServices,
                    { title: '', href: '', description: '' },
                  ])
                }
                className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:text-[#1a26e0] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>
            {relatedServices.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">
                No related services yet. Link to tours, transfers, or attractions.
              </p>
            )}
            <div className="space-y-3">
              {relatedServices.map((svc, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Service {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setRelatedServices(relatedServices.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={svc.title}
                      onChange={(e) =>
                        setRelatedServices(
                          relatedServices.map((s, j) =>
                            j === i ? { ...s, title: e.target.value } : s,
                          ),
                        )
                      }
                      placeholder="Service Name"
                      className={inputCls}
                    />
                    <input
                      value={svc.href}
                      onChange={(e) =>
                        setRelatedServices(
                          relatedServices.map((s, j) =>
                            j === i ? { ...s, href: e.target.value } : s,
                          ),
                        )
                      }
                      placeholder="/attractions/my-attraction"
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                  <input
                    value={svc.description ?? ''}
                    onChange={(e) =>
                      setRelatedServices(
                        relatedServices.map((s, j) =>
                          j === i ? { ...s, description: e.target.value } : s,
                        ),
                      )
                    }
                    placeholder="Optional short description"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Section 5: Publishing ── */}
        <SectionCard title="Publishing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Publish date */}
            <div>
              <Label>Publish Date (optional)</Label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Related slugs */}
          <div>
            <Label>Related Post Slugs (comma-separated)</Label>
            <input
              value={relatedSlugs}
              onChange={(e) => setRelatedSlugs(e.target.value)}
              placeholder="top-10-bangkok-temples, pattaya-nightlife-guide"
              className={`${inputCls} font-mono text-xs`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the slugs of related articles to link at the bottom of this post.
            </p>
          </div>
        </SectionCard>

        {/* ── Sticky footer actions ── */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('PUBLISHED')}
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#2534ff] hover:bg-[#1a26e0] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="px-6 py-2.5 bg-[#2534ff] hover:bg-[#1a26e0] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
