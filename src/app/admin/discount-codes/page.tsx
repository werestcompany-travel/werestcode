'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, X, ChevronRight, Tag, Copy, Check,
  Percent, DollarSign, Clock, ToggleLeft, ToggleRight, Trash2, Pencil, Users,
} from 'lucide-react';

interface DiscountCode {
  id: string; code: string; type: 'PERCENTAGE' | 'FIXED';
  value: number; description: string | null;
  minOrderAmount: number | null; maxUses: number | null; usedCount: number;
  expiresAt: string | null; isActive: boolean;
  newUserOnly: boolean; perUserLimit: number | null;
  createdAt: string; updatedAt: string;
}
interface Stats { total: number; active: number; expired: number; }

const EMPTY_FORM = {
  code: '', type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  value: '', description: '', minOrderAmount: '', maxUses: '',
  expiresAt: '', isActive: true,
  newUserOnly: false, perUserLimit: '',
};

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function AdminDiscountCodesPage() {
  const [codes,     setCodes]     = useState<DiscountCode[]>([]);
  const [stats,     setStats]     = useState<Stats>({ total: 0, active: 0, expired: 0 });
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [copied,    setCopied]    = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/discount-codes');
    const d = await r.json();
    setCodes(d.codes ?? []);
    setStats(d.stats ?? { total: 0, active: 0, expired: 0 });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  }

  function openEdit(c: DiscountCode) {
    setEditId(c.id);
    setForm({
      code: c.code, type: c.type, value: String(c.value),
      description: c.description ?? '', minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.isActive,
      newUserOnly: c.newUserOnly ?? false,
      perUserLimit: c.perUserLimit ? String(c.perUserLimit) : '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.code || !form.value) { setError('Code and value are required.'); return; }
    setSaving(true); setError('');
    try {
      const url    = editId ? `/api/admin/discount-codes/${editId}` : '/api/admin/discount-codes';
      const method = editId ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed.'); return; }
      setShowModal(false);
      load();
    } finally { setSaving(false); }
  }

  async function handleToggle(c: DiscountCode) {
    await fetch(`/api/admin/discount-codes/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    setCodes(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this discount code? This cannot be undone.')) return;
    await fetch(`/api/admin/discount-codes/${id}`, { method: 'DELETE' });
    setCodes(prev => prev.filter(c => c.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  function isExpired(c: DiscountCode) {
    return !!c.expiresAt && new Date(c.expiresAt) < new Date();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
            Admin <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-gray-900 font-bold">Discount Codes</span>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New code
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total codes', value: stats.total,   icon: <Tag         className="w-5 h-5 text-brand-600" />, bg: 'bg-brand-50'  },
            { label: 'Active',      value: stats.active,  icon: <Check       className="w-5 h-5 text-green-600" />, bg: 'bg-green-50'  },
            { label: 'Expired',     value: stats.expired, icon: <Clock       className="w-5 h-5 text-red-500"   />, bg: 'bg-red-50'    },
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
          ) : codes.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No discount codes yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first code with the button above</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_100px_100px_90px_80px_100px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Code', 'Type', 'Value', 'Min order', 'Uses', 'Expires', 'Status'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {codes.map(c => {
                  const expired = isExpired(c);
                  return (
                    <div key={c.id} className="grid grid-cols-[1fr_80px_100px_100px_90px_80px_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                      {/* Code */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm text-gray-900">{c.code}</span>
                        <button onClick={() => copyCode(c.code)}
                          className="text-gray-300 hover:text-brand-500 transition-colors shrink-0">
                          {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {c.description && <span className="text-xs text-gray-400 truncate hidden lg:block">{c.description}</span>}
                      </div>
                      {/* Type */}
                      <div className="flex items-center gap-1">
                        {c.type === 'PERCENTAGE'
                          ? <Percent   className="w-3.5 h-3.5 text-purple-500" />
                          : <DollarSign className="w-3.5 h-3.5 text-green-500" />}
                        <span className="text-xs text-gray-600">{c.type === 'PERCENTAGE' ? '%' : 'Fixed'}</span>
                      </div>
                      {/* Value */}
                      <p className="text-sm font-bold text-gray-900">
                        {c.type === 'PERCENTAGE' ? `${c.value}%` : `฿${c.value.toLocaleString()}`}
                      </p>
                      {/* Min order */}
                      <p className="text-xs text-gray-500">
                        {c.minOrderAmount ? `฿${c.minOrderAmount.toLocaleString()}` : '—'}
                      </p>
                      {/* Uses */}
                      <p className="text-xs text-gray-600">
                        {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
                      </p>
                      {/* Expires */}
                      <p className={`text-xs ${expired ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </p>
                      {/* Status + actions */}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleToggle(c)} className="text-gray-400 hover:text-brand-600 transition-colors">
                          {c.isActive && !expired
                            ? <ToggleRight className="w-5 h-5 text-green-500" />
                            : <ToggleLeft  className="w-5 h-5 text-gray-300"  />}
                        </button>
                        <Link href={`/admin/discount-codes/${c.id}`}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                          title="View redemptions">
                          <Users className="w-3 h-3" />
                        </Link>
                        <button onClick={() => openEdit(c)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editId ? 'Edit discount code' : 'New discount code'}</h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount code</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER20"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, code: genCode() }))}
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Auto-generate
                  </button>
                </div>
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {(['PERCENTAGE', 'FIXED'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${form.type === t ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {t === 'PERCENTAGE' ? '% Off' : '฿ Fixed'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Value {form.type === 'PERCENTAGE' ? '(%)' : '(฿)'}
                  </label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === 'PERCENTAGE' ? '10' : '100'}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Summer sale 2026"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              {/* Min order + Max uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min order (฿)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="Leave empty for no minimum"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {/* New users only + Per-user limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New users only</label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, newUserOnly: !f.newUserOnly }))}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${form.newUserOnly ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {form.newUserOnly ? <><ToggleRight className="w-4 h-4" /> New customers only</> : <><ToggleLeft className="w-4 h-4" /> All customers</>}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Per-user limit</label>
                  <input type="number" min="1" value={form.perUserLimit} onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              {/* Expires + Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expires on</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${form.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {form.isActive ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Inactive</>}
                  </button>
                </div>
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
                {saving ? 'Saving…' : editId ? 'Save changes' : 'Create code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
