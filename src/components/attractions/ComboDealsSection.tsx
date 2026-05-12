'use client';

import Image from 'next/image';
import { useState } from 'react';

const COMBO_DEALS = [
  {
    id: 'combo-grand-palace-wat-pho',
    title: 'Grand Palace + Wat Pho',
    subtitle: 'Bangkok Temple Duo',
    attractions: ['Grand Palace & Wat Phra Kaew', 'Wat Pho – Temple of the Reclining Buddha'],
    originalPrice: 900,
    comboPrice: 750,
    saving: 150,
    badge: '💰 Save ฿150',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80',
    city: 'Bangkok',
  },
  {
    id: 'combo-sanctuary-elephant',
    title: 'Sanctuary of Truth + Elephant Sanctuary',
    subtitle: 'Pattaya & Chiang Mai Experience',
    attractions: ['Sanctuary of Truth', 'Elephant Nature Park'],
    originalPrice: 2200,
    comboPrice: 1890,
    saving: 310,
    badge: '🔥 Best Seller Bundle',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=80',
    city: 'Multi-City',
  },
  {
    id: 'combo-floating-market-river',
    title: 'Floating Market + Chao Phraya Cruise',
    subtitle: 'Bangkok Water Experience',
    attractions: ['Damnoen Saduak Floating Market', 'Chao Phraya Dinner Cruise'],
    originalPrice: 1400,
    comboPrice: 1150,
    saving: 250,
    badge: '⭐ Top Rated Bundle',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    city: 'Bangkok',
  },
];

export default function ComboDealsSection() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Combo deals — save more</h2>
          <p className="text-sm text-gray-500 mt-0.5">Bundle your favourites and pay less</p>
        </div>
      </div>

      {/* Horizontal scroll on mobile, 2-col grid on md+, 3-col on xl */}
      <div className="flex gap-4 overflow-x-auto pb-2 md:overflow-visible md:grid md:grid-cols-2 xl:grid-cols-3 scrollbar-hide">
        {COMBO_DEALS.map(deal => (
          <div
            key={deal.id}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100
              hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-200 flex flex-col
              shrink-0 w-[280px] md:w-auto"
          >
            {/* Image */}
            <div className="relative overflow-hidden" style={{ height: 180 }}>
              {!imgErrors[deal.id] ? (
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() => setImgErrors(prev => ({ ...prev, [deal.id]: true }))}
                  sizes="(max-width: 768px) 280px, (max-width: 1280px) 50vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-indigo-600" />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* City pill */}
              <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {deal.city}
              </div>
              {/* Save badge — top right, green */}
              <div className="absolute top-3 right-3 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                {deal.badge}
              </div>
            </div>

            {/* Card body */}
            <div className="p-4 flex flex-col flex-1 gap-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {deal.subtitle}
                </p>
                <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">
                  {deal.title}
                </h3>
              </div>

              {/* Included attractions */}
              <ul className="space-y-1">
                {deal.attractions.map(name => (
                  <li key={name} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                    {name}
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] text-gray-400">Combo price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-extrabold text-gray-900">฿{deal.comboPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 line-through">฿{deal.originalPrice.toLocaleString()}</p>
                  </div>
                </div>
                <button className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-[0_4px_12px_rgba(37,52,255,0.3)] shrink-0">
                  Book Bundle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
