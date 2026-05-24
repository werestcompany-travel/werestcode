import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | Werest Travel',
  description:
    'Contact Werest Travel for booking help, partnership enquiries, or custom travel planning in Thailand. Reply within 24 hours.',
  alternates: { canonical: 'https://www.werest.com/contact' },
}

const CONTACT_METHODS = [
  {
    icon: '📧',
    label: 'Email',
    value: 'werestcompany@gmail.com',
    href: 'mailto:werestcompany@gmail.com',
  },
  {
    icon: '💬',
    label: 'WhatsApp',
    value: '+66 62-187-1392',
    href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`,
  },
  {
    icon: '🕐',
    label: 'Operating Hours',
    value: 'Daily 6:00 AM – 11:00 PM (ICT)',
    href: null,
  },
  {
    icon: '📍',
    label: 'Based in',
    value: 'Bangkok, Thailand — serving all of Thailand',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#2534ff] uppercase tracking-wider mb-2">Support</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 text-[15px]">
              Questions, booking help, or partnership enquiries — we&apos;re here to help.
            </p>
            <div className="mt-6 h-px bg-gray-200" />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: contact info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>

              <div className="space-y-4 mb-8">
                {CONTACT_METHODS.map(m => (
                  <div key={m.label} className="flex gap-4 items-start bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{m.label}</p>
                      {m.href ? (
                        <a href={m.href} className="text-sm font-medium text-[#2534ff] hover:underline">
                          {m.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">{m.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
                <strong>Tip:</strong> For urgent enquiries, WhatsApp is the fastest way to reach us.
              </div>

              <p className="text-sm text-gray-600">
                Planning a custom trip?{' '}
                <Link href="/inquiry" className="text-[#2534ff] font-medium hover:underline">
                  Submit a travel enquiry →
                </Link>
              </p>
            </div>

            {/* Right: contact form */}
            <ContactForm />

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
