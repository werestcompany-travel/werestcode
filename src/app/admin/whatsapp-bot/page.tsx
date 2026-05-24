'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import toast from 'react-hot-toast';
import { MessageSquare, RefreshCw, Trash2, CheckCircle2, Users } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WaSession {
  id:          string;
  phone:       string;
  step:        string;
  data:        Record<string, unknown>;
  bookingRef:  string | null;
  lastMessage: string;
  createdAt:   string;
}

interface Stats {
  total:  number;
  byStep: Record<string, number>;
}

// ── Step badge colours ────────────────────────────────────────────────────────

const STEP_COLOR: Record<string, string> = {
  GREETING:   'bg-gray-100  text-gray-600',
  PICKUP:     'bg-blue-100  text-blue-700',
  DROPOFF:    'bg-indigo-100 text-indigo-700',
  DATE:       'bg-violet-100 text-violet-700',
  TIME:       'bg-purple-100 text-purple-700',
  PASSENGERS: 'bg-amber-100  text-amber-700',
  VEHICLE:    'bg-orange-100 text-orange-700',
  CONFIRM:    'bg-yellow-100 text-yellow-700',
  PAYMENT:    'bg-cyan-100   text-cyan-700',
  DONE:       'bg-green-100  text-green-700',
  CANCELLED:  'bg-red-100    text-red-700',
};

const ALL_STEPS = [
  'GREETING','PICKUP','DROPOFF','DATE','TIME',
  'PASSENGERS','VEHICLE','CONFIRM','PAYMENT','DONE','CANCELLED',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  // International format: 66812345678 → +66 81 234 5678
  if (raw.length >= 10) {
    return `+${raw.slice(0, 2)} ${raw.slice(2, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
  }
  return raw;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WhatsAppBotPage() {
  const router               = useRouter();
  const [sessions, setSessions] = useState<WaSession[]>([]);
  const [stats,    setStats]    = useState<Stats>({ total: 0, byStep: {} });
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter,   setFilter]   = useState<string>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/whatsapp-sessions');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const json = await res.json();
      if (json.success) {
        setSessions(json.data.sessions);
        setStats(json.data.stats);
      } else {
        toast.error('Failed to load sessions');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const resetSession = async (phone: string) => {
    setDeleting(phone);
    try {
      const encoded = encodeURIComponent(phone);
      const res     = await fetch(`/api/admin/whatsapp-sessions/${encoded}`, { method: 'DELETE' });
      const json    = await res.json();
      if (json.success) {
        toast.success(`Session for ${formatPhone(phone)} reset`);
        setSessions(prev => prev.filter(s => s.phone !== phone));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          byStep: {
            ...prev.byStep,
            [sessions.find(s => s.phone === phone)?.step ?? '']: Math.max(
              0,
              (prev.byStep[sessions.find(s => s.phone === phone)?.step ?? ''] ?? 1) - 1,
            ),
          },
        }));
      } else {
        toast.error(json.error ?? 'Failed to reset session');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === 'ALL' ? sessions : sessions.filter(s => s.step === filter);

  return (
    <AdminShell
      title="WhatsApp Bot"
      subtitle="Live booking sessions via WhatsApp chatbot"
    >
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400">Total Sessions</p>
          </div>
        </div>

        {/* Active (not DONE/CANCELLED) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {sessions.filter(s => s.step !== 'DONE' && s.step !== 'CANCELLED').length}
            </p>
            <p className="text-xs text-gray-400">Active Chats</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {stats.byStep['DONE'] ?? 0}
            </p>
            <p className="text-xs text-gray-400">Completed Bookings</p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {stats.byStep['CANCELLED'] ?? 0}
            </p>
            <p className="text-xs text-gray-400">Cancelled</p>
          </div>
        </div>
      </div>

      {/* ── Step breakdown chips ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Sessions by Step</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filter === 'ALL'
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          {ALL_STEPS.map(step => {
            const count = stats.byStep[step] ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={step}
                onClick={() => setFilter(step)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  filter === step
                    ? 'bg-gray-800 text-white border-gray-800'
                    : `${STEP_COLOR[step] ?? 'bg-gray-100 text-gray-600'} border-transparent hover:opacity-80`
                }`}
              >
                {step} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
            {filter !== 'ALL' ? ` · ${filter}` : ''}
          </p>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && sessions.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading sessions…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No sessions found</p>
            <p className="text-xs text-gray-300 mt-1">Sessions appear as customers message the bot</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Step</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Data</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Booking Ref</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Last Message</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(session => (
                  <tr key={session.id} className="hover:bg-gray-50/60 transition-colors">

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] font-semibold text-gray-900">
                        {formatPhone(session.phone)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{session.phone}</div>
                    </td>

                    {/* Step */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${STEP_COLOR[session.step] ?? 'bg-gray-100 text-gray-600'}`}>
                        {session.step}
                      </span>
                    </td>

                    {/* Booking data summary */}
                    <td className="px-6 py-4 max-w-[200px]">
                      <SessionDataSummary data={session.data} />
                    </td>

                    {/* Booking ref */}
                    <td className="px-6 py-4">
                      {session.bookingRef ? (
                        <span className="font-mono text-[12px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
                          {session.bookingRef}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">{timeAgo(session.lastMessage)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => resetSession(session.phone)}
                        disabled={deleting === session.phone}
                        title="Reset session (allows customer to start over)"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deleting === session.phone ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

// ── Small helper component ────────────────────────────────────────────────────

function SessionDataSummary({ data }: { data: Record<string, unknown> }) {
  const lines: string[] = [];
  if (data.pickup)     lines.push(`From: ${String(data.pickup).slice(0, 25)}…`);
  if (data.dropoff)    lines.push(`To: ${String(data.dropoff).slice(0, 25)}…`);
  if (data.date)       lines.push(`Date: ${data.date}`);
  if (data.passengers) lines.push(`Pax: ${data.passengers}`);
  if (data.vehicle)    lines.push(`Vehicle: ${data.vehicle}`);

  if (lines.length === 0) return <span className="text-xs text-gray-300">—</span>;

  return (
    <div className="space-y-0.5">
      {lines.map((l, i) => (
        <p key={i} className="text-[11px] text-gray-500 truncate">{l}</p>
      ))}
    </div>
  );
}
