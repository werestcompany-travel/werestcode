'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

interface Props {
  targetType: 'ATTRACTION' | 'TOUR' | 'TRANSFER';
  targetId: string;
  targetName: string;
  onSubmitted: () => void;
  initialBookingRef?: string;
}

export default function ReviewForm({ targetType, targetId, targetName, onSubmitted, initialBookingRef = '' }: Props) {
  const [rating, setRating]     = useState(0);
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [bookingRef, setRef]    = useState(initialBookingRef);
  const [submitting, setSubmit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating.'); return; }
    if (body.trim().length < 10) { toast.error('Review must be at least 10 characters.'); return; }

    setSubmit(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body, targetType, targetId, targetName, bookingRef }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to submit review.');
        return;
      }
      toast.success('Review submitted! It will appear after approval.');
      setRating(0); setTitle(''); setBody(''); setRef('');
      onSubmitted();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmit(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rating *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Sum it up in a few words"
          maxLength={100}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder="Share your experience..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/2000</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Booking Reference <span className="text-gray-400 font-normal">(optional — adds a Verified badge)</span>
        </label>
        <input
          type="text"
          value={bookingRef}
          onChange={e => setRef(e.target.value.toUpperCase())}
          placeholder="e.g. AT-260510-1234 or WR-260510-1234"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
