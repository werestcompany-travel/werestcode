'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingCalendar from '@/components/account/BookingCalendar';
import PushNotificationBell from '@/components/PushNotificationBell';
import {
  Heart, BookOpen, User, MapPin, Calendar, Ticket,
  ExternalLink, Trash2, ChevronRight, Star, Compass,
  Gift, X, CalendarDays, ChevronDown, ChevronUp,
  Car, LogOut, Award, Route, Pencil, Check,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  tierLevel: string;
  createdAt: string;
}

interface SavedRouteItem {
  id: string;
  label: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType?: string | null;
  createdAt: string;
}

interface WishlistItem {
  id: string;
  attractionId: string;
  attractionName: string;
  attractionUrl?: string;
  createdAt: string;
}

interface AttractionBooking {
  id: string;
  bookingRef: string;
  attractionName: string;
  packageName: string;
  visitDate: string;
  adultQty: number;
  childQty: number;
  infantQty: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface UnifiedBooking {
  id: string;
  bookingRef: string;
  serviceType: 'transfer' | 'tour' | 'attraction';
  serviceName: string;
  date: string;
  status: string;
  price: number;
  viewUrl?: string;
}

// ─── Tab & filter types ───────────────────────────────────────────────────────

type TabId =
  | 'all' | 'transfers' | 'tours' | 'attractions'
  | 'wishlist' | 'calendar' | 'routes'
  | 'profile' | 'referral';

type BookingFilter = 'all' | 'upcoming' | 'past' | 'review';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:        'bg-green-50 text-green-700 border-green-200',
  DRIVER_CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  DRIVER_STANDBY:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  DRIVER_PICKED_UP: 'bg-blue-50 text-blue-800 border-blue-200',
  COMPLETED:        'bg-green-50 text-green-700 border-green-200',
  CANCELLED:        'bg-red-50 text-red-700 border-red-200',
  USED:             'bg-gray-50 text-gray-600 border-gray-200',
};

const SERVICE_ICONS: Record<string, string> = {
  transfer:   '🚗',
  tour:       '🗺️',
  attraction: '🎟️',
};

const TIER_META: Record<string, { label: string; icon: string; color: string }> = {
  EXPLORER:   { label: 'Explorer',   icon: '🌱', color: 'text-emerald-600 bg-emerald-50' },
  ADVENTURER: { label: 'Adventurer', icon: '🏔️', color: 'text-blue-600 bg-blue-50'      },
  NAVIGATOR:  { label: 'Navigator',  icon: '🧭', color: 'text-violet-600 bg-violet-50'   },
  VOYAGER:    { label: 'Voyager',    icon: '⛵', color: 'text-amber-600 bg-amber-50'     },
};

// ─── Sidebar item ─────────────────────────────────────────────────────────────

