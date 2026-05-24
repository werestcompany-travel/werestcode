'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Plus, Search, FileText, Wand2, Download, Trash2, Edit3,
  Globe, Users, Calendar, MapPin, Star, Copy, MoreVertical,
  CheckCircle, Clock, Send, Zap,
} from 'lucide-react';

// ── Types (inline for the page) ──
interface ItinerarySummary {
  id: string; ref: string; title: string; subtitle?: string | null;
  clientName?: string | null; clientEmail?: string | null;
  destination: string; destinations: string[];
  startDate?: string | null; endDate?: string | null;
  travelers: number; hotelCategory: string; language: string;
  status: string; totalPrice?: number | null; currency: string;
  exportedAt?: string | null; sentAt?: string | null;
  createdAt: string; updatedAt: string;
}

interface Stats {
  total: number; draft: number; finalized: number; sent: number; thisMonth: number;
}

// ── Constants ──
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft:     { label: 'Draft',     color: 'bg-amber-100 text-amber-800',   icon: Clock },
  finalized: { label: 'Finalized', color: 'bg-blue-100 text-blue-800',     icon: CheckCircle },
  sent:      { label: 'Sent',      color: 'bg-green-100 text-green-800',   icon: Send },
};

const HOTEL_LABELS: Record<string, string> = {
  budget: 'Budget', standard: '3★', superior: '4★', deluxe: '5★', luxury: 'Luxury',
};

const DEST_EMOJIS: Record<string, string> = {
  bangkok: '🏙️', phuket: '🏖️', 'chiang mai': '🌿', pattaya: '🎡',
  krabi: '🏝️', 'koh samui': '🌊', 'chiang rai': '⛩️',
};

function getDestEmoji(dest: string): string {
  const lower = dest.toLowerCase();
  for (const [k, v] of Object.entries(DEST_EMOJIS)) {
    if (lower.includes(k)) return v;
  }
  return '🗺️';
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number | null | undefined): string {
  if (!n) return '';
  return `฿${n.toLocaleString()}`;
}

function timeAgo(d: string): string {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

// ── Main Component ──
export default function ItineraryListPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [stats, setStats]             = useState<Stats>({ total: 0, draft: 0, finalized: 0, sent: 0, thisMonth: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/itinerary');
      const json = await res.json();
      if (json.success) {
        setItineraries(json.data);
        setStats(json.stats);
      }
    } catch { toast.error('Failed to load itineraries'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItineraries(); }, [fetchItineraries]);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/itinerary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Itinerary deleted');
        fetchItineraries();
      } else {
        toast.error('Failed to delete');
      }
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleDuplicate = async (it: ItinerarySummary) => {
    try {
      const detailRes = await fetch(`/api/admin/itinerary/${it.id}`);
      const detail    = await detailRes.json();
      if (!detail.success) { toast.error('Failed to duplicate'); return; }
      const d = detail.data;
      const res = await fetch('/api/admin/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...d,
          id: undefined, ref: undefined, createdAt: undefined, updatedAt: undefined,
          title: `Copy of ${d.title}`,
          status: 'draft',
          exportedAt: null, sentAt: null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Itinerary duplicated');
        fetchItineraries();
      }
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleExport = async (it: ItinerarySummary) => {
    const toastId = toast.loading('Generating PDF…');
    try {
      const res = await fetch(`/api/admin/itinerary/${it.id}/export`, { method: 'POST' });
      if (!res.ok) { toast.error('PDF generation failed', { id: toastId }); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `werest-itinerary-${it.ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: toastId });
      fetchItineraries();
    } catch { toast.error('PDF generation failed', { id: toastId }); }
  };

  // Filter
  const filtered = itineraries.filter(it => {
    const matchesStatus = filterStatus === 'all' || it.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      it.title.toLowerCase().includes(q) ||
      it.destination.toLowerCase().includes(q) ||
      (it.clientName ?? '').toLowerCase().includes(q) ||
      it.ref.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminShell title="Itinerary Builder" subtitle="Create AI-powered travel packages for your clients">
      {/* ── Header actions ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Wand2 className="w-4 h-4 text-brand-600" />
          <span>Powered by GPT-4o — generate complete itineraries in seconds</span>
        </div>
        <Link
          href="/admin/itinerary/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Itinerary
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total',      value: stats.total,     color: 'text-gray-900',  bg: 'bg-white',     icon: FileText },
          { label: 'Draft',      value: stats.draft,     color: 'text-amber-700', bg: 'bg-amber-50',  icon: Clock },
          { label: 'Finalized',  value: stats.finalized, color: 'text-blue-700',  bg: 'bg-blue-50',   icon: CheckCircle },
          { label: 'Sent',       value: stats.sent,      color: 'text-green-700', bg: 'bg-green-50',  icon: Send },
          { label: 'This Month', value: stats.thisMonth, color: 'text-brand-700', bg: 'bg-brand-50',  icon: Zap },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              <p className={`text-2xl font-extrabold ${color} leading-none`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, destination, client…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {['all', 'draft', 'finalized', 'sent'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                filterStatus === s
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Itinerary Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {search || filterStatus !== 'all' ? 'No itineraries match your filter' : 'No itineraries yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            {search || filterStatus !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create your first AI-powered travel itinerary in under 60 seconds. Just enter the destination and let GPT-4o do the heavy lifting.'
            }
          </p>
          {!search && filterStatus === 'all' && (
            <Link
              href="/admin/itinerary/new"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Generate First Itinerary
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const statusCfg = STATUS_CONFIG[it.status] ?? STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            const emoji = getDestEmoji(it.destination);

            return (
              <div
                key={it.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all group relative overflow-hidden"
              >
                {/* Top color bar */}
                <div className={`h-1 w-full ${
                  it.status === 'sent' ? 'bg-green-400' :
                  it.status === 'finalized' ? 'bg-blue-400' : 'bg-amber-400'
                }`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl shrink-0">{emoji}</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-[14px] leading-tight truncate">{it.title}</h3>
                        {it.subtitle && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{it.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* 3-dot menu */}
                    <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === it.id ? null : it.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {openMenu === it.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-10 w-40 overflow-hidden">
                          <button
                            onClick={() => { router.push(`/admin/itinerary/${it.id}`); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { handleExport(it); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700"
                          >
                            <Download className="w-3.5 h-3.5" /> Export PDF
                          </button>
                          <button
                            onClick={() => { handleDuplicate(it); setOpenMenu(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700"
                          >
                            <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <button
                            onClick={() => { handleDelete(it.id, it.title); setOpenMenu(null); }}
                            disabled={deleting === it.id}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status + ref */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{it.ref}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(it.createdAt)}</span>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{it.destination}</span>
                    </div>
                    {(it.startDate || it.endDate) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>
                          {it.startDate ? formatDate(it.startDate) : '?'}
                          {it.endDate ? ` – ${formatDate(it.endDate)}` : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        {it.travelers} traveler{it.travelers > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-gray-400" />
                        {HOTEL_LABELS[it.hotelCategory] ?? it.hotelCategory}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {it.language.toUpperCase()}
                      </span>
                    </div>
                    {it.clientName && (
                      <div className="text-xs text-gray-500 truncate">
                        👤 {it.clientName}
                        {it.clientEmail && <span className="text-gray-400"> · {it.clientEmail}</span>}
                      </div>
                    )}
                    {it.totalPrice && (
                      <div className="text-xs font-bold text-brand-600">
                        💰 {formatCurrency(it.totalPrice)} total
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                    <Link
                      href={`/admin/itinerary/${it.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors py-1.5 rounded-lg hover:bg-brand-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleExport(it)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
