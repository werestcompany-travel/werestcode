'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Star, CheckCircle2, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type EntityType = 'TOUR' | 'ATTRACTION' | 'TRANSFER';

interface Review {
  id:          string;
  entityType:  EntityType;
  entityId:    string;
  entityName:  string;
  rating:      number;
  title:       string | null;
  body:        string;
  authorName:  string;
  authorEmail: string;
  verified:    boolean;
  isPublished: boolean;
  adminNotes:  string | null;
  createdAt:   string;
}

const ENTITY_COLORS: Record<EntityType, string> = {
  TOUR:       'bg-blue-100 text-blue-700',
  ATTRACTION: 'bg-purple-100 text-purple-700',
  TRANSFER:   'bg-green-100 text-green-700',
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<'all' | 'pending' | 'published'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      toast.success(current ? 'Review unpublished' : 'Review published ✓');
      load();
    } else {
      toast.error('Failed to update review');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Review deleted');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      toast.error('Failed to delete review');
    }
  };

  const pendingCount = reviews.filter((r) => !r.isPublished).length;

  return (
    <AdminShell title="Reviews" subtitle="Moderate customer reviews before they go live">

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['pending', 'published', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f}{f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
        <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                r.isPublished ? 'border-gray-100' : 'border-amber-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ENTITY_COLORS[r.entityType]}`}>
                    {r.entityType}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{r.entityName}</span>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {!r.isPublished && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                      Awaiting approval
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(r.id, r.isPublished)}
                    title={r.isPublished ? 'Unpublish' : 'Publish'}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      r.isPublished
                        ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {r.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stars + author */}
              <div className="flex items-center gap-3 mb-3">
                <Stars rating={r.rating} />
                <span className="text-xs text-gray-500">
                  by <strong>{r.authorName}</strong>
                  <span className="text-gray-300 mx-1">·</span>
                  {r.authorEmail}
                  <span className="text-gray-300 mx-1">·</span>
                  {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Content */}
              {r.title && <p className="text-sm font-semibold text-gray-900 mb-1">{r.title}</p>}
              <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
