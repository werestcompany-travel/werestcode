'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, ChevronRight, FileText, Eye, Archive,
  Search, Loader2, BookOpen, LayoutDashboard, Tag, Ticket, Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt: string | null;
  readingTimeMin: number;
  authorName: string;
  createdAt: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  BANGKOK:  'bg-blue-100 text-blue-700',
  PATTAYA:  'bg-emerald-100 text-emerald-700',
  THAILAND: 'bg-red-100 text-red-700',
  PHUKET:   'bg-purple-100 text-purple-700',
  KRABI:    'bg-orange-100 text-orange-700',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED:  'bg-amber-100 text-amber-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  DRAFT:     <FileText className="w-3 h-3" />,
  PUBLISHED: <Eye className="w-3 h-3" />,
  ARCHIVED:  <Archive className="w-3 h-3" />,
};

/* ─── Nav links ─────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/admin',                  label: 'Dashboard',          icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { href: '/admin/blog',             label: 'Blog',               icon: <BookOpen className="w-3.5 h-3.5" /> },
  { href: '/admin/attractions',      label: 'Attractions',        icon: <Package className="w-3.5 h-3.5" /> },
  { href: '/admin/attraction-bookings', label: 'Attraction Bookings', icon: <Ticket className="w-3.5 h-3.5" /> },
  { href: '/admin/discount-codes',   label: 'Discount Codes',     icon: <Tag className="w-3.5 h-3.5" /> },
];

/* ─── Skeleton row ──────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-3/4 mb-1.5" /><div className="h-3 bg-gray-100 rounded w-1/2" /></td>
      <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
      <td className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
      <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
      <td className="px-5 py-4"><div className="h-8 bg-gray-100 rounded-xl w-24" /></td>
    </tr>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminBlogPage() {
  const router = useRouter();

  const [posts,         setPosts]         = useState<BlogPost[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [categoryFilter,setCategoryFilter]= useState('All');
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [confirmId,     setConfirmId]     = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter  !== 'All') params.set('status',   statusFilter);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      const res  = await fetch(`/api/admin/blog?${params.toString()}`);
      if (res.status === 401) { router.push('/admin/login'); return; }
      const json = await res.json();
      setPosts(json.data ?? []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter, categoryFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  /* ── Delete ── */
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res  = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Delete failed');
      toast.success('Post deleted');
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  /* ── Derived data ── */
  const filtered = posts.filter((p) => {
    if (!searchQuery) return true;
    return p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    total:     posts.length,
    published: posts.filter((p) => p.status === 'PUBLISHED').length,
    draft:     posts.filter((p) => p.status === 'DRAFT').length,
  };

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header nav */}
      <div className="bg-[#2534ff] text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">W</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-200" />
              <span className="font-semibold">Blog Posts</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/admin" className="hover:text-gray-700 transition-colors">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">Blog Posts</span>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 bg-[#2534ff] hover:bg-[#1a26e0] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Posts',      value: stats.total,     color: 'text-[#2534ff]' },
            { label: 'Published',        value: stats.published, color: 'text-green-600' },
            { label: 'Drafts',           value: stats.draft,     color: 'text-gray-600'  },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title…"
              className="border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] bg-white"
          >
            <option value="All">All Categories</option>
            <option value="BANGKOK">Bangkok</option>
            <option value="PATTAYA">Pattaya</option>
            <option value="THAILAND">Thailand</option>
            <option value="PHUKET">Phuket</option>
            <option value="KRABI">Krabi</option>
          </select>
          {(statusFilter !== 'All' || categoryFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); setSearchQuery(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Read</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="font-semibold text-gray-500">No posts found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery || statusFilter !== 'All' || categoryFilter !== 'All'
                          ? 'Try adjusting your filters.'
                          : 'Create your first blog post to get started.'}
                      </p>
                      {!searchQuery && statusFilter === 'All' && categoryFilter === 'All' && (
                        <Link
                          href="/admin/blog/new"
                          className="inline-flex items-center gap-2 mt-4 bg-[#2534ff] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#1a26e0] transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Create First Post
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/60 transition-colors group">
                      {/* Title */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">by {post.authorName}</p>
                      </td>

                      {/* Category badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {post.category.charAt(0) + post.category.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[post.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_ICONS[post.status]}
                          {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                        </span>
                      </td>

                      {/* Published date */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(post.publishedAt)}
                      </td>

                      {/* Reading time */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {post.readingTimeMin} min
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#2534ff] border border-[#2534ff]/20 bg-[#2534ff]/5 hover:bg-[#2534ff]/10 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(post.id)}
                            disabled={deletingId === post.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === post.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Row count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {posts.length} post{posts.length !== 1 ? 's' : ''}
                {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All') && ' (filtered)'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delete this post?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the blog post. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmId && handleDelete(confirmId)}
                disabled={!!deletingId}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
