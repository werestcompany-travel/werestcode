import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-extrabold text-brand-600 mb-2">404</p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-brand-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
