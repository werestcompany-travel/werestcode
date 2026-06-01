'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  cityName:         string;
  description:      string;
  descriptionFull?: string[];
}

export default function DestinationHeroOverlay({ cityName, description, descriptionFull }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen, mounted]);

  const fullParagraphs = descriptionFull ?? [description];

  const modal = mounted ? (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={cityName}
    >
      <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
      <div className="relative z-10 bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button type="button" aria-label="Close" onClick={() => setModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-base font-bold text-gray-900">{cityName}</h2>
          <div className="w-8" />
        </div>
        <div className="px-5 py-5 space-y-4">
          {fullParagraphs.map((para, i) => (
            <p key={i} className="text-sm sm:text-base text-gray-700 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* ── Hero text overlay — pinned bottom-left ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 pb-4 sm:pb-6 z-10">
        {/* Headline — city name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-[30px]
          [text-shadow:0_2px_12px_rgba(0,0,0,0.85)]">
          {cityName}
        </h1>
        {/* Sub-headline — description */}
        <p className="text-white/90 text-[13px] sm:text-sm leading-snug line-clamp-2 max-w-xl
          [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
          {description}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-1.5 text-white text-[13px] font-semibold underline underline-offset-2
            hover:text-white/80 transition-colors cursor-pointer"
        >
          See more
        </button>
      </div>

      {/* ── Modal via portal — always outside hero's stacking context ── */}
      {mounted && modalOpen && createPortal(modal, document.body)}
    </>
  );
}
