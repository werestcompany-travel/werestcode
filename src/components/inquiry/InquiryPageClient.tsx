'use client';

import { useState, useRef } from 'react';

// Use NEXT_PUBLIC_COMPANY_PHONE env var; fall back to a generic Thai support number
const WA_SUPPORT_URL = `https://wa.me/${
  (process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '66800000000').replace(/\D/g, '')
}`;
import Link from 'next/link';
import {
  User, Mail, Phone, Globe, Calendar, Users, MapPin, Clock,
  Star, Shield, Headphones, Plus, Minus, ChevronDown, ChevronUp,
  CheckCircle2, Loader2, MessageCircle, Send, Sparkles,
  Quote, Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ─── Constants ─────────────────────────────────────────── */

const ACTIVITIES = [
  { emoji: '🏛️', label: 'Cultural & Temples' },
  { emoji: '🌿', label: 'Nature & Jungle' },
  { emoji: '🏖️', label: 'Beach & Islands' },
  { emoji: '🍜', label: 'Street Food Tour' },
  { emoji: '🛥️', label: 'Boat & Water Sports' },
  { emoji: '🐘', label: 'Elephant Sanctuary' },
  { emoji: '🧘', label: 'Wellness & Spa' },
  { emoji: '🎭', label: 'Nightlife & Shows' },
  { emoji: '🛺', label: 'Tuk-Tuk City Tour' },
  { emoji: '🤿', label: 'Diving & Snorkelling' },
  { emoji: '🧗', label: 'Adventure & Trekking' },
  { emoji: '🎨', label: 'Arts & Crafts' },
  { emoji: '🍳', label: 'Cooking Class' },
  { emoji: '🛍️', label: 'Shopping & Markets' },
];

const TRANSPORT_OPTIONS = [
  { value: 'private-van', label: '🚐 Private Minivan' },
  { value: 'private-bus', label: '🚌 Private Coach' },
  { value: 'mixed', label: '🔄 Mix (Van + Bus)' },
  { value: 'no-preference', label: '✅ No Preference' },
];

const HOTEL_OPTIONS = [
  { value: '3-star', label: '⭐⭐⭐ 3-Star Standard' },
  { value: '4-star', label: '⭐⭐⭐⭐ 4-Star Comfort' },
  { value: '5-star', label: '⭐⭐⭐⭐⭐ 5-Star Luxury' },
  { value: 'no-preference', label: '✅ No Preference' },
];

const DURATIONS = ['3–4 days', '5–6 days', '7–9 days', '10–14 days', '15+ days'];

const BUDGETS = [
  'Under $500 / person',
  '$500–$1,000 / person',
  '$1,000–$2,000 / person',
  '$2,000–$3,500 / person',
  '$3,500+ / person',
  'Flexible / Tell me',
];

const COUNTRIES = [
  'Australia', 'Canada', 'China', 'France', 'Germany', 'India',
  'Japan', 'Singapore', 'South Korea', 'United Kingdom', 'United States',
  'Other Asia', 'Other Europe',
];

const FAQS = [
  {
    q: 'How quickly will I receive my custom itinerary?',
    a: 'Our team responds within 24 hours — usually faster. We review your group details and craft a personalised proposal with day-by-day activities, hotel options, and a transparent price breakdown.',
  },
  {
    q: 'Can we change the itinerary after receiving the proposal?',
    a: 'Absolutely. Every proposal is a starting point. We revise until it is exactly right for your group — there is no limit on revisions and no obligation to book.',
  },
  {
    q: 'Do you handle flights and visa requirements?',
    a: 'We focus on in-Thailand services: accommodation, private transport, guided tours, and activities. We can advise on visa requirements and connect you with trusted flight partners on request.',
  },
  {
    q: 'What is included in a typical group tour package?',
    a: 'All tours include: private air-conditioned transport throughout, English-speaking local guide, accommodation per selected star rating, daily breakfast, and all entrance fees for listed attractions. International flights and personal expenses are excluded.',
  },
  {
    q: 'Is there a minimum group size?',
    a: 'Our group tours are designed for 8–50 travellers. For smaller groups we offer private tours — just mention your size and we will tailor accordingly.',
  },
];

const REVIEWS = [
  {
    name: 'Sarah M.',
    country: 'Australia',
    rating: 5,
    text: 'Werest organised a 14-day tour for 22 colleagues. Every detail was perfect — the itinerary, hotels, and guides were outstanding. Will use again without hesitation.',
  },
  {
    name: 'Thomas K.',
    country: 'Germany',
    rating: 5,
    text: 'Professional, fast, and genuinely caring. They responded within 3 hours and the final proposal was better than anything we had imagined. Highly recommend.',
  },
  {
    name: 'Priya S.',
    country: 'Singapore',
    rating: 5,
    text: 'Booking a group tour of 35 people sounds stressful — Werest made it easy. Seamless from first inquiry to last day. Our team is already planning the next trip.',
  },
];

/* ─── Types ──────────────────────────────────────────────── */

interface FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
  travelDate: string;
  flexibleDate: boolean;
  adults: number;
  children: number;
  destination: string;
  multiDestination: boolean;
  multiDestinationNote: string;
  tourDuration: string;
  hotelCategory: string;
  budgetRange: string;
  transportType: string;
  activities: string[];
  tourPreferences: string;
  specialRequests: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  destination?: string;
}

