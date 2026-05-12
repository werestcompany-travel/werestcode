'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLocale, type Lang, type Currency } from '@/context/LocaleContext';

interface Props { open: boolean; onClose: () => void }

/* ── Language list ─────────────────────────────────────────────────────────── */
const LANGUAGES: { code: Lang | string; label: string; flag: string; supported: boolean }[] = [
  { code: 'EN', label: 'English (Thailand)',  flag: 'https://flagcdn.com/w40/th.png',  supported: true  },
  { code: 'ZH', label: '繁體中文',             flag: 'https://flagcdn.com/w40/tw.png',  supported: true  },
  { code: 'ja', label: '日本語',               flag: 'https://flagcdn.com/w40/jp.png',  supported: false },
  { code: 'ko', label: '한국어',               flag: 'https://flagcdn.com/w40/kr.png',  supported: false },
  { code: 'TH', label: 'ภาษาไทย',             flag: 'https://flagcdn.com/w40/th.png',  supported: true  },
  { code: 'uk', label: 'Українська',          flag: 'https://flagcdn.com/w40/ua.png',  supported: false },
  { code: 'ar', label: 'العربية',             flag: 'https://flagcdn.com/w40/sa.png',  supported: false },
  { code: 'id', label: 'Bahasa Indonesia',    flag: 'https://flagcdn.com/w40/id.png',  supported: false },
  { code: 'ms', label: 'Bahasa Melayu',       flag: 'https://flagcdn.com/w40/my.png',  supported: false },
  { code: 'da', label: 'Dansk',               flag: 'https://flagcdn.com/w40/dk.png',  supported: false },
  { code: 'de', label: 'Deutsch',             flag: 'https://flagcdn.com/w40/de.png',  supported: false },
  { code: 'en', label: 'English',             flag: 'https://flagcdn.com/w40/gb.png',  supported: false },
  { code: 'es', label: 'Español',             flag: 'https://flagcdn.com/w40/es.png',  supported: false },
  { code: 'fr', label: 'Français',            flag: 'https://flagcdn.com/w40/fr.png',  supported: false },
  { code: 'it', label: 'Italiano',            flag: 'https://flagcdn.com/w40/it.png',  supported: false },
  { code: 'nl', label: 'Nederlands',          flag: 'https://flagcdn.com/w40/nl.png',  supported: false },
  { code: 'pl', label: 'Polski',              flag: 'https://flagcdn.com/w40/pl.png',  supported: false },
  { code: 'pt', label: 'Português (Brasil)',  flag: 'https://flagcdn.com/w40/br.png',  supported: false },
  { code: 'fi', label: 'Suomi',               flag: 'https://flagcdn.com/w40/fi.png',  supported: false },
  { code: 'sv', label: 'Svenska',             flag: 'https://flagcdn.com/w40/se.png',  supported: false },
  { code: 'vi', label: 'Tiếng Việt',          flag: 'https://flagcdn.com/w40/vn.png',  supported: false },
  { code: 'tr', label: 'Türkçe',              flag: 'https://flagcdn.com/w40/tr.png',  supported: false },
  { code: 'el', label: 'Ελληνικά',            flag: 'https://flagcdn.com/w40/gr.png',  supported: false },
  { code: 'ru', label: 'Русский',             flag: 'https://flagcdn.com/w40/ru.png',  supported: false },
];

/* ── Currency list ─────────────────────────────────────────────────────────── */
interface CurrencyItem { code: string; label: string; supported: boolean }
const TOP_CURRENCIES: CurrencyItem[] = [
  { code: 'THB', label: 'Thai Baht',                      supported: true  },
];
const ALL_CURRENCIES: CurrencyItem[] = [
  { code: 'THB', label: 'Thai Baht',                      supported: true  },
  { code: 'AED', label: 'United Arab Emirates Dirham',    supported: false },
  { code: 'AZN', label: 'Azerbaijani Manat',              supported: false },
  { code: 'AUD', label: 'Australian Dollar (AU$)',         supported: false },
  { code: 'BHD', label: 'Bahraini Dinar',                 supported: false },
  { code: 'BRL', label: 'Brazilian Real',                 supported: false },
  { code: 'BYN', label: 'Belarusian Ruble',               supported: false },
  { code: 'CAD', label: 'Canadian Dollar',                supported: false },
  { code: 'CHF', label: 'Swiss Franc',                    supported: false },
  { code: 'CLP', label: 'Chilean Peso',                   supported: false },
  { code: 'CNY', label: 'Chinese Yuan',                   supported: false },
  { code: 'COP', label: 'Colombian Peso',                 supported: false },
  { code: 'DKK', label: 'Danish Krone',                   supported: false },
  { code: 'EUR', label: 'Euro (€)',                       supported: true  },
  { code: 'GBP', label: 'British Pound (£)',              supported: true  },
  { code: 'HKD', label: 'Hong Kong Dollar (HK$)',         supported: false },
  { code: 'IDR', label: 'Indonesian Rupiah',              supported: false },
  { code: 'ILS', label: 'Israeli New Shekel',             supported: false },
  { code: 'INR', label: 'Indian Rupee',                   supported: false },
  { code: 'JOD', label: 'Jordanian Dinar',                supported: false },
  { code: 'JPY', label: 'Japanese Yen',                   supported: false },
  { code: 'KRW', label: 'Korean Won (₩)',                 supported: false },
  { code: 'KWD', label: 'Kuwaiti Dinar',                  supported: false },
  { code: 'KZT', label: 'Kazakhstani Tenge',              supported: false },
  { code: 'MXN', label: 'Mexican Peso',                   supported: false },
  { code: 'MYR', label: 'Malaysian Ringgit',              supported: false },
  { code: 'NOK', label: 'Norwegian Krone',                supported: false },
  { code: 'NZD', label: 'New Zealand Dollar',             supported: false },
  { code: 'PHP', label: 'Philippine Peso',                supported: false },
  { code: 'PLN', label: 'Polish Zloty',                   supported: false },
  { code: 'QAR', label: 'Qatari Riyal',                   supported: false },
  { code: 'RON', label: 'Romanian Leu',                   supported: false },
  { code: 'RUB', label: 'Russian Ruble',                  supported: false },
  { code: 'SAR', label: 'Saudi Riyal',                    supported: false },
  { code: 'SEK', label: 'Swedish Krona',                  supported: false },
  { code: 'SGD', label: 'Singapore Dollar',               supported: false },
  { code: 'TRY', label: 'Turkish Lira',                   supported: false },
  { code: 'TWD', label: 'New Taiwan Dollar',              supported: false },
  { code: 'UAH', label: 'Ukrainian Hryvnia',              supported: false },
  { code: 'USD', label: 'US Dollar',                      supported: true  },
  { code: 'VND', label: 'Vietnamese Dong',                supported: false },
  { code: 'ZAR', label: 'South African Rand',             supported: false },
];

