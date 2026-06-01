'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, RefreshCw, BarChart2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

/* ── Types ────────────────────────────────────────────────────────────────── */
interface KPIs {
  todayRevenue: number;
  todayBookings: number;
  monthRevenue: number;
  lastMonthRevenue: number;
  monthGrowth: number;
  totalRevenue: number;
  totalBookings: number;
  repeatRate: number;
}
interface DayPoint  { date: string; revenue: number; bookings: number }
interface ServiceMix { name: string; revenue: number; bookings: number; fill: string }
interface TopRoute  { route: string; count: number; revenue: number }
interface AnalyticsData {
  kpis: KPIs;
  revenueByDay: DayPoint[];
  serviceMix: ServiceMix[];
  topRoutes: TopRoute[];
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmt(n: number) {
  return `฿${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Custom Tooltip ───────────────────────────────────────────────────────── */
function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-1.5">{label ? fmtLabel(label) : ''}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-900">
            {p.name === 'Revenue' ? fmt(p.value) : p.value.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
}

/* ── Donut Tooltip ────────────────────────────────────────────────────────── */
function DonutTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: ServiceMix }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{d.name}</p>
      <p className="text-gray-500">Revenue: <span className="font-bold text-gray-900">{fmt(d.value)}</span></p>
      <p className="text-gray-500">Bookings: <span className="font-bold text-gray-900">{d.payload.bookings.toLocaleString()}</span></p>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, subColor, icon: Icon, iconBg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
      {sub && (
        <p className={`text-xs font-semibold ${subColor ?? 'text-gray-400'}`}>{sub}</p>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const avgBookingValue =
    data && data.kpis.totalBookings > 0
      ? data.kpis.totalRevenue / data.kpis.totalBookings
      : 0;

  return (
    <AdminShell title="Analytics" subtitle="Live revenue and booking insights">
      {/* ── Refresh bar ── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-400">All data is live from the database</p>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-red-500 underline">Try again</button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">

          {/* ── Section 1: KPI Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              label="Today's Revenue"
              value={fmt(data.kpis.todayRevenue)}
              icon={DollarSign}
              iconBg="bg-brand-600"
            />
            <KpiCard
              label="Today's Bookings"
              value={data.kpis.todayBookings}
              icon={Calendar}
              iconBg="bg-indigo-500"
            />
            <KpiCard
              label="This Month"
              value={fmt(data.kpis.monthRevenue)}
              sub={
                data.kpis.monthGrowth !== 0
                  ? `${data.kpis.monthGrowth > 0 ? '+' : ''}${data.kpis.monthGrowth.toFixed(1)}% vs last month`
                  : 'No prior month data'
              }
              subColor={
                data.kpis.monthGrowth > 0
                  ? 'text-emerald-600'
                  : data.kpis.monthGrowth < 0
                  ? 'text-red-500'
                  : 'text-gray-400'
              }
              icon={data.kpis.monthGrowth >= 0 ? TrendingUp : TrendingDown}
              iconBg={data.kpis.monthGrowth >= 0 ? 'bg-emerald-500' : 'bg-red-400'}
            />
            <KpiCard
              label="Total Bookings"
              value={data.kpis.totalBookings.toLocaleString()}
              sub="All time"
              icon={BarChart2}
              iconBg="bg-amber-500"
            />
            <KpiCard
              label="Repeat Customers"
              value={`${data.kpis.repeatRate.toFixed(1)}%`}
              sub="Of transfer customers"
              icon={Users}
              iconBg="bg-purple-500"
            />
          </div>

          {/* ── Section 2: Revenue Line Chart ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5 text-base">Revenue — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.revenueByDay} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtLabel}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval="preserveStartEnd"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  orientation="left"
                  tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <YAxis
                  yAxisId="cnt"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2534ff"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="cnt"
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ── Section 3: Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Service Mix Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5 text-base">Revenue by Service</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.serviceMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="revenue"
                    >
                      {data.serviceMix.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {data.serviceMix.map(s => {
                    const totalRev = data.serviceMix.reduce((acc, x) => acc + x.revenue, 0);
                    const pct = totalRev > 0 ? (s.revenue / totalRev) * 100 : 0;
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.fill }} />
                            <span className="text-sm font-semibold text-gray-700">{s.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: s.fill }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(s.revenue)} · {s.bookings} bookings</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Routes Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Top Transfer Routes</h3>
              </div>
              {data.topRoutes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No paid transfer data yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Route</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trips</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topRoutes.map((r, i) => (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="px-5 py-3 text-xs font-bold text-gray-300">{i + 1}</td>
                        <td className="px-3 py-3 font-medium text-gray-800 max-w-[180px] truncate">{r.route}</td>
                        <td className="px-3 py-3 text-right text-gray-600">{r.count}</td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">{fmt(r.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Section 4: Bottom Stats Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Repeat rate bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Repeat Customer Rate</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-3">{data.kpis.repeatRate.toFixed(1)}%</p>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(data.kpis.repeatRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Based on transfer customers</p>
            </div>

            {/* Monthly growth */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Monthly Growth</p>
              <div className="flex items-center gap-2 mb-3">
                {data.kpis.monthGrowth >= 0
                  ? <TrendingUp className="w-6 h-6 text-emerald-500" />
                  : <TrendingDown className="w-6 h-6 text-red-400" />
                }
                <p className={`text-3xl font-extrabold ${data.kpis.monthGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {data.kpis.monthGrowth > 0 ? '+' : ''}{data.kpis.monthGrowth.toFixed(1)}%
                </p>
              </div>
              <p className="text-xs text-gray-500">
                This month: <span className="font-bold text-gray-800">{fmt(data.kpis.monthRevenue)}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Last month: {fmt(data.kpis.lastMonthRevenue)}
              </p>
            </div>

            {/* Avg booking value */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Avg. Booking Value</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-3">{fmt(avgBookingValue)}</p>
              <p className="text-xs text-gray-500">
                Total: <span className="font-bold text-gray-800">{fmt(data.kpis.totalRevenue)}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Over {data.kpis.totalBookings.toLocaleString()} paid bookings
              </p>
            </div>
          </div>

        </div>
      )}
    </AdminShell>
  );
}
