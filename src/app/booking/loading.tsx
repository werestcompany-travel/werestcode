export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-pulse">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="space-y-4">
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
