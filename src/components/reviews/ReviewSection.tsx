'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type EntityType = 'TOUR' | 'ATTRACTION' | 'TRANSFER';

interface PublicReview {
  id:         string;
  rating:     number;
  title:      string | null;
  body:       string;
  authorName: string;
  verified:   boolean;
  createdAt:  string;
}

interface ReviewSectionProps {
  entityType: EntityType;
  entityId:   string;   // slug or ref
  entityName: string;
}

function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none disabled:cursor-not-allowed"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
        </div>
        {review.verified && (
          <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      {review.title && <p className="font-semibold text-gray-900 text-sm mb-1">{review.title}</p>}
      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
      <p className="text-xs text-gray-400 mt-3">
        — {review.authorName} ·{' '}
        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function ReviewSection({ entityType, entityId, entityName }: ReviewSectionProps) {
  const [reviews,    setReviews]    = useState<PublicReview[]>([]);
  const [avgRating,  setAvgRating]  = useState<number | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);

  // Form state
  const [rating,      setRating]      = useState(0);
  const [title,       setTitle]       = useState('');
  const [body,        setBody]        = useState('');
  const [authorName,  setAuthorName]  = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    fetch(`/api/reviews?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews ?? []); setAvgRating(d.avgRating ?? null); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ entityType, entityId, entityName, rating, title: title || undefined, body: body.trim(), authorName, authorEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to submit review.'); return; }
      setSubmitted(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
            )}
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 rounded-xl px-4 py-2 hover:bg-brand-50 transition-colors"
          >
            {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Write a review'}
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && !submitted && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Share your experience</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Your Rating *</label>
              <StarRating value={rating} onChange={setRating} disabled={submitting} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Name *</label>
                <input
                  required value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email" required value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Title (optional)</label>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                placeholder="Great experience!"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Review *</label>
              <textarea
                required value={body} onChange={(e) => setBody(e.target.value)}
                minLength={10} maxLength={2000} rows={4}
                placeholder="Tell others about your experience…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{body.length}/2000</p>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <p className="text-xs text-gray-400">Your review will be visible after moderation (usually within 24h).</p>
            <button
              type="submit" disabled={submitting || rating === 0}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Thank you for your review!</p>
            <p className="text-xs text-green-700 mt-0.5">It will appear here once approved — usually within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}
