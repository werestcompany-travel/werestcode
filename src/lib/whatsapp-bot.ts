/**
 * WhatsApp Booking Flow — State Machine
 *
 * Handles incoming messages from customers and guides them through
 * a multi-step private transfer booking flow over WhatsApp.
 */

import { prisma } from '@/lib/db';
import { WhatsAppStep } from '@prisma/client';

// ── Pricing constants (flat rate: base + per-km) ──────────────────────────────
const VEHICLE_CONFIG = {
  SEDAN: {
    label: 'Sedan',
    emoji: '🚗',
    baseFare: 500,
    perKm: 12,
    maxPax: 2,
  },
  SUV: {
    label: 'SUV',
    emoji: '🚙',
    baseFare: 800,
    perKm: 18,
    maxPax: 4,
  },
  MINIVAN: {
    label: 'Minivan',
    emoji: '🚐',
    baseFare: 1200,
    perKm: 22,
    maxPax: 10,
  },
  LUXURY_MPV: {
    label: 'Luxury MPV',
    emoji: '✨',
    baseFare: 3500,
    perKm: 35,
    maxPax: 6,
  },
} as const;

type VehicleKey = keyof typeof VEHICLE_CONFIG;

// Admin phone for help link
const ADMIN_PHONE = process.env.WHATSAPP_ADMIN_PHONE ?? '6620001111';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

// Reset trigger words (case-insensitive)
const RESET_WORDS = new Set(['restart', 'new', 'book', 'cancel', 'reset', 'start']);

