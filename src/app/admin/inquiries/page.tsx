'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import {
  Search, RefreshCw, ChevronDown, ChevronUp, Mail, Phone,
  MapPin, Calendar, Users, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type InquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'CANCELLED';

interface Inquiry {
  id:               string;
  ref:              string;
  status:           InquiryStatus;
  fullName:         string;
  email:            string;
  whatsapp:         string;
  country?:         string | null;
  travelDate?:      string | null;
  flexibleDate:     boolean;
  adults:           number;
  children:         number;
  destination:      string;
  multiDestination: boolean;
  tourDuration?:    string | null;
  hotelCategory?:   string | null;
  budgetRange?:     string | null;
  transportType?:   string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities?:      any;
  tourPreferences?: string | null;
  specialRequests?: string | null;
  adminNotes?:      string | null;
  lastContactedAt?: string | null;
  createdAt:        string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'ALL',       label: 'All' },
  { key: 'NEW',       label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'QUOTED',    label: 'Quoted' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_BADGE: Record<InquiryStatus, string> = {
  NEW:       'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  QUOTED:    'bg-purple-100 text-purple-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function fmt(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InquiriesPage() {
  const [inquiries,   setInquiries]   = useState<Inquiry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusTab,   setStatusTab]   = useState('ALL');
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [notesMap,    setNotesMap]    = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)    params.set('search', search);
      if (statusTab !== 'ALL') params.set('status', statusTab);
      const res  = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries ?? []);
        // Seed notesMap
        const map: Record<string, string> = {};
        (data.inquiries ?? []).forEach((inq: Inquiry) => {
          map[inq.id] = inq.adminNotes ?? '';
        });
        setNotesMap(map);
      } else {
        toast.error('Failed to load inquiries');
      }
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, [search, statusTab]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { toast.error('Failed to update status'); return; }
      setInquiries(prev =>
        prev.map(inq => inq.id === id ? { ...inq, status: newStatus as InquiryStatus } : inq),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleNotesSave = async (id: string) => {
    setSavingNotes(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ adminNotes: notesMap[id] ?? '' }),
      });
      if (!res.ok) { toast.error('Failed to save notes'); return; }
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <AdminShell title="Inquiries" subtitle="View and manage customer group tour inquiries">

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {([
          { label: 'Total',     value: inquiries.length,                                        color: 'text-gray-900' },
          { label: 'New',       value: inquiries.filter(i => i.status === 'NEW').length,        color: 'text-blue-700' },
          { label: 'Quoted',    value: inquiries.filter(i => i.status === 'QUOTED').length,     color: 'text-purple-700' },
          { label: 'Confirmed', value: inquiries.filter(i => i.status === 'CONFIRMED').length,  color: 'text-green-700' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name / email / destination…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400"
            />
          </div>
          {/* Refresh */}
          <button
            onClick={fetchInquiries}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-0 border-b border-gray-100 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                statusTab === tab.key
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading inquiries…</div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No inquiries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {inquiries.map(inq => {
              const isExpanded = expanded === inq.id;
              const activitiesObj = (inq.activities ?? {}) as Record<string, boolean>;
              const activitiesList = Object.keys(activitiesObj).filter(k => activitiesObj[k]).join(', ');
              const pax = `${inq.adults} adult${inq.adults !== 1 ? 's' : ''}` +
                (inq.children > 0 ? ` + ${inq.children} child${inq.children !== 1 ? 'ren' : ''}` : '');

              return (
                <div key={inq.id}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : inq.id)}
                  >
                    {/* Ref + name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[11px] font-mono font-bold text-brand-600">{inq.ref}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[inq.status]}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{inq.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{inq.email}</p>
                    </div>
                    {/* Destination */}
                    <div className="hidden sm:block min-w-0 w-32">
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {inq.destination}
                      </p>
                    </div>
                    {/* Date */}
                    <div className="hidden md:block w-24 text-right">
                      <p className="text-[11px] text-gray-400">{fmt(inq.createdAt)}</p>
                    </div>
                    {/* Pax */}
                    <div className="hidden lg:block w-28 text-right">
                      <p className="text-[11px] text-gray-500 flex items-center justify-end gap-1">
                        <Users className="w-3 h-3 shrink-0" />
                        {pax}
                      </p>
                    </div>
                    {/* Expand chevron */}
                    <div className="shrink-0 ml-2 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-5 pb-6 bg-gray-50/60 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

                        {/* Left: inquiry details */}
                        <div className="space-y-3 text-xs text-gray-700">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inquiry Details</h3>
                          <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={inq.email} />
                          <DetailRow icon={<Phone className="w-3.5 h-3.5" />} label="WhatsApp" value={inq.whatsapp} />
                          {inq.country && <DetailRow label="Country" value={inq.country} />}
                          <DetailRow
                            icon={<Calendar className="w-3.5 h-3.5" />}
                            label="Travel Date"
                            value={inq.travelDate ? `${inq.travelDate}${inq.flexibleDate ? ' (flexible)' : ''}` : 'Not specified'}
                          />
                          <DetailRow icon={<Users className="w-3.5 h-3.5" />} label="Group" value={pax} />
                          {inq.tourDuration && <DetailRow label="Duration" value={inq.tourDuration} />}
                          {inq.hotelCategory && <DetailRow label="Hotel" value={inq.hotelCategory} />}
                          {inq.budgetRange && <DetailRow label="Budget" value={inq.budgetRange} />}
                          {inq.transportType && <DetailRow label="Transport" value={inq.transportType} />}
                          {activitiesList && <DetailRow label="Activities" value={activitiesList} />}
                          {inq.tourPreferences && <DetailRow label="Tour Style" value={inq.tourPreferences} />}
                          {inq.specialRequests && (
                            <div>
                              <p className="text-[10px] text-gray-400 mb-0.5">Special Requests</p>
                              <p className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 italic">{inq.specialRequests}</p>
                            </div>
                          )}
                          {inq.lastContactedAt && (
                            <p className="text-[10px] text-gray-400">Last contacted: {fmt(inq.lastContactedAt)}</p>
                          )}
                          {/* WhatsApp quick contact */}
                          <a
                            href={`https://wa.me/${inq.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${inq.fullName}, regarding your inquiry ${inq.ref} for ${inq.destination}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#25D366] hover:underline mt-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp Customer
                          </a>
                        </div>

                        {/* Right: admin controls */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Controls</h3>
                          {/* Status change */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
                            <select
                              value={inq.status}
                              onChange={e => handleStatusChange(inq.id, e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-brand-400 bg-white"
                            >
                              {(['NEW','CONTACTED','QUOTED','CONFIRMED','CANCELLED'] as const).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          {/* Admin notes */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Admin Notes</label>
                            <textarea
                              rows={4}
                              value={notesMap[inq.id] ?? ''}
                              onChange={e => setNotesMap(prev => ({ ...prev, [inq.id]: e.target.value }))}
                              onBlur={() => handleNotesSave(inq.id)}
                              onClick={e => e.stopPropagation()}
                              placeholder="Internal notes — not visible to customer…"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-brand-400 resize-none placeholder:text-gray-300"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                              {savingNotes[inq.id] ? 'Saving…' : 'Auto-saves on blur'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400">
          {inquiries.length} inquir{inquiries.length !== 1 ? 'ies' : 'y'} shown
        </div>
      </div>
    </AdminShell>
  );
}

function DetailRow({
  icon, label, value,
}: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>}
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
