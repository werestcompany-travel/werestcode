'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import {
  Tag, Clock, User, Hash, ArrowLeft, Percent, DollarSign,
  Users, ShieldCheck, CalendarClock, Infinity as InfinityIcon,
} from 'lucide-react';

interface Redemption {
  id: string;
  customerEmail: string;
  bookingId: string;
  usedAt: string;
}

interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  description: string | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  newUserOnly: boolean;
  perUserLimit: number | null;
  createdAt: string;
}

export default function DiscountCodeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [code,               setCode]               = useState<DiscountCode | null>(null);
  const [redemptions,        setRedemptions]        = useState<Redemption[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [redemptionsLoading, setRedemptionsLoading] = useState(true);

  useEffect(() => {
    async function loadCode() {
      try {
        const r = await fetch('/api/admin/discount-codes');
        const d = await r.json();
        const found = (d.codes ?? []).find((c: DiscountCode) => c.id === id);
        setCode(found ?? null);
      } finally {
        setLoading(false);
      }
    }

    async function loadRedemptions() {
      try {
        const r = await fetch(`/api/admin/discount-codes/${id}/redemptions`);
        const d = await r.json();
        setRedemptions(d.redemptions ?? []);
      } finally {
        setRedemptionsLoading(false);
      }
    }

    loadCode();
    loadRedemptions();
  }, [id]);

  function isExpired(c: DiscountCode) {
    return !!c.expiresAt && new Date(c.expiresAt) < new Date();
  }

  return (
    <AdminShell
      title={code ? code.code : 'Redemptions'}
      subtitle="Discount code details and usage history"
    >
      {/* Back link */}
      <Link
        href="/admin/discount-codes"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 font-semibold mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Discount Codes
      </Link>

      {/* Code summary card */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center justify-center mb-5">
          <div className="w-7 h-7 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : code ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              {code.type === 'PERCENTAGE'
                ? <Percent    className="w-5 h-5 text-brand-600" />
                : <DollarSign className="w-5 h-5 text-brand-600" />}
            </div>
            <div className="min-w-0">
              <p className="font-mono font-extrabold text-xl text-gray-900 leading-none">{code.code}</p>
              {code.description && <p className="text-sm text-gray-400 mt-0.5">{code.description}</p>}
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {code.expiresAt && isExpired(code) && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Expired</span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {code.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              icon={<Tag className="w-4 h-4 text-brand-500" />}
              label="Discount"
              value={code.type === 'PERCENTAGE' ? `${code.value}% off` : `฿${code.value.toLocaleString()} off`}
            />
            <Stat
              icon={<Users className="w-4 h-4 text-violet-500" />}
              label="Uses"
              value={code.maxUses ? `${code.usedCount} / ${code.maxUses}` : `${code.usedCount} used`}
            />
            <Stat
              icon={<CalendarClock className="w-4 h-4 text-amber-500" />}
              label="Expires"
              value={code.expiresAt
                ? new Date(code.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Never'}
            />
            <Stat
              icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              label="Restrictions"
              value={[
                code.newUserOnly && 'New users only',
                code.perUserLimit && `Max ${code.perUserLimit}/user`,
                code.minOrderAmount && `Min ฿${code.minOrderAmount.toLocaleString()}`,
              ].filter(Boolean).join(' · ') || 'None'}
            />
          </div>

          {/* Usage bar */}
          {code.maxUses && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Usage</span>
                <span>{Math.round((code.usedCount / code.maxUses) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${Math.min((code.usedCount / code.maxUses) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {!code.maxUses && (
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400">
              <InfinityIcon className="w-3.5 h-3.5" /> Unlimited uses
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 mb-5">
          Discount code not found.
        </div>
      )}

      {/* Redemptions table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-sm">Redemption History</h2>
          {!redemptionsLoading && (
            <span className="ml-auto text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {redemptions.length} {redemptions.length === 1 ? 'redemption' : 'redemptions'}
            </span>
          )}
        </div>

        {redemptionsLoading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-6 h-6 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : redemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No redemptions yet</p>
            <p className="text-xs text-gray-300">When customers use this code, their usage will appear here.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_160px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
              {['Customer', 'Booking ID', 'Used At'].map(h => (
                <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-gray-50">
              {redemptions.map((r, i) => (
                <div key={r.id} className="grid grid-cols-[1fr_1fr_160px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                  {/* Index + email */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0">
                      {i + 1}
                    </span>
                    <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{r.customerEmail}</span>
                  </div>
                  {/* Booking ID */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Hash className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <Link
                      href={`/admin/transfers?q=${r.bookingId}`}
                      className="text-sm font-mono text-brand-600 hover:text-brand-800 truncate transition-colors"
                      title="View booking"
                    >
                      {r.bookingId.slice(0, 12)}…
                    </Link>
                  </div>
                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    {new Date(r.usedAt).toLocaleString('en-GB', {
                      day: 'numeric', month: 'short', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

/* ── Helpers ── */
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">{icon}<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p></div>
      <p className="text-sm font-bold text-gray-800 leading-snug">{value}</p>
    </div>
  );
}
