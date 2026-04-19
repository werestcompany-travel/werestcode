'use client';

import { useState, useEffect } from 'react';
import { Car, Map, Ticket } from 'lucide-react';
import { TabType } from '@/types';
import PrivateRideForm from './PrivateRideForm';
import ToursForm from './ToursForm';
import TicketsForm from './TicketsForm';
import { useLocale } from '@/context/LocaleContext';

interface PrefillRoute { from: string; to: string; }

export default function SearchTabs({ prefillRoute }: { prefillRoute?: PrefillRoute | null }) {
  const [activeTab, setActiveTab] = useState<TabType>('private-ride');
  const { t } = useLocale();

  // Auto-switch to Private Transfers tab when a route is prefilled
  useEffect(() => {
    if (prefillRoute) setActiveTab('private-ride');
  }, [prefillRoute]);

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'private-ride', label: t('tab.transfers'), icon: <Car    className="w-4 h-4" /> },
    { id: 'tours',        label: t('tab.tours'),     icon: <Map    className="w-4 h-4" /> },
    { id: 'tickets',      label: t('tab.tickets'),   icon: <Ticket className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* ── GoTher-style pill tab bar: rounded-left pill, diagonal-cut right edge ── */}
      <div className="flex items-stretch">
        <div
          className="inline-flex items-center gap-0.5 px-1 py-1.5"
          style={{
            background: 'linear-gradient(to right, #2534ff 0%, #1420cc 100%)',
            /* left side fully rounded, right side open (no radius) */
            borderRadius: '5px',
            /* diagonal cut: top-right is 44px shorter than bottom-right */
            clipPath: 'polygon(0 0, calc(100% - 44px) 0, 100% 100%, 0 100%)',
            /* extra right padding so last tab content clears the diagonal */
            paddingRight: '60px',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#2534ff] shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search form card ── */}
      <div className="mt-2">
        {activeTab === 'private-ride' && <PrivateRideForm prefillRoute={prefillRoute} />}
        {activeTab === 'tours'        && <ToursForm />}
        {activeTab === 'tickets'      && <TicketsForm />}
      </div>
    </div>
  );
}
