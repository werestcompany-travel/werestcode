import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Cancellation Policy | Werest Travel',
  description:
    'Werest Travel cancellation and refund policy. Free cancellation up to 24 hours before your transfer or tour.',
  alternates: { canonical: 'https://www.werest.com/cancellation-policy' },
}

// ─── Section helper ────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-[#2534ff] mb-4">{title}</h2>
      <div className="space-y-4 text-gray-700 leading-relaxed text-[15px]">{children}</div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CancellationPolicyPage() {
  return (
    <>
      <Navbar transparent />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Cancellation Policy</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><strong className="text-gray-700">Effective date:</strong> January 1, 2025</span>
              <span><strong className="text-gray-700">Last updated:</strong> May 2026</span>
            </div>
            <div className="mt-6 h-px bg-gray-200" />
          </div>

          {/* Intro */}
          <p className="text-gray-700 leading-relaxed text-[15px] mb-10">
            We understand that travel plans can change. This policy explains what happens if you need to
            cancel or reschedule a booking made through Werest Travel. These terms apply to all private
            transfers and tour bookings.
          </p>

          {/* 1. Free Cancellation Window */}
          <Section id="free-cancellation" title="1. Free Cancellation Window">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-bold text-green-800 text-base mb-1">✓ Cancel up to 24 hours before — full refund</p>
              <p className="text-green-700 text-sm">
                No questions asked. Cancellations made at least 24 hours before your scheduled pickup time
                or tour start time are eligible for a full refund. For online-paid bookings the refund is
                processed within 5–10 business days to your original payment method.
              </p>
            </div>
          </Section>

          {/* 2. Late Cancellation */}
          <Section id="late-cancellation" title="2. Late Cancellation (Within 24 Hours)">
            <p>
              Cancellations made <strong>within 24 hours</strong> of the scheduled service are subject to
              the following:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Online-paid bookings:</strong> a 50% cancellation fee applies. The remaining 50%
                will be refunded to your original payment method within 5–10 business days.
              </li>
              <li>
                <strong>Cash-pay bookings (pay on the day):</strong> the driver may charge a waiting time
                fee for arriving at the pickup location. No upfront charge applies.
              </li>
            </ul>
          </Section>

          {/* 3. No-show */}
          <Section id="no-show" title="3. No-Show Policy">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="font-bold text-red-800 mb-1">No-shows are treated as completed bookings</p>
              <p className="text-red-700 text-sm">
                If you do not show up at the agreed pickup location within 30 minutes of your scheduled
                time and have not contacted us or your driver, the booking is considered completed and no
                refund will be issued.
              </p>
            </div>
          </Section>

          {/* 4. How to Cancel */}
          <Section id="how-to-cancel" title="4. How to Cancel">
            <p>You can cancel your booking through any of the following methods:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Online:</strong> visit the{' '}
                <Link href="/tracking" className="text-[#2534ff] hover:underline">tracking page</Link>
                , enter your booking reference and email, then select &ldquo;Cancel Booking&rdquo;.
              </li>
              <li>
                <strong>WhatsApp:</strong> message us directly with your booking reference number and we
                will process the cancellation immediately.
              </li>
              <li>
                <strong>Email:</strong> send your cancellation request to{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                  werestcompany@gmail.com
                </a>{' '}
                including your booking reference.
              </li>
            </ul>
            <p className="text-sm text-gray-500">
              Please have your <strong>booking reference number</strong> ready — it is included in your
              confirmation email.
            </p>
          </Section>

          {/* 5. Rescheduling */}
          <Section id="rescheduling" title="5. Rescheduling">
            <p>
              Need to change the date or time of your booking? No problem:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Free reschedule:</strong> available up to 24 hours before your scheduled departure.
              </li>
              <li>
                <strong>New date subject to availability:</strong> we will confirm the new slot as quickly
                as possible, usually within a few hours.
              </li>
              <li>
                <strong>Within 24 hours:</strong> rescheduling is subject to driver and vehicle availability.
                Contact us directly for urgent changes.
              </li>
            </ul>
          </Section>

          {/* 6. Force Majeure */}
          <Section id="force-majeure" title="6. Force Majeure">
            <p>
              In the event of circumstances beyond reasonable control — including but not limited to natural
              disasters, government travel bans, official lockdowns, or airline cancellations affecting your
              inbound flight — Werest Travel will offer:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>A <strong>full refund</strong> to your original payment method, or</li>
              <li>A <strong>free reschedule</strong> to a date of your choice (subject to availability).</li>
            </ul>
            <p>
              Please contact us as soon as you become aware of a force majeure event affecting your
              booking. Documentation may be required.
            </p>
          </Section>

          {/* Contact footer */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm mt-4">
            <p className="font-bold text-gray-900 mb-1">Questions about this policy?</p>
            <p className="text-gray-600">
              Contact us at{' '}
              <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline font-medium">
                werestcompany@gmail.com
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" className="text-[#2534ff] hover:underline font-medium">
                contact page
              </Link>
              . We aim to respond within 24 hours.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
