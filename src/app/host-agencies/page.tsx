import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Car, Eye, Users, CheckCircle2, ArrowRight,
  DollarSign, LayoutDashboard, HeartHandshake,
  Megaphone, Wrench, BarChart3, Star,
  UserCheck, MonitorSmartphone, Rocket,
} from 'lucide-react'

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Host Agencies | Werest Travel Partner Program',
  description:
    'The #1 preferred partner for host agencies in Thailand. Offer your clients private car transfers with sightseeing stops. Competitive commissions, dedicated support, and easy onboarding.',
  alternates: { canonical: 'https://www.werest.com/host-agencies' },
}

/* ── Data ─────────────────────────────────────────────────────────────────── */

const WHY_FEATURES = [
  {
    icon: Car,
    title: 'Private transfers',
    desc: 'Comfort and privacy for your clients in our top-of-the-line vehicles across Thailand',
  },
  {
    icon: Eye,
    title: 'Sightseeing stops',
    desc: 'Explore hidden gems and local attractions en route. We offer curated stops across Bangkok, Phuket, Krabi & more',
  },
  {
    icon: UserCheck,
    title: 'Professional drivers',
    desc: 'Fully vetted, English-speaking drivers ensure a smooth and safe journey for every client',
  },
]

const ELEVATE_BENEFITS = [
  {
    heading: 'Increased revenue',
    body: 'Benefit from our competitive commission structure and attractive rates on every confirmed booking',
  },
  {
    heading: 'Enhanced client satisfaction',
    body: 'Offer more than just a transfer — provide a memorable Thailand journey your clients will talk about',
  },
  {
    heading: 'Dedicated support',
    body: 'Our team is here to assist you with everything from booking to client queries, 24/7',
  },
]

const COMMITMENT_ITEMS = [
  {
    heading: 'Reliable Service',
    body: 'Punctual, professional, and always dependable — we protect your agency\'s reputation',
  },
  {
    heading: 'Flexible Options',
    body: 'Choose from Sedan, SUV, Minivan, and Luxury MPV — customisable routes across all major Thai destinations',
  },
  {
    heading: 'Advanced Technology',
    body: 'Easy online booking and management through our user-friendly partner platform with real-time tracking',
  },
]

const RESOURCES = [
  {
    icon: Megaphone,
    title: 'Training & Support',
    desc: 'Comprehensive onboarding workshops, training materials, and a dedicated key account manager for your agency',
  },
  {
    icon: Wrench,
    title: 'Marketing Tools',
    desc: 'Access co-branded marketing materials, banners, and digital assets to promote Werest services to your agents',
  },
  {
    icon: BarChart3,
    title: 'Insights & Analytics',
    desc: 'Track bookings, revenue, and commissions in real time through your agency partner dashboard',
  },
]

const STEPS = [
  {
    n: '01',
    icon: UserCheck,
    title: 'Sign up your Host Agency',
    desc: 'Register your agency in minutes and submit your application to become an official Werest partner',
  },
  {
    n: '02',
    icon: MonitorSmartphone,
    title: 'Access our platform',
    desc: 'Get a custom-made portal for all your host agency members — sub-agents can book independently under your account',
  },
  {
    n: '03',
    icon: Rocket,
    title: 'Start booking',
    desc: 'Begin offering your clients unique, private transfer experiences across Thailand with instant confirmation',
  },
]

