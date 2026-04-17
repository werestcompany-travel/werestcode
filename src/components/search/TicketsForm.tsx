'use client';

import { Search, Calendar, Ticket, MapPin } from 'lucide-react';

export default function TicketsForm() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Attraction or activity (e.g. Grand Palace, Phi Phi Island)"
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
          <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="number"
            placeholder="Number of tickets"
            className="input-base pl-10 opacity-60 cursor-not-allowed"
            disabled
          />
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-5 text-center">
        <div className="text-3xl mb-2">🎟️</div>
        <h3 className="font-semibold text-purple-800 mb-1">Attraction Tickets – Coming Soon</h3>
        <p className="text-sm text-purple-700">
          Skip the queue at Thailand&apos;s top attractions. Launching soon!
        </p>
      </div>

      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 font-semibold rounded-xl py-3.5 cursor-not-allowed text-sm"
      >
        <Search className="w-4 h-4" />
        Search Tickets (Coming Soon)
      </button>
    </div>
  );
}
