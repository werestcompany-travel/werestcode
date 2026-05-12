import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatCurrency, formatDate, VEHICLE_LABELS } from '@/lib/utils';
import QRCode from 'qrcode';
import type { Metadata } from 'next';
import VoucherClient from './VoucherClient';

interface Props { params: { bookingId: string } }

export const metadata: Metadata = { robots: 'noindex', title: 'Booking Voucher | Werest Travel' };

export default async function VoucherPage({ params }: Props) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { bookingAddOns: { include: { addOn: true } } },
  });

  if (!booking) notFound();

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
  const verifyUrl = `${appUrl}/confirmation/${booking.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: '#1e2065', light: '#ffffff' } });

  const data = {
    bookingRef:    booking.bookingRef,
    bookingId:     booking.id,
    customerName:  booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    specialNotes:  booking.specialNotes ?? null,
    pickupAddress:  booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDate:    formatDate(booking.pickupDate.toISOString()),
    pickupTime:    booking.pickupTime,
    vehicleLabel:  VEHICLE_LABELS[booking.vehicleType],
    passengers:    booking.passengers,
    luggage:       booking.luggage,
    basePrice:     formatCurrency(booking.basePrice),
    totalPrice:    formatCurrency(booking.totalPrice),
    paymentMethod: booking.paymentMethod ?? 'Cash on arrival',
    paymentStatus: booking.paymentStatus ?? 'Unpaid',
    addOns: booking.bookingAddOns.map(ba => ({
      name:      `${ba.addOn.icon ?? ''} ${ba.addOn.name}`.trim(),
      quantity:  ba.quantity,
      unitPrice: formatCurrency(ba.unitPrice * ba.quantity),
    })),
    qrDataUrl,
  };

  return <VoucherClient data={data} />;
}
