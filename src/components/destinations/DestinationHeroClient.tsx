'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface Props {
  description:     string;
  descriptionFull?: string[];   // multi-paragraph full text shown in the modal
  destName:        string;
  slug:            string;
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

export default function DestinationHeroClient({ description, descriptionFull, destName, slug }: Props) {
  const [modalOpen,  setModalOpen]  = useState(false);
  const [activeTab,  setActiveTab]  = useState('explore');

  // Truncate preview to ~120 chars
  const isLong  = description.length > 120;
  const preview = isLong ? description.slice(0, 120) + '…' : description;

  // Lock body scroll when modal open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const fullParagraphs = descriptionFull ?? [description];

  return (
    <>
      {/* ── Description preview ── */}
      <div className="px-4 sm:px-6 pt-4 pb-3 max-w-3xl">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          {preview}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-1 text-sm font-semibold text-[#2534ff] hover:underline"
          >
            See more
          </button>
        )}
      </div>

      {/* ── Sticky tabs ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6">
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

      {/* ── Bottom-sheet modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={destName}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalOpen(false)}
          />

          {/* Sheet */}
          <div className="relative z-10 bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-base font-bold text-gray-900">{destName}</h2>
              {/* Spacer to centre the title */}
              <div className="w-8" />
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-4">
              {fullParagraphs.map((para, i) => (
                <p key={i} className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
