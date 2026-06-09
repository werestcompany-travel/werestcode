'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { ArrowLeft, User, Mail, Phone, Calendar, Award, BookOpen, Car, Ticket, Save } from 'lucide-react';

interface LoyaltyTx { id: string; points: number; type: string; description: string; bookingRef: string | null; createdAt: string; }
interface TourBooking { id: string; bookingRef: string; tourTitle: string; totalPrice: number; status: string; createdAt: string; }
interface AttractionBooking { id: string; bookingRef: string; attractionName: string; totalPrice: number; status: string; createdAt: string; }
interface TransferBooking { id: string; bookingRef: string; pickupAddress: string; dropoffAddress: string; totalPrice: number; currentStatus: string; createdAt: string; }

interface UserProfile {
  id: string; email: string; name: string; phone: string | null;
  loyaltyPoints: number; createdAt: string;
  tourBookings: TourBooking[];
  attractionBookings: AttractionBooking[];
  loyaltyTransactions: LoyaltyTx[];
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CustomerProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [user,      setUser]      = useState<UserProfile | null>(null);
  const [transfers, setTransfers] = useState<TransferBooking[]>([]);
  const [notes,     setNotes]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${userId}`)
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setTransfers(d.transferBookings ?? []);
        setLoading(false);
      });
  }, [userId]);

  async function saveNotes() {
    if (!user) return;
    setSaving(true); setSaveMsg('');
    const res = await fetch(`/api/admin/customers/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes }),
    });
    setSaveMsg(res.ok ? 'Notes saved.' : 'Failed to save.');
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminShell title="Customer Profile">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Customer Profile">
        <p className="text-gray-500 py-10 text-center">User not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={user.name} subtitle={user.email}>
      <div className="mb-5">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — user info */}
        <div className="space-y-5">
          {/* User card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <User className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2534ff]">
                  💎 {user.loyaltyPoints.toLocaleString()} pts
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                Joined {fmt(user.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4 text-gray-400 shrink-0" />
                {user.loyaltyPoints.toLocaleString()} loyalty points
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Admin Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={5}
              placeholder="Internal notes visible to admin staff only…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl py-2 text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
            {saveMsg && <p className="text-xs text-center font-semibold text-green-600 mt-1">{saveMsg}</p>}
          </div>
        </div>

        {/* Right columns — bookings + loyalty */}
        <div className="lg:col-span-2 space-y-5">

          {/* Transfers */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Car className="w-5 h-5 text-brand-600" />
              <h2 className="font-bold text-gray-900">Transfer Bookings ({transfers.length})</h2>
            </div>
            {transfers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No transfer bookings</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {transfers.map(b => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{b.bookingRef}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{b.pickupAddress} → {b.dropoffAddress}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">฿{b.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{fmt(b.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tour bookings */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <BookOpen className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">Tour Bookings ({user.tourBookings.length})</h2>
            </div>
            {user.tourBookings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No tour bookings</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {user.tourBookings.map(b => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{b.bookingRef}</p>
                      <p className="text-xs text-gray-500">{b.tourTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">฿{b.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{fmt(b.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Attraction bookings */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Ticket className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-gray-900">Attraction Tickets ({user.attractionBookings.length})</h2>
            </div>
            {user.attractionBookings.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No attraction bookings</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {user.attractionBookings.map(b => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{b.bookingRef}</p>
                      <p className="text-xs text-gray-500">{b.attractionName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-gray-900">฿{b.totalPrice.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{fmt(b.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Loyalty history */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-gray-900">Loyalty History ({user.loyaltyTransactions.length})</h2>
            </div>
            {user.loyaltyTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No transactions</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {user.loyaltyTransactions.map(tx => (
                  <div key={tx.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-700">{tx.description}</p>
                      {tx.bookingRef && <p className="text-xs text-gray-400">{tx.bookingRef}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${tx.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.points >= 0 ? '+' : ''}{tx.points} pts
                      </p>
                      <p className="text-xs text-gray-400">{fmt(tx.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
