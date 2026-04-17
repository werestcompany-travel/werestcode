'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Heart, BookOpen, User, MapPin, Calendar, Ticket,
  ExternalLink, Trash2, ChevronRight, Star, Package,
} from 'lucide-react';

interface UserInfo { id: string; name: string; email: string; phone?: string; createdAt: string; }
interface WishlistItem { id: string; attractionId: string; attractionName: string; attractionUrl?: string; createdAt: string; }
interface AttractionBooking {
  id: string; bookingRef: string; attractionName: string; packageName: string;
  visitDate: string; adultQty: number; childQty: number; infantQty: number;
  totalPrice: number; status: string; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  USED:      'bg-gray-50 text-gray-600 border-gray-200',
};

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [tab,      setTab]      = useState<'profile' | 'wishlist' | 'bookings'>(
    (tabParam as 'profile' | 'wishlist' | 'bookings') ?? 'profile'
  );
  const [user,     setUser]     = useState<UserInfo | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [bookings, setBookings] = useState<AttractionBooking[]>([]);
  const [loading,  setLoading]  = useState(true);

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
      setBookings((await bkRes.json()).bookings ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function removeWishlist(attractionId: string) {
    await fetch(`/api/user/wishlist?attractionId=${attractionId}`, { method: 'DELETE' });
    setWishlist(prev => prev.filter(w => w.attractionId !== attractionId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS = [
    { id: 'profile',  label: 'Profile',    icon: <User     className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Wishlist',   icon: <Heart    className="w-4 h-4" />, count: wishlist.length },
    { id: 'bookings', label: 'Bookings',   icon: <BookOpen className="w-4 h-4" />, count: bookings.length },
  ];

  return (
    <>
      <Navbar />
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
            <div className="flex gap-1 mt-6 border-b border-gray-100 -mb-px">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t.id
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.icon} {t.label}
                  {'count' in t && t.count! > 0 && (
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
              <h2 className="font-bold text-gray-900 mb-5">Account details</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full name',  value: user?.name },
                  { label: 'Email',      value: user?.email },
                  { label: 'Phone',      value: user?.phone ?? '—' },
                  { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—' },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{f.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WISHLIST TAB ── */}
          {tab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400 mb-6">Tap the heart icon on any attraction to save it here</p>
                  <Link href="/attractions" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                    Browse attractions <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-brand-600" />
                        </div>
                        <button onClick={() => removeWishlist(item.attractionId)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{item.attractionName}</h3>
                      <p className="text-xs text-gray-400 mb-4">
                        Saved {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {item.attractionUrl ? (
                        <Link href={item.attractionUrl}
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                          View attraction <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link href="/attractions"
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                          Browse tickets <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {tab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-20">
                  <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 mb-1">No bookings yet</p>
                  <p className="text-sm text-gray-400 mb-6">Your attraction ticket bookings will appear here</p>
                  <Link href="/attractions" className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                    Browse attractions <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                bookings.map(bk => (
                  <div key={bk.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-mono">
                            {bk.bookingRef}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[bk.status] ?? STATUS_COLORS.PENDING}`}>
                            {bk.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">{bk.attractionName}</h3>
                        <p className="text-sm text-gray-500">{bk.packageName}</p>
                      </div>
                      <p className="text-lg font-extrabold text-gray-900 shrink-0">
                        ฿{bk.totalPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(bk.visitDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-gray-400" />
                        {[
                          bk.adultQty  > 0 ? `${bk.adultQty} adult${bk.adultQty  > 1 ? 's' : ''}` : '',
                          bk.childQty  > 0 ? `${bk.childQty} child${bk.childQty  > 1 ? 'ren' : ''}` : '',
                          bk.infantQty > 0 ? `${bk.infantQty} infant${bk.infantQty > 1 ? 's' : ''}` : '',
                        ].filter(Boolean).join(', ')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Booked {new Date(bk.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountContent />
    </Suspense>
  );
}
