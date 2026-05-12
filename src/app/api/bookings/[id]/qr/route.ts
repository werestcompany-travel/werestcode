import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({ where: { id: params.id }, select: { bookingRef: true } });
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
  const verifyUrl = `${appUrl}/confirmation/${params.id}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    width:  240,
    margin: 1,
    color:  { dark: '#1a1a2e', light: '#ffffff' },
  });

  return NextResponse.json({ dataUrl, verifyUrl, bookingRef: booking.bookingRef });
}