function SidebarBtn({
  label, icon, count, active, onClick, indent,
}: {
  label: string; icon?: React.ReactNode; count?: number;
  active: boolean; onClick: () => void; indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 text-sm transition-colors ${
        indent ? 'py-2 pl-10 pr-4' : 'py-2.5 px-4'
      } ${
        active
          ? 'border-l-[3px] border-[#2534ff] text-[#2534ff] bg-blue-50 font-semibold'
          : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 text-left leading-tight">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? 'bg-[#2534ff]/10 text-[#2534ff]' : 'bg-gray-100 text-gray-500'
        }`}>{count}</span>
      )}
    </button>
  );
}

// ─── Booking row ──────────────────────────────────────────────────────────────

function BookingRow({ booking, onCancel }: { booking: UnifiedBooking; onCancel?: (id: string) => void }) {
  const canCancel =
    booking.serviceType === 'transfer' &&
    (booking.status === 'PENDING' || booking.status === 'DRIVER_CONFIRMED') &&
    new Date(booking.date).getTime() - Date.now() > 24 * 60 * 60 * 1000;

  async function handleCancel() {
    if (!confirm('Cancel this booking? You will receive a full refund within 3–7 business days.')) return;
    const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      alert('Booking cancelled.');
      onCancel?.(booking.id);
    } else {
      const d = await res.json();
      alert(d.error ?? 'Failed to cancel');
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-xl shrink-0 mt-0.5">{SERVICE_ICONS[booking.serviceType]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold text-[#2534ff] bg-blue-50 px-2 py-0.5 rounded-full font-mono">
              {booking.bookingRef}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.PENDING}`}>
              {booking.status}
            </span>
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-snug">{booking.serviceName}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="font-semibold text-gray-700">฿{booking.price.toLocaleString()}</span>
          </div>
          {canCancel && (
            <div className="mt-2">
              <button
                onClick={handleCancel}
                className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel booking
              </button>
            </div>
          )}
        </div>
        {booking.viewUrl && (
          <Link href={booking.viewUrl} className="shrink-0 text-xs text-[#2534ff] font-semibold hover:underline">
            View
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Saved Routes Tab ─────────────────────────────────────────────────────────

function RouteCard({
  route,
  onDelete,
  onRename,
}: {
  route: SavedRouteItem;
  onDelete: (id: string) => void;
  onRename: (id: string, label: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState(route.label);

  function commitRename() {
    const trimmed = labelDraft.trim();
    if (trimmed && trimmed !== route.label) {
      onRename(route.id, trimmed);
    }
    setEditing(false);
  }

  const bookAgainUrl = `/results?pickup_address=${encodeURIComponent(route.pickupAddress)}&dropoff_address=${encodeURIComponent(route.dropoffAddress)}`;

  const VEHICLE_LABELS: Record<string, string> = {
    SEDAN: 'Sedan', SUV: 'SUV', MINIVAN: 'Minivan', LUXURY_MPV: 'Luxury MPV',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      {/* Label row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              className="flex-1 border border-[#2534ff] rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none"
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={commitRename} className="text-[#2534ff] hover:text-blue-700 p-1">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{route.label}</p>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 text-gray-300 hover:text-[#2534ff] transition-colors p-0.5"
              title="Rename"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button
          onClick={() => onDelete(route.id)}
          className="shrink-0 text-gray-300 hover:text-red-500 transition-colors p-1"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Route */}
      <div className="space-y-1 mb-3">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 mt-1" />
          <span className="line-clamp-1">{route.pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1" />
          <span className="line-clamp-1">{route.dropoffAddress}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {route.vehicleType ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2534ff] border border-blue-100">
            {VEHICLE_LABELS[route.vehicleType] ?? route.vehicleType}
          </span>
        ) : (
          <span />
        )}
        <a
          href={bookAgainUrl}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:underline"
        >
          Book again <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function SavedRoutesTab({
  routes,
  onDelete,
  onRename,
}: {
  routes: SavedRouteItem[];
  onDelete: (id: string) => void;
  onRename: (id: string, label: string) => void;
}) {
  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900 mb-4">Saved Routes</h1>
      {routes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 text-center py-16">
          <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">You have no saved routes yet</p>
          <p className="text-sm text-gray-400 mb-5">Save a route from the booking results page to quickly book again</p>
          <a
            href="/results"
            className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Book a transfer <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {routes.map(r => (
            <RouteCard key={r.id} route={r} onDelete={onDelete} onRename={onRename} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main account content ─────────────────────────────────────────────────────

function AccountContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tabParam     = (searchParams.get('tab') as TabId) ?? 'all';

  const [tab,           setTab]           = useState<TabId>(tabParam);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('upcoming');
  const [bookingsOpen,  setBookingsOpen]  = useState(true);
  const [accountOpen,   setAccountOpen]   = useState(false);

  const [user,          setUser]          = useState<UserInfo | null>(null);
  const [wishlist,      setWishlist]      = useState<WishlistItem[]>([]);
  const [allBookings,   setAllBookings]   = useState<UnifiedBooking[]>([]);
  const [savedRoutes,   setSavedRoutes]   = useState<SavedRouteItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refCopied,     setRefCopied]     = useState(false);

  useEffect(() => {
    async function load() {
      const [meRes, wlRes, bkRes, srRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/wishlist'),
        fetch('/api/user/bookings'),
        fetch('/api/user/saved-routes'),
      ]);
      const meData = await meRes.json();
      if (!meData.user) { router.push('/auth/login'); return; }
      setUser(meData.user);
      setWishlist((await wlRes.json()).items ?? []);
      setSavedRoutes((await srRes.json()).routes ?? []);
      const attrBookings: AttractionBooking[] = (await bkRes.json()).bookings ?? [];
      const unified: UnifiedBooking[] = attrBookings.map(b => ({
        id:          b.id,
        bookingRef:  b.bookingRef,
        serviceType: 'attraction' as const,
        serviceName: b.attractionName,
        date:        b.visitDate,
        status:      b.status,
        price:       b.totalPrice,
      }));
      unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllBookings(unified);
      setLoading(false);
    }
    load();
  }, [router]);

  async function copyReferral() {
    if (!user) return;
    await navigator.clipboard.writeText(`https://werest.com?ref=${user.id}`).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  }

  async function removeWishlist(attractionId: string) {
    await fetch(`/api/user/wishlist?attractionId=${encodeURIComponent(attractionId)}`, { method: 'DELETE' });
    setWishlist(prev => prev.filter(w => w.attractionId !== attractionId));
  }

  async function deleteSavedRoute(id: string) {
    await fetch(`/api/user/saved-routes/${id}`, { method: 'DELETE' });
    setSavedRoutes(prev => prev.filter(r => r.id !== id));
  }

  async function renameSavedRoute(id: string, label: string) {
    const res = await fetch(`/api/user/saved-routes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      const data = await res.json();
      setSavedRoutes(prev => prev.map(r => r.id === id ? { ...r, label: data.route.label } : r));
    }
  }

  function getWishlistMeta(item: WishlistItem) {
    const id = item.attractionId;
    if (id.startsWith('tour:'))  return { icon: <MapPin className="w-4 h-4 text-[#2534ff]" />, href: `/tours/${id.slice(5)}`, linkLabel: 'View tour' };
    if (id.startsWith('place:')) return { icon: <Compass className="w-4 h-4 text-[#2534ff]" />, href: '/attractions', linkLabel: 'Browse' };
    return { icon: <Star className="w-4 h-4 text-[#2534ff]" />, href: item.attractionUrl ?? '/attractions', linkLabel: 'View' };
  }

  function getFilteredBookings(source: UnifiedBooking[]) {
    const now = new Date();
    switch (bookingFilter) {
      case 'upcoming': return source.filter(b => new Date(b.date) >= now && b.status !== 'CANCELLED');
      case 'past':     return source.filter(b => new Date(b.date) <  now);
      case 'review':   return source.filter(b => {
        const h = (now.getTime() - new Date(b.date).getTime()) / 36e5;
        return h > 24 && (b.status === 'COMPLETED' || b.status === 'USED');
      });
      default: return source;
    }
  }

  function getBookingsForTab(): UnifiedBooking[] {
    switch (tab) {
      case 'transfers':   return allBookings.filter(b => b.serviceType === 'transfer');
      case 'tours':       return allBookings.filter(b => b.serviceType === 'tour');
      case 'attractions': return allBookings.filter(b => b.serviceType === 'attraction');
      default:            return allBookings;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2534ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tier         = TIER_META[user?.tierLevel ?? 'EXPLORER'] ?? TIER_META.EXPLORER;
  const isBookingTab = ['all', 'transfers', 'tours', 'attractions'].includes(tab);
  const filteredBookings = getFilteredBookings(getBookingsForTab());

  const reviewEligible = allBookings.filter(b => {
    const h = (new Date().getTime() - new Date(b.date).getTime()) / 36e5;
    return h > 24 && (b.status === 'COMPLETED' || b.status === 'USED');
  });

  const BOOKING_SUB_TABS = [
    { id: 'all'         as TabId, label: 'All',                 count: allBookings.length },
    { id: 'transfers'   as TabId, label: 'Private Transfers',   count: allBookings.filter(b => b.serviceType === 'transfer').length   },
    { id: 'tours'       as TabId, label: 'Tours & Experiences', count: allBookings.filter(b => b.serviceType === 'tour').length        },
    { id: 'attractions' as TabId, label: 'Attraction Ticket',   count: allBookings.filter(b => b.serviceType === 'attraction').length  },
  ];

  const MOBILE_TABS: { id: TabId; label: string }[] = [
    { id: 'all',      label: 'Bookings' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'routes',   label: 'Routes'   },
    { id: 'calendar', label: 'Calendar' },
    { id: 'profile',  label: 'Profile'  },
    { id: 'referral', label: 'Refer'    },
  ];

  return (
    <>
      <Navbar />

      <div className="pt-16 min-h-screen bg-[#f5f5f5]">

        {/* ── Mobile header + compact tabs ──────────────────────────────── */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-5 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#2534ff] flex items-center justify-center text-white font-extrabold text-lg shrink-0">
              {user?.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{user?.name}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${tier.color}`}>
                {tier.icon} {tier.label}
              </span>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-0 -mx-4 px-4">
            {MOBILE_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  (tab === t.id || (t.id === 'all' && isBookingTab))
                    ? 'border-[#2534ff] text-[#2534ff]'
                    : 'border-transparent text-gray-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Page body ─────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="lg:grid lg:grid-cols-[256px_1fr] lg:gap-6 lg:items-start">

            {/* ── Sidebar (desktop) ──────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-20">

                {/* User card */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2534ff] flex items-center justify-center text-white font-extrabold text-xl shrink-0">
                      {user?.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Nav */}
                <nav className="py-2">

                  {/* My Bookings dropdown */}
                  <button
                    onClick={() => setBookingsOpen(o => !o)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-l-[3px] border-transparent"
                  >
                    <BookOpen className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="flex-1 text-left">My Bookings</span>
                    {allBookings.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {allBookings.length}
                      </span>
                    )}
                    {bookingsOpen
                      ? <ChevronUp   className="w-3.5 h-3.5 text-gray-400" />
                      : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                  {bookingsOpen && (
                    <div className="pb-1">
                      {BOOKING_SUB_TABS.map(item => (
                        <SidebarBtn
                          key={item.id}
                          label={item.label}
                          count={item.count}
                          active={tab === item.id}
                          onClick={() => setTab(item.id)}
                          indent
                        />
                      ))}
                    </div>
                  )}

                  {/* Standalone items */}
                  <SidebarBtn label="Wishlist"      icon={<Heart        className="w-4 h-4 text-gray-500" />} count={wishlist.length}    active={tab === 'wishlist'} onClick={() => setTab('wishlist')} />
                  <SidebarBtn label="Saved Routes" icon={<Route        className="w-4 h-4 text-gray-500" />} count={savedRoutes.length} active={tab === 'routes'}  onClick={() => setTab('routes')}  />
                  <SidebarBtn label="Calendar"     icon={<CalendarDays className="w-4 h-4 text-gray-500" />}                            active={tab === 'calendar'} onClick={() => setTab('calendar')} />

                  <div className="my-2 mx-4 border-t border-gray-100" />

                  {/* Account dropdown */}
                  <button
                    onClick={() => setAccountOpen(o => !o)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-l-[3px] border-transparent"
                  >
                    <User className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="flex-1 text-left">Account</span>
                    {accountOpen
                      ? <ChevronUp   className="w-3.5 h-3.5 text-gray-400" />
                      : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                  {accountOpen && (
                    <div className="pb-1">
                      <SidebarBtn label="Profile"       active={tab === 'profile'}  onClick={() => setTab('profile')}  indent />
                      <SidebarBtn label="Refer a Friend" icon={<Gift className="w-3.5 h-3.5 text-gray-400" />} active={tab === 'referral'} onClick={() => setTab('referral')} indent />
                    </div>
                  )}

                  {/* Werest Rewards */}
                  <Link
                    href="/account/rewards"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 border-l-[3px] border-transparent hover:border-amber-400 transition-colors"
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="flex-1">Werest Rewards</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>

                  <div className="my-2 mx-4 border-t border-gray-100" />

                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 border-l-[3px] border-transparent transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign out</span>
                  </Link>
                </nav>
              </div>
            </aside>

            {/* ── Main content ───────────────────────────────────────────── */}
            <main className="min-w-0 space-y-4 mt-4 lg:mt-0">

              {/* ── BOOKINGS ──────────────────────────────────────────────── */}
              {isBookingTab && (
                <div>
                  {/* Heading */}
                  <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-bold text-gray-900">
                      {tab === 'transfers'   ? 'Private Transfers'   :
                       tab === 'tours'       ? 'Tours & Experiences' :
                       tab === 'attractions' ? 'Attraction Ticket'   : 'All Bookings'}
                    </h1>
                  </div>

                  {/* Review prompt */}
                  {tab === 'all' && reviewEligible.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3 mb-3">
                      <span className="text-2xl">🎁</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">How was your {reviewEligible[0].serviceName}?</p>
                        <p className="text-xs text-gray-500 mt-0.5">Share your experience and earn 50 loyalty points</p>
                      </div>
                      <Link
                        href={`/review/write?ref=${reviewEligible[0].bookingRef}&type=${reviewEligible[0].serviceType}`}
                        className="shrink-0 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Write Review
                      </Link>
                    </div>
                  )}

                  {/* Status filter bar */}
                  <div className="bg-white rounded-xl border border-gray-100 mb-3 flex overflow-x-auto">
                    {([
                      { id: 'upcoming' as BookingFilter, label: 'Upcoming'        },
                      { id: 'all'      as BookingFilter, label: 'All'             },
                      { id: 'past'     as BookingFilter, label: 'Past'            },
                      { id: 'review'   as BookingFilter, label: 'Awaiting Review' },
                    ]).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setBookingFilter(f.id)}
                        className={`shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                          bookingFilter === f.id
                            ? 'border-[#2534ff] text-[#2534ff]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* List */}
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 text-center py-16">
                      <Ticket className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="font-semibold text-gray-700 mb-1">
                        {bookingFilter === 'upcoming' ? 'No upcoming bookings'  :
                         bookingFilter === 'past'     ? 'No past bookings'      :
                         bookingFilter === 'review'   ? 'Nothing to review yet' : 'No bookings yet'}
                      </p>
                      <p className="text-sm text-gray-400 mb-5">Start exploring Thailand!</p>
                      <Link href="/tours" className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                        Explore Thailand <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredBookings.map(bk => (
                        <BookingRow
                          key={bk.id}
                          booking={bk}
                          onCancel={id => setAllBookings(prev =>
                            prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── WISHLIST ───────────────────────────────────────────────── */}
              {tab === 'wishlist' && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 mb-4">Wishlist</h1>
                  {wishlist.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 text-center py-16">
                      <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
                      <p className="text-sm text-gray-400 mb-5">Tap the heart icon on any tour to save it here</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/tours" className="inline-flex items-center gap-2 bg-[#2534ff] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                          Browse tours
                        </Link>
                        <Link href="/attractions" className="inline-flex items-center gap-2 border border-[#2534ff] text-[#2534ff] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                          Attractions
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {wishlist.map(item => {
                        const meta = getWishlistMeta(item);
                        return (
                          <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">{meta.icon}</div>
                              <button onClick={() => removeWishlist(item.attractionId)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{item.attractionName}</h3>
                            <p className="text-xs text-gray-400 mb-3">
                              Saved {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <Link href={meta.href} className="flex items-center gap-1 text-xs font-semibold text-[#2534ff] hover:underline">
                              {meta.linkLabel} <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── SAVED ROUTES ───────────────────────────────────────────── */}
              {tab === 'routes' && (
                <SavedRoutesTab
                  routes={savedRoutes}
                  onDelete={deleteSavedRoute}
                  onRename={renameSavedRoute}
                />
              )}

              {/* ── CALENDAR ───────────────────────────────────────────────── */}
              {tab === 'calendar' && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 mb-4">Calendar</h1>
                  <BookingCalendar bookings={allBookings} />
                </div>
              )}

              {/* ── PROFILE ────────────────────────────────────────────────── */}
              {tab === 'profile' && (
                <div className="space-y-4">
                  <h1 className="text-lg font-bold text-gray-900">Profile</h1>

                  {/* Loyalty card */}
                  <div className="bg-gradient-to-r from-[#2534ff] to-blue-500 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-100 mb-0.5">Loyalty status</p>
                        <p className="text-2xl font-extrabold">
                          {(user?.loyaltyPoints ?? 0).toLocaleString()} <span className="text-base font-semibold text-blue-200">pts</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                        {tier.icon} {tier.label}
                      </span>
                    </div>
                    <Link href="/account/rewards" className="mt-3 inline-flex items-center gap-1 text-blue-100 text-xs font-semibold hover:text-white transition-colors">
                      View Werest Rewards <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Account details */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="font-bold text-gray-900 mb-4">Account details</h2>
                    <div className="divide-y divide-gray-50">
                      {[
                        { label: 'Full name',    value: user?.name },
                        { label: 'Email',        value: user?.email },
                        { label: 'Phone',        value: user?.phone ?? '—' },
                        { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—' },
                      ].map(f => (
                        <div key={f.label} className="flex items-center justify-between py-3">
                          <span className="text-sm text-gray-500">{f.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h2 className="font-bold text-gray-900 mb-3">Notifications</h2>
                    <PushNotificationBell />
                  </div>
                </div>
              )}

              {/* ── REFERRAL ───────────────────────────────────────────────── */}
              {tab === 'referral' && (
                <div className="max-w-2xl space-y-4">
                  <h1 className="text-lg font-bold text-gray-900">Refer a Friend</h1>

                  <div className="bg-gradient-to-br from-[#2534ff] to-blue-500 rounded-xl p-6 text-white">
                    <p className="text-2xl font-extrabold mb-1">Invite friends, earn rewards</p>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Your friend gets ฿100 off their first booking. You earn ฿100 credit when they complete a booking.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your referral link</p>
                    <div className="flex gap-3 items-center">
                      <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 truncate font-mono">
                        https://werest.com?ref={user?.id}
                      </code>
                      <button
                        onClick={copyReferral}
                        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          refCopied
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-[#2534ff] text-white hover:bg-blue-700'
                        }`}
                      >
                        {refCopied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                      <p className="text-3xl font-black text-gray-900">0</p>
                      <p className="text-xs text-gray-400 mt-1">Friends referred</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                      <p className="text-3xl font-black text-gray-900">฿0</p>
                      <p className="text-xs text-gray-400 mt-1">Credit earned</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-xl shrink-0">🎫</div>
                    <div>
                      <p className="text-xs text-gray-400">Your referral code</p>
                      <p className="font-mono font-extrabold text-gray-900 text-sm">{user?.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
