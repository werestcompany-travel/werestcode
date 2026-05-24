'use client';

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors"
    >
      Try Again
    </button>
  );
}
