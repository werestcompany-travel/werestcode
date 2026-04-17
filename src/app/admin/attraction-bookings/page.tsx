'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Search, X, Check, ChevronDown,
  Calendar, Users, Ticket, DollarSign, Clock,
  Eye, Trash2, ChevronRight,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface AttractionBooking {
  id: string; bookingRef: string;
  attractionName: string; packageName: string;
  visitDate: string;
  adultQty: number; childQty: number; infantQty: number;
  totalPrice: number; status: string;
  customerName: string; customerEmail: string; customerPhone: string;
  createdBy: string; createdAt: string;
}

interface Stats { total: number; pending: number; confirmed: number; revenue: number; }

const ATTRACTIONS = [
  { id: 'sanctuary-of-truth', name: 'Sanctuary of Truth, Pattaya' },
  { id: 'sea-life-bangkok',   name: 'Sea Life Bangkok Ocean World' },
  { id: 'safari-world',       name: 'Safari World Bangkok' },
  { id: 'mahanakhon',         name: 'Mahanakhon SkyWalk Bangkok' },
  { id: 'other',              name: 'Other / Custom' },
];

const PACKAGES: Record<string, Array<{ id: string; name: string; adultPrice: number; childPrice: number }>> = {
  'sanctuary-of-truth': [
    { id: 'standard',           name: 'Standard Entrance',         adultPrice: 479, childPrice: 239 },
    { id: 'standard-elephant',  name: 'Standard + Elephant Riding', adultPrice: 679, childPrice: 429 },
    { id: 'full-experience',    name: 'Full Experience Package',    adultPrice: 899, childPrice: 599 },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  USED:      'bg-gray-100 text-gray-600 border-gray-200',
};

/* ─── Manual booking form ─────────────────────────────────────────────────── */
const EMPTY_FORM = {
  attractionId: 'sanctuary-of-truth',
  attractionName: 'Sanctuary of Truth, Pattaya',
  packageId: 'standard',
  packageName: 'Standard Entrance',
  visitDate: '',
  adultQty: 1, childQty: 0, infantQty: 0,
  adultPrice: 479, childPrice: 239,
  totalPrice: 479,
  customerName: '', customerEmail: '', customerPhone: '',
  notes: '',
  status: 'CONFIRMED',
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminAttractionBookingsPage() {
  const [bookings,    setBookings]    = useState<AttractionBooking[]>([]);
  const [stats,       setStats]       = useState<Stats>({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [expandedId,  setExpandedId]  = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search)       params.set('search', search);
    const res  = await fetch(`/api/admin/attraction-bookings?${params}`);
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setStats(data.stats ?? { total: 0, pending: 0, confirmed: 0, revenue: 0 });
    setLoading(false);
  }

  useEffect(() => { loadBookings(); }, [search, statusFilter]); // eslint-disable-line

  // Recalculate total price when qty/pkg changes
  useEffect(() => {
    const total = form.adultQty * form.adultPrice + form.childQty * form.childPrice;
    setForm(f => ({ ...f, totalPrice: total }));
  }, [form.adultQty, form.childQty, form.adultPrice, form.childPrice]);

  function handleAttractionChange(attractionId: string) {
    const attr = ATTRACTIONS.find(a => a.id === attractionId);
    const pkgs = PACKAGES[attractionId] ?? [];
    const firstPkg = pkgs[0];
    setForm(f => ({
      ...f,
      attractionId,
      attractionName: attr?.name ?? attractionId,
      packageId:    firstPkg?.id   ?? '',
      packageName:  firstPkg?.name ?? '',
      adultPrice:   firstPkg?.adultPrice ?? 0,
      childPrice:   firstPkg?.childPrice ?? 0,
    }));
  }

  function handlePackageChange(packageId: string) {
    const pkgs = PACKAGES[form.attractionId] ?? [];
    const pkg  = pkgs.find(p => p.id === packageId);
    setForm(f => ({
      ...f,
      packageId,
      packageName: pkg?.name ?? packageId,
      adultPrice:  pkg?.adultPrice ?? f.adultPrice,
      childPrice:  pkg?.childPrice ?? f.childPrice,
    }));
  }

  async function handleSave() {
    setSaveError('');
    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      setSaveError('Customer name, email and phone are required.'); return;
    }
    if (!form.visitDate) { setSaveError('Visit date is required.'); return; }
    if (form.adultQty + form.childQty === 0) { setSaveError('At least one adult or child ticket required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/attraction-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? 'Failed to save.'); return; }
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      loadBookings();
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/admin/attraction-bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    await fetch(`/api/admin/attraction-bookings/${id}`, { method: 'DELETE' });
    setBookings(prev => prev.filter(b => b.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex items-center gap-1">
            Admin <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-gray-900 font-bold">Attraction Bookings</span>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New booking
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total bookings', value: stats.total,     icon: <Ticket      className="w-5 h-5 text-brand-600" />,   bg: 'bg-brand-50'  },
            { label: 'Pending',        value: stats.pending,   icon: <Clock       className="w-5 h-5 text-amber-600" />,   bg: 'bg-amber-50'  },
            { label: 'Confirmed',      value: stats.confirmed, icon: <Check       className="w-5 h-5 text-green-600" />,   bg: 'bg-green-50'  },
            { label: 'Revenue (conf.)',value: `฿${stats.revenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
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

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by ref, name, email, attraction…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[160px]">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="USED">Used</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No bookings found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search || statusFilter ? 'Try clearing the filters' : 'Create the first booking with the button above'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map(b => (
                <div key={b.id}>
                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Ref + status */}
                    <div className="w-36 shrink-0">
                      <p className="font-mono text-xs font-bold text-brand-600">{b.bookingRef}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.customerName}</p>
                      <p className="text-xs text-gray-400 truncate">{b.customerEmail}</p>
                    </div>

                    {/* Attraction + date */}
                    <div className="hidden md:block flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.attractionName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.visitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Tickets */}
                    <div className="hidden lg:block text-right shrink-0 w-24">
                      <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        <Users className="w-3 h-3" />
                        {[b.adultQty > 0 && `${b.adultQty}A`, b.childQty > 0 && `${b.childQty}C`].filter(Boolean).join(' ')}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">฿{b.totalPrice.toLocaleString()}</p>
                    </div>

                    {/* Created by */}
                    <div className="hidden xl:block text-xs text-gray-400 shrink-0 w-24 text-right">
                      <p>{b.createdBy}</p>
                      <p>{new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(b.id)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === b.id && (
                    <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Package</p>
                          <p className="text-sm font-semibold text-gray-800">{b.packageName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                          <p className="text-sm font-semibold text-gray-800">{b.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Created by</p>
                          <p className="text-sm font-semibold text-gray-800">{b.createdBy}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Change status</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['PENDING', 'CONFIRMED', 'CANCELLED', 'USED'].map(s => (
                              <button key={s} onClick={() => handleStatusChange(b.id, s)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                                  b.status === s
                                    ? STATUS_COLORS[s] + ' ring-1 ring-offset-1 ring-current'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                }`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── NEW BOOKING MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Create booking manually</h2>
              <button onClick={() => { setShowForm(false); setSaveError(''); }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}

              {/* Attraction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Attraction</label>
                  <select value={form.attractionId} onChange={e => handleAttractionChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    {ATTRACTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Package</label>
                  {(PACKAGES[form.attractionId] ?? []).length > 0 ? (
                    <select value={form.packageId} onChange={e => handlePackageChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                      {PACKAGES[form.attractionId].map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input value={form.packageName} onChange={e => setForm(f => ({ ...f, packageName: e.target.value, packageId: 'custom' }))}
                      placeholder="Package name"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  )}
                </div>
              </div>

              {/* Visit date + status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Visit date</label>
                  <input type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="USED">Used</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Tickets */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tickets & pricing</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'adultQty',  priceKey: 'adultPrice',  label: 'Adult' },
                    { key: 'childQty',  priceKey: 'childPrice',  label: 'Child' },
                    { key: 'infantQty', priceKey: null,           label: 'Infant (free)' },
                  ].map(t => (
                    <div key={t.key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t.label}</p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <button onClick={() => setForm(f => ({ ...f, [t.key]: Math.max(0, (f[t.key as keyof typeof f] as number) - 1) }))}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 text-xs transition-colors">-</button>
                        <span className="w-6 text-center text-sm font-bold">{form[t.key as keyof typeof form] as number}</span>
                        <button onClick={() => setForm(f => ({ ...f, [t.key]: (f[t.key as keyof typeof f] as number) + 1 }))}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-400 text-xs transition-colors">+</button>
                      </div>
                      {t.priceKey && (
                        <input type="number" value={form[t.priceKey as keyof typeof form] as number}
                          onChange={e => setForm(f => ({ ...f, [t.priceKey!]: Number(e.target.value) }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between bg-brand-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-semibold text-brand-800">Total price</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">override:</span>
                    <input type="number" value={form.totalPrice}
                      onChange={e => setForm(f => ({ ...f, totalPrice: Number(e.target.value) }))}
                      className="w-24 px-2 py-1 border border-brand-200 rounded-lg text-sm font-bold text-brand-900 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white" />
                    <span className="text-xs text-brand-600 font-medium">THB</span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer details</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'customerName',  placeholder: 'Full name',  type: 'text'  },
                    { key: 'customerEmail', placeholder: 'Email',      type: 'email' },
                    { key: 'customerPhone', placeholder: 'Phone',      type: 'tel'   },
                  ].map(f => (
                    <input key={f.key} type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form] as string}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special requirements or notes…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button onClick={() => { setShowForm(false); setSaveError(''); }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : <Plus className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Create booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
