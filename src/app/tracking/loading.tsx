export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
