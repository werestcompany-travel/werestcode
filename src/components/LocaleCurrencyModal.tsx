'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';

/* ─── Data ─────────────────────────────────────────────────── */
const LANGUAGES: { code: Lang; native: string; label: string; country: string; flagSrc: string }[] = [
  { code: 'EN', native: 'English',  label: 'English', country: 'United Kingdom', flagSrc: 'https://flagcdn.com/w40/gb.png' },
  { code: 'TH', native: 'ภาษาไทย', label: 'Thai',    country: 'Thailand',       flagSrc: 'https://flagcdn.com/w40/th.png' },
  { code: 'ZH', native: '中文',     label: 'Chinese', country: 'China',          flagSrc: 'https://flagcdn.com/w40/cn.png' },
];

const CURRENCIES_POPULAR: { code: Currency; name: string; flag: string }[] = [
  { code: 'THB', name: 'Thai Baht',         flag: '🇹🇭' },
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',              flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     flag: '🇬🇧' },
  { code: 'CNY', name: 'Chinese Yuan',      flag: '🇨🇳' },
];

const CURRENCIES_MORE: { code: Currency; name: string; flag: string }[] = [
  { code: 'JPY', name: 'Japanese Yen',      flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar',  flag: '🇸🇬' },
];

/* ─── Props ─────────────────────────────────────────────────── */
interface Props {
  open:        boolean;
  tab:         'language' | 'currency';
  onClose:     () => void;
  onTabChange: (tab: 'language' | 'currency') => void;
}

/* ─── Sub-components defined at module level (avoids remount on every render) ── */
function LangItem({
  l, active, onSelect,
}: { l: typeof LANGUAGES[number]; active: boolean; onSelect: (code: Lang) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(l.code)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center
        ${active
          ? 'border-[#2534ff] bg-[#2534ff]/5'
          : 'border-transparent bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
        }`}
    >
      <img src={l.flagSrc} alt={l.label} className="w-8 h-[22px] object-cover rounded shadow-sm" />
      <span className={`text-[13px] font-semibold leading-tight ${active ? 'text-[#2534ff]' : 'text-gray-800'}`}>
        {l.native}
      </span>
      <span className={`text-[10px] leading-tight ${active ? 'text-[#2534ff]/60' : 'text-gray-400'}`}>
        {l.country}
      </span>
    </button>
  );
}

function CurrItem({
  c, active, onSelect,
}: { c: { code: Currency; name: string; flag: string }; active: boolean; onSelect: (code: Currency) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(c.code)}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center
        ${active
          ? 'border-[#2534ff] bg-[#2534ff]/5'
          : 'border-transparent bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
        }`}
    >
      <span className="text-2xl leading-none">{c.flag}</span>
      <span className={`text-[13px] font-bold leading-tight ${active ? 'text-[#2534ff]' : 'text-gray-800'}`}>
        {c.code}
      </span>
      <span className={`text-[10px] leading-tight ${active ? 'text-[#2534ff]/60' : 'text-gray-400'}`}>
        {c.name}
      </span>
    </button>
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export default function LocaleCurrencyModal({ open, tab, onClose, onTabChange }: Props) {
  const { lang, currency, setLang, setCurrency } = useLocale();

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelectLang = (code: Lang) => { setLang(code); onClose(); };
  const handleSelectCurrency = (code: Currency) => { setCurrency(code); onClose(); };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full sm:w-[520px] max-h-[92dvh] sm:max-h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
          <h2 className="text-[17px] font-bold text-gray-900">Language &amp; Currency</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex px-5 mt-4 border-b border-gray-100 shrink-0">
          {(['language', 'currency'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={`pb-3 mr-6 text-[14px] font-semibold border-b-2 transition-colors
                ${tab === t
                  ? 'border-[#2534ff] text-[#2534ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {t === 'language' ? 'Language' : 'Currency'}
            </button>
          ))}
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

          {tab === 'language' && (
            <>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Select language
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {LANGUAGES.map(l => (
                  <LangItem key={l.code} l={l} active={lang === l.code} onSelect={handleSelectLang} />
                ))}
              </div>
            </>
          )}

          {tab === 'currency' && (
            <>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Popular currencies
              </p>
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {CURRENCIES_POPULAR.map(c => (
                  <CurrItem key={c.code} c={c} active={currency === c.code} onSelect={handleSelectCurrency} />
                ))}
              </div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                More currencies
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {CURRENCIES_MORE.map(c => (
                  <CurrItem key={c.code} c={c} active={currency === c.code} onSelect={handleSelectCurrency} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
