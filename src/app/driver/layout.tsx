import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Werest Driver',
  description: 'Werest driver companion app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'W-Driver',
  },
};

export const viewport: Viewport = {
  themeColor: '#2534ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {children}
    </div>
  );
}
