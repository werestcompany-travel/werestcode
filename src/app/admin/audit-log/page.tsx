'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { RefreshCw, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AUDIT_ACTIONS = [
  'BOOKING_STATUS_UPDATE',
  'BOOKING_DRIVER_ASSIGN',
  'BOOKING_CANCEL',
  'REFUND_CREATE',
  'REFUND_APPROVE',
  'REFUND_REJECT',
  'REFUND_PROCESS',
  'USER_LOYALTY_ADJUST',
  'DISCOUNT_CREATE',
  'DRIVER_CREATE',
  'DRIVER_UPDATE',
];

const ENTITY_TYPES = ['Booking', 'TourBooking', 'AttractionBooking', 'Refund', 'User', 'Driver', 'DiscountCode'];

interface AuditEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs]         = useState<AuditEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);

  // Filters
  const [action,     setAction]     = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');

  // Detail modal
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const buildQuery = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: '50' });
    if (action)     params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (dateFrom)   params.set('dateFrom', dateFrom);
    if (dateTo)     params.set('dateTo', dateTo);
    return params.toString();
  }, [action, entityType, dateFrom, dateTo]);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/audit-log?${buildQuery(p)}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data.logs);
        setTotal(json.data.total);
        setPages(json.data.pages);
        setPage(p);
      }
    } catch {
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // Auto-refresh every 30s
  useEffect(() => {
    load(1);
    const id = setInterval(() => load(page), 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => load(1);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatAction = (a: string) =>
    a.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const exportCsv = () => {
    const params = new URLSearchParams({ export: 'csv' });
    if (action)     params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (dateFrom)   params.set('dateFrom', dateFrom);
    if (dateTo)     params.set('dateTo', dateTo);
    window.open(`/api/admin/audit-log?${params.toString()}`);
  };

  return (
    <AdminShell title="Audit Log" subtitle="All admin actions recorded">

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Action</label>
            <select
              value={action}
              onChange={e => setAction(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All actions</option>
              {AUDIT_ACTIONS.map(a => (
                <option key={a} value={a}>{formatAction(a)}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Entity Type</label>
            <select
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All entities</option>
              {ENTITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Apply Filters
          </button>

          {(action || entityType || dateFrom || dateTo) && (
            <button
              onClick={() => { setAction(''); setEntityType(''); setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => load(page)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold">Admin</th>
                <th className="text-left px-4 py-3 font-semibold">Action</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Entity Type</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Entity ID</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">IP</th>
                <th className="text-right px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No audit log entries found</td>
                </tr>
              ) : logs.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{log.adminEmail}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-bold">
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-gray-600">{log.entityType}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell font-mono text-[11px] text-gray-500 max-w-[140px] truncate">
                      {log.entityId ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell text-gray-400">{log.ip ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      {(log.before || log.after) && (
                        <button
                          onClick={() => { setSelected(log); toggleExpanded(log.id); }}
                          className="flex items-center gap-1 ml-auto text-[10px] font-semibold text-brand-600 hover:text-brand-800"
                        >
                          Details
                          {expanded.has(log.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded.has(log.id) && (
                    <tr key={`${log.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-5 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {log.before && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Before</p>
                              <pre className="text-[10px] bg-red-50 text-red-800 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                                {JSON.stringify(log.before, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.after && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">After</p>
                              <pre className="text-[10px] bg-green-50 text-green-800 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
                                {JSON.stringify(log.after, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[10px] text-gray-400">
            {total} entries · Page {page} of {pages}
          </p>
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

      {/* Detail modal (full view) */}
      {selected && !expanded.has(selected.id) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <p className="font-bold text-gray-900 text-sm">{formatAction(selected.action)}</p>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-400">Admin:</span> <span className="text-gray-800">{selected.adminEmail}</span></div>
                <div><span className="text-gray-400">Entity:</span> <span className="text-gray-800">{selected.entityType} {selected.entityId}</span></div>
                <div><span className="text-gray-400">IP:</span> <span className="text-gray-800">{selected.ip ?? '—'}</span></div>
                <div><span className="text-gray-400">Time:</span> <span className="text-gray-800">{new Date(selected.createdAt).toLocaleString()}</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.before && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Before</p>
                    <pre className="text-[10px] bg-red-50 text-red-800 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(selected.before, null, 2)}
                    </pre>
                  </div>
                )}
                {selected.after && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">After</p>
                    <pre className="text-[10px] bg-green-50 text-green-800 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(selected.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
