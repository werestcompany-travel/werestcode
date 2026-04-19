'use client';

import { useState } from 'react';
import { Building2, CreditCard, CheckCircle2, Copy, Check, Lock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ───────────────────────────────────────────────────────────────── */
export type PaymentMethod = 'international_transfer' | 'credit_card' | 'crypto';

interface PaymentSectionProps {
  value:    PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}

/* ── Bitcoin SVG logo ────────────────────────────────────────────────────── */
function BitcoinLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="32" fill="#F7931A" />
      <path
        fill="#fff"
        d="M46.1 27.4c.6-4.1-2.5-6.3-6.8-7.8l1.4-5.6-3.4-.9-1.4 5.5-2.7-.7
           1.4-5.5-3.4-.8-1.4 5.6-2.2-.6-4.7-1.1-.9 3.7s2.5.6 2.5.6c1.4.3
           1.6 1.3 1.6 2l-1.6 6.4.4.1-.4-.1-2.3 9.1c-.2.4-.6 1.1-1.6.9
           0 .1-2.5-.6-2.5-.6l-1.7 3.9 4.4 1.1 2.4.6-1.4 5.7 3.4.8
           1.4-5.6 2.7.7-1.4 5.6 3.4.8 1.4-5.7c5.8 1.1 10.1.7 11.9-4.5
           1.5-4.1-.1-6.5-3-8.1 2.2-.5 3.8-2 4.2-4.9zm-7.1 11.3c-1 4.2-8.1
           1.9-10.4 1.4l1.9-7.4c2.2.6 9.5 1.7 8.5 6zm1-11.5c-.9 3.8-6.8
           1.9-8.7 1.4l1.7-6.7c1.9.5 8.1 1.4 7 5.3z"
      />
    </svg>
  );
}

