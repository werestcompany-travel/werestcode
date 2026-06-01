'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  destName: string;
  slug:     string;
}

const TABS = [
  { id: 'explore',  label: 'Explore'          },
  { id: 'todo',     label: 'Things to do'     },
  { id: 'tours',    label: 'Tours'            },
  { id: 'transfer', label: 'Private Transfer' },
];

const TAB_HREFS: Record<string, (slug: string, name: string) => string> = {
  explore:  (slug) => `/destinations/${slug}`,
  todo:     (_, name) => `/attractions?location=${encodeURIComponent(name)}`,
  tours:    (_, name) => `/tours?destination=${encodeURIComponent(name)}`,
  transfer: (_, name) => `/results?pickup_address=${encodeURIComponent(name)}`,
};

export default function DestinationHeroClient({ destName, slug }: Props) {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-5">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={TAB_HREFS[tab.id](slug, destName)}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#ff6b35] text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