const DEFAULT_FORM: FormData = {
  fullName: '',
  email: '',
  whatsapp: '',
  country: '',
  travelDate: '',
  flexibleDate: false,
  adults: 2,
  children: 0,
  destination: 'Bangkok',
  multiDestination: false,
  multiDestinationNote: '',
  tourDuration: '',
  hotelCategory: '',
  budgetRange: '',
  transportType: '',
  activities: [],
  tourPreferences: '',
  specialRequests: '',
};

/* ─── Small helpers ──────────────────────────────────────── */

function SectionHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="shrink-0 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {step}
      </span>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

function Counter({
  label, value, onChange, min = 0,
}: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 transition-all duration-200 bg-white';

const selectCls =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 transition-all duration-200 bg-white appearance-none';

/* ─── Main component ─────────────────────────────────────── */

export default function InquiryPageClient() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryRef, setInquiryRef] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function toggleActivity(label: string) {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.includes(label)
        ? prev.activities.filter(a => a !== label)
        : [...prev.activities, label],
    }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Please enter your full name.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address.';
    if (!form.whatsapp.trim()) e.whatsapp = 'Please enter your WhatsApp number.';
    if (!form.destination.trim()) e.destination = 'Please select a destination.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const ref = 'WR-' + Date.now().toString(36).toUpperCase().slice(-6);
      setInquiryRef(ref);
      if (data.success) setSubmitted(true);
    } catch {
      const ref = 'WR-' + Date.now().toString(36).toUpperCase().slice(-6);
      setInquiryRef(ref);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success / Confirmation state ── */
  if (submitted) {
    const paxLine =
      `${form.adults} adult${form.adults !== 1 ? 's' : ''}` +
      (form.children > 0 ? ` + ${form.children} child${form.children !== 1 ? 'ren' : ''}` : '');

    const summaryRows = [
      { label: 'Full Name',    value: form.fullName },
      { label: 'Email',        value: form.email },
      { label: 'WhatsApp',     value: form.whatsapp },
      { label: 'Country',      value: form.country || '—' },
      { label: 'Destination',  value: form.multiDestination && form.multiDestinationNote ? `${form.destination} + ${form.multiDestinationNote}` : form.destination },
      { label: 'Travel Date',  value: form.travelDate ? `${form.travelDate}${form.flexibleDate ? ' (flexible)' : ''}` : 'Not specified' },
      { label: 'Group Size',   value: paxLine },
      { label: 'Duration',     value: form.tourDuration || 'Not specified' },
      { label: 'Hotel',        value: form.hotelCategory ? HOTEL_OPTIONS.find(o => o.value === form.hotelCategory)?.label ?? form.hotelCategory : 'Not specified' },
      { label: 'Transport',    value: form.transportType ? TRANSPORT_OPTIONS.find(o => o.value === form.transportType)?.label ?? form.transportType : 'Not specified' },
      { label: 'Budget',       value: form.budgetRange || 'Not specified' },
    ].filter(r => r.value && r.value !== '—');

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pb-20">
          {/* Top confirmation banner */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white px-4 py-14 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Inquiry Confirmed!</h1>
            <p className="text-white/80 text-sm max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{form.fullName.split(' ')[0]}</strong>! We&apos;ve received your group tour request. Our local expert will reach out within <strong className="text-white">24 hours</strong>.
            </p>
            {inquiryRef && (
              <div className="inline-flex items-center gap-2 mt-5 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-sm font-mono font-bold tracking-wider">
                Ref: {inquiryRef}
              </div>
            )}
          </div>

          <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-5">

            {/* Next steps */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> What happens next
              </h2>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Our local expert reviews your trip requirements', sub: 'Usually within a few hours' },
                  { step: '2', text: 'We craft a personalised day-by-day itinerary + price', sub: 'Fully tailored to your group' },
                  { step: '3', text: 'You receive the proposal via email & WhatsApp', sub: `Sent to ${form.email}` },
                  { step: '4', text: 'Revise freely until it\'s perfect — no obligation to book', sub: 'Unlimited revisions, zero pressure' },
                ].map(({ step, text, sub }) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{step}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Inquiry summary */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" /> Your Submitted Inquiry
              </h2>
              <div className="divide-y divide-gray-100">
                {summaryRows.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between py-2.5 gap-4">
                    <span className="text-xs text-gray-500 shrink-0 w-28">{label}</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
                  </div>
                ))}
                {form.activities.length > 0 && (
                  <div className="flex items-start justify-between py-2.5 gap-4">
                    <span className="text-xs text-gray-500 shrink-0 w-28">Activities</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {form.activities.map(a => (
                        <span key={a} className="text-[10px] bg-brand-50 text-brand-700 rounded-full px-2 py-0.5 font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {form.tourPreferences && (
                  <div className="flex items-start justify-between py-2.5 gap-4">
                    <span className="text-xs text-gray-500 shrink-0 w-28">Tour Style</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{form.tourPreferences}</span>
                  </div>
                )}
                {form.specialRequests && (
                  <div className="flex items-start justify-between py-2.5 gap-4">
                    <span className="text-xs text-gray-500 shrink-0 w-28">Special Requests</span>
                    <span className="text-sm text-gray-700 text-right italic">{form.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact + CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={WA_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] text-white rounded-2xl px-5 py-4 hover:bg-[#20be5a] transition shadow-sm"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold leading-tight">Chat on WhatsApp</p>
                  <p className="text-xs text-white/80">Have a question right now?</p>
                </div>
              </a>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-semibold text-sm rounded-2xl px-5 py-4 hover:border-brand-300 hover:text-brand-600 transition shadow-sm"
              >
                Back to Home
              </Link>
            </div>

          </div>
        </main>
        <Footer />
      </>
    );
  }


  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-white px-4 text-center overflow-hidden"
        style={{ minHeight: '62vh' }}
      >
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512552288940-3a300922a275?auto=format&fit=crop&w=1920&q=85')" }}
        />
        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(13,28,110,0.93) 0%, rgba(20,53,184,0.88) 25%, rgba(37,52,255,0.82) 55%, rgba(70,110,255,0.72) 100%)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Custom Group Tour Planning
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
            Your Dream Group Tour<br className="hidden sm:block" />
            <span className="text-yellow-300"> Starts Here</span>
          </h1>
          <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed">
            Tell us your vision — our local Thailand experts craft a fully personalised itinerary within 24 hours. No templates. No surprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80 mb-10">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Free consultation</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Response within 24 h</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> No obligation to book</span>
          </div>
          <a
            href="#inquiry-form-section"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-bold text-base hover:bg-brand-50 shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            Start Your Inquiry
          </a>
        </div>
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { Icon: Star, label: '4.9 / 5 Rating', sub: '200+ groups' },
            { Icon: Shield, label: 'Secure Booking', sub: 'No obligation' },
            { Icon: Clock, label: '24 h Response', sub: 'Guaranteed' },
            { Icon: Headphones, label: 'Dedicated Expert', sub: 'End-to-end support' },
          ].map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + Sticky summary ── */}
      <section id="inquiry-form-section" className="max-w-3xl mx-auto px-4 py-14">
        <div>

          {/* ── Left: form ── */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Section 1 — Contact */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={1} title="Your Contact Details" subtitle="We will send your itinerary here." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => set('fullName', e.target.value)}
                      placeholder="John Smith"
                      className={`${inputCls} pl-10 ${errors.fullName ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.fullName} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="john@example.com"
                      className={`${inputCls} pl-10 ${errors.email ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={e => set('whatsapp', e.target.value)}
                      placeholder="+1 234 567 8901"
                      className={`${inputCls} pl-10 ${errors.whatsapp ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.whatsapp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country of Origin</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={form.country}
                      onChange={e => set('country', e.target.value)}
                      className={`${selectCls} pl-10`}
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Travel Dates & Group */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={2} title="Travel Dates & Group Size" />
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Travel Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={form.travelDate}
                        onChange={e => set('travelDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={form.flexibleDate}
                          onChange={e => set('flexibleDate', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 rounded-full bg-gray-200 peer-checked:bg-brand-600 transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[18px]" />
                      </div>
                      <span className="text-sm text-gray-700">My dates are flexible</span>
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <Counter label="Adults" value={form.adults} onChange={v => set('adults', v)} min={1} />
                  <div className="border-t border-gray-200" />
                  <Counter label="Children (under 12)" value={form.children} onChange={v => set('children', v)} />
                </div>
              </div>
            </div>

            {/* Section 3 — Destination */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={3} title="Destination & Duration" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Primary Destination <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={form.destination}
                      onChange={e => set('destination', e.target.value)}
                      className={`${selectCls} pl-10 ${errors.destination ? 'border-red-400' : ''}`}
                    >
                      {['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Krabi', 'Pattaya', 'Ayutthaya', 'Kanchanaburi', 'Hua Hin', 'Chiang Rai'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <FieldError msg={errors.destination} />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.multiDestination}
                    onChange={e => set('multiDestination', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">Add more destinations (multi-city tour)</span>
                </label>
                {form.multiDestination && (
                  <input
                    type="text"
                    value={form.multiDestinationNote}
                    onChange={e => set('multiDestinationNote', e.target.value)}
                    placeholder="e.g. Chiang Mai → Phuket → Krabi"
                    className={inputCls}
                  />
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Tour Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set('tourDuration', d)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          form.tourDuration === d
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 — Hotel & Transport */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={4} title="Accommodation & Transport" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Hotel Category</label>
                  <div className="space-y-2">
                    {HOTEL_OPTIONS.map(o => (
                      <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                          form.hotelCategory === o.value ? 'border-brand-600 bg-brand-600' : 'border-gray-300 group-hover:border-brand-300'
                        }`}>
                          {form.hotelCategory === o.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <input type="radio" className="sr-only" checked={form.hotelCategory === o.value} onChange={() => set('hotelCategory', o.value)} />
                        <span className="text-sm text-gray-700">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Transport Type</label>
                  <div className="space-y-2">
                    {TRANSPORT_OPTIONS.map(o => (
                      <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition shrink-0 ${
                          form.transportType === o.value ? 'border-brand-600 bg-brand-600' : 'border-gray-300 group-hover:border-brand-300'
                        }`}>
                          {form.transportType === o.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <input type="radio" className="sr-only" checked={form.transportType === o.value} onChange={() => set('transportType', o.value)} />
                        <span className="text-sm text-gray-700">{o.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Budget Range (per person)</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => set('budgetRange', b)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.budgetRange === b
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5 — Activities */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={5} title="Activities & Interests" subtitle="Select all that apply." />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {ACTIVITIES.map(({ emoji, label }) => {
                  const active = form.activities.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleActivity(label)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        active
                          ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-brand-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="truncate">{label}</span>
                      {active && <Check className="w-3 h-3 text-brand-600 shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tour Style / Preferences</label>
                <input
                  type="text"
                  value={form.tourPreferences}
                  onChange={e => set('tourPreferences', e.target.value)}
                  placeholder="e.g. Relaxed pace, photography-focused, family-friendly…"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Section 6 — Special Requests */}
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <SectionHeader step={6} title="Special Requests" subtitle="Dietary needs, accessibility, celebrations, anything else." />
              <textarea
                rows={4}
                value={form.specialRequests}
                onChange={e => set('specialRequests', e.target.value)}
                placeholder="Tell us anything that will help us create the perfect trip for your group…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold text-base hover:bg-brand-700 active:scale-[0.99] transition-all shadow-blue-glow flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending Inquiry…</>
              ) : (
                <><Send className="w-5 h-5" /> Send My Inquiry — Free & No Obligation</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              By submitting you agree to our{' '}
              <Link href="/privacy" className="underline hover:text-brand-600">Privacy Policy</Link>.
              We never share your data.
            </p>
          </form>

        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm">Everything you need to know before submitting your inquiry.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What Groups Say</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-sm font-semibold text-gray-700">4.9 / 5 from 200+ groups</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-6 relative">
                <Quote className="absolute top-4 right-5 w-6 h-6 text-brand-100" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, s) => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ── WhatsApp float ── */}
      <a
        href={WA_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20be5a] hover:scale-110 transition-transform lg:bottom-8 lg:right-8"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ── Mobile sticky CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={submitting}
          className="flex-1 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-700 transition disabled:opacity-70"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Inquiry
        </button>
        <a
          href={WA_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20be5a] transition shrink-0"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>
    </>
  );
}
