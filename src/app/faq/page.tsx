import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Werest Travel',
  description:
    'Answers to the most common questions about Werest Travel — transfers, tours, payments, drivers, and cancellation policies.',
  alternates: { canonical: 'https://gowerest.com/faq' },
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QA {
  q: string
  a: string
  defaultOpen?: boolean
}

interface Category {
  id: string
  label: string
  badgeColor: string
  items: QA[]
}

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'transfers',
    label: 'Transfers & Booking',
    badgeColor: 'bg-blue-100 text-blue-700',
    items: [
      {
        q: 'How do I book a private transfer?',
        a: 'Use the search form on our homepage, enter your pickup and dropoff locations, select your date and vehicle, then fill in your details. Booking takes less than 2 minutes — no account required.',
        defaultOpen: true,
      },
      {
        q: 'How will I find my driver at the airport?',
        a: 'Your driver will be waiting in the arrivals hall holding a name sign with your name. You receive full driver details (name, photo, phone, vehicle plate) 24 hours before pickup.',
      },
      {
        q: 'What if my flight is delayed?',
        a: 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time at no extra cost.',
      },
      {
        q: 'Can I cancel or change my booking?',
        a: 'Yes — free cancellation and rescheduling up to 24 hours before pickup. Changes within 24 hours are subject to availability.',
      },
      {
        q: 'Is payment required at the time of booking?',
        a: 'No payment is needed when you book. You pay the driver directly on the day in cash (Thai Baht) or via bank transfer.',
      },
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicles & Capacity',
    badgeColor: 'bg-purple-100 text-purple-700',
    items: [
      {
        q: 'What vehicle types are available?',
        a: 'Sedan (up to 2 passengers), SUV (up to 4 passengers), Minivan (up to 10 passengers), Luxury MPV (up to 6 passengers, VIP). All air-conditioned with complimentary water.',
        defaultOpen: true,
      },
      {
        q: 'How much luggage can I bring?',
        a: 'Sedan: 2 large bags. SUV: 4 large bags. Minivan: 7 large bags. For excess luggage or oversized items, contact us in advance.',
      },
      {
        q: 'Can I request a child seat?',
        a: 'Yes — add a child seat as an extra when booking. Available for all vehicle types.',
      },
    ],
  },
  {
    id: 'tours',
    label: 'Tours & Attractions',
    badgeColor: 'bg-green-100 text-green-700',
    items: [
      {
        q: 'Do tours include pickup from my hotel?',
        a: 'Yes, all Werest tours include hotel pickup and dropoff within the listed service area.',
        defaultOpen: true,
      },
      {
        q: 'Are tours available in English?',
        a: 'All tours are conducted in English. Thai, Chinese, and other languages available on request.',
      },
      {
        q: 'Can I join a tour last minute?',
        a: 'Subject to availability. We recommend booking at least 24 hours in advance for best availability.',
      },
      {
        q: 'What is the cancellation policy for tours?',
        a: 'Free cancellation up to 24 hours before the tour start time. No refund for cancellations within 24 hours.',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & Prices',
    badgeColor: 'bg-orange-100 text-orange-700',
    items: [
      {
        q: 'What currencies do you accept?',
        a: 'All prices are in Thai Baht (THB). We accept THB cash and bank transfer. Online payments are processed via Payso.',
        defaultOpen: true,
      },
      {
        q: 'Are prices fixed or can they change?',
        a: 'All prices displayed are fixed. No surge pricing, no hidden fees. The price you see is the price you pay.',
      },
      {
        q: 'Do you offer discounts?',
        a: 'We occasionally run promotions. Subscribe to our newsletter for exclusive deals. Group bookings of 5+ transfers receive special rates — contact us for a quote.',
      },
    ],
  },
  {
    id: 'safety',
    label: 'Safety & Trust',
    badgeColor: 'bg-red-100 text-red-700',
    items: [
      {
        q: 'Are your drivers verified?',
        a: 'Yes — all drivers pass background checks, have valid commercial licenses, and are verified by the Werest team before being listed.',
        defaultOpen: true,
      },
      {
        q: 'Is Werest Travel a licensed company?',
        a: 'Yes, Werest Travel is a registered travel services company operating legally in Thailand.',
      },
      {
        q: 'How do I track my booking?',
        a: 'Use the /tracking page with your booking reference number and email to see real-time status updates.',
      },
    ],
  },
]

// ─── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({ q, a, defaultOpen }: QA) {
  return (
    <details
      open={defaultOpen}
      className="group border border-gray-200 rounded-xl overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 bg-white hover:bg-gray-50 transition-colors list-none">
        <span className="font-semibold text-gray-900 text-[14px] sm:text-[15px]">{q}</span>
        {/* Chevron — rotates 180° when open */}
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-4 pt-2 bg-gray-50 text-gray-700 text-[14px] leading-relaxed border-t border-gray-100">
        {a}
      </div>
    </details>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  return (
    <>
      <Navbar transparent />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Help Centre</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-[15px] max-w-xl mx-auto">
              Everything you need to know about booking with Werest Travel.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Can&apos;t find your answer?{' '}
              <Link href="/contact" className="text-[#2534ff] font-medium hover:underline">
                Contact us →
              </Link>
            </p>
            <div className="mt-8 h-px bg-gray-200" />
          </div>

          {/* FAQ categories */}
          <div className="space-y-12">
            {CATEGORIES.map(cat => (
              <section key={cat.id} id={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${cat.badgeColor}`}>
                    {cat.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {cat.items.map(item => (
                    <AccordionItem key={item.q} {...item} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
            <p className="text-gray-600 text-sm mb-5">
              Our team is available daily from 6:00 AM to 11:00 PM (ICT).
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#2534ff] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a26cc] transition-colors text-sm"
            >
              Get in Touch
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
