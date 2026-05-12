'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ChevronDown } from 'lucide-react';
import StarRating from './StarRating';
import ReviewCard, { ReviewData } from './ReviewCard';
import ReviewForm from './ReviewForm';

interface Props {
  targetType: 'ATTRACTION' | 'TOUR' | 'TRANSFER';
  targetId: string;
  targetName: string;
  isLoggedIn: boolean;
}

interface Summary {
  averageRating: number | null;
  totalReviews: number;
  distribution?: Record<number, number>;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewsSection({ targetType, targetId, targetName, isLoggedIn }: Props) {
  const [reviews, setReviews]     = useState<ReviewData[]>([]);
  const [summary, setSummary]     = useState<Summary>({ averageRating: null, totalReviews: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}&page=${page}&limit=5`
      );
      const json = await res.json();
      if (page === 1) setReviews(json.reviews ?? []);
      else setReviews(prev => [...prev, ...(json.reviews ?? [])]);
      setSummary(json.summary ?? { averageRating: null, totalReviews: 0 });
      setPagination(json.pagination ?? { page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  return (
    <section className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-brand-600" />
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        {summary.totalReviews > 0 && (
          <span className="text-sm text-gray-500">({summary.totalReviews})</span>
        )}
      </div>

      {/* Summary bar */}
      {summary.averageRating !== null && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-gray-900">{summary.averageRating.toFixed(1)}</p>
            <StarRating value={Math.round(summary.averageRating)} size="sm" />
            <p className="text-xs text-gray-500 mt-1">{summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 w-full">
            <p className="text-base font-semibold text-gray-800 mb-2">
              {RATING_LABELS[Math.round(summary.averageRating)]}
            </p>
            {summary.distribution && (
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = summary.distribution?.[star] ?? 0;
                  const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-3 text-right">{star}</span>
                      <svg className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <div className="flex-1 bg-amber-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading && reviews.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {/* Load more */}
      {pagination.page < pagination.pages && (
        <button
          onClick={() => fetchReviews(pagination.page + 1)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
        >
          <ChevronDown className="w-4 h-4" />
          {loading ? 'Loading…' : `Show more reviews`}
        </button>
      )}

      {/* Review form */}
      <div className="mt-6">
        {isLoggedIn ? (
          showForm ? (
            <ReviewForm
              targetType={targetType}
              targetId={targetId}
              targetName={targetName}
              onSubmitted={() => { setShowForm(false); fetchReviews(1); }}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-brand-200 rounded-2xl py-4 text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm font-medium"
            >
              + Write a Review
            </button>
          )
        ) : (
          <div className="text-center py-5 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600">
              <a href="/auth/login" className="text-brand-600 font-semibold hover:underline">Log in</a>
              {' '}to leave a review
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
