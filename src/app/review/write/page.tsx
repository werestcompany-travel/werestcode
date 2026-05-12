'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewForm from '@/components/reviews/ReviewForm';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function WriteReviewContent() {
  const params      = useSearchParams();
  const router      = useRouter();
  const [done, setDone] = useState(false);

  const type       = (params.get('type') ?? 'ATTRACTION') as 'ATTRACTION' | 'TOUR' | 'TRANSFER';
  const targetId   = params.get('targetId')   ?? '';
  const targetName = params.get('targetName') ?? '';
  const bookingRef = params.get('bookingRef') ?? '';

  if (!targetId) {
    router.replace('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">

        <Link href="/account?tab=bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to my bookings
        </Link>

        {done ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Review Submitted!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Thank you for your feedback. Your review will appear after our team approves it.
            </p>
            <Link href="/account?tab=bookings"
              className="inline-flex items-center gap-2 bg-[#2534ff] text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-[#1a27e0] transition-colors">
              Back to My Bookings
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-7 pb-4 border-b border-gray-50">
              <p className="text-xs font-bold uppercase tracking-widest text-[#2534ff] mb-1">Write a Review</p>
              <h1 className="text-xl font-extrabold text-gray-900">{targetName}</h1>
              {bookingRef && (
                <p className="text-sm text-gray-400 mt-1 font-mono">{bookingRef}</p>
              )}
            </div>
            <div className="p-6">
              <ReviewForm
                targetType={type}
                targetId={targetId}
                targetName={targetName}
                initialBookingRef={bookingRef}
                onSubmitted={() => setDone(true)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function WriteReviewPage() {
  return (
    <>
      <Navbar />
      <Suspense>
        <WriteReviewContent />
      </Suspense>
      <Footer />
    </>
  );
}
