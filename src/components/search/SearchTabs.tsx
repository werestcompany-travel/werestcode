'use client';

import { useState, useEffect } from 'react';
import { Car, Compass, Ticket, Clock } from 'lucide-react';
import Link from 'next/link';
import { TabType } from '@/types';
import PrivateRideForm from './PrivateRideForm';
import HourlyForm from './HourlyForm';
import ToursForm from './ToursForm';
import TicketsForm from './TicketsForm';

interface PrefillRoute { from: string; to: string; }

type TransferSubTab = 'transfers' | 'hourly';

export default function SearchTabs({
  prefillRoute,
  activeService,
}: {
  prefillRoute?: PrefillRoute | null;
  activeService?: string;
}) {
  const [activeTab,       setActiveTab]       = useState<TabType>('private-ride');
  const [transferSubTab,  setTransferSubTab]  = useState<TransferSubTab>('transfers');

  useEffect(() => {
    if (prefillRoute) { setActiveTab('private-ride'); setTransferSubTab('transfers'); }
  }, [prefillRoute]);

  useEffect(() => {
    if (!activeService) return;
    if (activeService === 'transfer')         { setActiveTab('private-ride'); setTransferSubTab('transfers'); }
    else if (activeService === 'hourly')      { setActiveTab('private-ride'); setTransferSubTab('hourly'); }
    else if (activeService === 'tours')       setActiveTab('tours');
    else if (activeService === 'attractions') setActiveTab('tickets');
  }, [activeService]);

  const TABS = [
    { id: 'private-ride' as TabType, label: 'Private Transfers',  Icon: Car,     badge: null, href: undefined },
    { id: 'tours'        as TabType, label: 'Tours & Experiences', Icon: Compass, badge: null, href: undefined },
    { id: 'tickets'      as TabType, label: 'Attractions ticket',  Icon: Ticket,  badge: null, href: undefined },
  ];

  const TRANSFER_SUB_TABS: { id: TransferSubTab; label: string; Icon: typeof Car }[] = [
    { id: 'transfers', label: 'Transfers', Icon: Car   },
    { id: 'hourly',    label: 'Hourly',    Icon: Clock },
  ];

  return (
    <div className="relative w-full">

      {/* ── Floating pill tab bar — hidden on mobile, visible lg+ ── */}
      <div className="relative z-10 hidden lg:flex justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden px-4 lg:px-0">
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

      {/* ── White search card ── */}
      <div className="mt-0 lg:-mt-5 relative z-0 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">

        {/* ── Transfers / Hourly sub-tabs (only for Private Transfers tab) ── */}
        {activeTab === 'private-ride' && (
          <div className="flex items-center gap-0 px-6 pt-4 lg:pt-6 pb-0 border-b border-gray-100">
            {TRANSFER_SUB_TABS.map(({ id, label, Icon }) => {
              const isActive = transferSubTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTransferSubTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                    isActive
                      ? 'border-[#2534ff] text-[#2534ff]'
                      : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Form content ── */}
        <div className={activeTab === 'private-ride' ? 'pt-2' : 'pt-4 lg:pt-7'}>
          {activeTab === 'private-ride' && transferSubTab === 'transfers' && <PrivateRideForm prefillRoute={prefillRoute} />}
          {activeTab === 'private-ride' && transferSubTab === 'hourly'    && <HourlyForm noCard />}
          {activeTab === 'tours'   && <ToursForm />}
          {activeTab === 'tickets' && <TicketsForm />}
        </div>

      </div>

    </div>
  );
}
