'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, ChevronLeft, ImagePlus, Bold, Italic, Link2, Heading2, Heading3, List, ListOrdered, Minus, Sparkles, Quote, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

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

function FeaturedImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      onUploaded(json.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="shrink-0">
      <input ref={inputRef} type="file" id="feat-img-upload"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleChange} className="hidden" />
      <label htmlFor="feat-img-upload"
        className={`flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50 text-gray-600'}`}>
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
        {uploading ? 'Uploading…' : 'Upload'}
      </label>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

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

  // SEO auto-fill
  const [seoGenerating, setSeoGenerating] = useState(false);

  /* ── TipTap editor ── */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Write your article here…' }),
      CharacterCount,
    ],
    content: initialData?.content ?? '',
    onUpdate: ({ editor: ed }) => {
      setContent(ed.getHTML());
    },
  });

  const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;

  const autoFillSeo = async () => {
    if (!title.trim()) { toast.error('Add a title first'); return; }
    setSeoGenerating(true);
    try {
      const res = await fetch('/api/admin/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'blog', title, description: excerpt || content.slice(0, 500), category }),
      });
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        if (d.seoTitle)       setSeoTitle(d.seoTitle);
        if (d.seoDescription) setSeoDesc(d.seoDescription);
        if (d.tags?.length)   setTags(d.tags.join(', '));
        if (d.excerpt && !excerpt.trim()) setExcerpt(d.excerpt);
        toast.success('SEO fields auto-filled');
      }
    } catch { toast.error('Generation failed'); }
    finally { setSeoGenerating(false); }
  };

  // Image insert panel
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImgPanel,  setShowImgPanel]  = useState(false);
  const [imgTab,        setImgTab]        = useState<'url' | 'upload'>('url');
  const [imgUrl,        setImgUrl]        = useState('');
  const [imgCaption,    setImgCaption]    = useState('');
  const [uploading,     setUploading]     = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError,   setUploadError]   = useState<string | null>(null);

  // Insert an image into the TipTap editor
  const insertImageIntoEditor = useCallback((src: string, alt: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor]);

  function handleInsertImage() {
    if (!imgUrl.trim()) return;
    insertImageIntoEditor(imgUrl.trim(), imgCaption.trim());
    setImgUrl('');
    setImgCaption('');
    setShowImgPanel(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      // Auto-insert once uploaded
      insertImageIntoEditor(json.url, imgCaption.trim());
      setImgCaption('');
      setUploadPreview(null);
      setShowImgPanel(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

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
            <Label>Content *</Label>

            {/* ── TipTap Toolbar ── */}
            <div className="flex flex-wrap items-center gap-0.5 border border-gray-200 border-b-0 rounded-t-xl bg-gray-50 px-2 py-1.5">
              {/* Heading buttons */}
              <button type="button" title="Heading 1"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                H1
              </button>
              <button type="button" title="Heading 2"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Heading2 className="w-4 h-4" />
              </button>
              <button type="button" title="Heading 3"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1" />

              {/* Inline formatting */}
              <button type="button" title="Bold"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('bold') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" title="Italic"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('italic') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" title="Link"
                onClick={() => {
                  const url = window.prompt('Enter URL:', 'https://');
                  if (url) editor?.chain().focus().setLink({ href: url }).run();
                }}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('link') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Link2 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1" />

              {/* Blockquote + Code */}
              <button type="button" title="Blockquote"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('blockquote') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Quote className="w-4 h-4" />
              </button>
              <button type="button" title="Code block"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('codeBlock') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <Code2 className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1" />

              {/* Lists */}
              <button type="button" title="Bullet list"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('bulletList') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <List className="w-4 h-4" />
              </button>
              <button type="button" title="Numbered list"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded-lg transition-colors ${editor?.isActive('orderedList') ? 'bg-[#2534ff] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}>
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" title="Horizontal rule"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-300 mx-1" />

              {/* Insert image */}
              <button
                type="button"
                title="Insert image"
                onClick={() => setShowImgPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showImgPanel ? 'bg-[#2534ff] text-white' : 'text-[#2534ff] hover:bg-[#2534ff]/10'}`}
              >
                <ImagePlus className="w-4 h-4" />
                Insert Image
              </button>
            </div>

            {/* ── Image insert panel ── */}
            {showImgPanel && (
              <div className="border border-gray-200 border-b-0 bg-gray-50">

                {/* Tab bar */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 pt-2">
                  <div className="flex gap-1">
                    {(['url', 'upload'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setImgTab(t); setUploadError(null); }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors ${imgTab === t ? 'bg-white border border-gray-200 border-b-white -mb-px text-[#2534ff]' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {t === 'url' ? '🔗 Paste URL' : '📁 Upload from Computer'}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setShowImgPanel(false); setUploadPreview(null); setUploadError(null); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors mb-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="px-4 py-3">

                  {/* Caption — shared between tabs */}
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Caption (optional)</p>
                    <input
                      value={imgCaption}
                      onChange={(e) => setImgCaption(e.target.value)}
                      placeholder="e.g. Bangkok skyline at sunset (Source: Unsplash)"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] w-full bg-white"
                    />
                  </div>

                  {/* ── URL tab ── */}
                  {imgTab === 'url' && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Image URL *</p>
                        <input
                          value={imgUrl}
                          onChange={(e) => setImgUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] w-full bg-white font-mono"
                          onKeyDown={(e) => e.key === 'Enter' && handleInsertImage()}
                        />
                      </div>
                      {imgUrl && (
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt="preview" className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleInsertImage}
                        disabled={!imgUrl.trim()}
                        className="flex items-center gap-1.5 bg-[#2534ff] disabled:opacity-40 hover:bg-[#1a26e0] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
                      >
                        <ImagePlus className="w-3.5 h-3.5" /> Insert
                      </button>
                    </div>
                  )}

                  {/* ── Upload tab ── */}
                  {imgTab === 'upload' && (
                    <div className="space-y-3">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="blog-img-upload"
                      />

                      {/* Drop zone */}
                      <label
                        htmlFor="blog-img-upload"
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors ${uploading ? 'border-gray-200 bg-gray-50 pointer-events-none' : 'border-gray-300 bg-white hover:border-[#2534ff] hover:bg-blue-50/30'}`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-[#2534ff] animate-spin mb-2" />
                            <p className="text-xs font-semibold text-gray-500">Uploading…</p>
                          </>
                        ) : uploadPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={uploadPreview} alt="preview" className="max-h-40 rounded-xl object-contain" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-[#2534ff]/10 rounded-2xl flex items-center justify-center mb-3">
                              <ImagePlus className="w-6 h-6 text-[#2534ff]" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Click to choose a file</p>
                            <p className="text-xs text-gray-400">or drag and drop here</p>
                            <p className="text-[11px] text-gray-400 mt-2">JPG, PNG, WebP, GIF — max 8 MB</p>
                          </>
                        )}
                      </label>

                      {uploadError && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                          ⚠️ {uploadError}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ── TipTap Editor ── */}
            <div className="border border-gray-200 rounded-b-xl bg-white focus-within:border-[#2534ff] focus-within:ring-2 focus-within:ring-[#2534ff]/20 transition-all">
              <EditorContent
                editor={editor}
                className="min-h-[400px] px-4 py-3 prose max-w-none text-sm text-gray-700 [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {charCount.toLocaleString()} characters · Rich text editor — use the toolbar to format headings, bold, links, lists, and insert images.
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <Label>Featured Image</Label>

            {featuredImage ? (
              /* ── Preview with remove ── */
              <div className="mt-1 rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100 aspect-[16/7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="Featured image" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button type="button" onClick={() => setFeaturedImage('')}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              /* ── URL + upload zone ── */
              <div className="space-y-2 mt-1">
                {/* URL input */}
                <div className="flex items-center gap-2">
                  <input
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="Paste image URL…"
                    className={`${inputCls} font-mono text-xs`}
                  />
                  <span className="text-xs text-gray-400 shrink-0">or</span>
                  <FeaturedImageUpload onUploaded={setFeaturedImage} />
                </div>
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
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={autoFillSeo}
              disabled={seoGenerating}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50"
            >
              {seoGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {seoGenerating ? 'Generating…' : 'Auto-fill SEO'}
            </button>
          </div>
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