const PARTNER_LOGOS = [
  { name: 'Expedia', abbr: 'EX' },
  { name: 'Booking.com', abbr: 'BK' },
  { name: 'TripAdvisor', abbr: 'TA' },
  { name: 'Viator', abbr: 'VI' },
  { name: 'GetYourGuide', abbr: 'GY' },
  { name: 'Klook', abbr: 'KL' },
  { name: 'Traveloka', abbr: 'TV' },
  { name: 'Agoda', abbr: 'AG' },
  { name: 'Airbnb', abbr: 'AB' },
  { name: 'Trip.com', abbr: 'TC' },
  { name: 'Tours4Fun', abbr: 'TF' },
  { name: 'Tourradar', abbr: 'TR' },
]

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HostAgenciesPage() {
  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-white">

        {/* ══════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-24 pb-20 bg-white">
          {/* Subtle blue top bar accent */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #2534ff, #6366f1)' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">

              {/* TripAdvisor-style badge */}
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-7">
                <span className="text-amber-500 text-sm">★</span>
                <span className="text-amber-700 text-[11px] font-extrabold uppercase tracking-widest">
                  TRIPADVISOR TRAVELERS' CHOICE — THAILAND'S TOP TRANSFER SERVICE
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-tight mb-4">
                #1 preferred partner<br />for host agencies
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-xl">
                Door-to-door transfers with sightseeing stops across Thailand — the perfect product to add to your host agency portfolio.
              </p>

              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm shadow-lg transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}
              >
                Sign up your Host Agency
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            PARTNER LOGOS
        ══════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-b border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
              Partners supplied by Werest
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {PARTNER_LOGOS.map(p => (
                <div
                  key={p.name}
                  className="flex items-center justify-center w-[90px] h-10 rounded-lg bg-white border border-gray-200 shadow-sm"
                >
                  <span className="text-[10px] font-extrabold text-gray-400 tracking-wider">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            WHY CHOOSE WEREST
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Why choose Werest?
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                At Werest, we understand that the journey is as important as the destination. That&apos;s why we offer private car transfers with sightseeing stops along the way, transforming travel into an unforgettable Thailand experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WHY_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 p-8 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            ELEVATE YOUR SERVICE OFFERINGS
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Text */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                  Elevate your service offerings
                </h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                  By partnering with Werest, you can provide your clients with exceptional Thailand travel experiences that set you apart from the competition. The perfect solution for FIT travellers — Werest connects travel with experience.
                </p>

                <ul className="space-y-5">
                  {ELEVATE_BENEFITS.map(item => (
                    <li key={item.heading} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-[15px] text-gray-700">
                        <strong className="text-gray-900">{item.heading}:</strong>{' '}
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/inquiry"
                  className="mt-8 inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-md transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}
                >
                  Let&apos;s talk <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Visual card */}
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center p-10 text-center">
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
                  <div className="relative z-10">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Average partner earnings</p>
                    <p className="text-white text-5xl font-extrabold mb-1">฿18,500</p>
                    <p className="text-white/60 text-sm">per month</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                      <div className="bg-white/10 rounded-xl px-4 py-3">
                        <p className="text-white text-xl font-extrabold">Up to 8%</p>
                        <p className="text-white/60 text-[11px]">Commission rate</p>
                      </div>
                      <div className="bg-white/10 rounded-xl px-4 py-3">
                        <p className="text-white text-xl font-extrabold">30-day</p>
                        <p className="text-white/60 text-[11px]">Cookie window</p>
                      </div>
                      <div className="bg-white/10 rounded-xl px-4 py-3">
                        <p className="text-white text-xl font-extrabold">1,200+</p>
                        <p className="text-white/60 text-[11px]">Active partners</p>
                      </div>
                      <div className="bg-white/10 rounded-xl px-4 py-3">
                        <p className="text-white text-xl font-extrabold">24/7</p>
                        <p className="text-white/60 text-[11px]">Partner support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            OUR COMMITMENT TO YOU
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Visual */}
              <div className="order-2 lg:order-1">
                <div className="space-y-4">
                  {COMMITMENT_ITEMS.map((item, i) => (
                    <div
                      key={item.heading}
                      className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-[15px] mb-1">{item.heading}</h4>
                        <p className="text-gray-500 text-[13px] leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                  Our commitment to you
                </h2>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
                  At Werest, we value our partnerships with travel agents and host agencies across the globe. We are committed to providing an experience that protects your reputation and grows your revenue.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 font-bold px-7 py-3.5 rounded-xl text-sm transition-all hover:bg-blue-600 hover:text-white"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            RESOURCES AVAILABLE TO PARTNERS
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Resources available to partners
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                After we review your application, you will be assigned a key account manager who will work with you and help onboard your travel agents with Werest. Some of the activities include:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {RESOURCES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white border border-gray-100 p-8 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-[16px] mb-2">{title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HOW TO GET STARTED
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-14 text-center">
              How to get started?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
              {/* Connector lines */}
              <div className="hidden sm:block absolute top-8 h-0.5 bg-blue-100" style={{ left: 'calc(16.66% + 28px)', width: 'calc(33.33% - 56px)' }} />
              <div className="hidden sm:block absolute top-8 h-0.5 bg-blue-100" style={{ left: 'calc(50% + 28px)', width: 'calc(33.33% - 56px)' }} />

              {STEPS.map(step => {
                const Icon = step.icon
                return (
                  <div key={step.n} className="flex flex-col items-center text-center gap-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg relative z-10"
                        style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 text-blue-700 text-[10px] font-black flex items-center justify-center z-20">
                        {step.n}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            PARTNER UP — CTA BANNER
        ══════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 55%, #0d1266 100%)' }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Partner up with Werest
            </h2>
            <p className="text-white/65 text-[15px] leading-relaxed mb-8 max-w-xl mx-auto">
              Ready to take a step forward and bring travel convenience and experience to your travel agents&apos; portfolio? Join 1,200+ partners already earning with Werest.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/inquiry"
                className="inline-flex items-center justify-center gap-2 bg-white font-bold px-8 py-4 rounded-xl text-sm shadow-lg transition-all hover:bg-blue-50 active:scale-95"
                style={{ color: '#2534ff' }}
              >
                Sign up <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:werestcompany@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/20 transition-colors"
              >
                Contact us first
              </a>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
