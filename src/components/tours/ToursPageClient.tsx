'use client';

import Link from 'next/link';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import TourGrid from '@/components/tours/TourGrid';
import KlookCategorySection from '@/components/tours/KlookCategorySection';
import { type Tour } from '@/lib/tours';
import { useLocale } from '@/context/LocaleContext';

const CATEGORY_CONFIGS = [
  { key: 'day-trip',  labelKey: 'act.day',  emoji: '🗓',  iconBg: '#FF5722', bg: '#FFF3EC' },
  { key: 'cultural',  labelKey: 'act.cult', emoji: '🏛️',  iconBg: '#7C3AED', bg: '#F3E5F5' },
  { key: 'adventure', labelKey: 'act.adv',  emoji: '⛺',  iconBg: '#16A34A', bg: '#ECFDF5' },
  { key: 'food',      labelKey: 'act.food', emoji: '🍽️',  iconBg: '#D97706', bg: '#FFFBEB' },
  { key: 'nature',    labelKey: 'act.nature',emoji: '🌿', iconBg: '#15803D', bg: '#F0FDF4' },
  { key: 'water',     labelKey: 'act.water', emoji: '🌊', iconBg: '#1D4ED8', bg: '#EFF6FF' },
] as const;

const PROMO_PILLS = [
  { topKey: 'promo.10off',     bottomKey: 'promo.noMin',     topFallback: '10% off',      bottomFallback: 'No min. spend'  },
  { topKey: 'promo.6off',      bottomKey: 'promo.min3000',   topFallback: '6% off',       bottomFallback: 'Min. ฿3,000'   },
  { topKey: 'promo.5off',      bottomKey: 'promo.min1500',   topFallback: '5% off',       bottomFallback: 'Min. ฿1,500'   },
  { topKey: 'promo.freeCancel',bottomKey: 'promo.selectTours',topFallback: 'Free cancel', bottomFallback: 'On select tours' },
  { topKey: 'promo.200off',    bottomKey: 'promo.min5000',   topFallback: '฿200 off',     bottomFallback: 'Min. ฿5,000'   },
];

interface Props {
  filteredTours: Tour[];
  categoryGroups: Map<string, Tour[]>;
  locationMap: Record<string, string>;
  locationLabel: string;
  categoryLabel: string;
  hasFilters: boolean;
  q: string;
  resolvedLocation: string;
}

export default function ToursPageClient({
  filteredTours, categoryGroups, locationMap,
  locationLabel, categoryLabel, hasFilters, q, resolvedLocation,
}: Props) {
  const { t } = useLocale();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {hasFilters ? (
          /* ── Filtered view ── */
          <div className="py-8 pb-24">
            {/* Result count */}
            <p className="text-sm text-gray-600 mb-5">
              {filteredTours.length > 0 ? (
                <>
                  <strong className="text-gray-900">{filteredTours.length}</strong>{' '}
                  {filteredTours.length !== 1 ? t('tours.page.noFound').replace('No ', '') || 'experiences' : 'experience'}
                  {locationLabel && (
                    <> in <strong className="text-[#2534ff]">{locationLabel}</strong></>
                  )}
                  {categoryLabel && (
                    <> · <strong>{categoryLabel}</strong></>
                  )}
                  {q && (
                    <> matching &ldquo;<strong className="text-[#2534ff]">{q}</strong>&rdquo;</>
                  )}
                </>
              ) : (
                <strong className="text-gray-900">{t('tours.page.noFound')}</strong>
              )}
            </p>

            {/* Tour grid or empty state */}
            {filteredTours.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">{q ? '🔍' : '🗺️'}</p>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('tours.page.noFoundTitle')}</h2>
                <p className="text-gray-500 mb-6">
                  {q
                    ? `We couldn't find experiences matching "${q}". Try different keywords.`
                    : resolvedLocation
                    ? `No experiences available in "${locationLabel}" yet.`
                    : 'No experiences match these filters.'}
                </p>
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e2ce6] transition-colors text-sm"
                >
                  {t('tours.page.browseAll')}
                </Link>
              </div>
            ) : (
              <TourGrid tours={filteredTours} />
            )}
          </div>
        ) : (
          /* ── Klook grouped sections view ── */
          <div className="py-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('tours.page.unmissable')}</h2>

            {/* Category panels */}
            {CATEGORY_CONFIGS.map(cat => {
              const tours = categoryGroups.get(cat.key) ?? [];
              if (!tours.length) return null;
              return (
                <KlookCategorySection
                  key={cat.key}
                  label={t(cat.labelKey)}
                  tours={tours.slice(0, 8)}
                />
              );
            })}

            {/* Explore all button */}
            <div className="flex justify-center mt-4 mb-10">
              <Link
                href="/tours?sort=popular"
                className="flex items-center gap-2 border border-gray-300 rounded-full px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                {t('tours.page.exploreAll')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Promo codes section */}
            <div className="border border-gray-100 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900 text-[15px]">
                    <span className="mr-1.5">⚡</span>{t('tours.page.promoCodes')}
                  </p>
                  <p className="text-gray-400 text-[13px] mt-0.5">{t('tours.page.promoRedeem')}</p>
                </div>
                <Link
                  href="/tours"
                  className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  {t('tours.page.viewAll')}
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {PROMO_PILLS.map(pill => (
                  <div
                    key={pill.topFallback + pill.bottomFallback}
                    className="border border-red-200 rounded-lg px-3 py-2 text-center shrink-0 w-[110px]"
                  >
                    <p className="text-red-500 font-bold text-sm">{pill.topFallback}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{pill.bottomFallback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Browse by destination */}
            <div className="mt-4 pt-10 border-t border-gray-200 mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('tours.page.byDest')}</p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(locationMap).map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/tours?location=${encodeURIComponent(key)}`}
                    className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#2534ff] hover:text-[#2534ff] transition-colors shadow-sm"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
