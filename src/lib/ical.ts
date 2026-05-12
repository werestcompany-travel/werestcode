import { formatDate, VEHICLE_LABELS } from './utils';

interface ICalBooking {
  bookingRef: string;
  bookingId: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string | Date;
  pickupTime: string;
  vehicleType: string;
  passengers: number;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function toICalDate(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

export function generateICalFile(b: ICalBooking): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';
  const vehicleLabel = (VEHICLE_LABELS as Record<string, string>)[b.vehicleType] ?? b.vehicleType;
  const dateStr = formatDate(typeof b.pickupDate === 'string' ? b.pickupDate : b.pickupDate.toISOString());

  const [hours, minutes] = b.pickupTime.split(':').map(Number);
  const baseDate = typeof b.pickupDate === 'string' ? new Date(b.pickupDate) : new Date(b.pickupDate);
  const startDate = new Date(baseDate);
  startDate.setUTCHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours estimated

  const now = toICalDate(new Date());
  const start = toICalDate(startDate);
  const end = toICalDate(endDate);
  const uid = `${b.bookingRef}@werest.com`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Werest Travel//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:🚗 Werest Transfer – ${b.bookingRef}`,
    `DESCRIPTION:Pickup: ${b.pickupAddress}\\nDrop-off: ${b.dropoffAddress}\\nVehicle: ${vehicleLabel}\\nPassengers: ${b.passengers}\\nDate: ${dateStr} at ${b.pickupTime}\\n\\nView booking: ${appUrl}/confirmation/${b.bookingId}`,
    `LOCATION:${b.pickupAddress}`,
    `URL:${appUrl}/confirmation/${b.bookingId}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildGoogleCalendarUrl(b: ICalBooking): string {
  const vehicleLabel = (VEHICLE_LABELS as Record<string, string>)[b.vehicleType] ?? b.vehicleType;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

  const [hours, minutes] = b.pickupTime.split(':').map(Number);
  const baseDate = typeof b.pickupDate === 'string' ? new Date(b.pickupDate) : new Date(b.pickupDate);
  const start = new Date(baseDate);
  start.setUTCHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   `Werest Transfer – ${b.bookingRef}`,
    dates:  `${fmt(start)}/${fmt(end)}`,
    details: `Vehicle: ${vehicleLabel}\nPassengers: ${b.passengers}\n\nView booking: ${appUrl}/confirmation/${b.bookingId}`,
    location: b.pickupAddress,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(b: ICalBooking): string {
  const vehicleLabel = (VEHICLE_LABELS as Record<string, string>)[b.vehicleType] ?? b.vehicleType;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://werest.com';

  const [hours, minutes] = b.pickupTime.split(':').map(Number);
  const baseDate = typeof b.pickupDate === 'string' ? new Date(b.pickupDate) : new Date(b.pickupDate);
  const start = new Date(baseDate);
  start.setUTCHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace('.000Z', '');

  const params = new URLSearchParams({
    path:      '/calendar/action/compose',
    rru:       'addevent',
    subject:   `Werest Transfer – ${b.bookingRef}`,
    startdt:   fmt(start),
    enddt:     fmt(end),
    body:      `Vehicle: ${vehicleLabel}\nPassengers: ${b.passengers}\nView: ${appUrl}/confirmation/${b.bookingId}`,
    location:  b.pickupAddress,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
