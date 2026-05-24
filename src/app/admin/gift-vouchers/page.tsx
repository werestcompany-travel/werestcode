'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, Copy, Gift } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface GiftVoucher {
  id: string;
  code: string;
  value: number;
  recipientName: string | null;
  recipientEmail: string | null;
  purchaserEmail: string | null;
  message: string | null;
  isUsed: boolean;
  usedAt: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface Stats { total: number; active: number; used: number; totalValue: number; }

const EMPTY_FORM = { value: '', recipientName: '', recipientEmail: '', purchaserEmail: '', message: '', expiresAt: '' };

function getVoucherStatus(v: GiftVoucher): { label: string; cls: string } {
  if (v.isUsed)       return { label: 'Used',     cls: 'bg-gray-100 text-gray-600' };
  if (!v.isActive)    return { label: 'Inactive',  cls: 'bg-red-100 text-red-700' };
  if (v.expiresAt && new Date() > new Date(v.expiresAt)) {
    return { label: 'Expired', cls: 'bg-orange-100 text-orange-700' };
  }
  return { label: 'Active', cls: 'bg-green-100 text-green-700' };
}

export default function AdminGiftVouchersPage() {
  const [vouchers,  setVouchers]  = useState<GiftVoucher[]>([]);
  const [stats,     setStats]     = useState<Stats>({ total: 0, active: 0, used: 0, totalValue: 0 });
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [copied,    setCopied]    = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/gift-vouchers');
    const d = await r.json();
    setVouchers(d.vouchers ?? []);
    setStats(d.stats ?? { total: 0, active: 0, used: 0, totalValue: 0 });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.value) { setError('Value is required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/gift-vouchers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Save failed.'); setSaving(false); return; }
    setShowModal(false);
    setSaving(false);
    load();
  }

  async function handleDeactivate(v: GiftVoucher) {
    if (!confirm('Deactivate this voucher?')) return;
    await fetch(`/api/admin/gift-vouchers/${v.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    });
    setVouchers(prev => prev.map(x => x.id === v.id ? { ...x, isActive: false } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this voucher? This cannot be undone.')) return;
    await fetch(`/api/admin/gift-vouchers/${id}`, { method: 'DELETE' });
    setVouchers(prev => prev.filter(v => v.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <AdminShell title="Gift Vouchers" subtitle="Issue and manage gift vouchers">

      <div className="flex justify-end mb-5">
        <button onClick={openNew}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Issue Voucher
        </button>
      </div>

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total',             value: stats.total,                              bg: 'bg-brand-50',   icon: <Gift  className="w-5 h-5 text-brand-600"  /> },
            { label: 'Active',            value: stats.active,                             bg: 'bg-green-50',   icon: <Check className="w-5 h-5 text-green-600"  /> },
            { label: 'Used',              value: stats.used,                               bg: 'bg-gray-100',   icon: <Gift  className="w-5 h-5 text-gray-500"   /> },
            { label: 'Unredeemed Value',  value: `฿${stats.totalValue.toLocaleString()}`, bg: 'bg-emerald-50', icon: <Gift  className="w-5 h-5 text-emerald-600" /> },
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
          ) : vouchers.length === 0 ? (
            <div className="text-center py-20">
              <Gift className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No gift vouchers yet</p>
              <p className="text-sm text-gray-400 mt-1">Issue your first voucher with the button above</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[180px_80px_1fr_1fr_110px_90px_130px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Code', 'Value', 'Recipient', 'Purchaser', 'Expires', 'Status', 'Actions'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {vouchers.map(v => {
                  const status = getVoucherStatus(v);
                  return (
                    <div key={v.id} className="grid grid-cols-[180px_80px_1fr_1fr_110px_90px_130px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                      {/* Code */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-gray-900">{v.code}</span>
                        <button onClick={() => copyCode(v.code)} className="text-gray-300 hover:text-brand-500 transition-colors shrink-0">
                          {copied === v.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {/* Value */}
                      <p className="text-sm font-bold text-gray-900">฿{v.value.toLocaleString()}</p>
                      {/* Recipient */}
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 truncate">{v.recipientName ?? '—'}</p>
                        {v.recipientEmail && <p className="text-xs text-gray-400 truncate">{v.recipientEmail}</p>}
                      </div>
                      {/* Purchaser */}
                      <p className="text-xs text-gray-500 truncate">{v.purchaserEmail ?? '—'}</p>
                      {/* Expires */}
                      <p className="text-xs text-gray-500">
                        {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </p>
                      {/* Status */}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${status.cls}`}>{status.label}</span>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {v.isActive && !v.isUsed && (
                          <button onClick={() => handleDeactivate(v)}
                            className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-amber-300 hover:text-amber-600 transition-colors whitespace-nowrap">
                            Deactivate
                          </button>
                        )}
                        <button onClick={() => handleDelete(v.id)}
                          className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
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
              <h2 className="font-bold text-gray-900">Issue Gift Voucher</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Value (฿) *</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Name</label>
                  <input value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                    placeholder="e.g. John Smith"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Email</label>
                  <input type="email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Purchaser Email</label>
                <input type="email" value={form.purchaserEmail} onChange={e => setForm(f => ({ ...f, purchaserEmail: e.target.value }))}
                  placeholder="purchaser@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Personal Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={2} placeholder="Happy birthday! Enjoy your Thailand adventure 🎉"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <p className="text-xs text-gray-400">The voucher code (GV-XXXXXXXX) will be generated automatically.</p>
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
                  : <Gift className="w-4 h-4" />}
                {saving ? 'Issuing…' : 'Issue Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
