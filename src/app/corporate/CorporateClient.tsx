'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, ChevronRight, Building2, Users, Clock, Star, TrendingUp, Phone } from 'lucide-react';

const BENEFITS = [
  {
    icon: '👤',
    title: 'Dedicated Account Manager',
    desc: 'A single point of contact who knows your company\'s travel preferences and handles everything for you.',
  },
  {
    icon: '🧾',
    title: 'Monthly Invoicing',
    desc: 'No upfront payments per booking. Receive a consolidated invoice at month-end for easy accounting.',
  },
  {
    icon: '⚡',
    title: 'Priority Booking',
    desc: 'Skip the queue. Your bookings are handled first — even during peak season and holidays.',
  },
  {
    icon: '💰',
    title: 'Volume Discounts',
    desc: 'The more you book, the more you save. Negotiated rates across all transfers, tours and tickets.',
  },
  {
    icon: '🗺️',
    title: 'Custom Routes',
    desc: 'We design bespoke itineraries and transfer routes tailored to your team\'s specific needs.',
  },
  {
    icon: '📊',
    title: 'Reporting Dashboard',
    desc: 'Monthly spend reports, booking history and cost-centre breakdowns — all in one place.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Apply Online',
    desc: 'Fill in the short form below. Our corporate team reviews your application within 24 hours.',
    icon: '📝',
  },
  {
    step: '02',
    title: 'Get Onboarded',
    desc: 'Your account manager contacts you, sets up your corporate account and aligns on preferences.',
    icon: '🤝',
  },
  {
    step: '03',
    title: 'Book Anytime',
    desc: 'Book via WhatsApp, email or our platform — anytime. We\'ll handle the rest.',
    icon: '✅',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    spend: '฿50,000+/mo',
    desc: 'Perfect for small teams with regular travel needs',
    color: 'border-gray-200',
    headerBg: 'bg-gray-50',
    features: [
      'Dedicated account manager',
      'Monthly invoicing',
      'Up to 5% volume discount',
      'Priority email support',
      'Monthly spend report',
    ],
    cta: 'Apply for Starter',
    highlight: false,
  },
  {
    name: 'Business',
    spend: '฿150,000+/mo',
    desc: 'For growing companies with high-frequency bookings',
    color: 'border-brand-500',
    headerBg: 'bg-brand-600',
    features: [
      'Everything in Starter',
      'Up to 12% volume discount',
      'Dedicated WhatsApp line',
      'Custom route planning',
      'Weekly spend report',
      'Priority booking guarantee',
    ],
    cta: 'Apply for Business',
    highlight: true,
  },
  {
    name: 'Enterprise',
    spend: 'Custom pricing',
    desc: 'Bespoke solutions for large organisations',
    color: 'border-gray-200',
    headerBg: 'bg-gray-900',
    features: [
      'Everything in Business',
      'Negotiated enterprise rates',
      'Dedicated operations team',
      'API / system integration',
      'Real-time dashboard access',
      'SLA-backed response times',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const SPEND_RANGES = [
  'Under ฿50,000/month',
  '฿50,000–150,000/month',
  '฿150,000–500,000/month',
  'Over ฿500,000/month',
];

export default function CorporatePage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    monthlySpend: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/corporate/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-brand-900 to-brand-800 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5" /> Werest for Business
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Corporate Travel<br className="hidden sm:block" />
            <span className="text-brand-300">Made Simple</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            One account. One invoice. One team that handles everything — transfers, tours, attraction tickets — across all of Thailand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#apply"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg">
              Apply now <ChevronRight className="w-4 h-4" />
            </a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66819519191'}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
              <Phone className="w-4 h-4" /> Talk to sales
            </a>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything your business needs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From airport runs to company retreats — we handle the logistics so your team can focus on work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl mb-4 shadow-sm">
                  {b.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Get your company account up and running in under 48 hours.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-brand-100" style={{ left: '20%', right: '20%' }} />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(37,52,255,0.3)]">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 sm:relative sm:top-auto sm:right-auto w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pricing tiers</h2>
            <p className="text-gray-500">The more you book, the better the deal. All tiers include dedicated support.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {PRICING_TIERS.map(tier => (
              <div key={tier.name}
                className={`rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${tier.color} ${tier.highlight ? 'shadow-[0_8px_40px_rgba(37,52,255,0.2)] scale-105' : ''}`}>
                <div className={`${tier.headerBg} p-6 ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {tier.highlight && (
                    <div className="text-[10px] font-bold bg-white/20 text-white/90 px-2.5 py-0.5 rounded-full inline-flex mb-2">Most Popular</div>
                  )}
                  <p className="text-2xl font-extrabold">{tier.name}</p>
                  <p className={`text-lg font-bold mt-1 ${tier.highlight ? 'text-brand-200' : 'text-brand-600'}`}>{tier.spend}</p>
                  <p className={`text-sm mt-2 ${tier.highlight ? 'text-white/70' : 'text-gray-500'}`}>{tier.desc}</p>
                </div>
                <div className="p-6 space-y-3 bg-white">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                  <a href="#apply"
                    className={`block w-full text-center mt-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                      tier.highlight
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-[0_4px_16px_rgba(37,52,255,0.3)]'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                    {tier.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST LOGOS ── */}
      <section className="bg-gray-50 py-14 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by companies across Thailand</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['🏨 Hotel Groups', '✈️ Airlines & OTAs', '🏢 MNCs', '🎓 Universities', '🏥 Medical Centres', '🛢️ Energy Companies'].map(logo => (
              <div key={logo} className="text-sm font-semibold text-gray-400 bg-white rounded-xl px-4 py-2.5 border border-gray-200 shadow-sm">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLY FORM ── */}
      <section id="apply" className="bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Apply for a Corporate Account</h2>
            <p className="text-gray-500">Our corporate team will contact you within 24 hours of receiving your application.</p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-xl font-extrabold text-green-800 mb-2">Application received!</p>
              <p className="text-green-700 text-sm">Our corporate team will be in touch within 24 hours. Check your email and WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
              {[
                { name: 'companyName', label: 'Company name', type: 'text',  placeholder: 'Acme Co., Ltd.' },
                { name: 'contactName', label: 'Your name',    type: 'text',  placeholder: 'John Smith'     },
                { name: 'email',       label: 'Work email',   type: 'email', placeholder: 'john@acme.com'  },
                { name: 'phone',       label: 'Phone number', type: 'tel',   placeholder: '+66 81 234 5678'},
                { name: 'whatsapp',    label: 'WhatsApp',     type: 'tel',   placeholder: '+66 81 234 5678'},
              ].map(field => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {field.label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none text-sm bg-white transition-colors"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="monthlySpend" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Estimated monthly travel spend <span className="text-red-400">*</span>
                </label>
                <select
                  id="monthlySpend"
                  name="monthlySpend"
                  required
                  value={form.monthlySpend}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none text-sm bg-white transition-colors"
                >
                  <option value="">Select a range</option>
                  {SPEND_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  Something went wrong. Please try again or contact us on WhatsApp.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[0_4px_16px_rgba(37,52,255,0.3)]"
              >
                {status === 'sending' ? 'Sending…' : 'Submit Application'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