export default function LocaleModal({ open, onClose }: Props) {
  const { lang, currency, setLang, setCurrency } = useLocale();
  const [tab, setTab] = useState<'languages' | 'currency'>('languages');
  const bodyRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Reset to languages tab when reopened */
  useEffect(() => { if (open) setTab('languages'); }, [open]);

  if (!open) return null;

  const handleLangSelect = (code: string, supported: boolean) => {
    if (supported) setLang(code as Lang);
    onClose();
  };

  const handleCurrencySelect = (code: string, supported: boolean) => {
    if (supported) setCurrency(code as Currency);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Modal box */}
      <div className="relative z-10 w-full max-w-[640px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* ── Header tabs ── */}
        <div className="flex items-center border-b border-gray-100 px-6 pt-5 pb-0 gap-6">
          <button
            onClick={() => setTab('languages')}
            className={`pb-3 text-[15px] font-semibold border-b-2 transition-colors ${
              tab === 'languages'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Languages
          </button>
          <button
            onClick={() => setTab('currency')}
            className={`pb-3 text-[15px] font-semibold border-b-2 transition-colors ${
              tab === 'currency'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Currency
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto mb-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={bodyRef} className="overflow-y-auto flex-1 px-6 py-5">

          {/* ════ LANGUAGES TAB ════ */}
          {tab === 'languages' && (
            <div>
              <p className="text-[13px] font-bold text-gray-900 mb-4">All Languages</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {LANGUAGES.map((l) => {
                  const isActive = lang === l.code;
                  return (
                    <button
                      key={l.code + l.label}
                      onClick={() => handleLangSelect(l.code, l.supported)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-[#1a73e8]'
                          : l.supported
                          ? 'text-gray-700 hover:bg-gray-50'
                          : 'text-gray-400 hover:bg-gray-50 cursor-not-allowed'
                      }`}
                    >
                      <img
                        src={l.flag}
                        alt={l.label}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-100"
                        style={{ minWidth: 24 }}
                      />
                      <span className={`text-[13px] leading-tight truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {l.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ CURRENCY TAB ════ */}
          {tab === 'currency' && (
            <div>
              {/* Top currencies */}
              <p className="text-[13px] font-bold text-gray-900 mb-3">Top currencies</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-6">
                {TOP_CURRENCIES.map((c) => {
                  const isActive = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencySelect(c.code, c.supported)}
                      className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        isActive ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-bold text-[#1a73e8]'}`}>
                        {c.code}
                      </span>
                      <span className={`text-[13px] ${isActive ? 'font-medium' : 'text-gray-600 font-medium'}`}>
                        {' '}- {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* All currencies */}
              <p className="text-[13px] font-bold text-gray-900 mb-3">All currencies</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {ALL_CURRENCIES.map((c) => {
                  const isActive = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencySelect(c.code, c.supported)}
                      className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50'
                          : c.supported
                          ? 'hover:bg-gray-50'
                          : 'cursor-not-allowed'
                      }`}
                    >
                      <span className={`text-[13px] font-bold shrink-0 ${isActive ? 'text-[#1a73e8]' : c.supported ? 'text-[#1a73e8]' : 'text-gray-400'}`}>
                        {c.code}
                      </span>
                      <span className={`text-[13px] font-medium truncate ${isActive ? 'text-[#1a73e8]' : c.supported ? 'text-gray-600' : 'text-gray-400'}`}>
                        {' '}- {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
