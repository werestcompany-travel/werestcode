'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield, CheckCircle, Headphones, Clock, AlertCircle,
  Car, MapPin, Ticket, ChevronRight, ChevronDown,
  Star, RefreshCw, Users, Heart, Zap, Award,
  Phone, MessageCircle, ThumbsUp,
} from 'lucide-react';

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'general',     label: 'General Service Guarantee', icon: <Shield    className="w-4 h-4" /> },
  { id: 'tours',       label: 'Tours & Experiences',       icon: <MapPin    className="w-4 h-4" /> },
  { id: 'transfers',   label: 'Transfers',                  icon: <Car       className="w-4 h-4" /> },
  { id: 'attractions', label: 'Attraction Tickets',         icon: <Ticket    className="w-4 h-4" /> },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Accordion item ───────────────────────────────────────────────────────────

function AccordionItem({
  icon, title, children, defaultOpen,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="shrink-0 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#2534ff]">
          {icon}
        </span>
        <span className="flex-1 font-semibold text-gray-900 text-sm sm:text-base">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-white border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Guarantee chip ───────────────────────────────────────────────────────────

function GuaranteeChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-semibold">
      <span className="text-green-500">{icon}</span>
      {label}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Bullet list ──────────────────────────────────────────────────────────────

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-[#2534ff] shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function GeneralTab() {
  return (
    <div className="space-y-4">
      {/* Trust chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <GuaranteeChip icon={<Headphones className="w-3.5 h-3.5" />} label="24/7 Support" />
        <GuaranteeChip icon={<Shield className="w-3.5 h-3.5" />}     label="Booking Protected" />
        <GuaranteeChip icon={<Heart className="w-3.5 h-3.5" />}       label="Emergency Assist" />
        <GuaranteeChip icon={<ThumbsUp className="w-3.5 h-3.5" />}   label="Advance Compensation" />
      </div>

      {/* 24/7 Support */}
      <AccordionItem icon={<Headphones className="w-4 h-4" />} title="24/7 Customer Support" defaultOpen>
        <SectionTitle icon={<Headphones className="w-4 h-4" />} title="Always here for you" subtitle="Our customer support team is available around the clock, every day of the year." />
        <p className="text-sm text-gray-600 mb-4">
          Whether you need help with a booking, have a question during your trip, or need urgent assistance, our team is reachable via WhatsApp, live chat, and phone — in English and Thai.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp & Live Chat', desc: 'Instant replies, typically under 5 minutes' },
            { icon: <Phone className="w-4 h-4" />,         label: 'Phone Support',        desc: 'Available 08:00–22:00 ICT daily'             },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
              <span className="text-[#2534ff] mt-0.5">{c.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* Booking Guarantee */}
      <AccordionItem icon={<Shield className="w-4 h-4" />} title="Booking Guarantee">
        <p className="text-sm text-gray-600 mb-3">
          Once your payment is confirmed and your booking reference is issued, Werest guarantees your service will be provided as described. If we cannot fulfill your booking due to our fault, we will arrange an equivalent alternative at no extra cost.
        </p>
        <BulletList items={[
          'Booking reference sent immediately after payment confirmation',
          'Driver details (name, vehicle, plate number) confirmed 3–12 hours before pickup',
          'If a driver cannot be assigned, we notify you immediately and arrange a replacement',
          'In the event of a confirmed booking failure due to Werest, full refund issued within 24 hours',
        ]} />
      </AccordionItem>

      {/* Special Circumstances */}
      <AccordionItem icon={<Heart className="w-4 h-4" />} title="Special Circumstances Cancellation">
        <p className="text-sm text-gray-600 mb-3">
          Werest assists customers who are unable to travel due to serious personal circumstances. The following are covered with supporting documentation submitted within 7 days of the event:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          {[
            { icon: '🏥', title: 'Hospitalization',     desc: 'Sudden acute illness requiring admission (pre-existing conditions excluded)' },
            { icon: '🦴', title: 'Fracture',             desc: 'Medical certificate required; traveller only'                                },
            { icon: '👶', title: 'Pregnancy',             desc: 'Medical advice not to travel; must be discovered after booking'              },
            { icon: '🕊️', title: 'Bereavement',          desc: 'Immediate family member; death certificate + relationship proof required'     },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <p className="text-lg mb-1">{item.icon}</p>
              <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-xl p-3">
          Contact us before your trip date and submit documentation within 7 days. Coordinate with your travel insurance where applicable.
        </p>
      </AccordionItem>

      {/* Emergency Assistance */}
      <AccordionItem icon={<AlertCircle className="w-4 h-4" />} title="Emergency Assistance">
        <p className="text-sm text-gray-600 mb-3">
          Werest provides 24/7 emergency assistance for customers travelling in Thailand. Our team is trained to handle unexpected situations including:
        </p>
        <BulletList items={[
          'Lost luggage — we coordinate with vehicle operators and pickup locations',
          'Accidents or medical emergencies — we help contact local emergency services and your embassy',
          'Driver no-show — we dispatch a replacement or arrange an alternative service immediately',
          'Route or destination issues — live support via WhatsApp with GPS tracking',
        ]} />
      </AccordionItem>

      {/* Advance Compensation */}
      <AccordionItem icon={<ThumbsUp className="w-4 h-4" />} title="Advance Compensation">
        <p className="text-sm text-gray-600 mb-3">
          When Werest is verified to be at fault for a service failure, we practice a policy of providing advance compensation without requiring you to pursue a formal claim.
        </p>
        <BulletList items={[
          'Compensation is initiated within one working day of confirming Werest fault',
          'Refunds are processed to the original payment method within 3–7 business days',
          'Where a partial failure occurs, proportional compensation is offered',
          'Loyalty points may be offered in addition to monetary compensation',
        ]} />
      </AccordionItem>
    </div>
  );
}

function ToursTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-6">
        <GuaranteeChip icon={<CheckCircle className="w-3.5 h-3.5" />} label="Accurate Descriptions" />
        <GuaranteeChip icon={<Users className="w-3.5 h-3.5" />}       label="Expert Guides" />
        <GuaranteeChip icon={<RefreshCw className="w-3.5 h-3.5" />}   label="Free Cancellation" />
        <GuaranteeChip icon={<Star className="w-3.5 h-3.5" />}        label="Experience Guarantee" />
      </div>

      {/* Booking guarantee */}
      <AccordionItem icon={<Shield className="w-4 h-4" />} title="Tour Booking Guarantee" defaultOpen>
        <p className="text-sm text-gray-600 mb-3">
          Once your tour is booked and payment confirmed, your spot is reserved. If the tour is cancelled or cannot proceed due to Werest or our operator partners&apos; fault, you will receive:
        </p>
        <BulletList items={[
          'A full refund to your original payment method within 3 working days, OR',
          'An equivalent alternative tour at no extra cost (subject to availability and your preference)',
          'Priority rebooking access for popular tours',
          '100% refund if the tour departs more than 30 minutes late due to operator fault',
        ]} />
      </AccordionItem>

      {/* Accurate descriptions */}
      <AccordionItem icon={<CheckCircle className="w-4 h-4" />} title="Accurate Tour Descriptions">
        <p className="text-sm text-gray-600 mb-3">
          We guarantee that all tour descriptions, inclusions, durations, and itinerary details on our platform are accurate and verified by our local operations team.
        </p>
        <BulletList items={[
          'All listed inclusions are provided (meals, transport, entrance fees, guides)',
          'Duration is accurate ± 30 minutes for standard itineraries',
          'Group size limits are enforced as advertised',
          'If an attraction is temporarily closed, an equivalent substitute is arranged or a partial refund issued',
        ]} />
        <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-xl p-3">
          If you experience any discrepancy, contact us during or within 24 hours of the tour. Our team will review and compensate where applicable.
        </p>
      </AccordionItem>

      {/* Wrong booking */}
      <AccordionItem icon={<RefreshCw className="w-4 h-4" />} title="Wrong Booking Cancellation">
        <p className="text-sm text-gray-600 mb-3">
          If you accidentally book the wrong tour, date, or group size, Werest will assist with cancellation under the following conditions:
        </p>
        <BulletList items={[
          'Request must be submitted before the tour departure date',
          'The booking must be unused (no partial attendance)',
          'Werest will bear refund processing fees where our error contributed to the mistake',
          'Same-day bookings are subject to the operator\'s own cancellation policy',
        ]} />
      </AccordionItem>

      {/* Experience standards */}
      <AccordionItem icon={<Star className="w-4 h-4" />} title="Experience Standards">
        <p className="text-sm text-gray-600 mb-3">We guarantee specific service standards for all group and private tours operated through Werest:</p>
        <div className="space-y-3 mt-3">
          {[
            { icon: '🍽️', title: 'Meals',          body: 'If a promised meal is not provided, we refund the meal cost plus equivalent compensation.' },
            { icon: '🚌', title: 'Transport',       body: 'Air-conditioned vehicles guaranteed for all standard tour bookings. Downgrade triggers partial refund.' },
            { icon: '👤', title: 'Guides',          body: 'English-speaking guide guaranteed on all tours marked "English Guide". Failure triggers 15% refund.' },
            { icon: '🛍️', title: 'No Forced Shopping', body: 'We never allow mandatory shopping stops. Report incidents for a full refund plus 20% compensation.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* Special circumstances */}
      <AccordionItem icon={<Heart className="w-4 h-4" />} title="Special Circumstances Cancellation">
        <p className="text-sm text-gray-600 mb-3">
          Tours booked through Werest are covered by the same special circumstances cancellation policy as our general guarantee. Covered events include hospitalization, fracture, pregnancy complications, and bereavement. Contact us before the tour date with supporting documentation.
        </p>
        <Link href="#" className="inline-flex items-center gap-1 text-sm text-[#2534ff] font-semibold hover:underline">
          View full policy <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </AccordionItem>
    </div>
  );
}

function TransfersTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-6">
        <GuaranteeChip icon={<CheckCircle className="w-3.5 h-3.5" />} label="Fixed Price Guarantee" />
        <GuaranteeChip icon={<Car className="w-3.5 h-3.5" />}         label="Driver Arrival Guarantee" />
        <GuaranteeChip icon={<Zap className="w-3.5 h-3.5" />}         label="Live Flight Tracking" />
        <GuaranteeChip icon={<RefreshCw className="w-3.5 h-3.5" />}   label="Free Cancellation" />
      </div>

      {/* Fixed price */}
      <AccordionItem icon={<Award className="w-4 h-4" />} title="Fixed Price Guarantee" defaultOpen>
        <p className="text-sm text-gray-600 mb-3">
          The price you see is the price you pay — guaranteed. No meters, no surge pricing, no hidden charges, no late-night premiums.
        </p>
        <BulletList items={[
          'Price locked at time of booking — no changes after payment',
          'All expressway tolls and airport parking fees included',
          'No surcharge for early morning, late night, or public holiday trips',
          'No charge for standard luggage (1 bag per passenger)',
          'Gratuity is always optional — never added automatically',
        ]} />
      </AccordionItem>

      {/* Driver arrival */}
      <AccordionItem icon={<Car className="w-4 h-4" />} title="Driver Arrival Guarantee">
        <p className="text-sm text-gray-600 mb-3">
          Your driver will be at the pickup location before your scheduled time. For airport arrivals, your driver is in the arrivals hall with a name board.
        </p>
        <BulletList items={[
          'Driver confirmation (name, photo, vehicle, plate number) sent 3–12 hours before pickup',
          'For airport pickups: driver waits up to 60 minutes after scheduled pickup time free of charge',
          'For arrivals: driver adjusts for your flight landing time automatically',
          'If your driver is more than 15 minutes late due to our fault, you receive a ฿100 credit or partial refund',
          'If no driver can be arranged, full refund issued immediately',
        ]} />
      </AccordionItem>

      {/* Flight tracking */}
      <AccordionItem icon={<Zap className="w-4 h-4" />} title="Live Flight Tracking Guarantee">
        <p className="text-sm text-gray-600 mb-3">
          Werest monitors all incoming and outgoing flights in real time. No need to update us if your flight is delayed — we already know.
        </p>
        <BulletList items={[
          'Automatic driver schedule adjustment for flight delays (arrivals)',
          'No additional charge for delays up to 3 hours from original scheduled landing',
          'Proactive SMS and WhatsApp notification if your flight is significantly delayed',
          'For early landings, driver makes best effort to arrive on time (advance notice recommended)',
        ]} />
      </AccordionItem>

      {/* Vehicle standards */}
      <AccordionItem icon={<CheckCircle className="w-4 h-4" />} title="Vehicle Standards Guarantee">
        <p className="text-sm text-gray-600 mb-3">
          The vehicle class you book is the vehicle you receive. We do not downgrade without notice or compensation.
        </p>
        <BulletList items={[
          'Vehicles are clean, air-conditioned, and well-maintained',
          'Sedans: max 2 passengers + luggage. SUVs: max 4. Minivans: max 10',
          'If only a lower-class vehicle is available, you are notified and offered a full refund',
          'Upgrades to a higher vehicle class are provided at no extra charge when your booked vehicle is unavailable',
          'Complimentary bottled water provided in all vehicles',
        ]} />
      </AccordionItem>

      {/* Free cancellation */}
      <AccordionItem icon={<RefreshCw className="w-4 h-4" />} title="Cancellation & Modification Policy">
        <p className="text-sm text-gray-600 mb-3">
          Werest offers flexible cancellation and modification — we don&apos;t profit from change fees.
        </p>
        <div className="space-y-2 mt-3">
          {[
            { time: 'More than 24 hours before',     policy: 'Free cancellation — full refund',                   color: 'bg-green-50 border-green-100 text-green-800' },
            { time: '4–24 hours before',              policy: '50% refund — fee waived for first-time changes',   color: 'bg-amber-50 border-amber-100 text-amber-800' },
            { time: 'Less than 4 hours before',       policy: 'No refund (driver already dispatched)',            color: 'bg-red-50 border-red-100 text-red-800'       },
            { time: 'Flight cancelled (airline fault)',policy: 'Free rebooking within 30 days',                   color: 'bg-blue-50 border-blue-100 text-blue-800'    },
          ].map((row, i) => (
            <div key={i} className={`border rounded-xl p-3 ${row.color}`}>
              <p className="font-semibold text-sm">{row.time}</p>
              <p className="text-xs mt-0.5 opacity-80">{row.policy}</p>
            </div>
          ))}
        </div>
      </AccordionItem>
    </div>
  );
}

function AttractionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-6">
        <GuaranteeChip icon={<Ticket className="w-3.5 h-3.5" />}      label="Ticket Guarantee" />
        <GuaranteeChip icon={<CheckCircle className="w-3.5 h-3.5" />} label="Accurate Info" />
        <GuaranteeChip icon={<RefreshCw className="w-3.5 h-3.5" />}   label="Wrong Ticket Fix" />
        <GuaranteeChip icon={<Clock className="w-3.5 h-3.5" />}       label="Validity Assured" />
      </div>

      {/* Booking guarantee */}
      <AccordionItem icon={<Ticket className="w-4 h-4" />} title="Ticket Booking Guarantee" defaultOpen>
        <p className="text-sm text-gray-600 mb-3">
          If you cannot use your attraction ticket due to a fault by Werest, and the issue cannot be resolved within 15 minutes of reporting, you may purchase tickets directly at the attraction. We will:
        </p>
        <BulletList items={[
          'Refund the full original ticket cost',
          'Cover the price difference if you paid more at the gate',
          'Issue an additional ฿50 credit for the inconvenience',
          'Process the refund within 1 working day of your report',
        ]} />
      </AccordionItem>

      {/* Accurate descriptions */}
      <AccordionItem icon={<CheckCircle className="w-4 h-4" />} title="Accurate Descriptions & Information">
        <p className="text-sm text-gray-600 mb-3">
          All attraction descriptions, prices, opening hours, and eligibility requirements listed on Werest are verified and kept up to date by our local content team.
        </p>
        <BulletList items={[
          'Admission prices reflect current attraction rates at time of purchase',
          'Age and eligibility requirements (children/senior/family rates) are displayed accurately',
          'Opening hours are updated when attractions announce changes',
          'If an attraction is unexpectedly closed on your visit day, full refund within 24 hours',
        ]} />
      </AccordionItem>

      {/* Wrong ticket cancellation */}
      <AccordionItem icon={<RefreshCw className="w-4 h-4" />} title="Wrong Ticket Cancellation">
        <p className="text-sm text-gray-600 mb-3">
          If you booked the wrong ticket type (e.g., adult instead of child ticket), Werest will assist with cancellation and rebooking, subject to the following:
        </p>
        <BulletList items={[
          'Request submitted before the attraction entry date',
          'The original ticket must be unused',
          'The correct ticket type must be rebooked with Werest at the same time',
          'Werest bears any refund loss or processing fees caused by the error',
        ]} />
      </AccordionItem>

      {/* Validity */}
      <AccordionItem icon={<Clock className="w-4 h-4" />} title="Ticket Validity Guarantee">
        <p className="text-sm text-gray-600 mb-3">
          All e-tickets and QR codes issued through Werest are guaranteed to be valid and scannable on your visit date.
        </p>
        <BulletList items={[
          'Tickets delivered instantly by email and SMS after payment',
          'E-tickets include QR codes valid for mobile scanning at attraction entrances',
          'If a ticket is rejected at the gate due to our error, we arrange immediate replacement or full refund',
          'Tickets marked "Open Date" remain valid for the stated validity window',
        ]} />
      </AccordionItem>

      {/* Special circumstances */}
      <AccordionItem icon={<Heart className="w-4 h-4" />} title="Special Circumstances Cancellation">
        <p className="text-sm text-gray-600 mb-3">
          Attraction tickets booked through Werest are covered by our special circumstances cancellation policy. Contact us before your visit date if you are unable to attend due to hospitalization, fracture, pregnancy complications, or bereavement.
        </p>
        <BulletList items={[
          'Supporting documentation required within 7 days of the event',
          'Unused tickets refunded in full where documentation is verified',
          'Priority rebooking offered for popular attractions',
        ]} />
      </AccordionItem>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const tabContent: Record<TabId, React.ReactNode> = {
    general:     <GeneralTab     />,
    tours:       <ToursTab       />,
    transfers:   <TransfersTab   />,
    attractions: <AttractionsTab />,
  };

  return (
    <>
      <Navbar transparent />
      <div className="pt-16 min-h-screen bg-[#f5f5f5]">

        {/* ── Hero banner ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#0a1850] via-[#1a2f9e] to-[#2534ff] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Customer Service Guarantee</h1>
                <p className="text-blue-200 text-sm sm:text-base max-w-2xl">
                  Werest is committed to transparent, reliable service for every booking. Our guarantees are designed to give you full peace of mind before, during, and after your trip in Thailand.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  {[
                    { icon: <Clock className="w-3.5 h-3.5" />,   label: '24/7 Support'         },
                    { icon: <Shield className="w-3.5 h-3.5" />,  label: 'Booking Protected'    },
                    { icon: <Zap className="w-3.5 h-3.5" />,     label: 'Instant Confirmation' },
                    { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Free Cancellation'  },
                  ].map((chip, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-semibold">
                      {chip.icon} {chip.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#2534ff] text-[#2534ff]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'general' ? 'General' :
                     tab.id === 'tours'   ? 'Tours'   :
                     tab.id === 'transfers' ? 'Transfers' : 'Tickets'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">

            {/* Left: accordion content */}
            <div>{tabContent[activeTab]}</div>

            {/* Right: sticky contact panel */}
            <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28">
              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                <h3 className="font-bold text-gray-900 mb-4">Need help now?</h3>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                    className="flex items-center gap-3 w-full bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm px-4 py-3 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <p className="font-bold">WhatsApp</p>
                      <p className="text-xs font-normal text-green-600">Typical reply: &lt; 5 minutes</p>
                    </div>
                  </a>
                  <a
                    href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                    className="flex items-center gap-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-3 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <p className="font-bold">Call Us</p>
                      <p className="text-xs font-normal text-blue-600">08:00–22:00 ICT, daily</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Quick links</h3>
                <div className="space-y-1">
                  {[
                    { label: 'View my bookings', href: '/account?tab=all-bookings' },
                    { label: 'Track my transfer', href: '/tracking' },
                    { label: 'Cancellation policy', href: '/customer-service#cancellation' },
                    { label: 'Service standards', href: '/service' },
                    { label: 'Werest Rewards', href: '/account/rewards' },
                  ].map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2534ff] py-1.5 transition-colors group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#2534ff]" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Trust footer banner ───────────────────────────────────────── */}
        <div className="bg-[#2534ff] mt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
              {[
                { icon: '🛡️', value: '100%', label: 'Booking Protected' },
                { icon: '⏱️', value: '24/7',  label: 'Customer Support' },
                { icon: '✅', value: '3-Day',  label: 'Refund Guarantee' },
                { icon: '🌟', value: '4.9★',   label: 'Average Rating'   },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-2xl font-extrabold">{stat.value}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
