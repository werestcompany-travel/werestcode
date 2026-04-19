'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogEditor, { BlogPost, BlogPostFormData } from '@/components/admin/BlogEditor';

export default function EditBlogPostPage() {
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const id       = params.id;

  const [post,    setPost]    = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchPost = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await fetch(`/api/admin/blog/${id}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (res.status === 404) { toast.error('Post not found'); router.push('/admin/blog'); return; }
      const json = await res.json();
      setPost(json.data);
    } catch {
      toast.error('Failed to load post');
    } finally {
      setFetching(false);
    }
  }, [id, router]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  async function handleSubmit(data: BlogPostFormData) {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/blog/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save post');
      toast.success('Post saved!');
      setPost(json.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  }

  /* Loading state */
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2534ff] animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="relative">
      {/* "View on site" banner — only for published posts */}
      {post.status === 'PUBLISHED' && post.slug && (
        <div className="bg-green-50 border-b border-green-100 px-6 py-2 flex items-center justify-between">
          <p className="text-xs text-green-700 font-medium">
            This post is live at{' '}
            <span className="font-semibold">/blog/{post.slug}</span>
          </p>
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            View on site <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      <BlogEditor
        mode="edit"
        initialData={post}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
