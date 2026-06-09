'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, Gift, MessageCircle, Search } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

const HOW_IT_WORKS = [
  {
    icon: <MessageCircle className="w-7 h-7 text-brand-600" />,
    step: '1',
    title: 'Purchase via WhatsApp',
    desc: 'Contact us on WhatsApp to purchase a gift voucher in any denomination. We\'ll confirm your order and process payment instantly.',
  },
  {
    icon: <Gift className="w-7 h-7 text-brand-600" />,
    step: '2',
    title: 'Receive Unique Code',
    desc: 'Once payment is confirmed, you\'ll receive a unique GV-XXXXXXXX voucher code to share with your recipient.',
  },
  {
    icon: <Check className="w-7 h-7 text-brand-600" />,
    step: '3',
    title: 'Redeem at Checkout',
    desc: 'Enter the code at checkout when booking any Werest Travel service — transfers, tours, or attraction tickets across Thailand.',
  },
];

const FAQS = [
  {
    q: 'How do I redeem a gift voucher?',
    a: 'At checkout, enter the voucher code in the gift voucher field. The value will be deducted from your total automatically.',
  },
  {
    q: 'Do gift vouchers expire?',
    a: 'Expiry dates are set at the time of issue and shown on the voucher. Contact us on WhatsApp for details.',
  },
  {
    q: 'Can I use a voucher for all services?',
    a: 'Vouchers are redeemable on all Werest Travel services — private transfers, tours, and attraction tickets across Thailand.',
  },
  {
    q: 'What if the voucher value is more than the booking total?',
    a: 'The remaining balance stays on the voucher for your next booking.',
  },
];

export default function GiftVouchersClient() {
  const [code,       setCode]       = useState('');
  const [checking,   setChecking]   = useState(false);
  const [checkResult, setCheckResult] = useState<{ valid: boolean; value?: number; message: string; recipientName?: string | null } | null>(null);
  const [openFaq,    setOpenFaq]    = useState<number | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/gift-vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setCheckResult(data);
    } catch {
      setCheckResult({ valid: false, message: 'Network error. Please try again.' });
    } finally {
      setChecking(false);
    }
  }

  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}?text=${encodeURIComponent("Hi, I'd like to purchase a gift voucher")}`;

  return (
    <>
      <Navbar transparent />

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-16 left-8 text-5xl opacity-20 rotate-12 select-none hidden lg:block">🎁</div>
        <div className="absolute top-24 right-12 text-4xl opacity-20 -rotate-12 select-none hidden lg:block">✈️</div>
        <div className="absolute bottom-10 left-20 text-3xl opacity-15 rotate-6 select-none hidden lg:block">🌏</div>
        <div className="absolute bottom-16 right-20 text-5xl opacity-20 -rotate-6 select-none hidden lg:block">💝</div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6 select-none">🎁</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Give the Gift<br />of Travel
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            The perfect present for explorers and adventurers. Redeemable on transfers, tours and attraction tickets across Thailand.
          </p>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl text-sm hover:bg-brand-50 transition-colors shadow-xl">
            🎁 Purchase a Gift Voucher
          </a>
        </div>
      </section>

      {/* Two columns: How it Works + Check Balance */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: How It Works */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">How It Works</h2>
              <p className="text-gray-500 text-sm mb-8">Three simple steps to the perfect travel gift.</p>
              <div className="space-y-8">
                {HOW_IT_WORKS.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0 border border-brand-100">
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center">
                          {step.step}
                        </span>
                        <h3 className="font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
                <MessageCircle className="w-4 h-4" />
                Purchase via WhatsApp
              </a>
            </div>

            {/* Right: Check Balance */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Voucher</h2>
              <p className="text-gray-500 text-sm mb-8">Already have a voucher code? Check its value and status here.</p>

              <form onSubmit={handleCheck} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voucher Code</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="GV-XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checking || !code.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  {checking
                    ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                    : <Search className="w-4 h-4" />}
                  {checking ? 'Checking…' : 'Check Balance'}
                </button>

                {checkResult && (
                  <div className={`rounded-xl px-4 py-4 border text-sm ${checkResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {checkResult.valid ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-green-800 mb-2">
                          <Check className="w-4 h-4" /> Voucher valid
                        </div>
                        <p className="text-green-800">Value: <span className="font-extrabold text-xl">฿{checkResult.value?.toLocaleString()}</span></p>
                        {checkResult.recipientName && <p className="text-green-700 text-xs">For: {checkResult.recipientName}</p>}
                      </div>
                    ) : (
                      <p className="text-red-700 font-semibold">{checkResult.message}</p>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`font-semibold text-sm transition-colors ${openFaq === i ? 'text-brand-600' : 'text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-brand-500' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed bg-gray-50 border-t border-gray-100">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
