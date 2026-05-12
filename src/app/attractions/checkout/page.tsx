'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft, User, Mail, Phone, Calendar, MessageSquare,
  CreditCard, Banknote, Building2, Bitcoin, CheckCircle2,
  ChevronRight, Minus, Plus, Trash2, Shield, Zap, Smartphone, CalendarPlus,
} from 'lucide-react';

export default function AttractionCheckoutPage() { return <Suspense><CheckoutInner /></Suspense>; }

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: <CreditCard className="w-5 h-5" />,
    desc: 'Visa, Mastercard, Amex',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'cash',
    label: 'Cash on Visit',
    icon: <Banknote className="w-5 h-5" />,
    desc: 'Pay in THB at the venue',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    id: 'swift',
    label: 'Bank Transfer (SWIFT)',
    icon: <Building2 className="w-5 h-5" />,
    desc: 'International wire transfer',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'crypto',
    label: 'Cryptocurrency',
    icon: <Bitcoin className="w-5 h-5" />,
    desc: 'BTC, ETH, USDT',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const PAYMENT_DETAILS: Record<string, React.ReactNode> = {
  card: (
    <div className="space-y-3 mt-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Card number</label>
        <input placeholder="1234 5678 9012 3456" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry</label>
          <input placeholder="MM / YY" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CVC</label>
          <input placeholder="123" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name on card</label>
        <input placeholder="Jane Smith" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
    </div>
  ),
  cash: (
    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800">
      <p className="font-bold mb-1">Pay at the venue</p>
      <p className="text-green-700 text-xs">Present your booking confirmation at the ticket counter on the day of your visit. Payment accepted in Thai Baht (THB) only.</p>
    </div>
  ),
  swift: (
    <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl text-sm space-y-2">
      <p className="font-bold text-purple-900">Bank Transfer Details</p>
      {[
        { label: 'Bank name',       value: 'Bangkok Bank' },
        { label: 'Account name',    value: 'Werest Travel Co., Ltd.' },
        { label: 'Account number',  value: '123-4-56789-0' },
        { label: 'SWIFT code',      value: 'BKKBTHBK' },
        { label: 'Reference',       value: 'Your booking reference' },
      ].map(row => (
        <div key={row.label} className="flex justify-between text-xs">
          <span className="text-purple-600 font-semibold">{row.label}</span>
          <span className="text-purple-900 font-bold font-mono">{row.value}</span>
        </div>
      ))}
      <p className="text-[11px] text-purple-600 mt-2">Transfer within 24 hours of booking to hold your reservation. Send proof of transfer to werestcompany@gmail.com.</p>
    </div>
  ),
  crypto: (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm space-y-3">
      <p className="font-bold text-amber-900">Crypto Payment</p>
      {[
        { label: 'USDT (TRC-20)', addr: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
        { label: 'BTC',          addr: 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
        { label: 'ETH (ERC-20)', addr: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
      ].map(c => (
        <div key={c.label}>
          <p className="text-[11px] font-bold text-amber-700 uppercase">{c.label}</p>
          <p className="text-[10px] font-mono text-amber-900 break-all">{c.addr}</p>
        </div>
      ))}
      <p className="text-[11px] text-amber-600">Send exact amount in your chosen currency. Email transaction hash to werestcompany@gmail.com with your booking reference.</p>
    </div>
  ),
};

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();

  // Parse booking params from sanctuary page
  const attractionId   = params.get('attractionId')   ?? 'sanctuary-of-truth';
  const attractionName = params.get('attractionName') ?? 'Sanctuary of Truth, Pattaya';
  const packageId      = params.get('packageId')      ?? '';
  const packageName    = params.get('packageName')    ?? '';
  const adultPrice     = parseFloat(params.get('adultPrice')   ?? '0');
  const childPrice     = parseFloat(params.get('childPrice')   ?? '0');

  // Ticket quantities (mutable)
  const [adultQty,  setAdultQty]  = useState(parseInt(params.get('adultQty')  ?? '1'));
  const [childQty,  setChildQty]  = useState(parseInt(params.get('childQty')  ?? '0'));
  const [infantQty, setInfantQty] = useState(parseInt(params.get('infantQty') ?? '0'));

  const [visitDate,      setVisitDate]      = useState(params.get('visitDate') ?? '');
  const [customerName,   setCustomerName]   = useState('');
  const [customerEmail,  setCustomerEmail]  = useState('');
  const [customerPhone,  setCustomerPhone]  = useState('');
  const [notes,          setNotes]          = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('card');
  const [step,           setStep]           = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [bookingRef,     setBookingRef]     = useState('');

  const totalPrice = adultQty * adultPrice + childQty * childPrice;
  const totalQty   = adultQty + childQty + infantQty;

  // Prefill from logged-in user
  useEffect(() => {
    fetch('/api/user/me').then(r => r.json()).then(d => {
      if (d.user) {
        setCustomerName(d.user.name ?? '');
        setCustomerEmail(d.user.email ?? '');
        setCustomerPhone(d.user.phone ?? '');
      }
    });
  }, []);

  function handleContinue() {
    if (!visitDate) { setError('Please select your visit date.'); return; }
    if (totalQty === 0) { setError('Please select at least one ticket.'); return; }
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill in your name, email and phone number.');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleConfirm() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/attraction-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attractionId, attractionName,
          packageId, packageName,
          visitDate, adultQty, childQty, infantQty,
          adultPrice, childPrice, totalPrice,
          customerName, customerEmail, customerPhone,
          notes: notes || null,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Booking failed.'); return; }
      setBookingRef(data.booking.bookingRef);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  const TICKETS = [
    { id: 'adult',  label: 'Adult',  desc: 'Age 13+',  price: adultPrice,  qty: adultQty,  setQty: setAdultQty  },
    { id: 'child',  label: 'Child',  desc: 'Age 3–12', price: childPrice,  qty: childQty,  setQty: setChildQty  },
    { id: 'infant', label: 'Infant', desc: 'Age 0–2',  price: 0,           qty: infantQty, setQty: setInfantQty },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* Step bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            {step > 1 && step < 3 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="flex items-center gap-2">
              {['Your Details', 'Payment', 'Confirmed'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${step === i + 1 ? 'border-brand-600 bg-brand-600 text-white'
                    : step > i + 1 ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-400'}`}>
                    {step > i + 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                  {i < 2 && <div className="w-6 h-px bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── MAIN FORM ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* ══ STEP 3: CONFIRMED ══ */}
              {step === 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Booking confirmed!</h1>
                  <p className="text-gray-500 text-sm mb-6">Your booking reference is:</p>
                  <div className="font-mono font-extrabold text-2xl text-brand-700 tracking-widest bg-brand-50 rounded-xl py-4 px-6 mb-6">{bookingRef}</div>
                  <p className="text-sm text-gray-500 mb-2">A confirmation has been sent to <strong>{customerEmail}</strong></p>
                  {paymentMethod === 'cash' && (
                    <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3 mb-4">Present your reference at the ticket counter when you arrive.</p>
                  )}
                  {paymentMethod === 'card' && (
                    <p className="text-sm text-blue-700 bg-blue-50 rounded-xl p-3 mb-4">Our team will contact you to process your card payment.</p>
                  )}
                  {(paymentMethod === 'swift' || paymentMethod === 'crypto') && (
                    <p className="text-sm text-purple-700 bg-purple-50 rounded-xl p-3 mb-4">Please complete your payment and email proof to werestcompany@gmail.com with reference <strong>{bookingRef}</strong>.</p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Link href="/account?tab=bookings"
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-colors">
                      View My Bookings
                    </Link>
                    <Link href="/attractions/sanctuary-of-truth"
                      className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                      Back to attraction
                    </Link>
                  </div>
                  <div className="text-center pt-3">
                    <a
                      href={`/api/ics/attraction/${bookingRef}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Add to Google Calendar / Apple Calendar
                    </a>
                  </div>
                </div>
              )}

              {/* ══ STEP 1: YOUR DETAILS ══ */}
              {step === 1 && (
                <>
                  {/* Tickets */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Select tickets</h2>
                    <div className="space-y-4">
                      {TICKETS.map(t => (
                        <div key={t.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                            <p className="text-xs text-gray-400">{t.desc} · {t.price === 0 ? 'Free' : `฿${t.price.toLocaleString()}`}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => t.setQty(q => Math.max(0, q - 1))}
                              disabled={t.qty === 0}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-30">
                              {t.qty === 1 && t.id === 'adult' ? <Minus className="w-3.5 h-3.5" /> : t.qty === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-gray-900">{t.qty}</span>
                            <button onClick={() => t.setQty(q => q + 1)}
                              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visit date */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Visit date</h2>
                    <label className="relative block">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input type="date" min={new Date().toISOString().split('T')[0]}
                        value={visitDate} onChange={e => setVisitDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </label>
                  </div>

                  {/* Customer info */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Your details</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                            placeholder="Jane Smith" type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                            placeholder="you@example.com" type="email"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                            placeholder="+66 XX XXX XXXX" type="tel"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Special requests (optional)</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                          <textarea value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Any special requests or accessibility needs…" rows={3}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

                  <button onClick={handleContinue}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.3)]">
                    Continue to payment
                  </button>
                </>
              )}

              {/* ══ STEP 2: PAYMENT ══ */}
              {step === 2 && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Select payment method</h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color} shrink-0`}>
                              {m.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{m.label}</p>
                              <p className="text-xs text-gray-500">{m.desc}</p>
                            </div>
                            {paymentMethod === m.id && (
                              <div className="ml-auto w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Payment-specific details */}
                    {PAYMENT_DETAILS[paymentMethod]}
                  </div>

                  {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

                  <button onClick={handleConfirm} disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.3)] flex items-center justify-center gap-2">
                    {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                    {loading ? 'Confirming…' : 'Confirm booking'}
                  </button>
                </>
              )}
            </div>

            {/* ── ORDER SUMMARY (right column) ── */}
            {step < 3 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 sticky top-24 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your order</p>
                    <p className="text-sm font-bold text-gray-900">{attractionName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{packageName}</p>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    {adultQty > 0 && <OrderRow label={`Adult × ${adultQty}`} price={adultQty * adultPrice} />}
                    {childQty > 0 && <OrderRow label={`Child × ${childQty}`} price={childQty * childPrice} />}
                    {infantQty > 0 && <OrderRow label={`Infant × ${infantQty}`} price={0} freeText />}
                    {visitDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(visitDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-extrabold text-brand-700">
                        {totalPrice === 0 ? '฿0' : `฿${totalPrice.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    {[
                      { icon: <Shield     className="w-3 h-3 text-green-500" />, text: 'Free cancellation 24h before' },
                      { icon: <Zap        className="w-3 h-3 text-brand-500" />, text: 'Instant confirmation'         },
                      { icon: <Smartphone className="w-3 h-3 text-blue-500" />, text: 'Mobile voucher accepted'       },
                    ].map(t => (
                      <div key={t.text} className="flex items-center gap-2 text-[11px] text-gray-500">
                        {t.icon} {t.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function OrderRow({ label, price, freeText }: { label: string; price: number; freeText?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{freeText ? 'Free' : `฿${price.toLocaleString()}`}</span>
    </div>
  );
}
