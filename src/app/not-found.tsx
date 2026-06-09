import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="text-8xl font-extrabold text-[#2534ff] opacity-20 mb-4">404</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 text-sm mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="bg-[#2534ff] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a26cc] transition-colors">
              Back to Home
            </Link>
            <Link href="/airport-transfers" className="border border-[#2534ff] text-[#2534ff] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Book a Transfer
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-8">
            Need help?{' '}
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
              className="text-[#2534ff] hover:underline">
              WhatsApp us
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
