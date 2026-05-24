'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import {
  RefreshCw, Zap, MapPin, Clock, Users, Car,
  Wifi, WifiOff, ChevronDown, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isTomorrow, parseISO, differenceInCalendarDays } from 'date-fns';

// ─── Types ─────────────────────────────────────────────────────────────────────

type VehicleType = 'SEDAN' | 'SUV' | 'MINIVAN' | 'LUXURY_MPV';
type BookingStatus =
  | 'PENDING'
  | 'DRIVER_CONFIRMED'
  | 'DRIVER_STANDBY'
  | 'DRIVER_PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
}

interface DispatchBooking {
  id: string;
  bookingRef: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  vehicleType: VehicleType;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  currentStatus: BookingStatus;
  driverId: string | null;
  driverName: string | null;
  driver?: {
    id: string;
    name: string;
    vehicles: Vehicle[];
  } | null;
}

interface DriverWithStatus {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  currentLat: number | null;
  currentLng: number | null;
  vehicles: Vehicle[];
  bookings: {
    id: string;
    bookingRef: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupDate: string;
    pickupTime: string;
    currentStatus: BookingStatus;
  }[];
}

interface DispatchData {
  unassigned: DispatchBooking[];
  assigned: DispatchBooking[];
  drivers: DriverWithStatus[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  MINIVAN: 'Minivan',
  LUXURY_MPV: 'Luxury MPV',
};

const STATUS_CHIP: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  DRIVER_CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  DRIVER_STANDBY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DRIVER_PICKED_UP: 'bg-violet-100 text-violet-700 border-violet-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  DRIVER_CONFIRMED: 'Confirmed',
  DRIVER_STANDBY: 'Standby',
  DRIVER_PICKED_UP: 'Picked Up',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const VEHICLE_BADGE: Record<VehicleType, string> = {
  SEDAN: 'bg-sky-100 text-sky-700',
  SUV: 'bg-emerald-100 text-emerald-700',
  MINIVAN: 'bg-orange-100 text-orange-700',
  LUXURY_MPV: 'bg-purple-100 text-purple-700',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function shortAddress(addr: string): string {
  // Return first 2 meaningful parts of address
  return addr.split(',').slice(0, 2).join(', ');
}

function urgencyClass(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'border-l-4 border-l-red-500 bg-red-50';
    if (isTomorrow(d)) return 'border-l-4 border-l-orange-400 bg-orange-50';
    const days = differenceInCalendarDays(d, new Date());
    if (days <= 3) return 'border-l-4 border-l-yellow-400 bg-yellow-50';
  } catch {}
  return 'border-l-4 border-l-gray-200';
}

function urgencyBadge(dateStr: string): React.ReactNode {
  try {
    const d = parseISO(dateStr);
    if (isToday(d))
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          <AlertTriangle className="h-3 w-3" />
          TODAY
        </span>
      );
    if (isTomorrow(d))
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
          <Clock className="h-3 w-3" />
          TOMORROW
        </span>
      );
  } catch {}
  return null;
}

