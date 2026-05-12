import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/db';
import { getTourBySlug, formatTHB } from '@/lib/tours';
import QRCode from 'qrcode';
import {
  Calendar, Clock, Users, CheckCircle2, Download,
  MessageCircle, PhoneCall, Share2, ArrowRight,
  Shield, Star, MapPin, Ticket,
} from 'lucide-react';

interface Props { params: { bookingId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await prisma.tourBooking.findUnique({ where: { id: params.bookingId }, select: { bookingRef: true } });
  return { title: `Tour Booking ${b?.bookingRef ?? 'Confirmed'} – Werest Travel`, robots: 'noindex' };
}

function formatDate(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function TourConfirmationPage({ params }: Props) {
  const booking = await prisma.tourBooking.findUnique({ where: { id: params.bookingId } });
  if (!booking) notFound();

  const tour = getTourBySlug(booking.tourSlug);

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
  const verifyUrl = `${appUrl}/confirmation/tour/${booking.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 180, margin: 1,
    color: { dark: '#1e2065', light: '#ffffff' },
  });

  const supportPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+66XXXXXXXXX';
  const supportWa    = `https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`;
  const dateStr      = formatDate(booking.bookingDate);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* ── Hero confirmation bar ── */}
        <div className="bg-brand-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">You're all set!</h1>
            <p className="text-white/80 text-sm mb-4">
              Booking confirmed · Reference <span className="font-bold text-white">{booking.bookingRef}</span>
            </p>
            <p className="text-white/70 text-xs">
              A confirmation has been sent to <span className="font-semibold text-white">{booking.customerEmail}</span>
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── Tour summary card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Tour image header */}
            {tour?.images[0] && (
              <div className="relative h-48 w-full">
                <Image
                  src={tour.images[0]}
                  alt={booking.tourTitle}
                  fill
                  className="object-cover"
                  sizes="900px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Your Tour</p>
                  <h2 className="text-white font-extrabold text-xl leading-tight">{booking.tourTitle}</h2>
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="p-5 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-5">

                {/* Date & time */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{dateStr}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Departure</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {booking.optionLabel}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Participants</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {booking.adultQty} adult{booking.adultQty !== 1 ? 's' : ''}
                      {booking.childQty > 0 && `, ${booking.childQty} child${booking.childQty !== 1 ? 'ren' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Meeting point */}
                {tour?.meetingPoint && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Meeting point</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2">{tour.meetingPoint}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Price Breakdown</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{booking.adultQty} adult{booking.adultQty !== 1 ? 's' : ''} × {formatTHB(booking.adultPrice)}</span>
                    <span>{formatTHB(booking.adultQty * booking.adultPrice)}</span>
                  </div>
                  {booking.childQty > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>{booking.childQty} child{booking.childQty !== 1 ? 'ren' : ''} × {formatTHB(booking.childPrice)}</span>
                      <span>{formatTHB(booking.childQty * booking.childPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base text-gray-900 border-t border-gray-100 pt-2.5 mt-2">
                    <span>Total paid</span>
                    <span className="text-brand-600">{formatTHB(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Special notes */}
              {booking.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your notes</p>
                  <p className="text-sm text-gray-600 italic">"{booking.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Voucher / QR card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">

              {/* QR code */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden border-4 border-brand-100 p-1 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Booking QR code" className="w-full h-full" />
                </div>
                <p className="text-xs text-gray-400 text-center">Show to guide</p>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <Ticket className="w-5 h-5 text-brand-600" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">E-Voucher</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-widest mb-1">{booking.bookingRef}</p>
                <p className="text-sm text-gray-500 mb-4">Present this QR code or reference number to your guide at the meeting point.</p>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a
                    href={`/api/tours/bookings/${booking.id}/voucher`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                  <button
                    onClick={() => navigator.share?.({ title: `Werest Tour — ${booking.bookingRef}`, url: verifyUrl })}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── What happens next ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-4">
              {[
                { step: '1', icon: '📧', title: 'Check your email',        desc: `A confirmation voucher has been sent to ${booking.customerEmail}` },
                { step: '2', icon: '📍', title: 'Arrive at meeting point', desc: tour?.meetingPoint ?? 'Our guide will share exact meeting details by email' },
                { step: '3', icon: '🎟️', title: 'Show your voucher',       desc: 'Present this page or the QR code to your guide to check in' },
                { step: '4', icon: '🌟', title: 'Enjoy your experience',   desc: 'Sit back and let us take care of everything!' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-brand-50 border-2 border-brand-100 flex items-center justify-center shrink-0 text-lg">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Support + actions row ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Contact support */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Need help?</h3>
              <div className="space-y-2.5">
                <a href={supportWa} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                  WhatsApp support (30s response)
                </a>
                <a href={`tel:${supportPhone}`}
                  className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
                  <PhoneCall className="w-4 h-4 text-brand-500 shrink-0" />
                  {supportPhone}
                </a>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-900">Free cancellation</p>
                  <p className="text-xs text-green-700 mt-1 leading-relaxed">
                    Cancel up to 24 hours before your tour starts for a full refund.
                    Contact us via WhatsApp to cancel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="text-center pb-6 space-y-3">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-[0_4px_16px_rgba(37,52,255,0.25)]"
            >
              Browse more tours <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-400">
              Want to leave a review after your trip?{' '}
              <Link href={`/tours/${booking.tourSlug}`} className="text-brand-600 hover:underline">
                Visit the tour page
              </Link>
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
