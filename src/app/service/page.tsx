import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield, Headphones, Clock, Zap, MessageCircle,
  Star, CheckCircle, Car, ChevronRight,
  MapPin, Smartphone, RefreshCw, Award, Ticket,
} from 'lucide-react';

// ─── Pillar data ──────────────────────────────────────────────────────────────

const PILLARS = [
  {
    number: '01',
    icon:   <Shield      className="w-8 h-8" />,
    color:  'from-[#2534ff] to-blue-600',
    bg:     'bg-blue-50',
    text:   'text-[#2534ff]',
    title:  'We guarantee your booking',
    tagline:'Your reservation is protected from confirmation to completion.',
    body:   'Once you receive a booking reference, your service is confirmed and guaranteed. If Werest cannot fulfill your booking for any reason within our control — we will arrange an equivalent alternative or issue a full refund within 3 working days. No disputes, no delays.',
    bullets:[
      'Booking reference issued immediately after payment',
      'Driver and vehicle details sent 3–12 hours before pickup',
      'If a driver cannot be assigned, we notify you and replace instantly',
      'Hotel and tour partners verified through a quality assurance programme',
    ],
  },
  {
    number: '02',
    icon:   <MessageCircle className="w-8 h-8" />,
    color:  'from-green-500 to-emerald-600',
    bg:     'bg-green-50',
    text:   'text-green-600',
    title:  'Get help easily — WhatsApp & live chat',
    tagline:'Reach us instantly, wherever you are in Thailand.',
    body:   'Whether you\'re at the airport, on a beach in Phuket, or stuck in Bangkok traffic, our support team is one message away. We prioritise WhatsApp and live chat because you shouldn\'t have to wait on hold when you need help.',
    bullets:[
      'WhatsApp available 24/7 — typical response under 5 minutes',
      'Live chat on our website and app',
      'English and Thai-speaking agents',
      'Dedicated booking reference lookup — no repeating your details',
    ],
  },
  {
    number: '03',
    icon:   <Clock className="w-8 h-8" />,
    color:  'from-violet-500 to-purple-600',
    bg:     'bg-violet-50',
    text:   'text-violet-600',
    title:  '24/7 support in English & Thai',
    tagline:'Round-the-clock assistance in the languages you speak.',
    body:   'Travel doesn\'t follow business hours, and neither do we. Our team is available every hour of every day — including Thai public holidays — to assist with emergencies, late-night pickups, and early-morning departures.',
    bullets:[
      'Fully staffed during Thai public holidays',
      'Emergency assistance for medical incidents, lost luggage, and driver no-shows',
      'Proactive flight delay monitoring — we notify you before you notice',
      'On-call local coordinators in Bangkok, Phuket, and Chiang Mai',
    ],
  },
  {
    number: '04',
    icon:   <Zap className="w-8 h-8" />,
    color:  'from-amber-500 to-orange-600',
    bg:     'bg-amber-50',
    text:   'text-amber-600',
    title:  'We won\'t keep you waiting',
    tagline:'Fast responses. Fast refunds. Fast resolutions.',
    body:   'We measure our service by how quickly we solve your problem, not by how long we can keep a ticket open. Our resolution standards are some of the fastest in the industry.',
    bullets:[
      'WhatsApp response: under 5 minutes (daytime), under 15 minutes (night)',
      'Booking issue resolution: within 1 hour for active trip issues',
      'Refund processing: 3–7 business days to original payment method',
      'Compensation issued within 1 working day when Werest is at fault',
    ],
  },
  {
    number: '05',
    icon:   <Smartphone className="w-8 h-8" />,
    color:  'from-rose-500 to-pink-600',
    bg:     'bg-rose-50',
    text:   'text-rose-600',
    title:  'Manage everything in one place',
    tagline:'Your bookings, status updates, and receipts — all in your account.',
    body:   'The Werest customer account lets you view upcoming trips, track live driver location, download invoices, manage cancellations, and chat with support — without needing to call or email.',
    bullets:[
      'Live GPS tracking for all active transfer bookings',
      'Instant cancellation and rebooking for eligible bookings',
      'Digital receipts and VAT invoices available on demand',
      'Push notifications for booking confirmations and driver status',
    ],
  },
  {
    number: '06',
    icon:   <Star className="w-8 h-8" />,
    color:  'from-[#2534ff] to-indigo-700',
    bg:     'bg-blue-50',
    text:   'text-[#2534ff]',
    title:  'Transparent pricing — no surprises',
    tagline:'The price you see is always the price you pay.',
    body:   'We believe in complete pricing transparency. There are no hidden fees, no metering, no surge pricing, and no service charges added at checkout. All tolls, parking, and taxes are included in your quoted price.',
    bullets:[
      'Fixed prices locked at the time of booking — no changes after payment',
      'All expressway tolls and airport surcharges included',
      'Optional gratuity — never automatically charged',
      'Full price breakdown visible before payment confirmation',
    ],
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50,000+', label: 'Trips completed',        icon: <Car className="w-5 h-5" />         },
  { value: '4.9★',    label: 'Average customer rating', icon: <Star className="w-5 h-5" />        },
  { value: '< 5 min', label: 'Avg. support response',   icon: <Clock className="w-5 h-5" />       },
  { value: '24/7',    label: 'Team availability',        icon: <Headphones className="w-5 h-5" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicePage() {
  return (
    <>
      <Navbar transparent />
      <div className="pt-16 min-h-screen bg-[#f5f5f5]">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#070e3d] via-[#0f1d7a] to-[#2534ff] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-semibold mb-5">
              <Award className="w-4 h-4" /> Service Standards
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              6 ways Werest offers<br className="hidden sm:block" /> outstanding service
            </h1>
            <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              At Werest, we make travel in Thailand effortless. These are the standards we hold ourselves to on every single booking — and the commitments we keep when things go wrong.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/airport-transfers" className="bg-white text-[#2534ff] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                Book a Transfer
              </Link>
              <Link href="/customer-service" className="bg-white/15 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors">
                Service Guarantee
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gray-900 leading-tight">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6 Pillars ────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          {PILLARS.map((pillar, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="grid lg:grid-cols-[1fr_380px]">

                {/* Left: content */}
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      {pillar.icon}
                    </div>
                    <div>
                      <span className={`text-xs font-black uppercase tracking-widest ${pillar.text} block mb-1`}>
                        {pillar.number}
                      </span>
                      <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{pillar.title}</h2>
                      <p className={`text-sm font-semibold mt-1 ${pillar.text}`}>{pillar.tagline}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{pillar.body}</p>
                  <ul className="space-y-2.5">
                    {pillar.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${pillar.text}`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: visual accent */}
                <div className={`lg:block hidden bg-gradient-to-br ${pillar.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
                    <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full bg-white" />
                  </div>
                  <div className="relative z-10 text-center text-white p-8">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      {pillar.icon}
                    </div>
                    <p className="text-3xl font-black mb-1">{pillar.number}</p>
                    <p className="text-sm text-white/80 font-semibold">{pillar.tagline}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact CTA ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Still have a question?</h2>
                <p className="text-gray-500 text-sm">
                  Our team is available 24/7 via WhatsApp and phone. For detailed guarantee information, visit our Service Guarantee page.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
                <Link
                  href="/customer-service"
                  className="flex items-center justify-center gap-2 border border-[#2534ff] text-[#2534ff] font-semibold text-sm px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Shield className="w-4 h-4" /> Service Guarantee
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Service categories ────────────────────────────────────────── */}
        <div className="bg-white border-t border-gray-100 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-bold text-gray-900 mb-6 text-center">What we cover</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Car     className="w-6 h-6" />, label: 'Private Transfers',  href: '/airport-transfers',  desc: 'Airport & city transfers' },
                { icon: <MapPin  className="w-6 h-6" />, label: 'Tours & Experiences', href: '/tours',              desc: 'Day trips & group tours'  },
                { icon: <Ticket  className="w-6 h-6" />, label: 'Attraction Tickets',  href: '/attractions',        desc: 'E-tickets & experiences'  },
                { icon: <Shield  className="w-6 h-6" />, label: 'Service Guarantee',  href: '/customer-service',   desc: 'All guarantees explained' },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 hover:border-[#2534ff]/30 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] mb-3 group-hover:bg-[#2534ff] group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Breadcrumb / more info ────────────────────────────────────── */}
        <div className="bg-[#f5f5f5] py-6 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#2534ff] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">Service Standards</span>
            <span className="ml-auto">
              <Link href="/customer-service" className="text-[#2534ff] font-semibold hover:underline flex items-center gap-1">
                Full Service Guarantee <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </span>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
