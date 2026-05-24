'use client';

import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, XCircle, CheckCircle } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface PaymentTransaction {
  id: string;
  paysoOrderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  bookingId: string | null;
  attractionBookingId: string | null;
  booking: { bookingRef: string; customerName: string } | null;
  attractionBooking: { bookingRef: string; customerName: string } | null;
}
interface Stats { total: number; paid: number; failed: number; revenue: number; }

const STATUS_PILL: Record<string, string> = {
  PAID:             'bg-green-100 text-green-700',
  FAILED:           'bg-red-100 text-red-700',
  AWAITING_PAYMENT: 'bg-amber-100 text-amber-700',
  REFUNDED:         'bg-gray-100 text-gray-600',
};

const STATUS_OPTIONS = ['All', 'AWAITING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats,        setStats]        = useState<Stats>({ total: 0, paid: 0, failed: 0, revenue: 0 });
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  async function load(status: string) {
    setLoading(true);
    const qs = status !== 'All' ? `?status=${status}` : '';
    const r  = await fetch(`/api/admin/payments${qs}`);
    const d  = await r.json();
    setTransactions(d.transactions ?? []);
    setStats(d.stats ?? { total: 0, paid: 0, failed: 0, revenue: 0 });
    setLoading(false);
  }
  useEffect(() => { load(statusFilter); }, [statusFilter]);

  function getCustomer(tx: PaymentTransaction) {
    return tx.booking?.customerName ?? tx.attractionBooking?.customerName ?? '—';
  }
  function getRef(tx: PaymentTransaction) {
    return tx.booking?.bookingRef ?? tx.attractionBooking?.bookingRef ?? '—';
  }
  function getType(tx: PaymentTransaction) {
    if (tx.bookingId) return 'Transfer';
    if (tx.attractionBookingId) return 'Attraction';
    return '—';
  }

  return (
    <AdminShell title="Payments" subtitle="Payment transaction log">

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total',         value: stats.total,                              icon: <CreditCard    className="w-5 h-5 text-brand-600"  />, bg: 'bg-brand-50'  },
            { label: 'Paid',          value: stats.paid,                               icon: <CheckCircle   className="w-5 h-5 text-green-600"  />, bg: 'bg-green-50'  },
            { label: 'Failed',        value: stats.failed,                             icon: <XCircle       className="w-5 h-5 text-red-500"    />, bg: 'bg-red-50'    },
            { label: 'Total Revenue', value: `฿${stats.revenue.toLocaleString()}`,     icon: <DollarSign    className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setStatusFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === opt ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt === 'All' ? 'All' : opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[140px_1fr_80px_1fr_130px_100px_100px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Date', 'Payso Order ID', 'Type', 'Customer', 'Booking Ref', 'Amount', 'Status'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {transactions.map(tx => (
                  <div key={tx.id} className="grid grid-cols-[140px_1fr_80px_1fr_130px_100px_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                    <p className="font-mono text-xs text-gray-700 truncate">{tx.paysoOrderId}</p>
                    <span className="text-xs text-gray-600">{getType(tx)}</span>
                    <p className="text-sm text-gray-900 truncate">{getCustomer(tx)}</p>
                    <p className="font-mono text-xs text-gray-600">{getRef(tx)}</p>
                    <p className="text-sm font-bold text-gray-900">฿{tx.amount.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[tx.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tx.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
