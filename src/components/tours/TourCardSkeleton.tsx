// Shimmer skeleton that matches TourCard proportions exactly.
// Uses bg-gradient + animate-shimmer (defined in tailwind.config.js).
const S = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded'

export default function TourCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
      {/* Image placeholder */}
      <div className={`aspect-[8/5] w-full ${S}`} />

      {/* Body */}
      <div className="p-3.5 flex flex-col gap-2.5">
        {/* Category line */}
        <div className={`h-3 w-28 ${S}`} />

        {/* Title — two lines */}
        <div className={`h-4 w-full ${S}`} />
        <div className={`h-4 w-4/5 ${S}`} />

        {/* Feature tags */}
        <div className="flex gap-1.5 flex-wrap">
          <div className={`h-5 w-20 rounded-full ${S}`} />
          <div className={`h-5 w-24 rounded-full ${S}`} />
          <div className={`h-5 w-16 rounded-full ${S}`} />
        </div>

        {/* Rating row */}
        <div className={`h-3 w-36 ${S}`} />

        {/* Price block */}
        <div className="mt-1 pt-2 border-t border-gray-100 flex flex-col gap-1">
          <div className={`h-2.5 w-8 ${S}`} />
          <div className={`h-6 w-24 ${S}`} />
          <div className={`h-2.5 w-14 ${S}`} />
        </div>
      </div>
    </div>
  )
}
