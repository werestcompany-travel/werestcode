'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="max-w-md">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">
              An unexpected error occurred. Our team has been notified. Please try again.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
