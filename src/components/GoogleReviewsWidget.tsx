'use client';
import { useEffect, useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface GoogleReview {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  timeDescription: string;
  profileUrl?: string;
}

interface ReviewsData {
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  reviewUrl: string;
}

export default function GoogleReviewsWidget() {
  const [data, setData] = useState<ReviewsData | null>(null);

  useEffect(() => {
    fetch('/api/google/reviews')
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null; // invisible if API not configured

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Google logo text */}
            <span className="text-2xl font-bold">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </span>
            <span className="text-xl font-bold text-gray-900">Reviews</span>
          </div>
          <a
            href={data.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2534ff] hover:underline"
          >
            Write a review <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Overall rating */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl font-extrabold text-gray-900">{data.rating.toFixed(1)}</span>
          <div>
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(data.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{data.totalReviews.toLocaleString()} Google reviews</p>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {data.reviews.slice(0, 3).map((review, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                {review.authorPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.authorPhoto} alt={review.authorName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2534ff] flex items-center justify-center text-white font-bold text-sm">
                    {review.authorName[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.authorName}</p>
                  <p className="text-xs text-gray-400">{review.timeDescription}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(j => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-4">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
