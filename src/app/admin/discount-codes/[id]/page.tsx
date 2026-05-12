'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Tag, Clock, User, Hash } from 'lucide-react';

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

export default function DiscountCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [code, setCode] = useState<DiscountCode | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          Admin <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <Link href="/admin/discount-codes" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          Discount Codes <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-gray-900 font-bold font-mono">{code?.code ?? id}</span>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Code summary card */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : code ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Tag className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-mono font-extrabold text-xl text-gray-900">{code.code}</p>
                {code.description && <p className="text-sm text-gray-500">{code.description}</p>}
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {code.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <dt className="text-xs text-gray-400 uppercase font-bold tracking-wider">Value</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {code.type === 'PERCENTAGE' ? `${code.value}%` : `฿${code.value.toLocaleString()}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase font-bold tracking-wider">Uses</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase font-bold tracking-wider">Per-user limit</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {code.perUserLimit ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase font-bold tracking-wider">New users only</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {code.newUserOnly ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
            Discount code not found.
          </div>
        )}

        {/* Redemptions table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <h2 className="font-bold text-gray-900">Redemptions</h2>
            {!redemptionsLoading && (
              <span className="ml-auto text-xs text-gray-400">{redemptions.length} total</span>
            )}
          </div>

          {redemptionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No redemptions yet</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_160px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
                {['Customer Email', 'Booking ID', 'Used At'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {redemptions.map(r => (
                  <div key={r.id} className="grid grid-cols-[1fr_1fr_160px] gap-4 px-6 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{r.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="text-sm font-mono text-gray-600 truncate">{r.bookingId}</span>
                    </div>
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

      </div>
    </div>
  );
}
