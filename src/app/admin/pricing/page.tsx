'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Pencil, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface PricingRule {
  id: string;
  vehicleType: string;
  name: string;
  description: string;
  maxPassengers: number;
  maxLuggage: number;
  baseFare: number;
  pricePerKm: number;
  isActive: boolean;
}

const VEHICLE_BADGE: Record<string, string> = {
  SEDAN:      'bg-blue-100 text-blue-700',
  SUV:        'bg-green-100 text-green-700',
  MINIVAN:    'bg-purple-100 text-purple-700',
  LUXURY_MPV: 'bg-amber-100 text-amber-700',
};

const EMPTY_EDIT = { baseFare: '', pricePerKm: '', maxPassengers: '', maxLuggage: '', isActive: true };

export default function AdminPricingPage() {
  const [rules,     setRules]     = useState<PricingRule[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editRule,  setEditRule]  = useState<PricingRule | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_EDIT });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/pricing');
    const d = await r.json();
    setRules(d.rules ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(rule: PricingRule) {
    setEditRule(rule);
    setForm({
      baseFare:      String(rule.baseFare),
      pricePerKm:    String(rule.pricePerKm),
      maxPassengers: String(rule.maxPassengers),
      maxLuggage:    String(rule.maxLuggage),
      isActive:      rule.isActive,
    });
    setError('');
  }

  async function handleSave() {
    if (!editRule) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/pricing/${editRule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed'); return; }
      setEditRule(null);
      load();
    } finally { setSaving(false); }
  }

  const sedan     = rules.find(r => r.vehicleType === 'SEDAN');
  const suv       = rules.find(r => r.vehicleType === 'SUV');
  const minivan   = rules.find(r => r.vehicleType === 'MINIVAN');
  const luxuryMpv = rules.find(r => r.vehicleType === 'LUXURY_MPV');

  const statsCards = [
    { label: 'SEDAN base fare',      value: sedan      ? `฿${sedan.baseFare.toLocaleString()}`      : '—' },
    { label: 'SUV base fare',        value: suv        ? `฿${suv.baseFare.toLocaleString()}`        : '—' },
    { label: 'MINIVAN base fare',    value: minivan    ? `฿${minivan.baseFare.toLocaleString()}`    : '—' },
    { label: 'LUXURY MPV base fare', value: luxuryMpv  ? `฿${luxuryMpv.baseFare.toLocaleString()}`  : '—' },
  ];

  return (
    <AdminShell title="Pricing Rules" subtitle="Vehicle pricing configuration">

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {statsCards.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-brand-600" />
              </div>
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
          ) : (
            <>
              <div className="grid grid-cols-[120px_1fr_80px_80px_120px_100px_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                {['Vehicle', 'Name', 'Max Pax', 'Max Bags', 'Base Fare', 'Per Km', 'Status', 'Action'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-gray-50">
                {rules.map(r => (
                  <div key={r.id} className="grid grid-cols-[120px_1fr_80px_80px_120px_100px_80px_80px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 transition-colors">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${VEHICLE_BADGE[r.vehicleType] ?? 'bg-gray-100 text-gray-600'}`}>
                      {r.vehicleType}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.description}</p>
                    </div>
                    <p className="text-sm text-gray-700">{r.maxPassengers}</p>
                    <p className="text-sm text-gray-700">{r.maxLuggage}</p>
                    <p className="text-sm font-bold text-gray-900">฿{r.baseFare.toLocaleString()}</p>
                    <p className="text-sm text-gray-700">฿{r.pricePerKm}/km</p>
                    <div>
                      {r.isActive
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <button onClick={() => openEdit(r)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {editRule && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit {editRule.vehicleType} pricing</h2>
              <button onClick={() => setEditRule(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Base Fare (฿)</label>
                  <input type="number" value={form.baseFare} onChange={e => setForm(f => ({ ...f, baseFare: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Per Km (฿)</label>
                  <input type="number" value={form.pricePerKm} onChange={e => setForm(f => ({ ...f, pricePerKm: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Passengers</label>
                  <input type="number" value={form.maxPassengers} onChange={e => setForm(f => ({ ...f, maxPassengers: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Luggage</label>
                  <input type="number" value={form.maxLuggage} onChange={e => setForm(f => ({ ...f, maxLuggage: e.target.value }))}
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
              <button onClick={() => setEditRule(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                {saving
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
