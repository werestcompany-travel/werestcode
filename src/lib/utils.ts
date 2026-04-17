import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookingStatus, VehicleType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function generateBookingRef(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `WR-${year}${month}${day}-${rand}`;
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  DRIVER_CONFIRMED: 'Driver Confirmed',
  DRIVER_STANDBY: 'Driver Standby',
  DRIVER_PICKED_UP: 'Picked Up',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  DRIVER_CONFIRMED: 'bg-blue-100 text-blue-800',
  DRIVER_STANDBY: 'bg-indigo-100 text-indigo-800',
  DRIVER_PICKED_UP: 'bg-brand-100 text-brand-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  MINIVAN: 'Minivan',
};

export const STATUS_FLOW: BookingStatus[] = [
  'PENDING',
  'DRIVER_CONFIRMED',
  'DRIVER_STANDBY',
  'DRIVER_PICKED_UP',
  'COMPLETED',
];
