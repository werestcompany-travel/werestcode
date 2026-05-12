export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const DEPRECATED_RESPONSE = { error: 'Deprecated. Use /api/tours/bookings instead.' };

export async function GET() {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 });
}

export async function POST() {
  return NextResponse.json(DEPRECATED_RESPONSE, { status: 410 });
}
