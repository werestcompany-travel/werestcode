'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ArrowRight, CheckCircle2, Globe2, Users, Zap, HeadphonesIcon,
  Star, TrendingUp, Shield, Building2, MapPin, Plane, Hotel,
  ChevronDown, ChevronUp, ArrowLeft, Check, X, Loader2,
} from 'lucide-react'

// ─── Typeform Data ────────────────────────────────────────────────────────────

type PartnerType = 'Tour Operator' | 'Hotel / Resort' | 'Travel Agent' | 'DMC' | 'Other'
type Volume      = 'Just starting' | 'Under 50' | '50 – 200' | '200 – 500' | '500+'

interface FormData {
  partnerType:   PartnerType | ''
  companyName:   string
  website:       string
  location:      string
  monthlyVolume: Volume | ''
  contactName:   string
  email:         string
  phone:         string
  message:       string
}

const PARTNER_TYPES: { value: PartnerType; icon: string; desc: string }[] = [
  { value: 'Tour Operator',  icon: '🗺️', desc: 'Day trips, excursions & guided experiences' },
  { value: 'Hotel / Resort', icon: '🏨', desc: 'Accommodations offering guest experiences' },
  { value: 'Travel Agent',   icon: '🧳', desc: 'OTAs, agencies & booking platforms' },
  { value: 'DMC',            icon: '✈️', desc: 'Destination management companies' },
  { value: 'Other',          icon: '🤝', desc: 'Something else — tell us!' },
]

const VOLUMES: { value: Volume; label: string }[] = [
  { value: 'Just starting', label: 'Just starting out' },
  { value: 'Under 50',      label: 'Under 50 / month' },
  { value: '50 – 200',      label: '50 – 200 / month' },
  { value: '200 – 500',     label: '200 – 500 / month' },
  { value: '500+',          label: '500+ / month' },
]

const STEPS = ['type','company','website','location','volume','name','email','phone','message','done'] as const
type Step = typeof STEPS[number]

const STEP_QUESTION: Record<Step, string> = {
  type:     'What best describes your business?',
  company:  'What\'s your company name?',
  website:  'Do you have a website?',
  location: 'Where do you primarily operate?',
  volume:   'How many bookings do you handle per month?',
  name:     'Your full name?',
  email:    'Your email address?',
  phone:    'Your phone number?',
  message:  'Anything else you\'d like us to know?',
  done:     '',
}

