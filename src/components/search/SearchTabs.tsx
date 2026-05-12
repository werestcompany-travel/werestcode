'use client';

import { useState, useEffect } from 'react';
import { Car, Compass, Ticket, Tag } from 'lucide-react';
import Link from 'next/link';
import { TabType } from '@/types';
import PrivateRideForm from './PrivateRideForm';
import ToursForm from './ToursForm';
import TicketsForm from './TicketsForm';

interface PrefillRoute { from: string; to: string; }

export default function SearchTabs({
  prefillRoute,
  activeService,
}: {
  prefillRoute?: PrefillRoute | null;
  activeService?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('private-ride');

  useEffect(() => {
    if (prefillRoute) setActiveTab('private-ride');
  }, [prefillRoute]);

  useEffect(() => {
    if (!activeService) return;
    if (activeService === 'transfer')         setActiveTab('private-ride');
    else if (activeService === 'tours')       setActiveTab('tours');
    else if (activeService === 'attractions') setActiveTab('tickets');
  }, [activeService]);

  const TABS = [
    { id: 'private-ride' as TabType, label: 'Private Transfers', Icon: Car,    badge: null,  href: undefined },
    { id: 'tours'        as TabType, label: 'Tours & Experiences', Icon: Compass, badge: null,  href: undefined },
    { id: 'tickets'      as TabType, label: 'Attractions ticket', Icon: Ticket,  badge: null,  href: undefined },
    { id: 'deals'        as TabType, label: 'Deals',             Icon: Tag,     badge: 'Hot', href: '/deals'  },
  ];

  return (
    <div className="relative w-full">

      {/* ── Floating pill tab bar — centered, content-width only ── */}
      <div className="relative z-10 flex justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden px-4 sm:px-0">
        <div className="inline-flex shrink-0 items-center bg-[#1a1f35] px-3 py-2 gap-1 rounded-full">
          {TABS.map(({ id, label, Icon, badge, href }) => {
            const isActive = activeTab === id;
            const cls = `flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap select-none ${
              isActive
                ? 'bg-white text-[#1a1f35] shadow-sm'
                : 'text-white hover:bg-white/10'
            }`;

            if (href) {
              return (
                <Link key={id} href={href} className={cls}>
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge && (
                    <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none ml-0.5">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className={cls}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── White search card — overlaps under the floating tab bar ── */}
      <div className="-mt-5 relative z-0 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div className="pt-7">
          {activeTab === 'private-ride' && <PrivateRideForm prefillRoute={prefillRoute} />}
          {activeTab === 'tours'        && <ToursForm />}
          {activeTab === 'tickets'      && <TicketsForm />}
        </div>
      </div>

    </div>
  );
}
