'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  cityName:         string;
  description:      string;
  descriptionFull?: string[];
}

export default function DestinationHeroOverlay({ cityName, description, descriptionFull }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const fullParagraphs = descriptionFull ?? [description];

  return (
    <>
      {/* ── Overlay content pinned bottom-left of hero ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 pb-4 sm:pb-5">
        <h1 className="text-[22px] sm:text-3xl font-extrabold text-white leading-snug mb-2
          [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
          Things to do in {cityName}
        </h1>
        <p className="text-white/90 text-[13px] sm:text-sm leading-snug line-clamp-2 max-w-lg
          [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          {description}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-1 text-white text-[13px] font-semibold underline underline-offset-2
            hover:text-white/80 transition-colors"
        >
          See more
        </button>
      </div>

      {/* ── Bottom-sheet modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />

          {/* Sheet */}
          <div className="relative z-10 bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl
            max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {/* Header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3
              border-b border-gray-100">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                  hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-base font-bold text-gray-900">{cityName}</h2>
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
