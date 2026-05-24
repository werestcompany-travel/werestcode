'use client';

import { useState } from 'react';
import { CheckCircle, Send, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

interface Props {
  targetType: 'ATTRACTION' | 'TOUR' | 'TRANSFER';
  targetId: string;
  targetName: string;
  onSubmitted: () => void;
  initialBookingRef?: string;
}

type VerifyState = 'idle' | 'loading' | 'verified' | 'failed';

export default function ReviewForm({ targetType, targetId, targetName, onSubmitted, initialBookingRef = '' }: Props) {
  // ── Verification state ────────────────────────────────────────────────────
  const [verifyRef, setVerifyRef]         = useState(initialBookingRef);
  const [verifyEmail, setVerifyEmail]     = useState('');
  const [verifyState, setVerifyState]     = useState<VerifyState>('idle');
  const [verifyError, setVerifyError]     = useState('');
  const [verifiedName, setVerifiedName]   = useState('');
  const [verifySkipped, setVerifySkipped] = useState(false);

  // ── Review form state ─────────────────────────────────────────────────────
  const [rating, setRating]       = useState(0);
  const [title, setTitle]         = useState('');
  const [body, setBody]           = useState('');
  const [authorName, setName]     = useState('');
  const [authorEmail, setEmail]   = useState('');
  const [submitting, setSubmit]   = useState(false);

  const isVerified  = verifyState === 'verified';
  const showForm    = isVerified || verifySkipped;

  // ── Verify booking ────────────────────────────────────────────────────────
  async function handleVerify() {
    if (!verifyRef.trim() || !verifyEmail.trim()) {
      setVerifyError('Please enter your booking reference and email.');
      return;
    }
    setVerifyState('loading');
    setVerifyError('');
    try {
      const res = await fetch('/api/reviews/verify-booking', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bookingRef: verifyRef.trim(), email: verifyEmail.trim() }),
      });
      const json = await res.json();
      if (json.verified) {
        setVerifyState('verified');
        setVerifiedName(json.customerName ?? '');
        // Pre-fill author fields from verified booking
        if (json.customerName) setName(json.customerName);
        if (verifyEmail) setEmail(verifyEmail.trim().toLowerCase());
      } else {
        setVerifyState('failed');
        setVerifyError(json.error ?? 'Verification failed. Please check your details.');
      }
    } catch {
      setVerifyState('failed');
      setVerifyError('Something went wrong. Please try again.');
    }
  }

  // ── Submit review ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating.'); return; }
    if (body.trim().length < 10) { toast.error('Review must be at least 10 characters.'); return; }
    if (!authorName.trim()) { toast.error('Please enter your name.'); return; }
    if (!authorEmail.trim()) { toast.error('Please enter your email.'); return; }

    setSubmit(true);
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          rating,
          title,
          body,
          entityType: targetType,
          entityId:   targetId,
          entityName: targetName,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim().toLowerCase(),
          // Pass booking ref so the API can set verified flag
          bookingRef: isVerified ? verifyRef.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to submit review.');
        return;
      }
      toast.success('Review submitted! It will appear after approval.');
      onSubmitted();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Write a Review</h3>

      {/* ── Verification card ─────────────────────────────────────────────── */}
      {!showForm && (
        <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-3">
          {/* Badge callout */}
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Verify your booking</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Verified reviews get a <span className="font-bold">&#10003; Verified</span> badge and priority display.
                Takes 10 seconds.
              </p>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-2">
            <input
              type="text"
              value={verifyRef}
              onChange={e => { setVerifyRef(e.target.value.toUpperCase()); setVerifyError(''); }}
              placeholder="Booking reference (e.g. WR-260510-1234)"
              className="w-full border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            />
            <input
              type="email"
              value={verifyEmail}
              onChange={e => { setVerifyEmail(e.target.value); setVerifyError(''); }}
              placeholder="Email used at booking"
              className="w-full border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Error message */}
          {verifyError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <X className="w-3.5 h-3.5 shrink-0" /> {verifyError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifyState === 'loading'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
            >
              {verifyState === 'loading' ? 'Verifying…' : 'Verify Booking'}
            </button>
            <button
              type="button"
              onClick={() => setVerifySkipped(true)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 bg-white rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ── Verified success banner ───────────────────────────────────────── */}
      {isVerified && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Booking verified!</p>
            {verifiedName && (
              <p className="text-xs text-green-700">Welcome back, {verifiedName}. Your review will show a Verified badge.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Review form (shown after verify or skip) ──────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Star rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rating *</label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Sum it up in a few words"
              maxLength={100}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={2000}
              placeholder="Share your experience…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/2000</p>
          </div>

          {/* Author name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              value={authorName}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah M."
              maxLength={100}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          {/* Author email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *{' '}
              <span className="text-gray-400 font-normal">(not displayed publicly)</span>
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              maxLength={255}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
      )}
    </div>
  );
}
