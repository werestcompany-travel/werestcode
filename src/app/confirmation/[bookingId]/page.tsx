import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, VEHICLE_LABELS } from '@/lib/utils';
import { CheckCircle2, MapPin, Calendar, Clock, Users, Briefcase, ArrowRight } from 'lucide-react';

interface Props {
  params: { bookingId: string };
}

export default async function ConfirmationPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      bookingAddOns: { include: { addOn: true } },
    },
  });

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
            <h1 className="text-2xl font-extrabold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-500 mt-2">
              We&apos;ll send your driver details to {booking.customerPhone} via WhatsApp.
            </p>
          </div>

          {/* Booking ref card */}
          <div className="bg-brand-700 text-white rounded-2xl p-6 text-center mb-6">
            <p className="text-brand-200 text-sm font-medium mb-1">Your Booking ID</p>
            <p className="text-4xl font-black tracking-wider">{booking.bookingRef}</p>
            <p className="text-brand-200 text-xs mt-2">Save this ID to track your booking</p>
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5 mb-6">
            <StatusBadge status={booking.currentStatus} />

            <div className="space-y-3 text-sm">
              <DetailRow icon={<MapPin className="w-4 h-4 text-brand-600" />}     label="Pickup"   value={booking.pickupAddress} />
              <DetailRow icon={<div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-100 mx-0.5" />} label="Drop-off" value={booking.dropoffAddress} />
              <DetailRow icon={<Calendar className="w-4 h-4 text-gray-400" />}   label="Date"     value={formatDate(booking.pickupDate.toISOString())} />
              <DetailRow icon={<Clock className="w-4 h-4 text-gray-400" />}      label="Time"     value={booking.pickupTime} />
              <DetailRow icon={<Users className="w-4 h-4 text-gray-400" />}      label="Passengers" value={String(booking.passengers)} />
              <DetailRow icon={<Briefcase className="w-4 h-4 text-gray-400" />}  label="Luggage"  value={String(booking.luggage)} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{VEHICLE_LABELS[booking.vehicleType]}</span>
                <span className="font-semibold">{formatCurrency(booking.basePrice)}</span>
              </div>
              {booking.bookingAddOns.map((ba) => (
                <div key={ba.id} className="flex justify-between text-gray-600">
                  <span>{ba.addOn.icon} {ba.addOn.name} × {ba.quantity}</span>
                  <span className="font-semibold">{formatCurrency(ba.unitPrice * ba.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
                <span>Total</span>
                <span className="text-brand-700">{formatCurrency(booking.totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400">Payment on arrival · No upfront charge</p>
            </div>

            <div className="border-t border-gray-100 pt-4 text-sm space-y-1">
              <p><span className="text-gray-400">Customer: </span><span className="font-medium">{booking.customerName}</span></p>
              <p><span className="text-gray-400">Phone: </span><span className="font-medium">{booking.customerPhone}</span></p>
              <p><span className="text-gray-400">Email: </span><span className="font-medium">{booking.customerEmail}</span></p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/tracking?ref=${booking.bookingRef}`}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Track My Booking <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 mt-0.5 w-4 h-4 flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-gray-400 text-xs">{label}: </span>
        <span className="text-gray-800 font-medium">{value}</span>
      </div>
    </div>
  );
}