function initialsAvatar(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [data, setData] = useState<DispatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoDispatching, setAutoDispatching] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // driverId or `reassign-${bookingId}`
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/dispatch');
      if (!res.ok) throw new Error('Failed to load dispatch data');
      const json: DispatchData = await res.json();
      setData(json);
    } catch {
      if (!silent) toast.error('Could not refresh dispatch board');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAutoDispatch = async () => {
    setAutoDispatching(true);
    try {
      const res = await fetch('/api/admin/dispatch/auto', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Auto-dispatch failed');
      toast.success(
        `Auto-dispatched ${json.assigned} booking${json.assigned !== 1 ? 's' : ''}` +
          (json.failed.length > 0 ? `. ${json.failed.length} could not be assigned.` : '.')
      );
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Auto-dispatch failed');
    } finally {
      setAutoDispatching(false);
    }
  };

  const handleAssign = async (bookingId: string, driverId: string) => {
    setAssigningId(bookingId);
    setOpenDropdown(null);
    try {
      const res = await fetch('/api/admin/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, driverId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Assignment failed');
      toast.success('Driver assigned successfully');
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setAssigningId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminShell title="Dispatch Board">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#2534ff]" />
          <span className="ml-3 text-gray-500">Loading dispatch board…</span>
        </div>
      </AdminShell>
    );
  }

  const { unassigned = [], assigned = [], drivers = [] } = data ?? {};

  return (
    <AdminShell title="Dispatch Board" subtitle="Assign drivers to pending bookings">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispatch Board</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {unassigned.length} unassigned &middot; {assigned.length} active &middot;{' '}
              {drivers.filter((d) => d.isOnline).length}/{drivers.length} drivers online
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={handleAutoDispatch}
              disabled={autoDispatching || unassigned.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2534ff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a27e0] disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${autoDispatching ? 'animate-pulse' : ''}`} />
              {autoDispatching ? 'Dispatching…' : `Auto-Dispatch All (${unassigned.length})`}
            </button>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── LEFT: Needs Driver queue ───────────────────────────────────── */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {unassigned.length}
              </span>
              Needs Driver
            </h2>

            {unassigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-green-300 bg-green-50 py-10 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
                <p className="font-medium text-green-700">All bookings assigned!</p>
                <p className="mt-1 text-sm text-green-600">No pending unassigned bookings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassigned.map((bk) => (
                  <UnassignedCard
                    key={bk.id}
                    booking={bk}
                    drivers={drivers}
                    assigningId={assigningId}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── RIGHT: Driver board ────────────────────────────────────────── */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {drivers.length}
              </span>
              Driver Board
            </h2>

            {drivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                <Car className="mb-2 h-8 w-8 text-gray-400" />
                <p className="font-medium text-gray-600">No active drivers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {drivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    unassigned={unassigned}
                    assigningId={assigningId}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Assigned bookings table ──────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {assigned.length}
            </span>
            Assigned Bookings
          </h2>

          {assigned.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
              No active assigned bookings.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left">Ref</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Route</th>
                    <th className="px-4 py-3 text-left">Date / Time</th>
                    <th className="px-4 py-3 text-left">Driver</th>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Re-assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assigned.map((bk) => (
                    <AssignedRow
                      key={bk.id}
                      booking={bk}
                      drivers={drivers}
                      assigningId={assigningId}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onAssign={handleAssign}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface UnassignedCardProps {
  booking: DispatchBooking;
  drivers: DriverWithStatus[];
  assigningId: string | null;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onAssign: (bookingId: string, driverId: string) => void;
}

function UnassignedCard({
  booking,
  drivers,
  assigningId,
  openDropdown,
  setOpenDropdown,
  onAssign,
}: UnassignedCardProps) {
  const dropdownKey = `unassigned-${booking.id}`;
  const isOpen = openDropdown === dropdownKey;
  const isBusy = assigningId === booking.id;

  // Eligible drivers for this booking's vehicle type
  const eligible = drivers.filter((d) =>
    d.vehicles.some((v) => v.vehicleType === booking.vehicleType)
  );

  let dateStr = '';
  try {
    dateStr = format(parseISO(booking.pickupDate), 'EEE d MMM');
  } catch {
    dateStr = booking.pickupDate;
  }

  return (
    <div className={`rounded-xl bg-white shadow-sm ring-1 ring-black/5 ${urgencyClass(booking.pickupDate)}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-gray-700">{booking.bookingRef}</span>
              {urgencyBadge(booking.pickupDate)}
            </div>
            <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-700">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{shortAddress(booking.pickupAddress)}</span>
            </div>
            <div className="mt-0.5 ml-5 text-xs text-gray-400">
              → {shortAddress(booking.dropoffAddress)}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${VEHICLE_BADGE[booking.vehicleType]}`}
          >
            {VEHICLE_LABELS[booking.vehicleType]}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {dateStr} {booking.pickupTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {booking.passengers} pax
          </span>
        </div>

        {/* Assign dropdown */}
        <div className="relative mt-3" data-dropdown>
          <button
            onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
            disabled={isBusy || eligible.length === 0}
            className="flex w-full items-center justify-between rounded-lg border border-[#2534ff] bg-[#2534ff]/5 px-3 py-1.5 text-sm font-medium text-[#2534ff] hover:bg-[#2534ff]/10 disabled:opacity-50"
          >
            <span>
              {isBusy
                ? 'Assigning…'
                : eligible.length === 0
                ? 'No eligible drivers'
                : 'Assign driver'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && eligible.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
              {eligible.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onAssign(booking.id, d.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        d.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {initialsAvatar(d.name)}
                    </span>
                    <span className="font-medium text-gray-800">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    {d.isOnline ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      <span className="text-gray-400">Offline</span>
                    )}
                    <span>&middot; {d.bookings.length} today</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DriverCardProps {
  driver: DriverWithStatus;
  unassigned: DispatchBooking[];
  assigningId: string | null;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onAssign: (bookingId: string, driverId: string) => void;
}

function DriverCard({
  driver,
  unassigned,
  assigningId,
  openDropdown,
  setOpenDropdown,
  onAssign,
}: DriverCardProps) {
  const dropdownKey = `driver-${driver.id}`;
  const isOpen = openDropdown === dropdownKey;

  // Bookings this driver is eligible for (vehicle type match)
  const eligibleBookings = unassigned.filter((bk) =>
    driver.vehicles.some((v) => v.vehicleType === bk.vehicleType)
  );

  const primaryVehicle = driver.vehicles[0];

  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 ${
        driver.isOnline ? 'ring-green-300' : ''
      }`}
    >
      {/* Avatar + online dot */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2534ff]/10 text-sm font-bold text-[#2534ff]">
              {initialsAvatar(driver.name)}
            </span>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                driver.isOnline ? 'bg-green-400' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{driver.name}</p>
            <p className="text-xs text-gray-500">{driver.phone}</p>
          </div>
        </div>
        {driver.isOnline ? (
          <Wifi className="h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 shrink-0 text-gray-300" />
        )}
      </div>

      {/* Vehicles */}
      <div className="mt-3 flex flex-wrap gap-1">
        {driver.vehicles.length === 0 ? (
          <span className="text-xs text-gray-400">No vehicles assigned</span>
        ) : (
          driver.vehicles.map((v) => (
            <span
              key={v.id}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${VEHICLE_BADGE[v.vehicleType]}`}
            >
              {v.make} {v.model}
            </span>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Car className="h-3.5 w-3.5" />
          {driver.bookings.length} trip{driver.bookings.length !== 1 ? 's' : ''} today
        </span>
        {primaryVehicle && (
          <span className="truncate text-gray-400">{primaryVehicle.plateNumber}</span>
        )}
      </div>

      {/* Assign booking dropdown */}
      <div className="relative mt-3" data-dropdown>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
          disabled={eligibleBookings.length === 0}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          <span>
            {eligibleBookings.length === 0
              ? 'No bookings to assign'
              : `Assign booking (${eligibleBookings.length})`}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && eligibleBookings.length > 0 && (
          <div className="absolute z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-xl">
            {eligibleBookings.map((bk) => (
              <button
                key={bk.id}
                onClick={() => onAssign(bk.id, driver.id)}
                disabled={assigningId === bk.id}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
              >
                <span className="font-mono font-bold text-gray-700">{bk.bookingRef}</span>
                <span className="truncate text-gray-500">{shortAddress(bk.pickupAddress)}</span>
                <span className="text-gray-400">
                  {(() => {
                    try {
                      return format(parseISO(bk.pickupDate), 'd MMM');
                    } catch {
                      return bk.pickupDate;
                    }
                  })()}{' '}
                  {bk.pickupTime}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AssignedRowProps {
  booking: DispatchBooking;
  drivers: DriverWithStatus[];
  assigningId: string | null;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onAssign: (bookingId: string, driverId: string) => void;
}

function AssignedRow({
  booking,
  drivers,
  assigningId,
  openDropdown,
  setOpenDropdown,
  onAssign,
}: AssignedRowProps) {
  const dropdownKey = `reassign-${booking.id}`;
  const isOpen = openDropdown === dropdownKey;
  const isBusy = assigningId === booking.id;

  const assignedVehicle = booking.driver?.vehicles[0];

  let dateStr = '';
  try {
    dateStr = format(parseISO(booking.pickupDate), 'EEE d MMM');
  } catch {
    dateStr = booking.pickupDate;
  }

  return (
    <tr className="hover:bg-gray-50/50">
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-semibold text-gray-700">{booking.bookingRef}</span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-800">{booking.customerName}</div>
        <div className="text-xs text-gray-400">{booking.customerPhone}</div>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[180px]">
          <div className="truncate text-xs text-gray-700">{shortAddress(booking.pickupAddress)}</div>
          <div className="truncate text-xs text-gray-400">→ {shortAddress(booking.dropoffAddress)}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
        {dateStr}
        <br />
        <span className="text-gray-400">{booking.pickupTime}</span>
      </td>
      <td className="px-4 py-3">
        {booking.driverName ? (
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2534ff]/10 text-xs font-bold text-[#2534ff]">
              {initialsAvatar(booking.driverName)}
            </span>
            <span className="text-sm text-gray-800">{booking.driverName}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {assignedVehicle ? (
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${VEHICLE_BADGE[booking.vehicleType]}`}>
            {VEHICLE_LABELS[booking.vehicleType]}
          </span>
        ) : (
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${VEHICLE_BADGE[booking.vehicleType]}`}>
            {VEHICLE_LABELS[booking.vehicleType]}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CHIP[booking.currentStatus]}`}
        >
          {STATUS_LABELS[booking.currentStatus]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
            disabled={isBusy}
            className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isBusy ? 'Updating…' : 'Re-assign'}
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white shadow-xl">
              {drivers.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">No drivers available</div>
              ) : (
                drivers
                  .filter((d) => d.id !== booking.driverId)
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onAssign(booking.id, d.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-gray-800">{d.name}</span>
                      <span className={`text-xs ${d.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                        {d.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