const STEP_HINT: Partial<Record<Step, string>> = {
  website: 'Optional — press Enter ↵ to skip',
  message: 'Optional — press Enter ↵ to skip',
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How long does the partnership review take?',
    a: 'Our team reviews all applications within 1–2 business days. Once approved, onboarding typically takes less than a week.' },
  { q: 'Is there a fee to join the partner network?',
    a: 'No upfront fee. We operate on a commission-based model — you only share revenue when we send you confirmed bookings.' },
  { q: 'What destinations does Werest Travel cover?',
    a: 'Currently Bangkok, Phuket, Chiang Mai, Pattaya, Krabi and Koh Samui — with more destinations being added regularly.' },
  { q: 'Do you offer API integration for large partners?',
    a: 'Yes — for high-volume partners we offer a full REST API for real-time availability and booking. Mention it in your application.' },
  { q: 'How are partner payouts handled?',
    a: 'Partners receive monthly payouts via bank transfer, with detailed booking reports. We handle all customer-facing payments.' },
  { q: 'Can I list my own tours on the Werest platform?',
    a: 'Absolutely. We curate partner experiences alongside our own inventory, with optional co-branding on confirmation vouchers.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartnerPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [faqOpen,  setFaqOpen]  = useState<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [formOpen])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#06071a]">
          {/* Ambient glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_55%_35%,rgba(37,52,255,0.32),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_40%_at_85%_65%,rgba(99,102,241,0.18),transparent)]" />
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

          {/* Floating image stack — right side */}
          <div className="absolute right-0 inset-y-0 w-[55%] hidden lg:block pointer-events-none select-none">
            <div className="relative h-full">
              <div className="absolute top-16 right-24 w-[280px] h-[190px] rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] rotate-[2deg] border border-white/8">
                <Image src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80" alt="Floating market tour" fill className="object-cover" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[11px] font-bold text-white bg-brand-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">Floating Market Tour</span>
                </div>
              </div>
              <div className="absolute top-60 right-8 w-[210px] h-[155px] rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)] -rotate-[1.5deg] border border-white/8">
                <Image src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80" alt="Chiang Mai" fill className="object-cover" sizes="220px" />
              </div>
              <div className="absolute bottom-20 right-28 w-[310px] h-[200px] rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] rotate-[1deg] border border-white/8">
                <Image src="https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80" alt="Phuket island" fill className="object-cover" sizes="320px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">Phuket Island Tour</span>
                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-white">4.9</span>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute top-40 right-60 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                New booking received
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:py-0 w-full">
            <div className="max-w-[540px]">
              <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white/85 tracking-wide">Now accepting partners across Thailand</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.04] tracking-tight mb-5">
                Grow your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300">
                  travel business
                </span><br />
                with Werest.
              </h1>

              <p className="text-[1.1rem] text-white/65 mb-10 leading-relaxed">
                Join our curated network of tour operators, hotels and travel agents across Thailand. We drive the bookings — you deliver unforgettable experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setFormOpen(true)}
                  className="group inline-flex items-center justify-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[0.95rem] px-8 py-4 rounded-2xl transition-all shadow-[0_8px_32px_rgba(37,52,255,0.5)] hover:shadow-[0_12px_48px_rgba(37,52,255,0.65)] hover:-translate-y-0.5"
                >
                  Become a Partner
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <a href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 text-white/70 hover:text-white font-semibold text-[0.95rem] px-6 py-4 rounded-2xl border border-white/15 hover:border-white/35 transition-all hover:bg-white/5">
                  See how it works
                </a>
              </div>

              {/* Micro-stats */}
              <div className="mt-14 pt-8 border-t border-white/8 flex flex-wrap gap-8">
                {[
                  { n: '10+',  l: 'Curated tours' },
                  { n: '6',    l: 'Destinations' },
                  { n: '4.9★', l: 'Avg. rating' },
                  { n: '24/7', l: 'Partner support' },
                ].map(s => (
                  <div key={s.l}>
                    <p className="text-2xl font-black text-white">{s.n}</p>
                    <p className="text-xs text-white/40 font-medium mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-35">
            <span className="text-white text-[9px] font-bold tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4 text-white animate-bounce" />
          </div>
        </section>

        {/* ══ TRUST BAR ═══════════════════════════════════════════════════════ */}
        <div className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Operating in</p>
              {['Bangkok','Phuket','Chiang Mai','Pattaya','Krabi','Koh Samui'].map(c => (
                <div key={c} className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-500" />
                  <span className="text-sm font-semibold text-gray-600">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ PARTNER MODELS ══════════════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.25em] mb-3">Partnership Models</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
                Built for every<br />travel business
              </h2>
              <p className="text-[1.05rem] text-gray-500 max-w-lg mx-auto">
                Whether you run day trips or manage luxury resorts — there's a model tailored for you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Globe2 className="w-6 h-6" />,
                  grad: 'from-brand-600 to-indigo-600',
                  glow: 'shadow-brand-500/25',
                  ring: 'hover:ring-brand-200',
                  title: 'Tour Operators',
                  sub:   'List your experiences on the Werest platform',
                  perks: [
                    'Featured to thousands of international visitors',
                    'Zero upfront cost — commission on confirmed bookings',
                    'Real-time availability & instant confirmation',
                    'Co-branded vouchers with your logo',
                  ],
                },
                {
                  icon: <Hotel className="w-6 h-6" />,
                  grad: 'from-violet-600 to-purple-700',
                  glow: 'shadow-violet-500/25',
                  ring: 'hover:ring-violet-200',
                  title: 'Hotels & Resorts',
                  sub:   'Offer curated day trips to your guests',
                  perks: [
                    'White-label tour catalogue for concierge desks',
                    'Earn commission on every guest booking',
                    'Branded booking flow matching your identity',
                    'Dedicated account manager',
                  ],
                },
                {
                  icon: <Plane className="w-6 h-6" />,
                  grad: 'from-emerald-500 to-teal-600',
                  glow: 'shadow-emerald-500/25',
                  ring: 'hover:ring-emerald-200',
                  title: 'Travel Agents & OTAs',
                  sub:   'Resell our tours to your client base',
                  perks: [
                    'Agent portal with instant booking access',
                    'Competitive net rates, transparent margins',
                    'Full API integration for volume partners',
                    'Priority support & dedicated manager',
                  ],
                },
              ].map(card => (
                <div key={card.title}
                  className={`relative group bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl ${card.glow} ring-1 ring-transparent ${card.ring} transition-all duration-300 overflow-hidden`}>
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gray-50/80 to-transparent" />
                  <div className="relative">
                    <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${card.grad} text-white items-center justify-center mb-6 shadow-lg`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-400 mb-6">{card.sub}</p>
                    <ul className="space-y-3">
                      {card.perks.map(p => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => setFormOpen(true)}
                      className="mt-8 w-full py-3 rounded-xl font-bold text-sm text-brand-600 border border-brand-200 hover:bg-brand-600 hover:text-white hover:border-transparent transition-all duration-200">
                      Apply Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHY WEREST — dark ════════════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 bg-[#06071a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_100%,rgba(37,52,255,0.22),transparent)]" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-3">Why partner with Werest</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Everything you need<br />to scale your bookings
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: <Zap className="w-5 h-5" />,            col: 'text-yellow-400', t: 'Instant Booking',       b: 'Live availability with real-time confirmation. Customers book and you\'re notified immediately — no manual back-and-forth.' },
                { icon: <HeadphonesIcon className="w-5 h-5" />, col: 'text-blue-400',   t: '24/7 Partner Support',  b: 'Our operations team handles customer queries around the clock so you can focus on delivering great experiences.' },
                { icon: <TrendingUp className="w-5 h-5" />,     col: 'text-emerald-400',t: 'Revenue Growth',        b: 'Partners report an average 40% increase in bookings within the first 3 months of joining the platform.' },
                { icon: <Shield className="w-5 h-5" />,         col: 'text-indigo-400', t: 'Verified & Trusted',    b: 'Werest carries a 4.9★ rating. Listing with us instantly transfers credibility to your experience.' },
                { icon: <Users className="w-5 h-5" />,          col: 'text-pink-400',   t: 'Built-in Audience',     b: 'Access a growing pool of international travellers actively searching for tours and experiences in Thailand.' },
                { icon: <Building2 className="w-5 h-5" />,      col: 'text-amber-400',  t: 'Flexible Integration',  b: 'From a simple listing to a full API integration — choose what fits your business and tech stack.' },
              ].map(f => (
                <div key={f.t} className="group bg-white/4 hover:bg-white/8 border border-white/8 hover:border-white/16 rounded-2xl p-6 transition-all">
                  <span className={`${f.col} block mb-3`}>{f.icon}</span>
                  <h3 className="text-[0.95rem] font-bold text-white mb-2">{f.t}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.25em] mb-3">Process</p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                Up and running<br />in days, not months
              </h2>
            </div>

            <div className="relative pl-8 space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-brand-600 via-brand-300 to-transparent" />

              {[
                { e: '📝', n: '01', t: 'Apply in 3 minutes',       b: 'Complete our quick application. No lengthy paperwork — just tell us about your business and what you\'re looking for.' },
                { e: '✅', n: '02', t: 'Review & approval',         b: 'Our partnerships team reviews your application within 1–2 business days and schedules a brief intro call if needed.' },
                { e: '⚙️', n: '03', t: 'Onboarding & setup',       b: 'We list your tours, configure your commission structure, and connect you to the dashboard. Takes under a week.' },
                { e: '🚀', n: '04', t: 'Start receiving bookings',  b: 'Go live. Bookings flow in, you get instant notifications, and we handle all customer support end-to-end.' },
              ].map((s, i) => (
                <div key={s.n} className="relative flex gap-8 pb-12 last:pb-0">
                  {/* Node */}
                  <div className="absolute -left-8 top-0">
                    <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-lg shadow-[0_0_20px_rgba(37,52,255,0.45)] z-10 relative">
                      {s.e}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-1.5 pb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-brand-400 tracking-[0.2em]">{s.n}</span>
                      <h3 className="text-lg font-extrabold text-gray-900">{s.t}</h3>
                    </div>
                    <p className="text-[0.9rem] text-gray-500 leading-relaxed">{s.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SOCIAL PROOF ════════════════════════════════════════════════════ */}
        <section className="py-16 px-4 sm:px-6 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6 text-center">
            {[
              { n: '4.9', u: '/ 5',    l: 'Average customer rating',    e: '⭐' },
              { n: '100%',u: '',        l: 'Free cancellation policy',   e: '🛡️' },
              { n: '24h', u: 'review',  l: 'Partner application response',e: '⚡' },
            ].map(s => (
              <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <p className="text-4xl mb-2">{s.e}</p>
                <p className="text-4xl font-black text-gray-900">{s.n}
                  {s.u && <span className="text-xl font-semibold text-gray-400 ml-1">{s.u}</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1.5">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FAQ ═════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.25em] mb-3">FAQ</p>
              <h2 className="text-4xl font-black text-gray-900">Common questions</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-sm leading-snug">{faq.q}</span>
                    {faqOpen === i
                      ? <ChevronUp   className="w-4 h-4 text-brand-600 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {faqOpen === i && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-8">
              More questions?{' '}
              <a href="mailto:werestcompany@gmail.com" className="text-brand-600 font-semibold hover:underline">
                Email our partner team →
              </a>
            </p>
          </div>
        </section>

        {/* ══ BOTTOM CTA ══════════════════════════════════════════════════════ */}
        <section className="py-24 px-4 sm:px-6 bg-brand-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_110%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to reach more<br />travellers in Thailand?
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Join our partner network today. It takes 3 minutes to apply.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="group inline-flex items-center gap-3 bg-white text-brand-600 font-black text-base px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              Apply to Become a Partner
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="mt-5 text-white/45 text-sm">No upfront fee · Response within 24 hours · Free to join</p>
          </div>
        </section>

      </main>
      <Footer />

      {/* Typeform overlay */}
      {formOpen && <PartnerTypeform onClose={() => setFormOpen(false)} />}
    </>
  )
}

// ─── Typeform ─────────────────────────────────────────────────────────────────

function PartnerTypeform({ onClose }: { onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<FormData>({
    partnerType: '', companyName: '', website: '', location: '',
    monthlyVolume: '', contactName: '', email: '', phone: '', message: '',
  })
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [animOut,  setAnimOut]  = useState(false)
  const [dir,      setDir]      = useState<'fwd'|'back'>('fwd')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const step     = STEPS[stepIndex]
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 280)
    return () => clearTimeout(t)
  }, [stepIndex])

  const goto = useCallback((idx: number, direction: 'fwd'|'back') => {
    setAnimOut(true); setDir(direction)
    setTimeout(() => { setStepIndex(idx); setAnimOut(false); setError('') }, 180)
  }, [])

  const validate = useCallback((): boolean => {
    const e = (msg: string) => { setError(msg); return false }
    if (step === 'type'    && !form.partnerType)                              return e('Please choose one to continue.')
    if (step === 'company' && !form.companyName.trim())                       return e('Please enter your company name.')
    if (step === 'location'&& !form.location.trim())                          return e('Please enter your location.')
    if (step === 'volume'  && !form.monthlyVolume)                            return e('Please choose one to continue.')
    if (step === 'name'    && !form.contactName.trim())                       return e('Please enter your name.')
    if (step === 'email'   && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))return e('Please enter a valid email address.')
    if (step === 'phone'   && form.phone.replace(/\D/g,'').length < 8)       return e('Please enter a valid phone number.')
    setError(''); return true
  }, [step, form])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && step !== 'message' && !loading) { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const advance = useCallback(async () => {
    if (!validate()) return
    if (step === 'message' || step === 'phone') { submit(); return }
    goto(stepIndex + 1, 'fwd')
  }, [validate, step, stepIndex, goto])

  const back = () => stepIndex > 0 && goto(stepIndex - 1, 'back')

  const submit = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/partner', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed')
      goto(STEPS.indexOf('done'), 'fwd')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Animation classes
  const base = 'transition-all duration-[180ms] ease-in-out'
  const anim = animOut
    ? dir === 'fwd' ? `${base} opacity-0 -translate-y-5` : `${base} opacity-0 translate-y-5`
    : `${base} opacity-100 translate-y-0`

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#06071a]/96 backdrop-blur-xl" />

      {/* Progress bar */}
      {step !== 'done' && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-white/8 z-10">
          <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/8 hover:bg-white/16 flex items-center justify-center text-white/60 hover:text-white transition-all">
        <X className="w-4 h-4" />
      </button>

      {/* Step counter */}
      {step !== 'done' && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
          <span className="text-[11px] font-semibold text-white/30 tracking-widest">{stepIndex + 1} / {STEPS.length - 1}</span>
        </div>
      )}

      {/* Center stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className={`w-full max-w-[560px] ${anim}`}>

          {/* ── Done screen ── */}
          {step === 'done' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-7 shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">Application sent! 🎉</h2>
              <p className="text-white/55 text-lg mb-1.5">
                Thanks, <strong className="text-white">{form.contactName.split(' ')[0]}</strong>. We've received your application for{' '}
                <strong className="text-white">{form.companyName}</strong>.
              </p>
              <p className="text-white/40 text-base mb-10">
                Our team will be in touch within <strong className="text-white/60">1–2 business days</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors">
                  Back to site
                </button>
                <Link href="/tours" onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl bg-white/8 hover:bg-white/14 text-white font-bold text-sm transition-colors border border-white/12">
                  Browse our tours →
                </Link>
              </div>
            </div>
          )}

          {/* ── Active step ── */}
          {step !== 'done' && (
            <>
              {/* Hint */}
              <p className="text-[11px] font-semibold text-brand-400/80 uppercase tracking-[0.2em] mb-3 h-4">
                {STEP_HINT[step] ?? ''}
              </p>

              {/* Question */}
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 leading-tight">
                {STEP_QUESTION[step]}
              </h2>

              {/* ── Partner type cards ── */}
              {step === 'type' && (
                <div className="grid gap-2.5">
                  {PARTNER_TYPES.map(pt => (
                    <button key={pt.value}
                      onClick={() => { setForm(f => ({ ...f, partnerType: pt.value })); setError(''); goto(stepIndex + 1, 'fwd') }}
                      className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all
                        ${form.partnerType === pt.value
                          ? 'border-brand-500 bg-brand-600/90 shadow-[0_0_30px_rgba(37,52,255,0.4)]'
                          : 'border-white/12 bg-white/4 hover:border-white/25 hover:bg-white/8'
                        }`}
                    >
                      <span className="text-2xl shrink-0 leading-none">{pt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">{pt.value}</p>
                        <p className="text-xs text-white/45 mt-0.5">{pt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${form.partnerType === pt.value ? 'border-white bg-white' : 'border-white/25 group-hover:border-white/50'}`}>
                        {form.partnerType === pt.value && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Volume cards ── */}
              {step === 'volume' && (
                <div className="grid gap-2.5">
                  {VOLUMES.map(v => (
                    <button key={v.value}
                      onClick={() => { setForm(f => ({ ...f, monthlyVolume: v.value })); setError(''); goto(stepIndex + 1, 'fwd') }}
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all
                        ${form.monthlyVolume === v.value
                          ? 'border-brand-500 bg-brand-600/90 shadow-[0_0_30px_rgba(37,52,255,0.4)]'
                          : 'border-white/12 bg-white/4 hover:border-white/25 hover:bg-white/8'
                        }`}
                    >
                      <span className="font-bold text-white text-sm">{v.label}</span>
                      {form.monthlyVolume === v.value && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Text inputs ── */}
              {['company','website','location','name','email','phone'].includes(step) && (
                <div>
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type={step === 'email' ? 'email' : step === 'phone' ? 'tel' : 'text'}
                    value={
                      step === 'company'  ? form.companyName  :
                      step === 'website'  ? form.website      :
                      step === 'location' ? form.location     :
                      step === 'name'     ? form.contactName  :
                      step === 'email'    ? form.email        : form.phone
                    }
                    onChange={e => {
                      const v = e.target.value; setError('')
                      setForm(f => ({
                        ...f,
                        ...(step==='company'  ? { companyName: v } :
                            step==='website'  ? { website:     v } :
                            step==='location' ? { location:    v } :
                            step==='name'     ? { contactName: v } :
                            step==='email'    ? { email:       v } : { phone: v }),
                      }))
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); advance() } }}
                    placeholder={
                      step==='company'  ? 'e.g. Amazing Thailand Tours'   :
                      step==='website'  ? 'https://yourwebsite.com'        :
                      step==='location' ? 'e.g. Bangkok, Thailand'         :
                      step==='name'     ? 'e.g. Somchai Jaidee'            :
                      step==='email'    ? 'your@company.com'               :
                      '+66 8X XXX XXXX'
                    }
                    className="w-full bg-transparent border-b-2 border-white/20 focus:border-brand-400 text-white text-2xl sm:text-3xl font-bold placeholder-white/18 outline-none py-3 transition-colors caret-brand-400"
                  />
                </div>
              )}

              {/* ── Textarea ── */}
              {step === 'message' && (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  rows={4}
                  value={form.message}
                  onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setError('') }}
                  placeholder="Tell us about your business, your goals, or any questions you have…"
                  className="w-full bg-transparent border-b-2 border-white/20 focus:border-brand-400 text-white text-lg font-medium placeholder-white/18 outline-none py-3 transition-colors resize-none leading-relaxed caret-brand-400"
                />
              )}

              {/* Error */}
              {error && (
                <p className="mt-4 text-red-400 text-sm font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{error}
                </p>
              )}

              {/* Action row — hidden for choice steps (auto-advance on click) */}
              {!['type','volume'].includes(step) && (
                <div className="mt-10 flex items-center gap-5 flex-wrap">
                  <button onClick={advance} disabled={loading}
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-[0.95rem] px-8 py-3.5 rounded-2xl transition-all shadow-[0_8px_32px_rgba(37,52,255,0.45)]">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                      : step === 'message' || step === 'phone'
                        ? <><Check className="w-4 h-4" /> Submit Application</>
                        : <>OK <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  {(step === 'website' || step === 'message') && (
                    <button onClick={advance} className="text-sm text-white/35 hover:text-white/65 transition-colors font-medium">
                      Skip →
                    </button>
                  )}

                  {!['message'].includes(step) && (
                    <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/25 ml-1">
                      press <kbd className="px-1.5 py-0.5 bg-white/8 border border-white/15 rounded text-[10px] font-mono">Enter ↵</kbd>
                    </span>
                  )}
                </div>
              )}

              {/* Back */}
              {stepIndex > 0 && (
                <button onClick={back} className="mt-7 flex items-center gap-1.5 text-xs text-white/28 hover:text-white/55 transition-colors font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
