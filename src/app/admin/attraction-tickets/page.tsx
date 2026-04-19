'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, Plus, X, ChevronDown, ChevronUp,
  Ticket, CheckCircle2, Clock, XCircle, TrendingUp,
} from 'lucide-react';

const STATUS_CHIP: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100   text-red-700',
  USED:      'bg-gray-100  text-gray-500',
};

export default function AttractionTicketsPage() {
  const router = useRouter();
  const [bookings,  setBookings]  = useState<any[]>([]);
  const [stats,     setStats]     = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('ALL');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [attractions, setAttractions] = useState<any[]>([]);

  /* Booking form state */
  const [form, setForm] = useState({
    attractionId: '', packageId: '', visitDate: '',
    adultQty: 1, childQty: 0, infantQty: 0,
    customerName: '', customerEmail: '', customerPhone: '',
    notes: '', status: 'CONFIRMED',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, aRes] = await Promise.all([
        fetch('/api/admin/attraction-bookings'),
        fetch('/api/admin/attractions'),
      ]);
      if (bRes.status === 401) { router.push('/admin/login'); return; }
      const bJson = await bRes.json();
      const aJson = await aRes.json();
      setBookings(bJson.bookings ?? []);
      setStats(bJson.stats ?? null);
      setAttractions(aJson.attractions ?? []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = !q || b.customerName.toLowerCase().includes(q) ||
      b.bookingRef.toLowerCase().includes(q) || b.attractionName.toLowerCase().includes(q);
    const matchF = filter === 'ALL' || b.status === filter;
    return matchQ && matchF;
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/attraction-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Status → ${status}`);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    await fetch(`/api/admin/attraction-bookings/${id}`, { method: 'DELETE' });
    toast.success('Booking deleted');
    load();
  };

  const selectedAttraction = attractions.find((a) => a.id === form.attractionId);
  const selectedPackage    = selectedAttraction?.packages?.find((p: any) => p.id === form.packageId);
  const adultTotal  = (selectedPackage?.adultPrice ?? 0) * form.adultQty;
  const childTotal  = (selectedPackage?.childPrice ?? 0) * form.childQty;
  const grandTotal  = adultTotal + childTotal;

  const handleSubmit = async () => {
    if (!form.attractionId || !form.packageId || !form.visitDate || !form.customerName || !form.customerEmail) {
      toast.error('Please fill all required fields'); return;
    }
    try {
      const res = await fetch('/api/admin/attraction-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attractionId:  form.attractionId,
          packageId:     form.packageId,
          visitDate:     form.visitDate,
          adultQty:      form.adultQty,
          childQty:      form.childQty,
          infantQty:     form.infantQty,
          customerName:  form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          notes:         form.notes,
          status:        form.status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Booking created!');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <AdminShell title="Attraction Tickets" subtitle="Manage attraction ticket bookings">

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <TrendingUp className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50', label: 'Total',     value: stats.total },
            { icon: <Clock className="w-4 h-4 text-amber-500" />,      bg: 'bg-amber-50',  label: 'Pending',   value: stats.pending },
            { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, bg: 'bg-green-50', label: 'Confirmed', value: stats.confirmed },
            { icon: <XCircle className="w-4 h-4 text-violet-600" />,   bg: 'bg-violet-50', label: 'Revenue',   value: formatCurrency(stats.revenue), isText: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className={`font-extrabold ${(s as any).isText ? 'text-sm text-violet-700' : 'text-lg text-gray-900'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ref, attraction…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400" />
          </div>
          <div className="flex gap-1.5">
            {['ALL','PENDING','CONFIRMED','USED','CANCELLED'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filter === s ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Booking
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Ref</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Attraction</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Visit Date</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Tickets</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No bookings found</td></tr>
              ) : filtered.map((b) => (
                <>
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-violet-700 text-[11px]">{b.bookingRef}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{b.customerName}</p>
                      <p className="text-gray-400 text-[10px]">{b.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-semibold text-gray-800">{b.attractionName}</p>
                      <p className="text-gray-400 text-[10px]">{b.packageName}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600">
                      {new Date(b.visitDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600">
                      {b.adultQty > 0 && <span>{b.adultQty} adult</span>}
                      {b.childQty > 0 && <span> · {b.childQty} child</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_CHIP[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        {expanded === b.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {expanded === b.id && (
                    <tr key={`${b.id}-detail`} className="bg-gray-50/50">
                      <td colSpan={8} className="px-5 py-3">
                        <div className="flex flex-wrap gap-6 text-xs text-gray-600">
                          <div><span className="text-gray-400">Phone:</span> {b.customerPhone || '—'}</div>
                          <div><span className="text-gray-400">Created by:</span> {b.createdBy}</div>
                          {b.notes && <div><span className="text-gray-400">Notes:</span> {b.notes}</div>}
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {['CONFIRMED','USED','CANCELLED'].map((s) => (
                            <button key={s} onClick={() => handleStatusChange(b.id, s)}
                              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-gray-600 transition-colors">
                              → {s}
                            </button>
                          ))}
                          <button onClick={() => handleDelete(b.id)}
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-auto">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </div>

      {/* New booking modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-violet-600" />
                <h2 className="text-base font-bold text-gray-900">New Ticket Booking</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Attraction */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Attraction *</label>
                <select value={form.attractionId} onChange={(e) => setForm({ ...form, attractionId: e.target.value, packageId: '' })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white">
                  <option value="">Select attraction…</option>
                  {attractions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {/* Package */}
              {selectedAttraction?.packages?.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Package *</label>
                  <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white">
                    <option value="">Select package…</option>
                    {selectedAttraction.packages.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} — ฿{p.adultPrice}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Visit date */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Visit Date *</label>
                <input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400" />
              </div>
              {/* Tickets */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Adult', key: 'adultQty', price: selectedPackage?.adultPrice },
                  { label: 'Child', key: 'childQty', price: selectedPackage?.childPrice },
                  { label: 'Infant', key: 'infantQty', price: 0 },
                ].map(({ label, key, price }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {label} {price != null && price > 0 ? `(฿${price})` : ''}
                    </label>
                    <input type="number" min={0} value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400" />
                  </div>
                ))}
              </div>
              {/* Price preview */}
              {selectedPackage && (
                <div className="bg-violet-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-violet-600">Estimated Total</span>
                  <span className="text-sm font-extrabold text-violet-700">{formatCurrency(grandTotal)}</span>
                </div>
              )}
              {/* Customer */}
              <div className="pt-2 space-y-3 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Customer Details</p>
                <div className="grid grid-cols-1 gap-3">
                  <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Full name *"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 placeholder:text-gray-300" />
                  <input value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    placeholder="Email *" type="email"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 placeholder:text-gray-300" />
                  <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="Phone"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 placeholder:text-gray-300" />
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Notes (optional)" rows={2}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 resize-none placeholder:text-gray-300" />
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-400 bg-white">
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors">
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