// ── Session data shape ────────────────────────────────────────────────────────
interface SessionData {
  pickup?: string;
  dropoff?: string;
  date?: string;       // "DD/MM/YYYY"
  time?: string;       // "HH:MM"
  passengers?: number;
  vehicle?: VehicleKey;
  estimatedPrice?: number;
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function handleIncomingMessage(
  phone: string,
  message: string,
  messageType: string,
): Promise<void> {
  const text = (messageType === 'text' ? message : '').trim();

  // Load or create the session
  let session = await prisma.whatsAppSession.findUnique({ where: { phone } });

  // Global reset check — works from any step
  if (text && RESET_WORDS.has(text.toLowerCase())) {
    // If they type "book" or "new" at DONE/CANCELLED, start fresh
    // If they type "cancel" mid-flow, cancel and reset
    await resetSession(phone);
    session = null; // will create fresh below
  }

  if (!session) {
    session = await prisma.whatsAppSession.create({
      data: { phone, step: WhatsAppStep.GREETING, data: {} },
    });
  }

  const data = (session.data as SessionData) ?? {};

  try {
    await dispatch(phone, session.step, text, data);
  } catch (err) {
    console.error('[WA-Bot] dispatch error:', err);
    await sendWhatsAppMessage(
      phone,
      `Sorry, something went wrong. Please contact us: https://wa.me/${ADMIN_PHONE}`,
    );
  }
}

// ── Step dispatcher ───────────────────────────────────────────────────────────

async function dispatch(
  phone: string,
  step: WhatsAppStep,
  text: string,
  data: SessionData,
): Promise<void> {
  switch (step) {
    case WhatsAppStep.GREETING:
      return handleGreeting(phone);

    case WhatsAppStep.PICKUP:
      return handlePickup(phone, text, data);

    case WhatsAppStep.DROPOFF:
      return handleDropoff(phone, text, data);

    case WhatsAppStep.DATE:
      return handleDate(phone, text, data);

    case WhatsAppStep.TIME:
      return handleTime(phone, text, data);

    case WhatsAppStep.PASSENGERS:
      return handlePassengers(phone, text, data);

    case WhatsAppStep.VEHICLE:
      return handleVehicle(phone, text, data);

    case WhatsAppStep.CONFIRM:
      return handleConfirm(phone, text, data);

    case WhatsAppStep.DONE:
      return handleDone(phone, data);

    case WhatsAppStep.CANCELLED:
      return handleCancelled(phone);

    default:
      // Fallback — restart
      await resetSession(phone);
      return handleGreeting(phone);
  }
}

// ── Step handlers ─────────────────────────────────────────────────────────────

async function handleGreeting(phone: string): Promise<void> {
  await setStep(phone, WhatsAppStep.PICKUP, {});
  await sendWhatsAppMessage(
    phone,
    `Hi! 🇹🇭 Welcome to Werest Travel!\n\nI can book a private transfer for you in just a few steps.\n\n📍 First, where would you like to be picked up from?\n(Type your pickup location, e.g. "Suvarnabhumi Airport")`,
  );
}

async function handlePickup(phone: string, text: string, data: SessionData): Promise<void> {
  if (!text) {
    await sendWhatsAppMessage(phone, `📍 Please tell me your pickup location.`);
    return;
  }
  const updated = { ...data, pickup: text };
  await setStep(phone, WhatsAppStep.DROPOFF, updated);
  await sendWhatsAppMessage(
    phone,
    `Got it! 📍 Pickup: ${text}\n\n🏁 Where would you like to go?`,
  );
}

async function handleDropoff(phone: string, text: string, data: SessionData): Promise<void> {
  if (!text) {
    await sendWhatsAppMessage(phone, `🏁 Please tell me your destination.`);
    return;
  }
  const updated = { ...data, dropoff: text };
  await setStep(phone, WhatsAppStep.DATE, updated);
  await sendWhatsAppMessage(
    phone,
    `Perfect route! 📅 What date do you need the transfer?\n(Format: DD/MM/YYYY, e.g. 25/12/2025)`,
  );
}

async function handleDate(phone: string, text: string, data: SessionData): Promise<void> {
  if (!text) {
    await sendWhatsAppMessage(phone, `📅 Please provide a date in DD/MM/YYYY format.`);
    return;
  }

  // Validate format
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = text.match(dateRegex);
  if (!match) {
    await sendWhatsAppMessage(
      phone,
      `⚠️ Invalid date format. Please use DD/MM/YYYY (e.g. 25/12/2025).`,
    );
    return;
  }

  const [, dd, mm, yyyy] = match;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

  // Check it's a real date
  if (
    parsed.getDate() !== Number(dd) ||
    parsed.getMonth() !== Number(mm) - 1 ||
    parsed.getFullYear() !== Number(yyyy)
  ) {
    await sendWhatsAppMessage(phone, `⚠️ That doesn't look like a valid date. Try again (DD/MM/YYYY).`);
    return;
  }

  // Must be in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) {
    await sendWhatsAppMessage(phone, `⚠️ The date must be today or in the future. Please try again.`);
    return;
  }

  const updated = { ...data, date: text };
  await setStep(phone, WhatsAppStep.TIME, updated);
  await sendWhatsAppMessage(
    phone,
    `📅 Date: ${text}\n\n⏰ What time should the driver pick you up?\n(Format: HH:MM, e.g. 14:30)`,
  );
}

async function handleTime(phone: string, text: string, data: SessionData): Promise<void> {
  if (!text) {
    await sendWhatsAppMessage(phone, `⏰ Please provide a time in HH:MM format.`);
    return;
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(text)) {
    await sendWhatsAppMessage(
      phone,
      `⚠️ Invalid time format. Please use HH:MM (24-hour, e.g. 14:30).`,
    );
    return;
  }

  const updated = { ...data, time: text };
  await setStep(phone, WhatsAppStep.PASSENGERS, updated);
  await sendWhatsAppMessage(
    phone,
    `⏰ Pickup time: ${text}\n\n👥 How many passengers? (1-10)`,
  );
}

