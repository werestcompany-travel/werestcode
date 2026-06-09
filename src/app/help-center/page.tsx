'use client'

// Note: To add metadata for this page in Next.js App Router,
// create src/app/help-center/layout.tsx and export metadata from there.

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Mail,
  Car,
  Plane,
  Ticket,
  CreditCard,
  MapPin,
  RefreshCw,
  User,
  Phone,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FaqCategory = 'Transfers' | 'Tours' | 'Payments' | 'Cancellations' | 'General'

interface FaqItem {
  category: FaqCategory
  q: string
  a: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS = ['All', 'Transfers', 'Tours', 'Payments', 'Cancellations'] as const
type Tab = (typeof TABS)[number]

const FAQS: FaqItem[] = [
  // Transfers
  {
    category: 'Transfers',
    q: 'How far in advance should I book a transfer?',
    a: 'We recommend booking at least 24 hours in advance, though same-day bookings are available subject to driver availability.',
  },
  {
    category: 'Transfers',
    q: 'What happens if my flight is delayed?',
    a: 'Our drivers monitor your flight in real time and adjust pickup time automatically. No extra charge for delays.',
  },
  {
    category: 'Transfers',
    q: 'How do I know which driver is picking me up?',
    a: "You'll receive a booking confirmation with your driver's name, photo, and vehicle details. Real-time tracking is available via the link in your email.",
  },
  {
    category: 'Transfers',
    q: 'Are your prices fixed or can they change?',
    a: 'All Werest prices are 100% fixed. The price shown at booking is the price you pay — no surge pricing, no hidden fees.',
  },
  {
    category: 'Transfers',
    q: 'How many passengers can I bring?',
    a: 'Depends on the vehicle: Sedan (up to 3 pax), SUV (up to 6 pax), Minivan (up to 8 pax), Mini Coach (up to 16 pax).',
  },
  // Tours
  {
    category: 'Tours',
    q: "What's included in the tour price?",
    a: 'Most tours include transport, an English-speaking guide, entrance fees, and listed activities. Check the specific tour page for full inclusions.',
  },
  {
    category: 'Tours',
    q: 'Can I book a private tour for my group?',
    a: 'Yes! All Werest tours are private — no strangers in your group. Contact us for groups of 10+.',
  },
  {
    category: 'Tours',
    q: 'What if I want to skip a stop on the itinerary?',
    a: 'Our guides are flexible. Let your guide know at the start and they will adjust where possible.',
  },
  {
    category: 'Tours',
    q: 'Are tours suitable for children?',
    a: 'Most tours welcome children. Age restrictions (if any) are noted on the tour page. Young children often qualify for reduced rates.',
  },
  // Payments
  {
    category: 'Payments',
    q: 'What payment methods do you accept?',
    a: 'We accept Visa, Mastercard, Thai QR payment, bank transfer, and select digital wallets. All payments are secured via Payso.',
  },
  {
    category: 'Payments',
    q: 'Will I receive a receipt for my booking?',
    a: 'Yes — a booking confirmation and receipt are emailed immediately after payment.',
  },
  {
    category: 'Payments',
    q: 'Is it safe to pay online through Werest?',
    a: 'Absolutely. Payments are processed by Payso (PCI-DSS compliant). We never store your card details.',
  },
  {
    category: 'Payments',
    q: 'Can I pay in a currency other than THB?',
    a: 'All prices are in Thai Baht (THB). Your card provider may apply a foreign exchange fee.',
  },
  // Cancellations
  {
    category: 'Cancellations',
    q: 'What is the free cancellation window?',
    a: 'Bookings can be cancelled free of charge up to 24 hours before the scheduled pickup time.',
  },
  {
    category: 'Cancellations',
    q: 'How do I cancel my booking?',
    a: 'Go to Manage Bookings in your account, select the booking, and click "Cancel". Or contact us via WhatsApp or email.',
  },
  {
    category: 'Cancellations',
    q: 'How long does a refund take?',
    a: 'Refunds are processed within 3–7 business days depending on your bank or card provider.',
  },
  {
    category: 'Cancellations',
    q: 'What if I cancel within 24 hours of pickup?',
    a: 'Cancellations within 24 hours are non-refundable. We recommend contacting us — we may be able to reschedule at no extra cost.',
  },
  {
    category: 'Cancellations',
    q: 'What happens if Werest cancels my booking?',
    a: 'In the very rare event we must cancel, you receive a full refund and a 10% discount voucher for your next booking.',
  },
  // General
  {
    category: 'General',
    q: 'How do I contact Werest customer support?',
    a: 'WhatsApp (fastest), email hello@werest.com, or LINE @werest. We respond within 1 hour during business hours.',
  },
  {
    category: 'General',
    q: 'Does Werest operate 24/7?',
    a: 'Our transfers run 24/7. Customer support is available 7:00–22:00 ICT daily.',
  },
]

const POPULAR_TOPICS = [
  'How do I cancel my booking?',
  'How do I track my driver in real time?',
  'What is the free cancellation policy?',
  'How can I modify my booking details?',
  'When will I receive my refund?',
]

interface CategoryCard {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  href: string
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    icon: <Car className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-50',
    title: 'Private Transfers',
    subtitle: 'Booking, vehicles, routes',
    href: '#faq',
  },
  {
    icon: <Plane className="w-6 h-6 text-violet-600" />,
    iconBg: 'bg-violet-50',
    title: 'Airport Transfers',
    subtitle: 'Pickups, meet & greet, flight tracking',
    href: '#faq',
  },
  {
    icon: <Ticket className="w-6 h-6 text-amber-600" />,
    iconBg: 'bg-amber-50',
    title: 'Tours & Experiences',
    subtitle: "Activities, what's included, guides",
    href: '#faq',
  },
  {
    icon: <CreditCard className="w-6 h-6 text-green-600" />,
    iconBg: 'bg-green-50',
    title: 'Payments & Pricing',
    subtitle: 'Methods, receipts, fixed pricing',
    href: '#faq',
  },
  {
    icon: <MapPin className="w-6 h-6 text-rose-600" />,
    iconBg: 'bg-rose-50',
    title: 'Live Tracking',
    subtitle: 'Driver location, real-time status updates',
    href: '#faq',
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-orange-600" />,
    iconBg: 'bg-orange-50',
    title: 'Cancellations & Refunds',
    subtitle: 'Policy, process, refund timeline',
    href: '#faq',
  },
  {
    icon: <User className="w-6 h-6 text-teal-600" />,
    iconBg: 'bg-teal-50',
    title: 'Account & Profile',
    subtitle: 'Login, registration, preferences',
    href: '/account',
  },
  {
    icon: <Phone className="w-6 h-6 text-indigo-600" />,
    iconBg: 'bg-indigo-50',
    title: 'Contact Support',
    subtitle: 'Channels, response times, escalation',
    href: '/contact',
  },
]

