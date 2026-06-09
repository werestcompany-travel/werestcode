'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { MapPin } from 'lucide-react';

export default function RecentlyViewedSection() {
  const { items, clearItems } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="w-full py-6 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recently viewed</h2>
        <button
          onClick={clearItems}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Scrollable row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="flex-shrink-0 w-[180px] bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative w-full h-[120px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>

            {/* Content */}
            <div className="p-2">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                {item.title}
              </p>
              {(item.location || item.price) && (
                <div className="flex items-center gap-1">
                  {item.location && (
                    <span className="flex items-center gap-0.5 text-xs text-gray-500 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  )}
                  {item.price && (
                    <span className="ml-auto text-xs font-semibold text-[#2534ff] flex-shrink-0">
                      {item.price}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
