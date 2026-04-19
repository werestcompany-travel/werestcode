'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

/* ── FAQ data — uses translation keys ────────────────────────────────────── */
const FAQ_KEYS = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
];

/* ── Single FAQ accordion item ───────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-gray-100 last:border-0"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        type="button"
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
      >
        <span
          className={`font-semibold text-sm sm:text-base transition-colors ${
            open ? 'text-brand-600' : 'text-gray-900 group-hover:text-brand-600'
          }`}
          itemProp="name"
        >
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-brand-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
          <p className="pb-5 text-sm text-gray-600 leading-relaxed -mt-1 animate-fade-in" itemProp="text">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── FAQ section ─────────────────────────────────────────────────────────── */
export default function FaqSection() {
  const { t } = useLocale();

  return (
    <section
      aria-labelledby="faq-heading"
      className="py-20 bg-white"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-2">
            {t('faq.tagline')}
          </p>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {t('faq.heading')}
          </h2>
        </div>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl px-6 shadow-sm">
          {FAQ_KEYS.map(({ qKey, aKey }) => (
            <FaqItem key={qKey} q={t(qKey)} a={t(aKey)} />
          ))}
        </div>
      </div>
    </section>
  );
}
