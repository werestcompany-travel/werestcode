'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getTourBySlug, formatTHB } from '@/lib/tours';
import {
  Calendar, Clock, Users, ArrowLeft, ArrowRight,
  Shield, CheckCircle2, Phone, Mail, User, FileText,
  CreditCard, Building2, Banknote, Tag, Gift, Loader2, X,
} from 'lucide-react';

export default function TourCheckoutPage() {
  return (
    <Suspense>
      <TourCheckoutInner />
    </Suspense>
  );
}

// ─── Payment method config ─────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: 'payso_card', label: 'Credit / Debit Card',  icon: <CreditCard className="w-4 h-4" /> },
  { id: 'payso_qr',   label: 'QR PromptPay',         icon: <span className="text-sm font-bold">QR</span> },
  { id: 'bank',       label: 'Bank Transfer',         icon: <Building2 className="w-4 h-4" /> },
  { id: 'cash',       label: 'Pay on the Day (Cash)', icon: <Banknote className="w-4 h-4" /> },
] as const;

type PaymentMethodId = typeof PAYMENT_METHODS[number]['id'];

// ─── Inner page ───────────────────────────────────────────────────────────────

function TourCheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();

  // ── Read URL params from TourBookingPanel ─────────────────────────────────
  const tourSlug    = params.get('tour_slug')     ?? '';
  const tourDate    = params.get('tour_date')     ?? '';
  const optionId    = params.get('tour_option')   ?? '';
  const adults      = parseInt(params.get('tour_adults')   ?? '1');
  const children    = parseInt(params.get('tour_children') ?? '0');

  const tour   = getTourBySlug(tourSlug);
  const option = tour?.options.find(o => o.id === optionId) ?? tour?.options[0];

  const adultPrice = option?.pricePerPerson ?? 0;
  const childPrice = option?.childPrice ?? 0;
  const baseTotal  = adults * adultPrice + children * childPrice;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [notes,   setNotes]   = useState('');
  const [payment, setPayment] = useState<PaymentMethodId>('payso_card');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  // ── Promo code state ────────────────────────────────────────────────────────
  const [promoInput,    setPromoInput]    = useState('');
  const [promoLoading,  setPromoLoading]  = useState(false);
  const [promoApplied,  setPromoApplied]  = useState<{ code: string; discountAmount: number; type: 'PERCENTAGE' | 'FIXED'; value: number } | null>(null);
  const [promoError,    setPromoError]    = useState('');

  // ── Loyalty points state ────────────────────────────────────────────────────
  const [loyaltyPoints,   setLoyaltyPoints]   = useState<number | null>(null);
  const [pointsToRedeem,  setPointsToRedeem]  = useState(0);
  const [loyaltyApplied,  setLoyaltyApplied]  = useState(false);

  // ── Derived price (computed after state is declared) ───────────────────────
  const promoDiscount   = promoApplied?.discountAmount ?? 0;
  const loyaltyDiscount = loyaltyApplied ? pointsToRedeem : 0;
  const totalPrice      = Math.max(0, baseTotal - promoDiscount - loyaltyDiscount);

  // Fetch loyalty points if user is logged in
  useEffect(() => {
    fetch('/api/user/loyalty')
      .then(r => r.json())
      .then(d => { if (d.points !== undefined) setLoyaltyPoints(d.points) })
      .catch(() => {});
  }, []);

  // ── Guard: invalid tour ────────────────────────────────────────────────────
  if (!tour || !option || !tourDate) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16">
          <p className="text-xl font-bold text-gray-700">Tour not found or session expired.</p>
          <Link href="/tours" className="text-brand-600 hover:underline font-medium">Browse tours →</Link>
        </main>
        <Footer />
      </>
    );
  }

  // ── Promo code validation ──────────────────────────────────────────────────
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res  = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), orderAmount: baseTotal }),
      });
      const json = await res.json();
      if (!json.valid) {
        setPromoError(json.error ?? 'Invalid code');
        setPromoApplied(null);
      } else {
        setPromoApplied({
          code:           json.discount.code,
          discountAmount: json.discount.discountAmount,
          type:           json.discount.type,
          value:          json.discount.value,
        });
        setPromoError('');
        toast.success(`Promo applied — ${formatTHB(json.discount.discountAmount)} off!`);
      }
    } catch {
      setPromoError('Could not validate code. Try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  // ── Loyalty redemption ────────────────────────────────────────────────────
  const handleApplyLoyalty = () => {
    if (!pointsToRedeem || pointsToRedeem < 100) {
      toast.error('Minimum 100 points to redeem');
      return;
    }
    setLoyaltyApplied(true);
    toast.success(`${pointsToRedeem} points applied — ${formatTHB(pointsToRedeem)} off!`);
  };

  // ── Formatted date display ─────────────────────────────────────────────────
  const displayDate = (() => {
    const d = new Date(tourDate + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = 'Full name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (phone.replace(/\D/g, '').length < 8) e.phone = 'Valid phone number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Create the booking record
      const res = await fetch('/api/tours/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourSlug,
          tourDate,
          tourOptionId:  optionId,
          adultQty:      adults,
          childQty:      children,
          customerName:  name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          specialNotes:  notes.trim() || null,
          paymentMethod: payment,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Booking failed');

      const { id: tourBookingId } = json.data;

      // 1b. If loyalty points were applied, deduct them now
      if (loyaltyApplied && pointsToRedeem > 0) {
        await fetch('/api/user/loyalty/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: pointsToRedeem }),
        }).catch(() => {}); // best-effort — don't block booking
      }

      // 2. For online payments, create a Payso session and redirect
      if (payment === 'payso_card' || payment === 'payso_qr') {
        const payRes = await fetch('/api/payment/tour/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tourBookingId }),
        });
        const payJson = await payRes.json();
        if (!payRes.ok || !payJson.success) throw new Error(payJson.error ?? 'Payment setup failed');

        // Redirect to Payso hosted payment page
        window.location.href = payJson.data.paymentUrl;
        return;
      }

      // 3. For cash / bank transfer, go straight to confirmation
      router.push(`/confirmation/tour/${tourBookingId}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/tours" className="hover:text-gray-700 transition-colors">Tours</Link>
            <span>›</span>
            <Link href={`/tours/${tourSlug}`} className="hover:text-gray-700 transition-colors line-clamp-1">{tour.title}</Link>
            <span>›</span>
            <span className="text-gray-600 font-medium">Checkout</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ═══ LEFT — Customer form ═══════════════════════════════════════ */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">

              {/* Back link */}
              <Link
                href={`/tours/${tourSlug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to tour
              </Link>

              <h1 className="text-2xl font-extrabold text-gray-900">Complete your booking</h1>

              {/* ── Contact details ── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" /> Contact details
                </h2>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                    placeholder="e.g. John Smith"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors
                      ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email + Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                        placeholder="your@email.com"
                        className={`w-full rounded-xl border pl-9 pr-4 py-3 text-sm outline-none transition-colors
                          ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                        placeholder="+66 8X XXX XXXX"
                        className={`w-full rounded-xl border pl-9 pr-4 py-3 text-sm outline-none transition-colors
                          ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Special requests <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Dietary requirements, allergies, accessibility needs…"
                    className="w-full rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 px-4 py-3 text-sm outline-none resize-none transition-colors"
                  />
                </div>
              </div>

              {/* ── Promo code ── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-brand-600" /> Promo Code
                </h2>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-green-800">{promoApplied.code}</p>
                      <p className="text-xs text-green-600">
                        {promoApplied.type === 'PERCENTAGE' ? `${promoApplied.value}% off` : formatTHB(promoApplied.value) + ' off'} — saving {formatTHB(promoApplied.discountAmount)}
                      </p>
                    </div>
                    <button type="button" onClick={() => { setPromoApplied(null); setPromoInput(''); }}
                      className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                      placeholder="PROMO CODE"
                      className="flex-1 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 px-4 py-2.5 text-sm outline-none font-mono tracking-widest uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
              </div>

              {/* ── Loyalty points ── */}
              {loyaltyPoints !== null && loyaltyPoints >= 100 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Gift className="w-4 h-4 text-brand-600" /> Loyalty Points
                    <span className="ml-auto text-sm font-normal text-gray-500">{loyaltyPoints.toLocaleString()} pts available</span>
                  </h2>
                  {loyaltyApplied ? (
                    <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-brand-800">{pointsToRedeem} points redeemed</p>
                        <p className="text-xs text-brand-600">Saving {formatTHB(pointsToRedeem)}</p>
                      </div>
                      <button type="button" onClick={() => { setLoyaltyApplied(false); setPointsToRedeem(0); }}
                        className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">Use your points for a discount — 1 point = ฿1. Minimum 100 points, multiples of 50.</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={100}
                          max={Math.min(loyaltyPoints, Math.floor(baseTotal / 50) * 50)}
                          step={50}
                          value={pointsToRedeem || ''}
                          onChange={e => setPointsToRedeem(Math.min(Number(e.target.value), loyaltyPoints, Math.floor(baseTotal)))}
                          placeholder="Enter points"
                          className="flex-1 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 px-4 py-2.5 text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyLoyalty}
                          disabled={!pointsToRedeem || pointsToRedeem < 100}
                          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-colors"
                        >Apply</button>
                      </div>
                      <div className="flex gap-2">
                        {[100, 200, 500].filter(p => p <= loyaltyPoints && p <= baseTotal).map(p => (
                          <button key={p} type="button" onClick={() => setPointsToRedeem(p)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 font-medium transition-colors">
                            {p} pts
                          </button>
                        ))}
                        <button type="button"
                          onClick={() => setPointsToRedeem(Math.min(loyaltyPoints, Math.floor(baseTotal / 50) * 50))}
                          className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 font-medium transition-colors">
                          Max
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Payment method ── */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-600" /> Payment method
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayment(m.id)}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors
                        ${payment === m.id
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-gray-50'
                        }`}
                    >
                      <span className={payment === m.id ? 'text-brand-600' : 'text-gray-400'}>{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                {payment === 'cash' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    💵 Please have exact cash ready on the day. Our guide will collect payment at the meeting point.
                  </p>
                )}
                {payment === 'bank' && (
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    🏦 Bank transfer details will be sent to your email after booking. Please transfer within 24 hours to confirm your spot.
                  </p>
                )}
              </div>

              {/* ── Cancellation policy ── */}
              <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Free cancellation</p>
                  <p className="text-xs text-green-700 mt-0.5">Cancel up to 24 hours before your tour for a full refund. No questions asked.</p>
                </div>
              </div>

              {/* ── Submit button ── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold text-base py-4 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,52,255,0.25)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Confirming…
                  </span>
                ) : (
                  <>Confirm Booking — {formatTHB(totalPrice)} <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* ═══ RIGHT — Order summary ═══════════════════════════════════════ */}
            <aside className="lg:col-span-2">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Tour image */}
                {tour.images[0] && (
                  <div className="relative h-44 w-full">
                    <Image
                      src={tour.images[0]}
                      alt={tour.title}
                      fill
                      className="object-cover"
                      sizes="480px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white font-bold text-sm leading-snug line-clamp-2">{tour.title}</p>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order Summary</h3>

                  {/* Tour details */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{displayDate}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{option.time}{option.label ? ` — ${option.label}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <Users className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>
                        {adults} adult{adults !== 1 ? 's' : ''}
                        {children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{adults} adult{adults !== 1 ? 's' : ''} × {formatTHB(adultPrice)}</span>
                      <span>{formatTHB(adults * adultPrice)}</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>{children} child{children !== 1 ? 'ren' : ''} × {formatTHB(childPrice)}</span>
                        <span>{formatTHB(children * childPrice)}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Promo ({promoApplied.code})</span>
                        <span>−{formatTHB(promoApplied.discountAmount)}</span>
                      </div>
                    )}
                    {loyaltyApplied && pointsToRedeem > 0 && (
                      <div className="flex justify-between text-brand-600 font-medium">
                        <span>Points ({pointsToRedeem} pts)</span>
                        <span>−{formatTHB(loyaltyDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-base text-gray-900 border-t border-gray-100 pt-2.5 mt-1">
                      <span>Total</span>
                      <span className="text-brand-600">{formatTHB(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    {[
                      'Free cancellation up to 24h before',
                      'Instant confirmation by email',
                      'Small group — max {max} people'.replace('{max}', String(tour.maxGroupSize)),
                    ].map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
