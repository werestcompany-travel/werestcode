import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | Werest Travel',
  description:
    'Learn how Werest Travel collects, uses, and protects your personal data in accordance with the Thailand Personal Data Protection Act (PDPA) B.E. 2562.',
  alternates: { canonical: 'https://www.werest.com/privacy-policy' },
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><strong className="text-gray-700">Effective date:</strong> January 1, 2025</span>
              <span><strong className="text-gray-700">Last updated:</strong> May 2026</span>
            </div>
            <div className="mt-6 h-px bg-gray-200" />
          </div>

          {/* Intro */}
          <p className="text-gray-700 leading-relaxed text-[15px] mb-10">
            Werest Travel (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal data. This
            Privacy Policy explains how we collect, use, share, and protect information about you when you use
            our website at <strong>werest.com</strong> and related services. By using our services you agree to
            the practices described in this policy.
          </p>

          {/* 1. Data Controller */}
          <Section id="data-controller" title="1. Data Controller">
            <p>
              The data controller responsible for your personal data is:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm">
              <p className="font-bold text-gray-900 mb-1">Werest Travel</p>
              <p>Thailand</p>
              <p>
                Email:{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                  werestcompany@gmail.com
                </a>
              </p>
            </div>
            <p>
              If you have any questions about how we handle your personal data, or wish to exercise any of your
              rights, please contact us at the email address above.
            </p>
          </Section>

          {/* 2. Data We Collect */}
          <Section id="data-collected" title="2. Personal Data We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Identity data:</strong> first name, last name, and nationality.
              </li>
              <li>
                <strong>Contact data:</strong> email address and phone number (including WhatsApp number).
              </li>
              <li>
                <strong>Booking data:</strong> travel dates, number of passengers, pickup and drop-off
                locations, tour preferences, and special requests.
              </li>
              <li>
                <strong>Payment data:</strong> payment method selection and transaction reference numbers.
                Full card details are processed exclusively by our third-party payment provider (Payso) and
                are never stored on our servers.
              </li>
              <li>
                <strong>Location data:</strong> approximate location when you use the address search or
                Google Maps integration to specify pickup points.
              </li>
              <li>
                <strong>Account data:</strong> hashed password and loyalty point balance if you create a
                registered account.
              </li>
              <li>
                <strong>Usage data:</strong> pages visited, device type, browser, IP address, and referring
                URL collected via analytics tools.
              </li>
              <li>
                <strong>Communications:</strong> content of messages you send to us via email or WhatsApp.
              </li>
            </ul>
          </Section>

          {/* 3. How We Use Your Data */}
          <Section id="data-use" title="3. How We Use Your Data">
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Booking processing:</strong> to confirm, manage, and fulfil your bookings for
                private transfers, tours, and attraction tickets.
              </li>
              <li>
                <strong>Email confirmations:</strong> to send booking confirmations, itineraries, and
                e-tickets via Resend (our transactional email provider).
              </li>
              <li>
                <strong>WhatsApp notifications:</strong> to send real-time booking updates, driver
                assignment notices, and pre-trip reminders via the WhatsApp Business API (Meta).
              </li>
              <li>
                <strong>Customer support:</strong> to respond to your queries and resolve any issues with
                your booking.
              </li>
              <li>
                <strong>Payment processing:</strong> to initiate and verify payments through Payso.
              </li>
              <li>
                <strong>Analytics:</strong> to understand how visitors use our website and improve our
                services using Google Analytics 4 (GA4).
              </li>
              <li>
                <strong>Fraud prevention:</strong> to detect and prevent fraudulent transactions and abuse
                of our platform.
              </li>
              <li>
                <strong>Legal compliance:</strong> to comply with applicable Thai law and respond to
                lawful requests from government authorities.
              </li>
            </ul>
            <p>
              The legal bases for processing are: performance of a contract (bookings), legitimate
              interests (analytics, fraud prevention), consent (marketing communications), and legal
              obligation (tax and regulatory requirements).
            </p>
          </Section>

          {/* 4. Data Retention */}
          <Section id="data-retention" title="4. Data Retention">
            <p>We retain your personal data only for as long as necessary for the purposes described above:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Booking records:</strong> 7 years from the date of the booking to satisfy Thai
                accounting and tax obligations.
              </li>
              <li>
                <strong>Account data:</strong> for the lifetime of your account, plus 12 months after
                account deletion.
              </li>
              <li>
                <strong>Marketing consents:</strong> until you withdraw your consent or 3 years from last
                interaction, whichever is earlier.
              </li>
              <li>
                <strong>Server logs and analytics data:</strong> up to 26 months in aggregated form.
              </li>
              <li>
                <strong>Customer support correspondence:</strong> 2 years from the date of resolution.
              </li>
            </ul>
          </Section>

          {/* 5. Third-Party Services */}
          <Section id="third-parties" title="5. Third-Party Services">
            <p>
              We share your data with trusted third-party service providers only to the extent necessary
              to operate our services:
            </p>
            <div className="space-y-4">
              {[
                {
                  name: 'Payso',
                  use: 'Payment processing',
                  data: 'Booking amount, payment method, billing details',
                  policy: 'https://www.payso.me/privacy-policy',
                },
                {
                  name: 'Google Maps Platform',
                  use: 'Address autocomplete and map display',
                  data: 'Location search queries, approximate coordinates',
                  policy: 'https://policies.google.com/privacy',
                },
                {
                  name: 'Resend',
                  use: 'Transactional email delivery',
                  data: 'Name, email address, booking details',
                  policy: 'https://resend.com/legal/privacy-policy',
                },
                {
                  name: 'Meta (WhatsApp Business API)',
                  use: 'WhatsApp notifications',
                  data: 'Phone number, booking reference, message content',
                  policy: 'https://www.whatsapp.com/legal/privacy-policy',
                },
                {
                  name: 'Google Analytics 4 (GA4)',
                  use: 'Website analytics',
                  data: 'Anonymised usage data, IP address (truncated)',
                  policy: 'https://policies.google.com/privacy',
                },
                {
                  name: 'Vercel',
                  use: 'Website hosting and edge analytics',
                  data: 'Server request logs, deployment metadata',
                  policy: 'https://vercel.com/legal/privacy-policy',
                },
              ].map(({ name, use, data, policy }) => (
                <div key={name} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-sm text-gray-600 mt-0.5"><strong>Purpose:</strong> {use}</p>
                      <p className="text-sm text-gray-600"><strong>Data shared:</strong> {data}</p>
                    </div>
                    <a
                      href={policy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#2534ff] hover:underline shrink-0 mt-1"
                    >
                      Privacy policy &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p>
              We do not sell your personal data to any third party for marketing or advertising purposes.
            </p>
          </Section>

          {/* 6. Cookies */}
          <Section id="cookies" title="6. Cookies Policy">
            <p>
              Our website uses cookies — small text files stored on your device. We use two categories of
              cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Functional / essential cookies:</strong> required for the website to work
                correctly. These include session tokens for authenticated accounts and cookie-consent
                preferences. These cookies cannot be disabled.
              </li>
              <li>
                <strong>Analytics cookies (GA4):</strong> used to understand how visitors interact with
                our website. These cookies collect anonymised data such as pages viewed, session duration,
                and device type. You may opt out of analytics cookies at any time.
              </li>
            </ul>
            <p>
              You can manage or disable cookies through your browser settings. Disabling functional
              cookies may affect your ability to log in or complete bookings.
            </p>
          </Section>

          {/* 7. Your Rights (PDPA) */}
          <Section id="your-rights" title="7. Your Rights Under the Thailand PDPA">
            <p>
              Under the Personal Data Protection Act B.E. 2562 (PDPA), you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Right to be informed:</strong> to know how and why we process your personal data
                (fulfilled by this policy).
              </li>
              <li>
                <strong>Right of access:</strong> to obtain a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Right to rectification:</strong> to request correction of inaccurate or incomplete
                data.
              </li>
              <li>
                <strong>Right to erasure:</strong> to request deletion of your personal data where there
                is no overriding legal basis for retention.
              </li>
              <li>
                <strong>Right to restriction:</strong> to request that we restrict processing of your data
                in certain circumstances.
              </li>
              <li>
                <strong>Right to data portability:</strong> to receive your data in a machine-readable
                format where technically feasible.
              </li>
              <li>
                <strong>Right to object:</strong> to object to processing based on legitimate interests,
                including direct marketing.
              </li>
              <li>
                <strong>Right to withdraw consent:</strong> to withdraw consent at any time where
                processing is based on consent, without affecting prior processing.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please email us at{' '}
              <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline">
                werestcompany@gmail.com
              </a>
              . We will respond within 30 days. We may need to verify your identity before processing your
              request.
            </p>
          </Section>

          {/* 8. Data Security */}
          <Section id="security" title="8. Data Security">
            <p>
              We implement appropriate technical and organisational measures to protect your personal data
              against accidental loss, unauthorised access, alteration, or disclosure. These measures
              include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>TLS/SSL encryption for all data in transit.</li>
              <li>Encrypted storage of passwords using industry-standard hashing algorithms.</li>
              <li>Access controls ensuring only authorised personnel can access booking data.</li>
              <li>Regular security reviews of our systems and third-party integrations.</li>
            </ul>
            <p>
              Despite these measures, no internet transmission is 100% secure. In the event of a data
              breach that poses a risk to your rights, we will notify you and the relevant authorities as
              required by Thai law.
            </p>
          </Section>

          {/* 9. International Transfers */}
          <Section id="international-transfers" title="9. International Data Transfers">
            <p>
              Some of our third-party service providers (such as Vercel, Resend, and Google) may process
              your data outside Thailand. When this occurs, we rely on appropriate safeguards — such as
              standard contractual clauses or adequacy decisions — to ensure your data receives equivalent
              protection.
            </p>
          </Section>

          {/* 10. Children */}
          <Section id="children" title="10. Children's Privacy">
            <p>
              Our services are not directed to children under the age of 13. We do not knowingly collect
              personal data from children. If you believe a child has provided us with personal data,
              please contact us and we will delete it promptly.
            </p>
          </Section>

          {/* 11. Changes */}
          <Section id="changes" title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or
              applicable law. We will notify you of material changes by updating the &ldquo;Last updated&rdquo; date at
              the top of this page. We encourage you to review this policy periodically.
            </p>
          </Section>

          {/* 12. Contact */}
          <Section id="contact" title="12. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm">
              <p className="font-bold text-gray-900 mb-1">Werest Travel — Data Privacy</p>
              <p>
                Email:{' '}
                <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline font-medium">
                  werestcompany@gmail.com
                </a>
              </p>
              <p className="text-gray-500 mt-2 text-xs">We aim to respond within 30 calendar days.</p>
            </div>
          </Section>

        </div>
      </main>

      <Footer />
    </>
  )
}
