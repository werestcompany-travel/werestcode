import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Werest Travel',
  description:
    'Get in touch with Werest Travel via WhatsApp, email, or LINE. Our support team is available 7:00–22:00 ICT, 7 days a week.',
  alternates: { canonical: 'https://www.werest.com/contact' },
  openGraph: {
    title: 'Contact Us | Werest Travel',
    description: 'Reach Werest Travel support via WhatsApp, email, or LINE — 7 days a week.',
    url: 'https://www.werest.com/contact',
    siteName: 'Werest Travel',
    locale: 'en_US',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
