'use client';

import { useState } from 'react';
import { Car, Map, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabType } from '@/types';
import PrivateRideForm from './PrivateRideForm';
import ToursForm from './ToursForm';
import TicketsForm from './TicketsForm';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const TABS: Tab[] = [
  { id: 'private-ride', label: 'Private Ride',        icon: <Car className="w-4 h-4" />,    active: true  },
  { id: 'tours',        label: 'Tours',               icon: <Map className="w-4 h-4" />,    active: false },
  { id: 'tickets',      label: 'Attraction Tickets',  icon: <Ticket className="w-4 h-4" />, active: false },
];

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('private-ride');

  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden w-full max-w-3xl mx-auto">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-semibold transition-all duration-200 select-none',
              activeTab === tab.id
                ? 'text-brand-700 bg-brand-50/60'
                : tab.active
                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                : 'text-gray-400 cursor-pointer hover:bg-gray-50',
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>

            {/* Coming soon pill */}
            {!tab.active && (
              <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full leading-none">
                SOON
              </span>
            )}

            {/* Active underline */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Form Panel – animated swap */}
      <div className="p-5 sm:p-6">
        {activeTab === 'private-ride' && (
          <div className="animate-fade-in">
            <PrivateRideForm />
          </div>
        )}
        {activeTab === 'tours' && (
          <div className="animate-fade-in">
            <ToursForm />
          </div>
        )}
        {activeTab === 'tickets' && (
          <div className="animate-fade-in">
            <TicketsForm />
          </div>
        )}
      </div>
    </div>
  );
}
