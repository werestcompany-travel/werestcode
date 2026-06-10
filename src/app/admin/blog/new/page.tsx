'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { BlogPostFormData } from '@/components/admin/BlogEditor';
const BlogEditor = dynamic(() => import('@/components/admin/BlogEditor'), { ssr: false, loading: () => <div className="p-8 text-gray-400">Loading editor…</div> });

export default function NewBlogPostPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: BlogPostFormData) {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/blog', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create post');
      toast.success('Post created!');
      router.push(`/admin/blog/${json.data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
      setLoading(false);
    }
  }

  return (
    <BlogEditor
      mode="create"
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
