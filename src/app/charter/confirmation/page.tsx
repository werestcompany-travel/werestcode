'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, MessageCircle, Home, Car } from 'lucide-react';

const WHATSAPP_NUMBER = '66818886888'; // Replace with actual Werest WhatsApp number

function CharterConfirmationInner() {
  const params = useSearchParams();
  const ref = params.get('ref') ?? '';

  const whatsappMsg = encodeURIComponent(
    `Hi Werest! I just made a charter booking. My booking reference is ${ref}. Please confirm the details. Thank you!`
  );

  return (
    <>
      <Navbar transparent />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">

          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Charter Booking Confirmed!</h1>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Thank you for choosing Werest. Your booking has been received and our team will be in touch shortly.
            </p>
          </div>

          {/* Booking ref card */}
          <div className="bg-gradient-to-br from-[#1a2aee] to-[#2534ff] text-white rounded-2xl p-6 text-center mb-6 shadow-lg">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Booking Reference</p>
            <p className="text-3xl font-black tracking-widest font-mono">{ref || '—'}</p>
            <p className="text-blue-200 text-xs mt-3">Keep this reference handy</p>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-blue-900 mb-1">What happens next?</h2>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Our team will contact you <strong>within 30 minutes</strong> via WhatsApp to confirm your driver assignment,
                  vehicle details, and any special requests. Please keep your phone available.
                </p>
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Your booking includes</h3>
            <ul className="space-y-2">
              {[
                'Professional licensed driver',
                'Air-conditioned vehicle',
                'Door-to-door service',
                'Bottled water onboard',
                'Real-time WhatsApp updates',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fba57] text-white font-bold py-4 rounded-xl text-sm transition-colors shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Werest on WhatsApp
            </a>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Questions? Email us at{' '}
            <a href="mailto:info@gowerest.com" className="text-brand-600 hover:underline">
              info@gowerest.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CharterConfirmationPage() {
  return (
    <Suspense>
      <CharterConfirmationInner />
    </Suspense>
  );
}
