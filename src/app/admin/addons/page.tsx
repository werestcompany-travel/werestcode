'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, Pencil, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string | null;
  isActive: boolean;
}
interface Stats { total: number; active: number; }

const EMPTY_FORM = { name: '', description: '', price: '', icon: '', isActive: true };

export default function AdminAddonsPage() {
  const [addons,    setAddons]    = useState<AddOn[]>([]);
  const [stats,     setStats]     = useState<Stats>({ total: 0, active: 0 });
  const [bookingUses, setBookingUses] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/addons');
    const d = await r.json();
    setAddons(d.addons ?? []);
    setStats(d.stats ?? { total: 0, active: 0 });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  }

  function openEdit(a: AddOn) {
    setEditId(a.id);
    setForm({ name: a.name, description: a.description, price: String(a.price), icon: a.icon ?? '', isActive: a.isActive });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) { setError('Name and price are required.'); return; }
    setSaving(true); setError('');
    try {
      const url    = editId ? `/api/admin/addons/${editId}` : '/api/admin/addons';
      const method = editId ? 'PATCH' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
      setShowModal(false);
      load();
    } finally { setSaving(false); }
  }

  async function handleToggle(a: AddOn) {
    await fetch(`/api/admin/addons/${a.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    setAddons(prev => prev.map(x => x.id === a.id ? { ...x, isActive: !x.isActive } : x));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this add-on? This cannot be undone.')) return;
    await fetch(`/api/admin/addons/${id}`, { method: 'DELETE' });
    setAddons(prev => prev.filter(a => a.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
  }

  return (
    <AdminShell title="Add-ons" subtitle="Bookable extras for transfers">

      <div className="flex justify-end mb-5">
        <button onClick={openNew}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New add-on
        </button>
      </div>

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total add-ons', value: stats.total,  icon: <Package className="w-5 h-5 text-brand-600" />, bg: 'bg-brand-50'  },
            { label: 'Active',        value: stats.active, icon: <Check   className="w-5 h-5 text-green-600" />, bg: 'bg-green-50'  },
            { label: 'Booking uses',  value: bookingUses,  icon: <Package className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
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
          ) : addons.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No add-ons yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first add-on with the button above</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[40px_1fr_1fr_100px_80px_100px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Icon', 'Name', 'Description', 'Price', 'Active', 'Actions'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {addons.map(a => (
                  <div key={a.id} className="grid grid-cols-[40px_1fr_1fr_100px_80px_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <span className="text-2xl">{a.icon ?? '📦'}</span>
                    <p className="font-semibold text-sm text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.description}</p>
                    <p className="text-sm font-bold text-gray-900">฿{a.price.toLocaleString()}</p>
                    <button onClick={() => handleToggle(a)} className="text-gray-400 hover:text-brand-600 transition-colors">
                      {a.isActive
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft  className="w-5 h-5 text-gray-300"  />}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(a)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
              <h2 className="font-bold text-gray-900">{editId ? 'Edit add-on' : 'New add-on'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Child Seat"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the add-on"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (฿) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 200"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Icon (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="e.g. 🪑"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${form.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {form.isActive ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Inactive</>}
                </button>
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
                {saving ? 'Saving…' : editId ? 'Save changes' : 'Create add-on'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
