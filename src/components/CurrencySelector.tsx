'use client';

import { useLocale, type Currency } from '@/context/LocaleContext';

/* ── Currency metadata ─────────────────────────────────────── */
const CURRENCIES: {
  code:   Currency;
  name:   string;
  flag:   string;
  symbol: string;
}[] = [
  { code: 'THB', name: 'Thai Baht',       flag: '🇹🇭', symbol: '฿'  },
  { code: 'USD', name: 'US Dollar',        flag: '🇺🇸', symbol: '$'  },
  { code: 'EUR', name: 'Euro',             flag: '🇪🇺', symbol: '€'  },
  { code: 'GBP', name: 'British Pound',    flag: '🇬🇧', symbol: '£'  },
  { code: 'CNY', name: 'Chinese Yuan',     flag: '🇨🇳', symbol: '¥'  },
  { code: 'JPY', name: 'Japanese Yen',     flag: '🇯🇵', symbol: '¥'  },
  { code: 'AUD', name: 'Australian Dollar',flag: '🇦🇺', symbol: 'A$' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
];

interface CurrencySelectorProps {
  /** "compact" shows only the currency code (mobile). "full" shows flag + code. */
  variant?: 'compact' | 'full';
  /** Extra Tailwind classes for the wrapper. */
  className?: string;
  /** Called after the currency has been saved to context + localStorage. */
  onSelect?: (currency: Currency) => void;
}

export default function CurrencySelector({
  variant   = 'full',
  className = '',
  onSelect,
}: CurrencySelectorProps) {
  const { currency, setCurrency } = useLocale();

  const active = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Currency;
    setCurrency(next);
    localStorage.setItem('werest_currency', next);
    onSelect?.(next);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Visible label layered on top of the invisible <select> */}
      <span
        className={`pointer-events-none flex items-center gap-1 text-sm font-medium select-none ${
          variant === 'compact' ? '' : 'gap-1.5'
        }`}
        aria-hidden="true"
      >
        {variant === 'full' && (
          <span className="text-base leading-none">{active.flag}</span>
        )}
        <span>{active.code}</span>
      </span>

      {/* Native <select> — positioned absolutely, fully transparent, covers the label */}
      <select
        value={currency}
        onChange={handleChange}
        aria-label="Select currency"
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Named list export (re-used inside Navbar's locale panel) ── */
export { CURRENCIES };
