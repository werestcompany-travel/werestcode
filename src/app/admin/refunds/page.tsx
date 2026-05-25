'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { RefreshCw, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Refund {
  id: string;
  bookingRef: string;
  bookingType: string;
  bookingId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processedBy: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  PENDING: number;
  APPROVED: number;
  PROCESSED: number;
  REJECTED: number;
}

const STATUS_CHIP: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-blue-100 text-blue-700',
  PROCESSED: 'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
};

const TABS = ['ALL', 'PENDING', 'APPROVED', 'PROCESSED', 'REJECTED'] as const;
type Tab = typeof TABS[number];

export default function RefundsPage() {
  const [refunds, setRefunds]   = useState<Refund[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('ALL');
  const [search, setSearch]     = useState('');
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ PENDING: 0, APPROVED: 0, PROCESSED: 0, REJECTED: 0 });

  // Side panel
  const [selected, setSelected]   = useState<Refund | null>(null);
  const [panelNotes, setPanelNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (tab !== 'ALL') params.set('status', tab);
      if (search)        params.set('search', search);
      const res  = await fetch(`/api/admin/refunds?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRefunds(json.data.refunds);
        setTotal(json.data.total);
        setPages(json.data.pages);
        setPage(p);
        setStatusCounts(json.data.statusCounts ?? { PENDING: 0, APPROVED: 0, PROCESSED: 0, REJECTED: 0 });
      }
    } catch {
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { load(1); }, [tab]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'process') => {
    setActionLoading(true);
    try {
      const res  = await fetch(`/api/admin/refunds/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action, notes: panelNotes || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Action failed');
      toast.success(`Refund ${action}d`);
      setSelected(json.refund);
      await load(page);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openPanel = (r: Refund) => {
    setSelected(r);
    setPanelNotes(r.notes ?? '');
  };

  const typeLabel: Record<string, string> = {
    transfer:   'Transfer',
    tour:       'Tour',
    attraction: 'Attraction',
    charter:    'Charter',
  };

  return (
    <AdminShell title="Refunds" subtitle="Manage refund requests">

      {/* Status count badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {([['PENDING', 'amber'], ['APPROVED', 'blue'], ['PROCESSED', 'green'], ['REJECTED', 'red']] as const).map(([status, color]) => (
          <div key={status} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-${color}-400 shrink-0`} />
            <div>
              <p className="text-[10px] text-gray-400">{status.charAt(0) + status.slice(1).toLowerCase()}</p>
              <p className="font-extrabold text-lg text-gray-900">{statusCounts[status]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          {/* Tab bar */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                {t !== 'ALL' && statusCounts[t] > 0 && (
                  <span className="ml-1 text-[9px] font-bold">{statusCounts[t]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load(1)}
              placeholder="Search booking ref…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={() => load(1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 ml-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Booking Ref</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Reason</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading refunds…</td></tr>
              ) : refunds.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No refunds found</td></tr>
              ) : refunds.map(r => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                  onClick={() => openPanel(r)}
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-brand-700 text-[11px]">{r.bookingRef}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 text-[10px] font-semibold">
                      {typeLabel[r.bookingType] ?? r.bookingType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-900">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 max-w-[200px] truncate">{r.reason}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_CHIP[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { openPanel(r); handleAction(r.id, 'approve'); }}
                          disabled={actionLoading}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { openPanel(r); handleAction(r.id, 'reject'); }}
                          disabled={actionLoading}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleAction(r.id, 'process'); }}
                        disabled={actionLoading}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        Mark Processed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[10px] text-gray-400">{total} refunds · Page {page} of {pages}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= pages || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Side panel / detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-[400px] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <p className="font-mono font-bold text-brand-700 text-sm">{selected.bookingRef}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CHIP[selected.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Details section */}
              <PanelSection title="Refund Details">
                <PanelRow label="Booking Ref" value={selected.bookingRef} />
                <PanelRow label="Type"        value={typeLabel[selected.bookingType] ?? selected.bookingType} />
                <PanelRow label="Amount"      value={formatCurrency(selected.amount)} bold />
                <PanelRow label="Reason"      value={selected.reason} />
                <PanelRow label="Created"     value={new Date(selected.createdAt).toLocaleString()} />
                {selected.processedBy && <PanelRow label="Processed by" value={selected.processedBy} />}
                {selected.processedAt && <PanelRow label="Processed at" value={new Date(selected.processedAt).toLocaleString()} />}
              </PanelSection>

              {/* Notes */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Notes</p>
                <textarea
                  value={panelNotes}
                  onChange={e => setPanelNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this refund…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Actions */}
              {selected.status === 'PENDING' && (
                <PanelSection title="Actions">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(selected.id, 'approve')}
                      disabled={actionLoading}
                      className="text-[11px] font-bold py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(selected.id, 'reject')}
                      disabled={actionLoading}
                      className="text-[11px] font-bold py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving…' : 'Reject'}
                    </button>
                  </div>
                </PanelSection>
              )}

              {selected.status === 'APPROVED' && (
                <PanelSection title="Actions">
                  <button
                    onClick={() => handleAction(selected.id, 'process')}
                    disabled={actionLoading}
                    className="w-full text-[11px] font-bold py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving…' : 'Mark as Processed'}
                  </button>
                </PanelSection>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{title}</p>
      <div className="space-y-2 bg-gray-50 rounded-xl p-3">{children}</div>
    </div>
  );
}
function PanelRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <span className={`text-gray-800 flex-1 ${bold ? 'font-bold text-brand-700' : ''}`}>{value}</span>
    </div>
  );
}
