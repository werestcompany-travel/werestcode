'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoyaltyProgressBar from '@/components/account/LoyaltyProgressBar';
import {
  Heart, BookOpen, User, MapPin, Calendar, Ticket,
  ExternalLink, Trash2, ChevronRight, Star, Package, Compass,
  Car, Gift, Users, Plus, X, Pencil,
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

interface TravellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
  dietaryRequirements?: string;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED:        'bg-green-50 text-green-700 border-green-200',
  DRIVER_CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  DRIVER_STANDBY:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  DRIVER_PICKED_UP: 'bg-brand-50 text-brand-700 border-brand-200',
  COMPLETED:        'bg-green-50 text-green-700 border-green-200',
  CANCELLED:        'bg-red-50 text-red-700 border-red-200',
  USED:             'bg-gray-50 text-gray-600 border-gray-200',
};

const SERVICE_ICONS: Record<string, string> = {
  transfer:   '🚗',
  tour:       '🗺️',
  attraction: '🎟️',
};

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = 'werest_travellers';

function loadTravellers(): TravellerProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveTravellers(profiles: TravellerProfile[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(profiles));
}

// ─── Traveller modal ──────────────────────────────────────────────────────────

function TravellerModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: TravellerProfile;
  onSave: (p: TravellerProfile) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<TravellerProfile, 'id' | 'createdAt'>>({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    nationality: initial?.nationality ?? '',
    passportNumber: initial?.passportNumber ?? '',
    dietaryRequirements: initial?.dietaryRequirements ?? '',
  });

  function handleSave() {
    if (!form.name || !form.nationality) return;
    onSave({
      id: initial?.id ?? Math.random().toString(36).slice(2),
      ...form,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{initial ? 'Edit Traveller' : 'Add Traveller'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {(
            [
              { key: 'name',                 label: 'Full name *',              type: 'text' },
              { key: 'email',                label: 'Email',                    type: 'email' },
              { key: 'phone',                label: 'Phone',                    type: 'tel' },
              { key: 'nationality',          label: 'Nationality *',            type: 'text' },
              { key: 'passportNumber',       label: 'Passport number',          type: 'text' },
              { key: 'dietaryRequirements',  label: 'Dietary requirements',     type: 'text' },
            ] as { key: keyof typeof form; label: string; type: string }[]
          ).map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
              <input
                type={type}
                value={form[key] ?? ''}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#2534ff] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main account content ─────────────────────────────────────────────────────

function AccountContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const tabParam     = searchParams.get('tab');

  type TabId = 'profile' | 'wishlist' | 'bookings' | 'travellers' | 'referral';

  const [tab,       setTab]       = useState<TabId>((tabParam as TabId) ?? 'profile');
  const [user,      setUser]      = useState<UserInfo | null>(null);
  const [wishlist,  setWishlist]  = useState<WishlistItem[]>([]);
  const [bookings,  setBookings]  = useState<AttractionBooking[]>([]);
  const [loading,   setLoading]   = useState(true);

  // Unified bookings (all types)
  const [allBookings, setAllBookings] = useState<UnifiedBooking[]>([]);

  // Travellers
  const [travellers,     setTravellers]     = useState<TravellerProfile[]>([]);
  const [travellerModal, setTravellerModal] = useState<null | 'add' | TravellerProfile>(null);
  const [deleteConfirm,  setDeleteConfirm]  = useState<string | null>(null);

  // Referral copy
  const [refCopied, setRefCopied] = useState(false);

  useEffect(() => {
    setTravellers(loadTravellers());
  }, []);

  useEffect(() => {
    async function load() {
      const [meRes, wlRes, bkRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/wishlist'),
        fetch('/api/user/bookings'),
      ]);
      const meData = await meRes.json();
      if (!meData.user) { router.push('/auth/login'); return; }
      setUser(meData.user);
      setWishlist((await wlRes.json()).items ?? []);
      const attrBookings: AttractionBooking[] = (await bkRes.json()).bookings ?? [];
      setBookings(attrBookings);

      // Build unified list (only attraction for now from API; extend when transfer/tour APIs added)
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

  function saveTravellerProfile(profile: TravellerProfile) {
    setTravellers(prev => {
      const exists = prev.findIndex(p => p.id === profile.id);
      const next = exists >= 0
        ? prev.map(p => p.id === profile.id ? profile : p)
        : [...prev, profile];
      saveTravellers(next);
      return next;
    });
    setTravellerModal(null);
  }

  function deleteTraveller(id: string) {
    setTravellers(prev => {
      const next = prev.filter(p => p.id !== id);
      saveTravellers(next);
      return next;
    });
    setDeleteConfirm(null);
  }

  async function copyReferral() {
    if (!user) return;
    const link = `https://werest.com?ref=${user.id}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  }

  async function removeWishlist(attractionId: string) {
    await fetch(`/api/user/wishlist?attractionId=${encodeURIComponent(attractionId)}`, { method: 'DELETE' });
    setWishlist(prev => prev.filter(w => w.attractionId !== attractionId));
  }

  function getWishlistItemMeta(item: WishlistItem): { icon: React.ReactNode; href: string; linkLabel: string } {
    const id = item.attractionId;
    if (id.startsWith('tour:')) {
      const slug = id.slice('tour:'.length);
      return { icon: <MapPin className="w-5 h-5 text-brand-600" />, href: `/tours/${slug}`, linkLabel: 'View tour' };
    }
    if (id.startsWith('place:')) {
      return { icon: <Compass className="w-5 h-5 text-brand-600" />, href: '/attractions', linkLabel: 'Browse experiences' };
    }
    return {
      icon: <Star className="w-5 h-5 text-brand-600" />,
      href: item.attractionUrl ?? '/attractions',
      linkLabel: item.attractionUrl ? 'View attraction' : 'Browse tickets',
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();

  const upcomingBookings = allBookings.filter(b => new Date(b.date) >= now);
  const pastBookings     = allBookings.filter(b => new Date(b.date) <  now);

  // Review-eligible: past bookings (date > 24h ago, status completed)
  const reviewEligible = pastBookings.filter(b => {
    const hoursAgo = (now.getTime() - new Date(b.date).getTime()) / 36e5;
    return hoursAgo > 24 && (b.status === 'COMPLETED' || b.status === 'USED' || hoursAgo > 48);
  }).slice(0, 1); // show only the latest one

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'profile',   label: 'Profile',    icon: <User      className="w-4 h-4" /> },
    { id: 'bookings',  label: 'Bookings',   icon: <BookOpen  className="w-4 h-4" />, count: allBookings.length },
    { id: 'wishlist',  label: 'Wishlist',   icon: <Heart     className="w-4 h-4" />, count: wishlist.length },
    { id: 'travellers',label: 'Travellers', icon: <Users     className="w-4 h-4" />, count: travellers.length },
    { id: 'referral',  label: 'Refer',      icon: <Gift      className="w-4 h-4" /> },
  ];

  return (
    <>
      <Navbar />
      {travellerModal && (
        <TravellerModal
          initial={travellerModal === 'add' ? undefined : travellerModal}
          onSave={saveTravellerProfile}
          onClose={() => setTravellerModal(null)}
        />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <p className="font-semibold text-gray-900 mb-4">
              Remove &ldquo;{travellers.find(t => t.id === deleteConfirm)?.name}&rdquo; from saved travellers?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => deleteTraveller(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
                {user?.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">{user?.name}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 border-b border-gray-100 -mb-px overflow-x-auto">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.icon} {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="space-y-6">
              {/* Loyalty progress bar */}
              <LoyaltyProgressBar
                points={user?.loyaltyPoints ?? 0}
                tier={user?.tierLevel ?? 'EXPLORER'}
              />

              <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
                <h2 className="font-bold text-gray-900 mb-5">Account details</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Full name',    value: user?.name },
                    { label: 'Email',        value: user?.email },
                    { label: 'Phone',        value: user?.phone ?? '—' },
                    { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{f.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {tab === 'bookings' && (
            <div className="space-y-6">
              {/* Review prompt */}
              {reviewEligible.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="text-3xl">🎁</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      How was your {reviewEligible[0].serviceName}?
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Share your experience and earn 50 loyalty points
                    </p>
                  </div>
                  <Link
                    href={`/review/write?ref=${reviewEligible[0].bookingRef}&type=${reviewEligible[0].serviceType}`}
                    className="shrink-0 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Write a Review
                  </Link>
                </div>
              )}

              {allBookings.length === 0 ? (
                <div className="text-center py-20">
                  <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 mb-1">No bookings yet</p>
                  <p className="text-sm text-gray-400 mb-6">
                    No bookings yet — start exploring Thailand!
                  </p>
                  <Link href="/tours" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                    Explore Thailand <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  {/* Upcoming */}
                  {upcomingBookings.length > 0 && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        Upcoming
                      </h2>
                      <div className="space-y-3">
                        {upcomingBookings.map(bk => (
                          <BookingRow key={bk.id} booking={bk} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {upcomingBookings.length > 0 && pastBookings.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Past trips</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  {/* Past */}
                  {pastBookings.length > 0 && (
                    <div>
                      {upcomingBookings.length === 0 && (
                        <h2 className="font-bold text-gray-900 mb-3">Past trips</h2>
                      )}
                      <div className="space-y-3">
                        {pastBookings.map(bk => (
                          <BookingRow key={bk.id} booking={bk} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── WISHLIST TAB ── */}
          {tab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400 mb-6">Tap the heart icon on any tour or attraction to save it here</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/tours" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                      Browse tours <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link href="/attractions" className="inline-flex items-center gap-2 border border-brand-600 text-brand-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
                      Browse attractions <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map(item => {
                    const meta = getWishlistItemMeta(item);
                    return (
                      <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                            {meta.icon}
                          </div>
                          <button onClick={() => removeWishlist(item.attractionId)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove from wishlist">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{item.attractionName}</h3>
                        <p className="text-xs text-gray-400 mb-4">
                          Saved {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <Link href={meta.href} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                          {meta.linkLabel} <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SAVED TRAVELLERS TAB ── */}
          {tab === 'travellers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Your Saved Travellers</h2>
                <button
                  onClick={() => setTravellerModal('add')}
                  className="flex items-center gap-1.5 bg-[#2534ff] text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Traveller
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Your details are saved locally on this device
              </p>

              {travellers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">No saved travellers yet</p>
                  <p className="text-sm text-gray-400 mb-4">Save profiles for quick checkout</p>
                  <button
                    onClick={() => setTravellerModal('add')}
                    className="inline-flex items-center gap-2 bg-[#2534ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" /> Add Traveller
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {travellers.map(t => (
                    <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-lg shrink-0">
                        {t.nationality.length <= 3 ? '🌍' : t.nationality[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.nationality}</p>
                        {t.passportNumber && (
                          <p className="text-xs text-gray-400 font-mono">
                            **{t.passportNumber.slice(-6)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setTravellerModal(t)}
                          className="p-2 text-gray-400 hover:text-[#2534ff] transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(t.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REFERRAL TAB ── */}
          {tab === 'referral' && (
            <div className="max-w-lg space-y-5">
              <div className="bg-gradient-to-br from-[#2534ff] to-blue-500 rounded-2xl p-6 text-white">
                <h2 className="text-lg font-extrabold mb-1">Refer a Friend</h2>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Share this link — your friend gets ฿100 off their first booking, and you earn ฿100 credit when they book.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
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

              {/* Referral stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                  <p className="text-3xl font-black text-gray-900">0</p>
                  <p className="text-xs text-gray-400 mt-1">Friends referred</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                  <p className="text-3xl font-black text-gray-900">฿0</p>
                  <p className="text-xs text-gray-400 mt-1">Credit earned</p>
                </div>
              </div>

              {/* Referral code badge */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2534ff]/10 flex items-center justify-center text-2xl shrink-0">
                  🎫
                </div>
                <div>
                  <p className="text-xs text-gray-400">Your referral code</p>
                  <p className="font-mono font-extrabold text-gray-900 text-sm">{user?.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

// ─── Booking row sub-component ────────────────────────────────────────────────

function BookingRow({ booking }: { booking: UnifiedBooking }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 mt-0.5">{SERVICE_ICONS[booking.serviceType]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-mono">
              {booking.bookingRef}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.PENDING}`}>
              {booking.status}
            </span>
          </div>
          <p className="font-bold text-gray-900 text-sm leading-snug">{booking.serviceName}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="font-semibold text-gray-700">฿{booking.price.toLocaleString()}</span>
          </div>
        </div>
        {booking.viewUrl && (
          <Link href={booking.viewUrl} className="shrink-0 text-xs text-brand-600 font-semibold hover:underline">
            View
          </Link>
        )}
      </div>
    </div>
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
