'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Download, RefreshCw } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface ReportStats {
  totalRevenue: number;
  totalBookings: number;
  transferRevenue: number;
  tourRevenue: number;
  attractionRevenue: number;
  transferCount: number;
  tourCount: number;
  attractionCount: number;
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toDateInput(d);
}

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate,   setEndDate]   = useState(toDateInput(new Date()));
  const [data,      setData]      = useState<ReportStats | null>(null);
  const [loading,   setLoading]   = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}`);
    const d = await r.json();
    setData(d.data?.stats ?? null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExportCSV() {
    const url = `/api/admin/reports?format=csv&startDate=${startDate}&endDate=${endDate}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `werest-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const maxRevenue = data ? Math.max(data.transferRevenue, data.tourRevenue, data.attractionRevenue, 1) : 1;

  const bars = data ? [
    { label: 'Transfers',   revenue: data.transferRevenue,   count: data.transferCount,   color: 'bg-brand-500' },
    { label: 'Tours',       revenue: data.tourRevenue,       count: data.tourCount,       color: 'bg-emerald-500' },
    { label: 'Attractions', revenue: data.attractionRevenue, count: data.attractionCount, color: 'bg-purple-500' },
  ] : [];

  return (
    <AdminShell title="Reports" subtitle="Revenue and booking analytics">

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Generate Report
        </button>
        <button onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue',  value: `฿${data.totalRevenue.toLocaleString()}` },
              { label: 'Total Bookings', value: data.totalBookings },
              { label: 'Transfer Rev.',  value: `฿${data.transferRevenue.toLocaleString()}` },
              { label: 'Tour Rev.',      value: `฿${data.tourRevenue.toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue bars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" /> Revenue by Category
            </h3>
            <div className="space-y-4">
              {bars.map(b => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">{b.label}</span>
                    <span className="text-sm font-bold text-gray-900">
                      ฿{b.revenue.toLocaleString()} <span className="text-xs text-gray-400 font-normal">({b.count} bookings)</span>
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(b.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Summary</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-500">Category</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500">Bookings</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bars.map(b => (
                  <tr key={b.label} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-sm text-gray-900">{b.label}</td>
                    <td className="px-5 py-3 text-right text-sm text-gray-700">{b.count}</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">฿{b.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-5 py-3 text-sm text-gray-900">Total</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-900">{data.totalBookings}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-900">฿{data.totalRevenue.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-20">
          <BarChart2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Select a date range and generate a report</p>
        </div>
      )}
    </AdminShell>
  );
}
