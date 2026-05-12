import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthTriggerButton } from '@/components/ui/AuthTriggerButton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  DollarSign, Users, TrendingUp, Globe, CheckCircle2,
  ArrowRight, Star, Megaphone, Briefcase, Building2,
  Share2, BarChart3, ShieldCheck, Zap,
} from 'lucide-react';

/* ── Metadata ─────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Affiliate & Partner Program | Werest Travel',
  description:
    'Join the Werest Travel partner program. Earn commission on every transfer and tour booking you refer. Up to 8% commission, real-time tracking, monthly payouts.',
  alternates: { canonical: 'https://www.werest.com/partners' },
};

/* ── Data ─────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: 'Up to 8%',       label: 'Commission per booking' },
  { value: '1,200+',         label: 'Active partners'        },
  { value: '฿12,500',        label: 'Avg. monthly earnings'  },
  { value: '30 days',        label: 'Cookie window'          },
];

const STEPS = [
  {
    n: '01',
    icon: Users,
    title: 'Sign up for free',
    desc: 'Create a partner account in minutes. No approval waiting period — your tracking link is ready immediately.',
  },
  {
    n: '02',
    icon: Share2,
    title: 'Share your link',
    desc: 'Add your unique referral link to your blog, social media, YouTube channel, or email newsletter.',
  },
  {
    n: '03',
    icon: DollarSign,
    title: 'Earn commission',
    desc: 'Get paid for every confirmed booking made through your link. Track earnings in real time and get paid monthly.',
  },
];

const COMMISSION_TIERS = [
  { product: 'Private Transfers',    rate: '5%', note: 'Per completed transfer booking',  icon: '🚗' },
  { product: 'Day Tours',            rate: '8%', note: 'Per confirmed tour booking',       icon: '🗺️' },
  { product: 'Attraction Tickets',   rate: '6%', note: 'Per issued attraction ticket',     icon: '🎡' },
  { product: 'Group Bookings (6+)',  rate: '7%', note: 'Bonus rate for large groups',      icon: '👥' },
];

const PARTNER_TYPES = [
  {
    icon: Megaphone,
    title: 'Travel Bloggers & Influencers',
    desc: 'Write about your Thailand adventures and earn every time a reader books through your link.',
    cta: 'Perfect for content creators',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: Briefcase,
    title: 'Travel Agents & Consultants',
    desc: 'Offer private transfers and tours to your clients. Earn a transparent commission on every booking.',
    cta: 'Ideal for travel professionals',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Building2,
    title: 'Hotels & Resorts',
    desc: 'Help guests book reliable airport transfers and day trips. Add value to their stay and earn at the same time.',
    cta: 'For hospitality businesses',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Globe,
    title: 'Tour Operators',
    desc: 'Bundle our private transfers with your tours. White-label options available for high-volume partners.',
    cta: 'For tour companies',
    color: 'bg-purple-50 text-purple-600',
  },
];

const BENEFITS = [
  { icon: BarChart3,   title: 'Real-time dashboard',         desc: 'Track clicks, conversions, and earnings live.'           },
  { icon: ShieldCheck, title: 'Reliable payouts',            desc: 'Monthly bank transfer or PayPal. No minimum payout.'     },
  { icon: Zap,         title: 'Instant tracking link',       desc: 'Get your link immediately after signing up.'             },
  { icon: TrendingUp,  title: 'Performance bonuses',         desc: 'Hit monthly targets and unlock higher commission rates.'  },
];

const TESTIMONIALS = [
  { name: 'Anna K.', role: 'Travel blogger — Thailand Wanderer', text: 'I added the Werest link to three airport-transfer posts and now earn a steady ฿8,000+ every month with zero extra work.', stars: 5 },
  { name: 'David L.', role: 'Independent travel consultant', text: 'My clients love having a reliable, English-speaking driver waiting for them. Referrals convert well and payouts are always on time.', stars: 5 },
  { name: 'Priya M.', role: 'Hotel concierge manager', text: 'We recommend Werest for every guest transfer. The commission is fair and the service quality means guests actually come back happy.', stars: 5 },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function PartnersPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-20" style={{ background: 'linear-gradient(135deg, #2534ff 0%, #1825b8 60%, #0d1266 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 translate-x-1/3 translate-y-1/3" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <DollarSign className="w-4 h-4 text-white/70" />
                <span className="text-white/80 text-sm font-semibold">Affiliate &amp; Partner Program</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                Earn money with<br />
                <span className="text-indigo-300">Werest Travel</span>
              </h1>
              <p className="text-white/65 text-lg mb-8 max-w-xl leading-relaxed">
                Refer travellers to our Thailand transfer and tour services and earn up to <strong className="text-white">8% commission</strong> on every confirmed booking — no cap, no hidden fees.
              </p>
              <div className="flex flex-wrap gap-4">
                <AuthTriggerButton
                  step="register"
                  className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg text-sm"
                >
                  Join for free <ArrowRight className="w-4 h-4" />
                </AuthTriggerButton>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-sm"
                >
                  How it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              {STATS.map(s => (
                <div key={s.label} className="flex flex-col items-center text-center px-6 py-8">
                  <dt className="text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight">{s.value}</dt>
                  <dd className="text-sm text-gray-500 mt-1">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Simple process</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How it works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
              <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(16.66% + 24px)' }} />
              <div className="hidden sm:block absolute top-8 h-0.5 bg-brand-200" style={{ width: 'calc(33.33% - 48px)', left: 'calc(49.99% + 24px)' }} />
              {STEPS.map(step => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="flex flex-col items-center text-center gap-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg z-10 relative"
                        style={{ background: 'linear-gradient(135deg, #2534ff, #1825b8)' }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-600 text-brand-700 text-[10px] font-black flex items-center justify-center">
                        {step.n}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Commission table ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Transparent rates</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Commission rates</h2>
              <p className="text-gray-500 mt-3">Paid on the booking value, net of taxes and fees. No clawbacks on completed bookings.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Product</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-600">Commission</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600 hidden sm:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TIERS.map((tier, i) => (
                    <tr key={tier.product} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <span className="mr-2">{tier.icon}</span>
                        {tier.product}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-brand-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">{tier.rate}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">{tier.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Commission paid within 30 days of booking completion. Minimum payout: ฿500.</p>
          </div>
        </section>

        {/* ── Who is it for ────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Built for everyone</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Who can partner with us?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PARTNER_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.title}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${type.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{type.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{type.desc}</p>
                    <p className="text-xs font-semibold text-brand-600">{type.cta}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Platform benefits ────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brand-600 text-xs font-bold uppercase tracking-widest mb-2">Why Werest?</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Everything you need to succeed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex flex-col items-start gap-3 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{b.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What our partners say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sign-up CTA ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl px-8 py-14 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative z-10">
                <CheckCircle2 className="w-10 h-10 text-white/50 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Ready to start earning?</h2>
                <p className="text-white/65 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  Join 1,200+ partners already earning with Werest Travel. Sign up in 2 minutes — free forever.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <AuthTriggerButton
                    step="register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors text-sm shadow-lg"
                  >
                    Create partner account <ArrowRight className="w-4 h-4" />
                  </AuthTriggerButton>
                  <a
                    href="mailto:werestcompany@gmail.com"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-sm"
                  >
                    Contact us first
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
