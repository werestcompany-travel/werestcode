import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service | Werest Travel',
  description:
    'Read the Terms of Service for Werest Travel — covering bookings, payments, cancellations, and your responsibilities when using our travel services in Thailand.',
  alternates: { canonical: 'https://www.werest.com/terms-of-service' },
}

// ─── Section heading helper ────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-[#2534ff] mb-4">{title}</h2>
      <div className="space-y-4 text-gray-700 leading-relaxed text-[15px]">{children}</div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><strong className="text-gray-700">Effective date:</strong> January 1, 2025</span>
              <span><strong className="text-gray-700">Last updated:</strong> May 2026</span>
            </div>
            <div className="mt-6 h-px bg-gray-200" />
          </div>

          {/* Intro */}
          <p className="text-gray-700 leading-relaxed text-[15px] mb-10">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Werest Travel website at{' '}
            <strong>werest.com</strong> and all travel services offered through it. By accessing our website
            or making a booking, you agree to be bound by these Terms. Please read them carefully before
            proceeding.
          </p>

          {/* 1. Acceptance */}
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By using our website or booking any service, you confirm that you are at least 18 years of
              age (or have parental consent), have the legal capacity to enter into a binding contract,
              and agree to these Terms and our{' '}
              <a href="/privacy-policy" className="text-[#2534ff] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
            <p>
              We reserve the right to update these Terms at any time. The revised version will be posted
              on this page with an updated date. Continued use of our services following any change
              constitutes acceptance of the new Terms.
            </p>
          </Section>

          {/* 2. Services */}
          <Section id="services" title="2. Services Offered">
            <p>Werest Travel provides the following travel services in Thailand:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Private transfers:</strong> point-to-point airport and inter-city transfers using
                private vehicles with professional drivers.
              </li>
              <li>
                <strong>Attraction tickets:</strong> entry tickets and packaged experiences for theme
                parks, cultural sites, water parks, and other attractions throughout Thailand.
              </li>
              <li>
                <strong>Guided tours:</strong> day trips, cultural experiences, food tours, nature
                excursions, and adventure activities across Thailand.
              </li>
            </ul>
            <p>
              All services are operated by Werest Travel or by carefully selected local partners.
              Availability, pricing, and itineraries are subject to change without prior notice.
            </p>
          </Section>

          {/* 3. Booking & Confirmation */}
          <Section id="booking" title="3. Booking and Confirmation">
            <p>
              A booking is initiated when you complete the booking form on our website and submit payment
              (or select &ldquo;Pay on arrival&rdquo; where available). You will receive a booking confirmation
              email and, where applicable, a WhatsApp notification within a short period of your booking.
            </p>
            <p>
              A booking is only confirmed once you receive a written confirmation from Werest Travel
              containing your booking reference number. We reserve the right to decline or cancel a
              booking if a service is unavailable, if there is a pricing error, or if we suspect
              fraudulent activity.
            </p>
            <p>
              It is your responsibility to ensure that all booking details — including names, dates,
              pickup locations, and contact information — are accurate at the time of booking. We cannot
              be held responsible for errors resulting from incorrect information provided by you.
            </p>
          </Section>

          {/* 4. Payment */}
          <Section id="payment" title="4. Payment Terms">
            <p>We accept the following payment methods:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Online payment:</strong> credit and debit cards processed securely via Payso. Full
                payment is required at the time of booking unless otherwise stated.
              </li>
              <li>
                <strong>Cash on arrival:</strong> available for selected services and clearly indicated
                during checkout. Cash payment is due in Thai Baht (THB) at the start of the service.
              </li>
              <li>
                <strong>Bank transfer:</strong> available on request for group bookings. Contact us at{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                  werestcompany@gmail.com
                </a>{' '}
                for details.
              </li>
            </ul>
            <p>
              All prices displayed on our website are in Thai Baht (THB) and include applicable taxes
              unless stated otherwise. We are not responsible for foreign transaction fees or currency
              conversion charges applied by your bank or card issuer.
            </p>
          </Section>

          {/* 5. Cancellation & Refund */}
          <Section id="cancellation" title="5. Cancellation and Refund Policy">
            <p>
              Our cancellation policy varies depending on how far in advance you cancel before the
              scheduled service date and time:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Notice period</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Refund amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-gray-700">48 hours or more before service</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">Full refund (100%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700">24 – 48 hours before service</td>
                    <td className="px-4 py-3 text-amber-700 font-semibold">Partial refund (50%)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700">Less than 24 hours before service</td>
                    <td className="px-4 py-3 text-red-700 font-semibold">No refund</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700">No-show</td>
                    <td className="px-4 py-3 text-red-700 font-semibold">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Cancellation notice must be submitted in writing by emailing{' '}
              <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                werestcompany@gmail.com
              </a>{' '}
              with your booking reference number. The cancellation time is determined by when we receive
              your written notice, not when it is sent.
            </p>
            <p>
              Approved refunds will be processed within 7–14 business days to the original payment
              method. Processing times may vary depending on your bank or card issuer.
            </p>
            <p>
              Some promotional bookings, last-minute deals, or non-refundable rates may have different
              cancellation terms, which will be clearly stated at the time of booking.
            </p>
          </Section>

          {/* 6. User Responsibilities */}
          <Section id="responsibilities" title="6. User Responsibilities">
            <p>When using our services, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Provide accurate and complete information during the booking process, including correct
                names, dates, contact details, and special requirements.
              </li>
              <li>
                Arrive at the designated pickup location on time. For airport transfers, we recommend
                being ready at least 10 minutes before the scheduled pickup time.
              </li>
              <li>
                Behave respectfully towards drivers, guides, and other participants throughout the
                service.
              </li>
              <li>
                Comply with local laws, cultural norms, and dress codes — particularly when visiting
                temples and religious sites in Thailand. Modest clothing that covers shoulders and knees
                is required at most Buddhist temples.
              </li>
              <li>
                Follow all safety instructions provided by drivers, guides, and attraction staff.
              </li>
              <li>
                Ensure all members of your group (including minors) are physically fit for the activities
                booked and meet any age or health requirements specified by the attraction or tour
                operator.
              </li>
              <li>
                Not engage in any behaviour that endangers yourself, others, or the property of Werest
                Travel or its partners.
              </li>
            </ul>
          </Section>

          {/* 7. Liability */}
          <Section id="liability" title="7. Limitation of Liability">
            <p>
              Werest Travel acts as a travel services provider and, in some cases, as an agent for local
              operators. To the fullest extent permitted by applicable Thai law, we exclude liability for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Weather conditions:</strong> delays, changes, or cancellations caused by severe
                weather, natural disasters, or other force majeure events beyond our control.
              </li>
              <li>
                <strong>Traffic and road conditions:</strong> delays caused by traffic congestion, road
                closures, or other transport disruptions.
              </li>
              <li>
                <strong>Attraction closures:</strong> temporary or permanent closures of attractions,
                venues, or sites for maintenance, public holidays, government orders, or other reasons
                outside our control.
              </li>
              <li>
                <strong>Third-party acts:</strong> actions or omissions of third-party service providers,
                including local tour operators, attraction management, and other subcontractors.
              </li>
              <li>
                <strong>Personal injury or loss:</strong> personal injury, illness, death, loss, or
                damage to property arising from participation in activities where inherent risk is
                involved, unless directly caused by our gross negligence.
              </li>
            </ul>
            <p>
              Our total liability to you for any claim arising from or related to your use of our
              services shall not exceed the total amount paid by you for the specific booking giving rise
              to the claim.
            </p>
            <p>
              We strongly recommend that all travellers purchase comprehensive travel insurance before
              their trip, including coverage for cancellation, medical emergencies, and personal
              belongings.
            </p>
          </Section>

          {/* 8. Intellectual Property */}
          <Section id="ip" title="8. Intellectual Property">
            <p>
              All content on the Werest Travel website — including but not limited to text, photographs,
              graphics, logos, icons, and software — is the property of Werest Travel or its content
              licensors and is protected by Thai and international copyright law.
            </p>
            <p>
              You may not reproduce, distribute, modify, publicly display, or create derivative works of
              any content from our website without our prior written consent. Personal, non-commercial use
              for the purpose of viewing and booking services is permitted.
            </p>
          </Section>

          {/* 9. Third-Party Links */}
          <Section id="third-party-links" title="9. Third-Party Links and Services">
            <p>
              Our website may contain links to third-party websites or services (such as Google Maps,
              payment providers, and attraction operators). These links are provided for your convenience
              only. We have no control over, and assume no responsibility for, the content, privacy
              policies, or practices of any third-party sites.
            </p>
          </Section>

          {/* 10. Governing Law */}
          <Section id="governing-law" title="10. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Kingdom
              of Thailand. Any disputes arising from or in connection with these Terms or your use of our
              services shall be subject to the exclusive jurisdiction of the competent courts of Thailand.
            </p>
          </Section>

          {/* 11. Dispute Resolution */}
          <Section id="disputes" title="11. Dispute Resolution">
            <p>
              If you have a complaint or dispute regarding our services, we encourage you to contact us
              first so we can attempt to resolve the matter amicably:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                Contact our customer support team at{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                  werestcompany@gmail.com
                </a>{' '}
                with full details of your complaint and your booking reference.
              </li>
              <li>
                We will acknowledge your complaint within 3 business days and aim to provide a full
                response within 14 business days.
              </li>
              <li>
                If the matter cannot be resolved through direct negotiation, either party may refer the
                dispute to mediation or the jurisdiction of the Thai courts as described in Section 10.
              </li>
            </ol>
          </Section>

          {/* 12. Severability */}
          <Section id="severability" title="12. Severability">
            <p>
              If any provision of these Terms is found to be unlawful, void, or unenforceable, that
              provision will be deemed severable and will not affect the validity and enforceability of
              the remaining provisions.
            </p>
          </Section>

          {/* 13. Contact */}
          <Section id="contact" title="13. Contact Us">
            <p>For any questions regarding these Terms of Service, please contact:</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm">
              <p className="font-bold text-gray-900 mb-1">Werest Travel — Legal</p>
              <p>
                Email:{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline font-medium">
                  werestcompany@gmail.com
                </a>
              </p>
              <p className="text-gray-500 mt-2 text-xs">We aim to respond within 5 business days.</p>
            </div>
          </Section>

        </div>
      </main>

      <Footer />
    </>
  )
}
