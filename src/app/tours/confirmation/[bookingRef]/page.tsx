import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, Calendar, Users, MapPin, ArrowRight, CalendarPlus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function TourConfirmationPage({ params }: { params: { bookingRef: string } }) {
  const booking = await prisma.tourBooking.findUnique({ where: { bookingRef: params.bookingRef } });
  if (!booking) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Tour Booked!</h1>
            <p className="text-gray-500 mt-2">We&apos;ll send your tour details to {booking.customerPhone} via WhatsApp.</p>
          </div>

          {/* Booking ref card */}
          <div className="bg-brand-700 text-white rounded-2xl p-6 text-center mb-6">
            <p className="text-brand-200 text-sm font-medium mb-1">Your Booking Reference</p>
            <p className="text-3xl font-black tracking-wider">{booking.bookingRef}</p>
            <p className="text-brand-200 text-xs mt-2">Save this reference to track your booking</p>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 mb-6">
            <h2 className="font-bold text-gray-900 text-lg">{booking.tourTitle}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-xs">Date: </span>
                  <span className="font-medium text-gray-800">{formatDate(booking.bookingDate.toISOString())}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-xs">Option: </span>
                  <span className="font-medium text-gray-800">{booking.optionLabel}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 text-xs">Guests: </span>
                  <span className="font-medium text-gray-800">
                    {booking.adultQty} adult{booking.adultQty !== 1 ? 's' : ''}
                    {booking.childQty > 0 ? `, ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total Paid</span>
                <span className="text-brand-700">{formatCurrency(booking.totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Payment on arrival · No upfront charge</p>
            </div>
            <div className="border-t border-gray-100 pt-4 text-sm space-y-1">
              <p><span className="text-gray-400">Name: </span><span className="font-medium">{booking.customerName}</span></p>
              <p><span className="text-gray-400">Email: </span><span className="font-medium">{booking.customerEmail}</span></p>
              <p><span className="text-gray-400">Phone: </span><span className="font-medium">{booking.customerPhone}</span></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/tours"
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Browse More Tours <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
          <div className="text-center pt-1">
            <a
              href={`/api/ics/tour/${booking.bookingRef}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              Add to Google Calendar / Apple Calendar
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
