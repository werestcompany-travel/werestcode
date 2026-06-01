export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
