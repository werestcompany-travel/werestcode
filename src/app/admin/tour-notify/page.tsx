'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Bell, BellOff, Filter } from 'lucide-react';

interface NotifyRequest {
  id: string;
  email: string;
  tourSlug: string;
  notified: boolean;
  createdAt: string;
}

type FilterMode = 'all' | 'pending';

export default function AdminTourNotifyPage() {
  const [requests,   setRequests]  = useState<NotifyRequest[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [filter,     setFilter]    = useState<FilterMode>('pending');
  const [notifying,  setNotifying] = useState<string | null>(null);

  const load = useCallback(async (mode: FilterMode) => {
    setLoading(true);
    const qs = mode === 'pending' ? '?pending=true' : '';
    const r  = await fetch(`/api/admin/tour-notify${qs}`);
    const d  = await r.json() as { requests: NotifyRequest[] };
    setRequests(d.requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  async function markNotified(id: string) {
    setNotifying(id);
    await fetch(`/api/admin/tour-notify/${id}/notify`, { method: 'POST' });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notified: true } : r)),
    );
    setNotifying(null);
  }

  // Group by tourSlug
  const grouped = requests.reduce<Record<string, NotifyRequest[]>>((acc, r) => {
    if (!acc[r.tourSlug]) acc[r.tourSlug] = [];
    acc[r.tourSlug].push(r);
    return acc;
  }, {});

  const pendingCount = requests.filter((r) => !r.notified).length;

  return (
    <AdminShell title="Tour Notify Requests" subtitle="Customers awaiting tour availability">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterMode)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 outline-none focus:border-brand-400 bg-white"
          >
            <option value="pending">Pending only</option>
            <option value="all">All requests</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No notify requests found.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([slug, items]) => {
            const pending = items.filter((i) => !i.notified);
            return (
              <div key={slug} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tour header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{slug}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {items.length} request{items.length !== 1 ? 's' : ''} &bull; {pending.length} pending
                    </p>
                  </div>
                </div>

                {/* Rows */}
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-gray-50">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Requested</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Notified</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{item.email}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.notified
                            ? <Bell className="w-4 h-4 text-emerald-500 inline-block" />
                            : <BellOff className="w-4 h-4 text-gray-300 inline-block" />}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!item.notified && (
                            <button
                              onClick={() => markNotified(item.id)}
                              disabled={notifying === item.id}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-300 text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                            >
                              <Bell className="w-3.5 h-3.5" /> Mark Notified
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