/* ── Copyable field ──────────────────────────────────────────────────────── */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:text-blue-700 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/* ── Credit card form ────────────────────────────────────────────────────── */
function CardForm() {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const cardBrand = () => {
    const n = card.number.replace(/\s/g, '');
    if (/^4/.test(n))  return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n))  return 'Amex';
    return null;
  };

  return (
    <div className="mt-3 rounded-2xl border border-[#2534ff]/20 bg-blue-50/30 p-4 space-y-3">

      {/* Card number */}
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Card Number
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={e => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
            className="input-base pl-10 pr-16 font-mono tracking-widest"
          />
          {cardBrand() && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              {cardBrand()}
            </span>
          )}
        </div>
      </div>

      {/* Cardholder name */}
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="As printed on card"
          value={card.name}
          onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
          className="input-base font-mono tracking-wide uppercase"
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Expiry Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
              className="input-base pl-10 font-mono tracking-widest"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            CVV
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="password"
              inputMode="numeric"
              placeholder="•••"
              maxLength={4}
              value={card.cvv}
              onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              className="input-base pl-10 font-mono tracking-widest"
            />
          </div>
        </div>
      </div>

      {/* Paysolution button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 bg-[#2534ff] hover:bg-[#1420cc] text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm mt-1"
      >
        <Lock className="w-4 h-4" />
        Pay securely with Paysolution
      </button>

      <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> 256-bit SSL encrypted · PCI DSS compliant
      </p>
    </div>
  );
}

/* ── PaymentSection ──────────────────────────────────────────────────────── */
const BANK_DETAILS = [
  { label: 'Bank Name',       value: 'Bangkok Bank PCL' },
  { label: 'Account Name',    value: 'Werest Travel Co., Ltd.' },
  { label: 'Account Number',  value: '012-3-45678-9' },
  { label: 'SWIFT Code',      value: 'BKKBTHBK' },
  { label: 'Branch',          value: 'Sukhumvit, Bangkok' },
  { label: 'Currency',        value: 'THB / USD / EUR' },
];

const CRYPTO_WALLETS = [
  { coin: 'Bitcoin (BTC)',  address: 'bc1qxy2kgdygjrsqtzq2n0yrf249xl0xhcca9sph3x' },
  { coin: 'Ethereum (ETH)', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
  { coin: 'USDT (TRC-20)',  address: 'TKFmV2tqV6h9NmNAZr4VNjEqfr9gXj3RMK' },
  { coin: 'USDC (ERC-20)',  address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
];

export default function PaymentSection({ value, onChange }: PaymentSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Method</h2>
      <p className="text-xs text-gray-400 mb-5">
        Our team will confirm your booking and send payment instructions via email &amp; WhatsApp.
      </p>

      <div className="space-y-3">

        {/* ── International Transfer ── */}
        <div>
          <button
            type="button"
            onClick={() => onChange('international_transfer')}
            className={cn(
              'w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150',
              value === 'international_transfer'
                ? 'border-[#2534ff] bg-blue-50/60 shadow-sm'
                : 'border-gray-200 bg-white hover:border-blue-200',
            )}
          >
            <span className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
              value === 'international_transfer' ? 'bg-[#2534ff] text-white' : 'bg-gray-100 text-gray-500',
            )}>
              <Building2 className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-bold', value === 'international_transfer' ? 'text-[#2534ff]' : 'text-gray-800')}>
                International Transfer
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Bank wire · SWIFT · No card needed</p>
            </div>
            {value === 'international_transfer'
              ? <CheckCircle2 className="w-5 h-5 text-[#2534ff] shrink-0" />
              : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
            }
          </button>

          {/* Transfer details */}
          {value === 'international_transfer' && (
            <div className="mt-3 rounded-2xl border border-[#2534ff]/20 bg-blue-50/30 px-4 py-1">
              <p className="text-[11px] font-bold text-[#2534ff] uppercase tracking-wide pt-3 pb-1">
                Bank Transfer Details
              </p>
              {BANK_DETAILS.map(d => (
                <CopyField key={d.label} label={d.label} value={d.value} />
              ))}
              <p className="text-[10px] text-gray-400 py-3 leading-relaxed">
                Please include your booking reference as the payment note. Allow 1–3 business days for transfers to clear.
              </p>
            </div>
          )}
        </div>

        {/* ── Credit Card ── */}
        <div>
          <button
            type="button"
            onClick={() => onChange('credit_card')}
            className={cn(
              'w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150',
              value === 'credit_card'
                ? 'border-[#2534ff] bg-blue-50/60 shadow-sm'
                : 'border-gray-200 bg-white hover:border-blue-200',
            )}
          >
            <span className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
              value === 'credit_card' ? 'bg-[#2534ff] text-white' : 'bg-gray-100 text-gray-500',
            )}>
              <CreditCard className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-bold', value === 'credit_card' ? 'text-[#2534ff]' : 'text-gray-800')}>
                Credit Card
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Visa · Mastercard · Amex · via Paysolution</p>
            </div>
            {value === 'credit_card'
              ? <CheckCircle2 className="w-5 h-5 text-[#2534ff] shrink-0" />
              : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
            }
          </button>

          {value === 'credit_card' && <CardForm />}
        </div>

        {/* ── Crypto ── */}
        <div>
          <button
            type="button"
            onClick={() => onChange('crypto')}
            className={cn(
              'w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150',
              value === 'crypto'
                ? 'border-[#F7931A] bg-orange-50/60 shadow-sm'
                : 'border-gray-200 bg-white hover:border-orange-200',
            )}
          >
            <span className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <BitcoinLogo className="w-10 h-10" />
            </span>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-bold', value === 'crypto' ? 'text-[#F7931A]' : 'text-gray-800')}>
                Crypto
              </p>
              <p className="text-xs text-gray-400 mt-0.5">BTC · ETH · USDT · USDC</p>
            </div>
            {value === 'crypto'
              ? <CheckCircle2 className="w-5 h-5 text-[#F7931A] shrink-0" />
              : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
            }
          </button>

          {/* Wallet addresses */}
          {value === 'crypto' && (
            <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/30 px-4 py-1">
              <p className="text-[11px] font-bold text-[#F7931A] uppercase tracking-wide pt-3 pb-1">
                Wallet Addresses
              </p>
              {CRYPTO_WALLETS.map(w => (
                <CopyField key={w.coin} label={w.coin} value={w.address} />
              ))}
              <p className="text-[10px] text-gray-400 py-3 leading-relaxed">
                Send the exact booking amount and email your transaction hash to confirm payment. Rates locked for 30 minutes after booking.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
