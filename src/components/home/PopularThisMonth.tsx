'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Users } from 'lucide-react';

interface PopularTour {
  slug: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  duration: string;
  maxGroupSize: number;
  images: string[];
  badge: string | null;
  options: unknown;
}

function getMinPrice(options: unknown): number | null {
  if (!Array.isArray(options) || options.length === 0) return null;
  const prices = (options as Array<{ pricePerPerson?: number; price?: number }>)
    .map((o) => o.pricePerPerson ?? o.price ?? 0)
    .filter((p) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

const BADGE_BG: Record<string, string> = {
  'Best Seller': 'bg-[#FF6D00]',
  'Top Rated': 'bg-emerald-500',
  New: 'bg-brand-600',
};

export default function PopularThisMonth() {
  const [tours, setTours] = useState<PopularTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tours/popular')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tours)) setTours(data.tours);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-52 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-1">Trending Now</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Popular This Month</h2>
          </div>
          <Link
            href="/tours"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all tours
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => {
            const minPrice = getMinPrice(tour.options);
            const image = tour.images?.[0];
            const city = tour.location.split(',')[0];

            return (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700" />
                  )}
                  {tour.badge && (
                    <span
                      className={`absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full ${BADGE_BG[tour.badge] ?? 'bg-gray-600'}`}
                    >
                      {tour.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">{city}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-brand-600 transition-colors">
                    {tour.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Max {tour.maxGroupSize}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-gray-900">{tour.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({tour.reviewCount.toLocaleString()})</span>
                    </div>
                    {minPrice !== null && (
                      <p className="text-sm font-extrabold text-brand-600">
                        From ฿{minPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            View all tours
          </Link>
        </div>
      </div>
    </section>
  );
}
