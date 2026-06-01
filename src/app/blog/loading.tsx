export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
