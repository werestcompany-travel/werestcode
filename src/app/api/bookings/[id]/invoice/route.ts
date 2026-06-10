export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePDF, { type InvoiceData, type InvoiceLineItem } from '@/components/pdf/InvoicePDF';
import { createElement } from 'react';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Look up by internal cuid ONLY. The cuid is unguessable and acts as a
  // capability URL; bookingRef (WR-YYMMDD-####) is intentionally NOT accepted
  // here because refs are enumerable and the invoice contains PII.
  const booking = await prisma.booking.findUnique({ where: { id: params.id } });

  let invoiceData: InvoiceData | null = null;

  if (booking) {
    const totalAmount = booking.totalPrice;
    // VAT-inclusive breakdown: subtotal = total / 1.07, vat = total - subtotal
    const subtotal   = totalAmount / 1.07;
    const vatAmount  = totalAmount - subtotal;

    const lineItems: InvoiceLineItem[] = [
      {
        description: `Private Transfer — ${booking.vehicleType.replace('_', ' ')} | ${booking.pickupAddress} → ${booking.dropoffAddress}`,
        quantity:    1,
        unitPrice:   subtotal,
        total:       subtotal,
      },
    ];

    invoiceData = {
      invoiceNumber: `WTINV-${booking.bookingRef}`,
      bookingRef:    booking.bookingRef,
      issueDate:     booking.createdAt.toISOString(),
      customerName:  booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      lineItems,
      subtotal:      Math.round(subtotal * 100) / 100,
      vatAmount:     Math.round(vatAmount * 100) / 100,
      totalAmount:   totalAmount,
      currency:      'THB',
    };
  } else {
    // Try tour booking — cuid only (see note above)
    const tourBooking = await prisma.tourBooking.findUnique({ where: { id: params.id } });

    if (!tourBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const totalAmount = tourBooking.totalPrice;
    const subtotal    = totalAmount / 1.07;
    const vatAmount   = totalAmount - subtotal;

    const lineItems: InvoiceLineItem[] = [];
    if (tourBooking.adultQty > 0) {
      lineItems.push({
        description: `${tourBooking.tourTitle} — Adult`,
        quantity:    tourBooking.adultQty,
        unitPrice:   tourBooking.adultPrice / 1.07,
        total:       (tourBooking.adultPrice * tourBooking.adultQty) / 1.07,
      });
    }
    if (tourBooking.childQty > 0) {
      lineItems.push({
        description: `${tourBooking.tourTitle} — Child`,
        quantity:    tourBooking.childQty,
        unitPrice:   tourBooking.childPrice / 1.07,
        total:       (tourBooking.childPrice * tourBooking.childQty) / 1.07,
      });
    }

    invoiceData = {
      invoiceNumber: `WTINV-${tourBooking.bookingRef}`,
      bookingRef:    tourBooking.bookingRef,
      issueDate:     tourBooking.createdAt.toISOString(),
      customerName:  tourBooking.customerName,
      customerEmail: tourBooking.customerEmail,
      customerPhone: tourBooking.customerPhone,
      lineItems,
      subtotal:      Math.round(subtotal * 100) / 100,
      vatAmount:     Math.round(vatAmount * 100) / 100,
      totalAmount:   totalAmount,
      currency:      'THB',
    };
  }

  try {
    const element = createElement(InvoicePDF, { data: invoiceData });
    const pdfBuffer = await renderToBuffer(element as React.ReactElement);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.invoiceNumber}.pdf"`,
        'Cache-Control':       'no-store',
      },
    });
  } catch (err) {
    console.error('Invoice PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate invoice PDF' }, { status: 500 });
  }
}
