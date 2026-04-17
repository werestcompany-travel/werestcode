'use client';

import { Search, Calendar, Users, MapPin } from 'lucide-react';

export default function ToursForm() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Destination or tour keyword (e.g. Chiang Mai, River Kwai)"
          className="input-base pl-10 opacity-60 cursor-not-allowed"
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input type="date" className="input-base pl-10 opacity-60 cursor-not-allowed" disabled />
        </div>
        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="number"
            placeholder="Participants"
            className="input-base pl-10 opacity-60 cursor-not-allowed"
            disabled
          />
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 text-center">
        <div className="text-3xl mb-2">🗺️</div>
        <h3 className="font-semibold text-amber-800 mb-1">Tours – Coming Soon</h3>
        <p className="text-sm text-amber-700">
          We&apos;re curating the best tours across Thailand. Check back soon!
        </p>
      </div>

      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 font-semibold rounded-xl py-3.5 cursor-not-allowed text-sm"
      >
        <Search className="w-4 h-4" />
        Search Tours (Coming Soon)
      </button>
    </div>
  );
}
