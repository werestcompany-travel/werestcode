'use client';

import Link from 'next/link';
import { Star, X, Clock } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface RecentlyViewedProps {
  excludeId?: string;
  className?: string;
}

export default function RecentlyViewed({ excludeId, className = '' }: RecentlyViewedProps) {
  const { items, clearAll } = useRecentlyViewed();

  const visible = excludeId ? items.filter(i => i.id !== excludeId) : items;
  if (visible.length === 0) return null;

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="text-xl font-extrabold text-gray-900">Recently viewed</h2>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {visible.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="shrink-0 w-44 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Gradient thumbnail */}
            <div className={`h-24 bg-gradient-to-br ${item.gradient} relative flex items-center justify-center overflow-hidden`}>
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
              />
              <span className="text-5xl opacity-35 group-hover:opacity-55 transition-opacity select-none">
                {item.emoji}
              </span>
              <span className="absolute bottom-1.5 left-2.5 text-[10px] font-semibold text-white/80 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                {item.location}
              </span>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-brand-600 transition-colors">
                {item.name}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-semibold text-gray-600">{item.rating}</span>
                </div>
                <span className="text-xs font-extrabold text-gray-900">฿{item.price.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
