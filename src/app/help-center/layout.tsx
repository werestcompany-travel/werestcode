import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | Werest Travel',
  description:
    'Find answers to common questions about private transfers, airport pickups, tours, payments, cancellations, and more. Search our help articles or contact our support team.',
  alternates: { canonical: 'https://www.werest.com/help-center' },
  openGraph: {
    title: 'Help Center | Werest Travel',
    description: 'Find answers to your questions about Werest Travel services in Thailand.',
    url: 'https://www.werest.com/help-center',
    siteName: 'Werest Travel',
    locale: 'en_US',
    type: 'website',
  },
}

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children
}