// ─── FAQ Accordion Item ────────────────────────────────────────────────────────

function FaqAccordion({ item }: { item: FaqItem }) {
  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
      <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 hover:bg-gray-50 transition-colors list-none select-none">
        <span className="font-semibold text-gray-900 text-sm sm:text-[15px] leading-snug">
          {item.q}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-3 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
        {item.a}
      </div>
    </details>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesTab =
        activeTab === 'All' ||
        (f.category as string) === activeTab ||
        f.category === 'General'
      const q = search.toLowerCase()
      const matchesSearch =
        !search ||
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [search, activeTab])

  // When searching, show all categories regardless of tab
  const displayedFaqs = search
    ? FAQS.filter((f) => {
        const q = search.toLowerCase()
        return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      })
    : filtered

  return (
    <>
      <Navbar transparent />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#2534ff] to-[#1a26cc] pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-3">
              Support
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Werest Help Center
            </h1>
            <p className="text-blue-100 text-base sm:text-lg mb-10">
              Find answers to your questions about transfers, tours, payments, and more.
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-2 max-w-xl mx-auto">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for answers…"
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-[15px] py-1 min-w-0"
              />
              <button
                onClick={() => {}}
                className="bg-[#2534ff] hover:bg-[#1a26cc] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Popular Topics ──────────────────────────────────────────────── */}
          {!search && (
            <section className="mb-14">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Popular Topics
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {POPULAR_TOPICS.map((topic) => (
                  <Link
                    key={topic}
                    href="#faq"
                    onClick={() => setSearch(topic.split(' ').slice(0, 3).join(' '))}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-[#2534ff] hover:shadow-sm transition-all group shrink-0 min-w-[220px] max-w-[280px]"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#2534ff] leading-snug flex-1">
                      {topic}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#2534ff] shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Category Grid ───────────────────────────────────────────────── */}
          {!search && (
            <section className="mb-14">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {CATEGORY_CARDS.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-[#2534ff] hover:shadow-md transition-all group"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110`}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 group-hover:text-[#2534ff] transition-colors">
                        {card.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug">{card.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ Section ─────────────────────────────────────────────────── */}
          <section id="faq" className="scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {search
                  ? `Search results for "${search}"`
                  : 'Frequently Asked Questions'}
              </h2>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-sm text-[#2534ff] font-medium hover:underline self-start sm:self-auto"
                >
                  ← Back to all FAQs
                </button>
              )}
            </div>

            {/* Tabs — hidden while searching */}
            {!search && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-6 -mx-1 px-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? 'bg-[#2534ff] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2534ff] hover:text-[#2534ff]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* FAQ items */}
            {displayedFaqs.length > 0 ? (
              <div className="space-y-2.5">
                {displayedFaqs.map((item) => (
                  <FaqAccordion key={item.q} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-base mb-1">No results found</p>
                <p className="text-gray-500 text-sm mb-5">
                  Try different keywords or{' '}
                  <button
                    onClick={() => setSearch('')}
                    className="text-[#2534ff] font-medium hover:underline"
                  >
                    browse all questions
                  </button>
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-[#2534ff] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a26cc] transition-colors"
                >
                  Ask our support team
                </Link>
              </div>
            )}
          </section>

        </div>

        {/* ── Contact CTA Banner ───────────────────────────────────────────────── */}
        <section className="bg-[#2534ff] mt-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Still can&apos;t find your answer?
            </h2>
            <p className="text-blue-200 text-base mb-8">
              Our support team typically responds within 1 hour
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white text-[#2534ff] font-bold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <a
                href="mailto:hello@werest.com"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-white text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Send us an Email
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