async function handlePassengers(phone: string, text: string, data: SessionData): Promise<void> {
  const n = parseInt(text, 10);
  if (isNaN(n) || n < 1 || n > 10) {
    await sendWhatsAppMessage(phone, `⚠️ Please enter a number between 1 and 10.`);
    return;
  }

  const updated = { ...data, passengers: n };
  await setStep(phone, WhatsAppStep.VEHICLE, updated);

  // Build vehicle menu — show starting prices
  const lines = (Object.entries(VEHICLE_CONFIG) as [VehicleKey, (typeof VEHICLE_CONFIG)[VehicleKey]][])
    .map(([, cfg], i) => {
      const startingFrom = `฿${cfg.baseFare.toLocaleString()}`;
      return `${cfg.emoji} *${cfg.label}* — from ${startingFrom} (max ${cfg.maxPax} pax)`;
    });

  await sendWhatsAppMessage(
    phone,
    `Here are the vehicles available for ${n} passenger${n > 1 ? 's' : ''}:\n\n` +
    `${lines.join('\n')}\n\n` +
    `Reply with:\n` +
    `*1* for Sedan\n*2* for SUV\n*3* for Minivan\n*4* for Luxury MPV`,
  );
}

async function handleVehicle(phone: string, text: string, data: SessionData): Promise<void> {
  const vehicleMap: Record<string, VehicleKey> = {
    '1': 'SEDAN',
    '2': 'SUV',
    '3': 'MINIVAN',
    '4': 'LUXURY_MPV',
    sedan: 'SEDAN',
    suv: 'SUV',
    minivan: 'MINIVAN',
    luxury: 'LUXURY_MPV',
    'luxury mpv': 'LUXURY_MPV',
  };

  const key = vehicleMap[text.toLowerCase()];
  if (!key) {
    await sendWhatsAppMessage(
      phone,
      `⚠️ Please reply with 1, 2, 3, or 4 to select your vehicle.`,
    );
    return;
  }

  const cfg = VEHICLE_CONFIG[key];
  const pax = data.passengers ?? 1;

  // Check capacity
  if (pax > cfg.maxPax) {
    await sendWhatsAppMessage(
      phone,
      `⚠️ ${cfg.label} fits max ${cfg.maxPax} passengers. Please choose a larger vehicle.\n\n` +
      `*1* Sedan (max 2) | *2* SUV (max 4) | *3* Minivan (max 10) | *4* Luxury MPV (max 6)`,
    );
    return;
  }

  // Estimate price using a fixed 30 km default (no Google Maps key available in bot context)
  const estimatedKm = 30;
  const estimatedPrice = Math.round(cfg.baseFare + cfg.perKm * estimatedKm);

  const updated: SessionData = { ...data, vehicle: key, estimatedPrice };
  await setStep(phone, WhatsAppStep.CONFIRM, updated);

  await sendWhatsAppMessage(
    phone,
    `📋 *Booking Summary*\n\n` +
    `📍 From: ${data.pickup}\n` +
    `🏁 To: ${data.dropoff}\n` +
    `📅 Date: ${data.date} at ${data.time}\n` +
    `👥 Passengers: ${pax}\n` +
    `${cfg.emoji} Vehicle: ${cfg.label}\n` +
    `💰 Estimated Price: ฿${estimatedPrice.toLocaleString()}*\n\n` +
    `_*Estimate based on ~${estimatedKm} km. Exact fare confirmed by driver._\n\n` +
    `Reply *YES* to confirm or *NO* to start over.`,
  );
}

async function handleConfirm(phone: string, text: string, data: SessionData): Promise<void> {
  const answer = text.toLowerCase().trim();

  if (answer === 'no' || answer === 'n') {
    await resetSession(phone);
    await sendWhatsAppMessage(
      phone,
      `No problem! Type *book* whenever you're ready to start a new booking. 😊`,
    );
    return;
  }

  if (answer !== 'yes' && answer !== 'y') {
    await sendWhatsAppMessage(phone, `Please reply *YES* to confirm or *NO* to start over.`);
    return;
  }

  // Create the booking
  try {
    const bookingRef = await createWhatsAppBooking(phone, data);
    await setStep(phone, WhatsAppStep.DONE, data, bookingRef);

    await sendWhatsAppMessage(
      phone,
      `✅ *Booking Confirmed!*\n\n` +
      `Booking Ref: *${bookingRef}*\n` +
      `Track your booking: ${APP_URL}/tracking?ref=${bookingRef}\n\n` +
      `Our team will confirm your driver shortly.\n` +
      `For help: https://wa.me/${ADMIN_PHONE}`,
    );
  } catch (err) {
    console.error('[WA-Bot] booking creation error:', err);
    await sendWhatsAppMessage(
      phone,
      `Sorry, we couldn't confirm your booking. Please contact us: https://wa.me/${ADMIN_PHONE}`,
    );
  }
}

