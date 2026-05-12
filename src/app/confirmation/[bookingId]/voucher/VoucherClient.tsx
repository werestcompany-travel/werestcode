'use client';

import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';

interface AddOn { name: string; quantity: number; unitPrice: string; }

interface VoucherData {
  bookingRef: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialNotes: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  vehicleLabel: string;
  passengers: number;
  luggage: number;
  basePrice: string;
  totalPrice: string;
  paymentMethod: string;
  paymentStatus: string;
  addOns: AddOn[];
  qrDataUrl: string;
}

export default function VoucherClient({ data: d }: { data: VoucherData }) {
  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">

      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center gap-3 max-w-[780px] mx-auto">
        <Link href={`/confirmation/${d.bookingId}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Booking
        </Link>
        <button onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 bg-[#2534ff] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#1a27e0] transition-colors">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Voucher document */}
      <div className="max-w-[700px] mx-auto my-8 print:my-0 bg-white shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden">

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#2534ff 0%,#1a27e0 60%,#4f46e5 100%)' }} className="px-10 py-9 text-white">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-black tracking-wide">WEREST TRAVEL</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-white/30 bg-white/20 tracking-widest uppercase">✓ Confirmed</span>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60 font-bold uppercase tracking-[3px] mb-2">Booking Voucher</p>
            <p className="text-5xl font-black tracking-[6px] font-mono">{d.bookingRef}</p>
          </div>
        </div>

        {/* Route */}
        <Section title="Trip Route">
          <div className="flex gap-5 mb-5">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-[#2534ff] ring-4 ring-blue-100" />
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[#2534ff] to-red-400 my-2 min-h-[36px]" />
              <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
            </div>
            <div className="flex flex-col gap-5 flex-1">
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Pickup</p>
                <p className="text-sm font-bold text-gray-900 leading-snug">{d.pickupAddress}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Drop-off</p>
                <p className="text-sm font-bold text-gray-900 leading-snug">{d.dropoffAddress}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Date" value={d.pickupDate} />
            <Detail label="Pickup Time" value={d.pickupTime} />
            <Detail label="Vehicle" value={d.vehicleLabel} />
            <Detail label="Passengers · Luggage" value={`${d.passengers} pax · ${d.luggage} bags`} />
          </div>
        </Section>

        {/* Customer */}
        <Section title="Passenger Details">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Full Name" value={d.customerName} />
            <Detail label="Phone" value={d.customerPhone} />
            <div className="col-span-2">
              <Detail label="Email" value={d.customerEmail} />
            </div>
            {d.specialNotes && (
              <div className="col-span-2">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Special Notes</p>
                <p className="text-sm text-gray-600">{d.specialNotes}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Payment Summary">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{d.vehicleLabel}</span>
              <span className="font-semibold">{d.basePrice}</span>
            </div>
            {d.addOns.map((a, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{a.name} × {a.quantity}</span>
                <span className="font-semibold">{a.unitPrice}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-100 text-base font-black text-gray-900">
              <span>Total</span>
              <span className="text-[#2534ff]">{d.totalPrice}</span>
            </div>
            <p className="text-xs text-gray-400 pt-1">Payment: {d.paymentMethod} · Status: {d.paymentStatus}</p>
          </div>
        </Section>

        {/* Driver instructions */}
        <Section title="Driver Instructions">
          <ul className="space-y-2">
            {[
              'Your driver will be at the pickup location holding a sign with your name.',
              'Please be ready 5 minutes before your scheduled pickup time.',
              'Driver contact details will be shared via WhatsApp before your trip.',
              'For airport pickups, wait at the arrivals exit.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="text-[#2534ff] font-black mt-0.5 shrink-0">✓</span> {t}
              </li>
            ))}
          </ul>
        </Section>

        {/* QR code */}
        <Section title="Booking Verification QR">
          <div className="flex items-center gap-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.qrDataUrl} alt="QR code" className="w-32 h-32 rounded-xl border border-gray-100 shrink-0" />
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Show this to your driver</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your driver can scan this code to instantly verify your booking. No ID required at pickup.
              </p>
              <p className="text-xs font-mono text-gray-400 mt-3">{d.bookingRef}</p>
            </div>
          </div>
        </Section>

        {/* Terms */}
        <Section title="Terms & Conditions">
          <p className="text-xs text-gray-400 leading-relaxed">
            This voucher is valid only for the trip details stated above. Cancellations must be made at least 24 hours before
            pickup for a full refund. No-shows are non-refundable. Werest Travel reserves the right to assign an equivalent
            or upgraded vehicle. Waiting time included: 60 min for airport pickups, 15 min for all other pickups.
            Contact our 24/7 support for emergencies or changes.
          </p>
        </Section>

        {/* Footer */}
        <div className="bg-gray-50 px-10 py-5 flex items-center justify-between">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Werest Travel · Thailand</p>
          <p className="text-xs text-gray-400">Printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-10 py-7 border-b border-gray-100 last:border-0">
      <p className="text-[11px] font-extrabold text-[#2534ff] uppercase tracking-[2.5px] mb-4">{title}</p>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900 leading-snug">{value}</p>
    </div>
  );
}
