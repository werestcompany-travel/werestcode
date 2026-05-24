import Link from 'next/link';
import RetryButton from './RetryButton';

export const metadata = { title: 'Offline | Werest Travel' };

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.288 8.288A8.25 8.25 0 0121.75 12c0 2.278-.92 4.338-2.406 5.831M6.343 6.343A8.218 8.218 0 002.25 12c0 2.278.92 4.338 2.406 5.831M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re offline</h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        No internet connection detected. Some pages may be available from your recent visit.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <RetryButton />
        <Link
          href="/tracking"
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Track My Booking
        </Link>
      </div>
      <p className="mt-8 text-xs text-gray-400">
        Werest Travel · Thailand Private Transfers
      </p>
    </div>
  );
}
