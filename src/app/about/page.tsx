import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Learn about Werest Travel — Thailand's trusted private transfer and tour company. 5,000+ happy travelers, verified drivers, fixed prices across all of Thailand.",
  alternates: { canonical: 'https://www.werest.com/about' },
}

const PILLARS = [
  {
    icon: '💰',
    title: 'Fixed Prices. No Surprises',
    desc: 'The price you see is the price you pay. No surge pricing, no hidden fees, no last-minute changes.',
  },
  {
    icon: '✅',
    title: 'Verified Drivers Only',
    desc: 'Every driver passes a background check and holds a valid commercial license before joining the Werest network.',
  },
  {
    icon: '⏱️',
    title: 'Always On Time',
    desc: 'We monitor flights in real time and track traffic conditions so your driver is always there when you need them.',
  },
]

const STATS = [
  { value: '5,000+', label: 'Happy Travelers' },
  { value: '50+',    label: 'Destinations' },
  { value: '24/7',   label: 'Support' },
  { value: '4.9★',   label: 'Average Rating' },
]

const FEATURES = [
  {
    icon: '📍',
    title: 'Stay Informed',
    desc: 'Receive your driver\'s details and status updates before and during your transfer so you\'re always in the loop.',
  },
  {
    icon: '🎖️',
    title: 'Professional Drivers',
    desc: 'Experienced Thai drivers with local knowledge and international service standards.',
  },
  {
    icon: '⚡',
    title: 'Instant Confirmation',
    desc: 'Receive your booking confirmation within minutes — no waiting, no uncertainty.',
  },
  {
    icon: '🏷️',
    title: 'Transparent Pricing',
    desc: 'Fixed prices set upfront — no meters, no surge, no hidden fees. What you see at checkout is what you pay.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-20 pb-16">

        {/* ── Hero ── */}
        <section className="bg-gradient-to-br from-[#2534ff] to-[#1a26cc] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-3">About Us</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
              Passionate About<br className="hidden sm:block" /> Thailand Travel
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Werest Travel was founded with a simple goal: give every visitor to Thailand a transfer and tour
              experience they can truly rely on — premium vehicles, professional drivers, and prices that never change.
            </p>
          </div>
        </section>

        {/* ── Mission pillars ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            Our Mission
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PILLARS.map(p => (
              <div key={p.title} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="bg-blue-50 py-10 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#2534ff]">{s.value}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our Story ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed text-[15px]">
            <p>
              Werest Travel started as a small Bangkok airport transfer service — just a handful of verified
              drivers and a commitment to punctuality. Word spread quickly. Travelers noticed the difference:
              a driver waiting with their name, a clean vehicle, no surprise charges at the end. What began
              in Bangkok soon grew to cover Chiang Mai, Phuket, Pattaya, Koh Samui, and dozens of routes
              across the kingdom.
            </p>
            <p>
              Today, Werest Travel covers all of Thailand. Our network of Thai drivers brings genuine local
              knowledge — the best routes, the hidden gems, the practical tips that no app can replicate.
              We combine that local expertise with international service standards: real-time booking
              confirmations, 24/7 customer support, and a transparent pricing system that never changes
              after you book.
            </p>
          </div>
        </section>

        {/* ── Why Werest ── */}
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
              Why Choose Werest?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4">
                  <div className="text-3xl shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA strip ── */}
        <section className="bg-gradient-to-r from-[#2534ff] to-[#1a26cc] py-14 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to explore Thailand?
            </h2>
            <p className="text-blue-200 mb-8 text-[15px]">
              Book your transfer or browse our curated tours — seamless travel starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/private-transfer"
                className="inline-block bg-white text-[#2534ff] font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Book a Transfer
              </Link>
              <Link
                href="/tours"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Browse Tours
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
