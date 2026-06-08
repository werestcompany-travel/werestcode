'use client';

import { Car, Clock } from 'lucide-react';
import PrivateRideForm from './PrivateRideForm';
import HourlyForm from './HourlyForm';

export type HourlyTab = 'transfers' | 'hourly';

const TABS: { id: HourlyTab; label: string; Icon: typeof Car }[] = [
  { id: 'transfers', label: 'Transfers',     Icon: Car   },
  { id: 'hourly',    label: 'Hourly driver', Icon: Clock },
];

interface Props {
  activeTab: HourlyTab;
  onTabChange: (tab: HourlyTab) => void;
}

export default function HourlySearchWidget({ activeTab, onTabChange }: Props) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.22)] overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">

        {/* Tab strip */}
        <div className="flex items-center px-2 pt-4 pb-0 border-b border-gray-100">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  isActive
                    ? 'border-[#2534ff] text-[#2534ff]'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 hidden lg:inline-block" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="pt-2">
          {activeTab === 'transfers' && <PrivateRideForm />}
          {activeTab === 'hourly'    && <HourlyForm noCard />}
        </div>

      </div>
    </div>
  );
}
