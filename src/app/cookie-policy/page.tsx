import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Cookie Policy | Werest Travel',
  description:
    'Werest Travel cookie policy — how we use cookies on werest.com and how to manage your preferences.',
  alternates: { canonical: 'https://www.werest.com/cookie-policy' },
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

// ─── Cookie type table ─────────────────────────────────────────────────────────

const COOKIE_TYPES = [
  {
    name: 'Essential Cookies',
    badge: 'bg-gray-200 text-gray-700',
    canDisable: false,
    examples: 'Session token, cookie-consent preference',
    purpose:
      'Required for the website to function. These include your login session and your cookie preference selection. Without these cookies, core features such as account login and booking submission will not work.',
  },
  {
    name: 'Analytics Cookies',
    badge: 'bg-blue-100 text-blue-700',
    canDisable: true,
    examples: 'Google Analytics (_ga, _gid, _gat)',
    purpose:
      'We use Google Analytics 4 (GA4) to understand how visitors use our website — which pages are most popular, how long sessions last, and what devices our visitors use. All data is anonymised before being sent to Google. You may opt out via your browser settings or the Google Analytics opt-out browser add-on.',
  },
  {
    name: 'Preference Cookies',
    badge: 'bg-purple-100 text-purple-700',
    canDisable: true,
    examples: 'Currency selection, language preference',
    purpose:
      'These cookies remember choices you have made on our website — such as your preferred currency or language — so you do not have to set them again on your next visit.',
  },
]

const THIRD_PARTY = [
  {
    provider: 'Google Maps',
    purpose: 'Address autocomplete and interactive maps on booking pages',
    policy: 'https://policies.google.com/privacy',
  },
  {
    provider: 'Vercel Analytics',
    purpose: 'Edge network performance monitoring and real user metrics',
    policy: 'https://vercel.com/legal/privacy-policy',
  },
  {
    provider: 'Payso',
    purpose: 'Secure payment processing; sets session cookies during checkout',
    policy: 'https://www.payso.me/privacy-policy',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Legal</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Cookie Policy</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span><strong className="text-gray-700">Effective date:</strong> January 1, 2025</span>
              <span><strong className="text-gray-700">Last updated:</strong> May 2026</span>
            </div>
            <div className="mt-6 h-px bg-gray-200" />
          </div>

          {/* 1. What Are Cookies */}
          <Section id="what-are-cookies" title="1. What Are Cookies?">
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, or phone)
              when you visit a website. They allow the website to recognise your device on subsequent
              visits and remember certain information — such as your preferences or login status.
            </p>
            <p>
              Cookies are widely used across the internet to make websites work more efficiently and to
              provide useful information to website owners. This policy explains how Werest Travel uses
              cookies on <strong>werest.com</strong>.
            </p>
          </Section>

          {/* 2. Types of Cookies */}
          <Section id="types-of-cookies" title="2. Types of Cookies We Use">
            <p>We use three categories of cookies:</p>
            <div className="space-y-4">
              {COOKIE_TYPES.map(c => (
                <div key={c.name} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${c.badge}`}>
                      {c.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {c.canDisable ? '— can be disabled' : '— cannot be disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong className="text-gray-700">Examples:</strong> {c.examples}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.purpose}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 3. Third-Party Cookies */}
          <Section id="third-party-cookies" title="3. Third-Party Cookies">
            <p>
              Some features on our website are provided by third parties who may set their own cookies.
              We do not control these cookies. Refer to each provider&apos;s privacy policy for details.
            </p>
            <div className="space-y-3">
              {THIRD_PARTY.map(t => (
                <div key={t.provider} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.provider}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{t.purpose}</p>
                    </div>
                    <a
                      href={t.policy}
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
          </Section>

          {/* 4. How to Manage Cookies */}
          <Section id="manage-cookies" title="4. How to Manage Cookies">
            <p>
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Browser settings:</strong> most browsers allow you to refuse or delete cookies
                through their settings or preferences menu. The steps vary by browser — search for
                &ldquo;cookies&rdquo; in your browser&apos;s help section for instructions.
              </li>
              <li>
                <strong>Google Analytics opt-out:</strong> install the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2534ff] hover:underline"
                >
                  Google Analytics opt-out browser add-on
                </a>{' '}
                to prevent your data from being used by GA4.
              </li>
              <li>
                <strong>Preference cookies:</strong> you can reset your currency and language preferences
                at any time using the settings on our website.
              </li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Please note:</strong> disabling essential cookies may prevent you from logging in or
              completing a booking. We recommend keeping essential cookies enabled.
            </div>
          </Section>

          {/* 5. Updates */}
          <Section id="updates" title="5. Updates to This Policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in the cookies we use
              or applicable regulations. The &ldquo;Last updated&rdquo; date at the top of this page shows when the
              policy was most recently revised.
            </p>
            <p>
              We encourage you to check this page periodically. Continued use of our website after any
              changes constitutes your acceptance of the updated policy.
            </p>
          </Section>

          {/* Contact footer */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm mt-4">
            <p className="font-bold text-gray-900 mb-1">Questions about cookies?</p>
            <p className="text-gray-600">
              Contact us at{' '}
              <a href="mailto:werestcompany@gmail.com" className="text-[#2534ff] hover:underline font-medium">
                werestcompany@gmail.com
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" className="text-[#2534ff] hover:underline font-medium">
                contact page
              </Link>
              . You may also review our{' '}
              <Link href="/privacy-policy" className="text-[#2534ff] hover:underline font-medium">
                Privacy Policy
              </Link>{' '}
              for more information on how we handle your personal data.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
