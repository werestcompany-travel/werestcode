'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

export default function AttractionsMap() {
  const [visible, setVisible] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  return (
    <section>
      {/* Toggle button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Attractions near you</h2>
          <p className="text-sm text-gray-500 mt-0.5">Explore top attractions across Thailand on the map</p>
        </div>
        <button
          onClick={() => setVisible(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
            visible
              ? 'bg-brand-600 text-white border-brand-600 shadow-[0_4px_12px_rgba(37,52,255,0.3)]'
              : 'bg-white text-brand-600 border-brand-200 hover:border-brand-400'
          }`}
        >
          {visible ? <X className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
          {visible ? 'Hide map' : '🗺️ View on Map'}
        </button>
      </div>

      {/* Map panel */}
      {visible && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-fade-in">
          {apiKey ? (
            <iframe
              src={`https://www.google.com/maps/embed/v1/search?q=top+tourist+attractions+thailand&key=${apiKey}`}
              width="100%"
              height="420"
              style={{ border: 0, borderRadius: '1rem', display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Top attractions in Thailand"
            />
          ) : (
            /* Fallback static embed when no API key is set */
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d7934279.8219393585!2d96.88099999999999!3d13.0369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1storist+attractions+Thailand!5e0!3m2!1sen!2sth!4v1716000000000!5m2!1sen!2sth"
              width="100%"
              height="420"
              style={{ border: 0, borderRadius: '1rem', display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Top attractions in Thailand"
            />
          )}

          {/* Pin legend */}
          <div className="bg-white px-5 py-3 border-t border-gray-100 flex flex-wrap gap-3">
            {[
              { emoji: '🏯', label: 'Temples & Shrines', color: 'text-amber-700 bg-amber-50' },
              { emoji: '🌿', label: 'Nature & Parks',    color: 'text-green-700 bg-green-50' },
              { emoji: '🎡', label: 'Theme Parks',       color: 'text-purple-700 bg-purple-50' },
              { emoji: '🏖️', label: 'Beaches',           color: 'text-blue-700 bg-blue-50'   },
            ].map(item => (
              <span key={item.label}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${item.color}`}>
                <span>{item.emoji}</span> {item.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
