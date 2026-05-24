'use client';

import { useState, useEffect } from 'react';
import { Award, Plus, X, Check, TrendingUp, TrendingDown } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface LoyaltyTx {
  id: string;
  points: number;
  type: string;
  description: string;
  bookingRef: string | null;
  createdAt: string;
  userId: string;
  user: { email: string; name: string };
}
interface Stats { totalEarned: number; totalRedeemed: number; }

const TYPE_BADGE: Record<string, string> = {
  EARN:   'bg-emerald-100 text-emerald-700',
  REDEEM: 'bg-amber-100 text-amber-700',
  EXPIRE: 'bg-red-100 text-red-700',
  ADJUST: 'bg-blue-100 text-blue-700',
};

export default function AdminLoyaltyPage() {
  const [transactions, setTransactions] = useState<LoyaltyTx[]>([]);
  const [stats,        setStats]        = useState<Stats>({ totalEarned: 0, totalRedeemed: 0 });
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState({ userId: '', points: '', description: '' });
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/loyalty');
    const d = await r.json();
    setTransactions(d.transactions ?? []);
    setStats(d.stats ?? { totalEarned: 0, totalRedeemed: 0 });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!form.userId || !form.points || !form.description) { setError('All fields required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/loyalty', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: form.userId, points: Number(form.points), description: form.description }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return; }
    setShowModal(false);
    setForm({ userId: '', points: '', description: '' });
    setSaving(false);
    load();
  }

  return (
    <AdminShell title="Loyalty Program" subtitle="Points transactions and balances">

      <div className="flex justify-end mb-5">
        <button onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Manual Adjustment
        </button>
      </div>

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Earned Points',   value: stats.totalEarned.toLocaleString(),   icon: <TrendingUp   className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Total Redeemed Points', value: stats.totalRedeemed.toLocaleString(), icon: <TrendingDown className="w-5 h-5 text-amber-600"   />, bg: 'bg-amber-50'   },
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No loyalty transactions yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[140px_1fr_80px_80px_1fr_120px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Date', 'User', 'Points', 'Type', 'Description', 'Booking Ref'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {transactions.map(tx => (
                  <div key={tx.id} className="grid grid-cols-[140px_1fr_80px_80px_1fr_120px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 truncate">{tx.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{tx.user.email}</p>
                    </div>
                    <span className={`font-bold text-sm ${tx.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.points >= 0 ? '+' : ''}{tx.points}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_BADGE[tx.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tx.type}
                    </span>
                    <p className="text-xs text-gray-600 truncate">{tx.description}</p>
                    <p className="font-mono text-xs text-gray-400">{tx.bookingRef ?? '—'}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Manual Point Adjustment</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">User ID *</label>
                <input value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                  placeholder="Paste user ID or search by email in Users page"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Points (negative to deduct) *</label>
                <input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                  placeholder="e.g. 500 or -200"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description / Reason *</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Loyalty bonus for VIP booking"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                {saving
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
