import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { bookingReservationSchema } from '@/lib/seo/schema';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, VEHICLE_LABELS } from '@/lib/utils';
import { CheckCircle2, MapPin, Calendar, Clock, Users, Briefcase, ArrowRight, Car, Phone } from 'lucide-react';
import { tours } from '@/lib/tours';
import PickupCountdown from '@/components/booking/PickupCountdown';
import ConfirmationActions from '@/components/booking/ConfirmationActions';
import PrepareChecklist from '@/components/booking/PrepareChecklist';
import PayNowButton from '@/components/booking/PayNowButton';
import VoucherDownloadButton from '@/components/booking/VoucherDownloadButton';
import TrackConversion from '@/components/booking/TrackConversion';

interface Props {
  params: { bookingId: string };
}

/** Determine the city keyword from the dropoff/pickup address */
function detectCity(dropoff: string, pickup: string): string {
  const text = (dropoff + ' ' + pickup).toLowerCase();
  if (text.includes('pattaya')) return 'pattaya';
  if (text.includes('phuket')) return 'phuket';
  if (text.includes('chiang mai') || text.includes('chiangmai')) return 'chiang mai';
  if (text.includes('krabi') || text.includes('ao nang')) return 'krabi';
  if (text.includes('chiang rai') || text.includes('chiangrai')) return 'chiang rai';
  return 'bangkok';
}

/** Return 2–3 recommended tours for the city */
function getRecommendedTours(city: string) {
  return tours
    .filter(t => t.cities.some(c => c.includes(city.split(' ')[0])))
    .slice(0, 3);
}

/** Build a Google Calendar URL */
function buildGoogleCalendarUrl(booking: {
  bookingRef: string;
  pickupDate: Date;
  pickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
}) {
  const [h, m] = booking.pickupTime.split(':').map(Number);
  const start = new Date(booking.pickupDate);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2h estimate

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Werest Transfer – ${booking.bookingRef}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Booking ref: ${booking.bookingRef}\nRoute: ${booking.pickupAddress} → ${booking.dropoffAddress}\nTrack at https://werest.com/tracking`,
    location: booking.pickupAddress,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export default async function ConfirmationPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      bookingAddOns: { include: { addOn: true } },
      driver: { select: { phone: true, vehicles: { select: { plateNumber: true, make: true, model: true }, take: 1 } } },
    },
  });

  if (!booking) notFound();

  const city = detectCity(booking.dropoffAddress, booking.pickupAddress);
  const recommendedTours = getRecommendedTours(city);
  const cityLabel = city.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const googleCalUrl = buildGoogleCalendarUrl(booking);
  const icsUrl = `/api/ics/${booking.id}`;
  const confirmationUrl = `https://werest.com/confirmation/${booking.id}`;
  const whatsappMsg = encodeURIComponent(
    `My booking ref is ${booking.bookingRef} for ${booking.pickupAddress} to ${booking.dropoffAddress} on ${formatDate(booking.pickupDate.toISOString())}. Track at https://werest.com/tracking`
  );

  return (
    <>
      <JsonLd data={bookingReservationSchema(booking)} />
      <TrackConversion
        bookingRef={booking.bookingRef}
        totalPrice={booking.totalPrice}
        vehicleType={booking.vehicleType}
      />
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

          {/* Payment section */}
          <div className="mb-6">
            <PayNowButton
              bookingId={booking.id}
              amount={booking.totalPrice}
              paymentStatus={booking.paymentStatus}
            />
          </div>

          {/* Countdown */}
          <PickupCountdown
            pickupDate={booking.pickupDate.toISOString()}
            pickupTime={booking.pickupTime}
          />

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
              {(() => {
                const addOnSum = booking.bookingAddOns.reduce((s, ba) => s + ba.unitPrice * ba.quantity, 0);
                const surcharge = Math.round(booking.addOnsTotal - addOnSum);
                return surcharge > 0 ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Service surcharge</span>
                    <span className="font-semibold">{formatCurrency(surcharge)}</span>
                  </div>
                ) : null;
              })()}
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>
                    Discount{booking.discountCode ? ` (${booking.discountCode})` : ''}
                  </span>
                  <span>−{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
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

          {/* Driver card */}
          {booking.driverName ? (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-blue-900">Your Driver</h2>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-extrabold text-lg shrink-0">
                  {booking.driverName[0].toUpperCase()}
                </div>
                <div className="flex-1 space-y-1 text-sm">
                  <p className="font-semibold text-gray-900">{booking.driverName}</p>
                  {(booking as any).driver?.phone && (
                    <a
                      href={`https://wa.me/${((booking as any).driver.phone as string).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {(booking as any).driver.phone}
                    </a>
                  )}
                  <p className="text-gray-500 text-xs">
                    {VEHICLE_LABELS[booking.vehicleType]}
                    {(booking as any).driver?.vehicles?.[0]?.plateNumber
                      ? ` · ${(booking as any).driver.vehicles[0].plateNumber}`
                      : ''}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-blue-900 mb-0.5">Your Driver</h2>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your driver will be assigned 24 hours before your pickup. You&apos;ll receive a WhatsApp notification with their name, photo, and vehicle details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📅</span> Save to Calendar
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <span>📅</span> Add to Google Calendar
              </a>
              <a
                href={icsUrl}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <span>🍎</span> Add to Apple Calendar
              </a>
            </div>
          </div>

          {/* Client-side action buttons (WhatsApp share, copy link, email) */}
          <ConfirmationActions
            bookingRef={booking.bookingRef}
            whatsappMsg={whatsappMsg}
            confirmationUrl={confirmationUrl}
          />

          {/* Prepare for your trip checklist */}
          <PrepareChecklist />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href={`/tracking?ref=${booking.bookingRef}`}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Track My Booking <ArrowRight className="w-4 h-4" />
            </Link>
            <VoucherDownloadButton bookingRef={booking.bookingRef} className="flex-1" />
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* You might also like */}
          {recommendedTours.length > 0 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">
                Popular in {cityLabel}
              </h2>
              <div className="space-y-3">
                {recommendedTours.map(tour => (
                  <Link
                    key={tour.slug}
                    href={`/tours/${tour.slug}`}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-md transition-shadow group"
                  >
                    {/* Tour image */}
                    <div
                      className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${tour.images[0]})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {tour.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{tour.duration}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">from</p>
                      <p className="font-extrabold text-brand-700 text-sm">
                        ฿{tour.options[0]?.pricePerPerson?.toLocaleString() ?? '—'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Server-safe sub-components ───────────────────────────────────────────────

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

