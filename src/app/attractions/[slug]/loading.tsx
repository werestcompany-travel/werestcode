export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-72 bg-gray-200 rounded-2xl mb-6" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
