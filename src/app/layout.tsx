import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Werest Travel – Premium Private Transfers in Thailand',
    template: '%s | Werest Travel',
  },
  description:
    'Book premium private transfers, tours, and attraction tickets across Thailand. Fast, reliable, and comfortable.',
  keywords: ['Thailand transfer', 'private car hire', 'Bangkok transfer', 'Phuket transfer', 'Thailand taxi'],
  openGraph: {
    title: 'Werest Travel',
    description: 'Your premium travel partner in Thailand',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  );
}