async function handleDone(phone: string, _data: SessionData): Promise<void> {
  const session = await prisma.whatsAppSession.findUnique({ where: { phone } });
  const ref = session?.bookingRef ?? 'your booking';
  await sendWhatsAppMessage(
    phone,
    `You already have booking *${ref}*.\nTrack at: ${APP_URL}/tracking?ref=${ref}\n\nType *new* to start a new booking.`,
  );
}

async function handleCancelled(phone: string): Promise<void> {
  await sendWhatsAppMessage(phone, `Type *book* to start a new booking.`);
}

// ── Booking creation ──────────────────────────────────────────────────────────

async function createWhatsAppBooking(phone: string, data: SessionData): Promise<string> {
  const cfg = VEHICLE_CONFIG[data.vehicle ?? 'SEDAN'];
  const passengers = data.passengers ?? 1;
  const estimatedKm = 30;
  const basePrice = Math.round(cfg.baseFare + cfg.perKm * estimatedKm);

  // Parse date
  const [dd, mm, yyyy] = (data.date ?? '01/01/2025').split('/');
  const pickupDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

  // Generate booking ref  WA-YYMMDD-XXXX
  const yy = String(pickupDate.getFullYear()).slice(-2);
  const mmStr = String(pickupDate.getMonth() + 1).padStart(2, '0');
  const ddStr = String(pickupDate.getDate()).padStart(2, '0');
  const prefix = `WA-${yy}${mmStr}${ddStr}`;

  const existingCount = await prisma.booking.count({
    where: { bookingRef: { startsWith: prefix } },
  });
  const seq = String(existingCount + 1).padStart(4, '0');
  const bookingRef = `${prefix}-${seq}`;

  await prisma.booking.create({
    data: {
      bookingRef,
      pickupAddress:  data.pickup  ?? 'Unknown',
      pickupLat:      0,
      pickupLng:      0,
      dropoffAddress: data.dropoff ?? 'Unknown',
      dropoffLat:     0,
      dropoffLng:     0,
      distanceKm:     estimatedKm,
      durationMin:    Math.round(estimatedKm * 2), // rough estimate
      pickupDate,
      pickupTime:     data.time ?? '12:00',
      passengers,
      luggage:        0,
      vehicleType:    data.vehicle ?? 'SEDAN',
      customerName:   'WhatsApp Customer',
      customerEmail:  `wa-${phone}@werest.com`,
      customerPhone:  phone,
      specialNotes:   `Booked via WhatsApp. Phone: ${phone}`,
      basePrice,
      addOnsTotal:    0,
      totalPrice:     basePrice,
      paymentMethod:  'cash',
      currentStatus:  'PENDING',
      statusHistory: {
        create: { status: 'PENDING', note: 'Booked via WhatsApp chatbot', updatedBy: 'whatsapp-bot' },
      },
    },
  });

  return bookingRef;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function setStep(
  phone: string,
  step: WhatsAppStep,
  data: SessionData,
  bookingRef?: string,
): Promise<void> {
  await prisma.whatsAppSession.upsert({
    where: { phone },
    update: { step, data: data as object, ...(bookingRef ? { bookingRef } : {}) },
    create: { phone, step, data: data as object, ...(bookingRef ? { bookingRef } : {}) },
  });
}

export async function resetSession(phone: string): Promise<void> {
  await prisma.whatsAppSession.deleteMany({ where: { phone } });
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('[WA-Bot] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN — message not sent');
    return;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    console.warn('[WA-Bot] Invalid phone number:', phone);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[WA-Bot] Send failed:', err);
    }
  } catch (err) {
    console.error('[WA-Bot] sendWhatsAppMessage error:', err);
  }
}
