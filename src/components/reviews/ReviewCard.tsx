import { ShieldCheck, MessageSquareDot } from 'lucide-react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

export interface ReviewData {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  authorName: string;
  isVerified: boolean;
  createdAt: string;
  ownerReply?: string | null;
}

export default function ReviewCard({ review }: { review: ReviewData }) {
  const initials = review.authorName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-gray-900 text-sm">{review.authorName}</p>
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" />
      </div>

      {review.title && (
        <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
      )}
      <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>

      {review.ownerReply && (
        <div className="mt-4 ml-3 pl-4 border-l-2 border-brand-200 bg-brand-50/60 rounded-r-xl py-3 pr-3">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquareDot className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-xs font-bold text-brand-700">Response from Werest</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{review.ownerReply}</p>
        </div>
      )}
    </div>
  );
}
