'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronDown, Check } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

const HOW_IT_WORKS = [
  { emoji: '🎁', step: '01', title: 'Choose Amount',       desc: 'Pick a preset or enter a custom amount. Every baht is redeemable on any Werest service.' },
  { emoji: '✍️', step: '02', title: 'Personalise',         desc: 'Add the recipient\'s name and a heartfelt message. We\'ll make it look beautiful.'         },
  { emoji: '📧', step: '03', title: 'Send or Print',        desc: 'Deliver instantly by email or download a printable PDF to gift in person.'                 },
];

const FAQS = [
  {
    q: 'How do I redeem a gift voucher?',
    a: 'At checkout, enter the voucher code in the discount field. The value will be deducted from your total automatically. Any remaining balance stays on the voucher for future use.',
  },
  {
    q: 'Do gift vouchers expire?',
    a: 'Gift vouchers are valid for 12 months from the date of purchase. The expiry date is clearly shown on the voucher.',
  },
  {
    q: 'Can I use multiple vouchers in one booking?',
    a: 'Yes — you can apply up to 3 vouchers per booking. If the voucher value exceeds the booking total, the remaining balance is kept for your next purchase.',
  },
  {
    q: 'Can I use a voucher for all services?',
    a: 'Vouchers are redeemable on all Werest Travel services — private transfers, tours, and attraction tickets across Thailand.',
  },
  {
    q: 'What if the recipient already has a booking?',
    a: 'Vouchers can be applied retroactively if the booking was made within the last 48 hours. Contact our support team via WhatsApp.',
  },
];

export default function GiftVouchersClient() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount,   setCustomAmount]   = useState('');
  const [openFaq,        setOpenFaq]        = useState<number | null>(null);
  const [interestForm,   setInterestForm]   = useState({ recipientName: '', recipientEmail: '', message: '', senderName: '', email: '' });
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const finalAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : 0);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    setSelectedAmount(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setInterestForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPurchaseStatus('sending');
    try {
      const res = await fetch('/api/gift-vouchers/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...interestForm, amount: finalAmount }),
      });
      setPurchaseStatus(res.ok ? 'success' : 'error');
    } catch {
      setPurchaseStatus('error');
    }
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Floating emoji decorations */}
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
            The perfect present for explorers, adventurers and anyone who loves Thailand. Redeemable on transfers, tours and attraction tickets.
          </p>
          <a href="#purchase"
            className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold px-8 py-4 rounded-2xl text-sm hover:bg-rose-50 transition-colors shadow-xl">
            🎁 Get a Voucher
          </a>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three simple steps to the perfect travel gift.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-3xl border border-rose-100">
                  {step.emoji}
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PURCHASE FORM ── */}
      <section id="purchase" className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Purchase a Voucher</h2>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2 rounded-full mt-3">
              💳 Payment and delivery coming soon — pre-register your interest below
            </div>
          </div>

          {purchaseStatus === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-xl font-extrabold text-green-800 mb-2">You&apos;re on the list!</p>
              <p className="text-green-700 text-sm">
                We&apos;ll email you as soon as gift vouchers launch. The lucky recipient will love it!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">

              {/* Amount selection */}
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Voucher Amount</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedAmount === amt
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={handleAmountChange}
                  placeholder="Or enter a custom amount (฿)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none text-sm bg-white transition-colors"
                />
                {finalAmount > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 font-semibold">
                    <Check className="w-3.5 h-3.5" /> ฿{finalAmount.toLocaleString()} selected
                  </div>
                )}
              </div>

              {/* Recipient details */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Recipient Details</p>
                {[
                  { name: 'recipientName',  label: 'Recipient name',  type: 'text',  placeholder: 'e.g. Sarah Johnson'          },
                  { name: 'recipientEmail', label: 'Recipient email', type: 'email', placeholder: 'sarah@example.com'            },
                ].map(f => (
                  <div key={f.name}>
                    <label htmlFor={f.name} className="block text-xs font-semibold text-gray-500 mb-1.5">
                      {f.label} <span className="text-red-400">*</span>
                    </label>
                    <input
                      id={f.name} name={f.name} type={f.type} required
                      placeholder={f.placeholder}
                      value={interestForm[f.name as keyof typeof interestForm]}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none text-sm bg-white transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Personalised message
                  </label>
                  <textarea
                    id="message" name="message" rows={3}
                    placeholder="Happy birthday! Hope you enjoy your Thailand adventure 🎉"
                    value={interestForm.message}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none text-sm bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Sender */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Details</p>
                {[
                  { name: 'senderName', label: 'Your name',  type: 'text',  placeholder: 'John Smith'            },
                  { name: 'email',      label: 'Your email', type: 'email', placeholder: 'john@example.com'      },
                ].map(f => (
                  <div key={f.name}>
                    <label htmlFor={`sender-${f.name}`} className="block text-xs font-semibold text-gray-500 mb-1.5">
                      {f.label} <span className="text-red-400">*</span>
                    </label>
                    <input
                      id={`sender-${f.name}`} name={f.name} type={f.type} required
                      placeholder={f.placeholder}
                      value={interestForm[f.name as keyof typeof interestForm]}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none text-sm bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>

              {purchaseStatus === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  Something went wrong. Please try again or contact us on WhatsApp.
                </p>
              )}

              <button
                type="submit"
                disabled={purchaseStatus === 'sending' || finalAmount < 100}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-sm shadow-[0_4px_20px_rgba(244,63,94,0.35)]"
              >
                {purchaseStatus === 'sending' ? 'Sending…' : '🎁 Pre-register Interest'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`font-semibold text-sm transition-colors ${openFaq === i ? 'text-rose-600' : 'text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-rose-500' : ''}`} />
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
