'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Download, Trash2, Plus, ChevronUp, ChevronDown,
  Edit3, X, Check, Loader2, Clock, CheckCircle, Send,
  MapPin, Users, Calendar, Globe, User,
  FileText, DollarSign, ScrollText,
} from 'lucide-react';

// ── Types (inline) ──
type ActivityType = 'transfer' | 'tour' | 'attraction' | 'meal' | 'free-time' | 'check-in' | 'check-out' | 'flight' | 'hotel';
type MealType = 'breakfast' | 'lunch' | 'dinner';

interface Activity {
  id: string; time?: string; title: string; description: string;
  type: ActivityType; duration?: string; price?: number; notes?: string; emoji?: string;
}

interface DayBlock {
  day: number; date?: string; title: string; description: string;
  activities: Activity[]; accommodation?: string; meals: MealType[]; transferInfo?: string;
}

interface PricingLine {
  id: string; label: string; description?: string;
  quantity: number; unitPrice: number; total: number;
  type: 'transfer' | 'tour' | 'attraction' | 'hotel' | 'guide' | 'meals' | 'other';
}

interface ItineraryData {
  id: string; ref: string; title: string; subtitle?: string;
  clientName?: string; clientEmail?: string;
  destination: string; destinations: string[];
  startDate?: string; endDate?: string;
  travelers: number; hotelCategory: string; language: string; status: string;
  overview?: string; highlights: string[]; dayBlocks: DayBlock[];
  inclusions: string[]; exclusions: string[]; terms?: string;
  importantNotes?: string; pricingLines: PricingLine[];
  totalPrice?: number; currency: string; adminNotes?: string;
  exportedAt?: string; sentAt?: string; createdAt: string; updatedAt: string;
}

// ── Constants ──
const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Draft',     icon: Clock,       color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'finalized', label: 'Finalized', icon: CheckCircle, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'sent',      label: 'Sent',      icon: Send,        color: 'bg-green-100 text-green-800 border-green-200' },
];

const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string }[] = [
  { value: 'transfer',   label: 'Transfer',      emoji: '🚗' },
  { value: 'tour',       label: 'Tour',          emoji: '🗺️' },
  { value: 'attraction', label: 'Attraction',    emoji: '🎡' },
  { value: 'meal',       label: 'Meal',          emoji: '🍽️' },
  { value: 'free-time',  label: 'Free Time',     emoji: '🌴' },
  { value: 'check-in',   label: 'Check-in',      emoji: '🏨' },
  { value: 'check-out',  label: 'Check-out',     emoji: '🧳' },
  { value: 'flight',     label: 'Flight',        emoji: '✈️' },
  { value: 'hotel',      label: 'Hotel Service', emoji: '🛎️' },
];

const MEAL_OPTIONS: MealType[] = ['breakfast', 'lunch', 'dinner'];

const HOTEL_LABELS: Record<string, string> = {
  budget: 'Budget', standard: '3★', superior: '4★', deluxe: '5★', luxury: 'Luxury',
};

function formatCurrency(n: number) { return `฿${n.toLocaleString()}`; }
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
function formatDate(d: string | undefined | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ── EditableText: inline edit helper ──
function Editable({
  value, onChange, className, placeholder, multiline = false, rows = 3,
}: {
  value: string; onChange: (v: string) => void; className?: string;
  placeholder?: string; multiline?: boolean; rows?: number;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 rounded-lg px-2 py-1.5 resize-none transition-colors ${className ?? ''}`}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 rounded-lg px-2 py-1 transition-colors ${className ?? ''}`}
    />
  );
}

// ── Main Component ──
export default function ItineraryEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData]           = useState<ItineraryData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'days' | 'details'>('days');
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch itinerary
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/admin/itinerary/${id}`);
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          setData({
            ...d,
            highlights:   Array.isArray(d.highlights)   ? d.highlights   : [],
            dayBlocks:    Array.isArray(d.dayBlocks)     ? d.dayBlocks    : [],
            inclusions:   Array.isArray(d.inclusions)    ? d.inclusions   : [],
            exclusions:   Array.isArray(d.exclusions)    ? d.exclusions   : [],
            pricingLines: Array.isArray(d.pricingLines)  ? d.pricingLines : [],
          });
        } else {
          toast.error('Itinerary not found');
          router.push('/admin/itinerary');
        }
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    }
    load();
  }, [id, router]);

  // Auto-save with debounce
  const triggerSave = useCallback((newData: ItineraryData) => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const totalPrice = newData.pricingLines.reduce((s, l) => s + l.total, 0);
        const res = await fetch(`/api/admin/itinerary/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newData, totalPrice: totalPrice || null }),
        });
        if (res.ok) { setSaved(true); }
        else        { toast.error('Auto-save failed'); }
      } catch { toast.error('Auto-save failed'); }
      finally { setSaving(false); }
    }, 2000);
  }, [id]);

  // Mutate helper
  const mutate = useCallback((fn: (d: ItineraryData) => ItineraryData) => {
    setData(prev => {
      if (!prev) return prev;
      const next = fn(prev);
      triggerSave(next);
      return next;
    });
  }, [triggerSave]);

  // Manual save
  const handleManualSave = async () => {
    if (!data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    try {
      const totalPrice = data.pricingLines.reduce((s, l) => s + l.total, 0);
      const res = await fetch(`/api/admin/itinerary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, totalPrice: totalPrice || null }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success('Saved!');
      } else {
        toast.error('Save failed');
      }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  // Export PDF
  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    const toastId = toast.loading('Generating PDF…');
    try {
      const res = await fetch(`/api/admin/itinerary/${id}/export`, { method: 'POST' });
      if (!res.ok) { toast.error('PDF generation failed', { id: toastId }); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `werest-itinerary-${data.ref}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: toastId });
    } catch { toast.error('PDF failed', { id: toastId }); }
    finally { setExporting(false); }
  };

  // ── Day block mutations ──
  const addDay = () => mutate(d => ({
    ...d,
    dayBlocks: [
      ...d.dayBlocks,
      {
        day:         d.dayBlocks.length + 1,
        title:       `Day ${d.dayBlocks.length + 1}`,
        description: '',
        activities:  [],
        meals:       [],
      },
    ],
  }));

  const removeDay = (index: number) => mutate(d => ({
    ...d,
    dayBlocks: d.dayBlocks
      .filter((_, i) => i !== index)
      .map((b, i) => ({ ...b, day: i + 1 })),
  }));

  const moveDay = (index: number, dir: 'up' | 'down') => mutate(d => {
    const blocks = [...d.dayBlocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return d;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    return { ...d, dayBlocks: blocks.map((b, i) => ({ ...b, day: i + 1 })) };
  });

  const updateDay = (index: number, key: keyof DayBlock, value: unknown) => mutate(d => {
    const blocks = [...d.dayBlocks];
    blocks[index] = { ...blocks[index], [key]: value };
    return { ...d, dayBlocks: blocks };
  });

  // ── Activity mutations ──
  const addActivity = (dayIndex: number) => {
    const newAct: Activity = {
      id:          uid(),
      time:        '09:00',
      title:       '',
      description: '',
      type:        'tour',
      emoji:       '🗺️',
    };
    mutate(d => {
      const blocks = [...d.dayBlocks];
      blocks[dayIndex] = {
        ...blocks[dayIndex],
        activities: [...blocks[dayIndex].activities, newAct],
      };
      return { ...d, dayBlocks: blocks };
    });
    setEditingActId(newAct.id);
  };

  const removeActivity = (dayIndex: number, actIndex: number) => mutate(d => {
    const blocks = [...d.dayBlocks];
    blocks[dayIndex] = {
      ...blocks[dayIndex],
      activities: blocks[dayIndex].activities.filter((_, i) => i !== actIndex),
    };
    return { ...d, dayBlocks: blocks };
  });

  const moveActivity = (dayIndex: number, actIndex: number, dir: 'up' | 'down') => mutate(d => {
    const blocks = [...d.dayBlocks];
    const acts   = [...blocks[dayIndex].activities];
    const target = dir === 'up' ? actIndex - 1 : actIndex + 1;
    if (target < 0 || target >= acts.length) return d;
    [acts[actIndex], acts[target]] = [acts[target], acts[actIndex]];
    blocks[dayIndex] = { ...blocks[dayIndex], activities: acts };
    return { ...d, dayBlocks: blocks };
  });

  const updateActivity = (dayIndex: number, actIndex: number, key: keyof Activity, value: unknown) => mutate(d => {
    const blocks = [...d.dayBlocks];
    const acts   = [...blocks[dayIndex].activities];
    acts[actIndex] = { ...acts[actIndex], [key]: value };
    if (key === 'type') {
      const typeDef = ACTIVITY_TYPES.find(t => t.value === value);
      if (typeDef) acts[actIndex].emoji = typeDef.emoji;
    }
    blocks[dayIndex] = { ...blocks[dayIndex], activities: acts };
    return { ...d, dayBlocks: blocks };
  });

  // ── Pricing mutations ──
  const addPricingLine = () => mutate(d => ({
    ...d,
    pricingLines: [
      ...d.pricingLines,
      { id: uid(), label: '', description: '', quantity: 1, unitPrice: 0, total: 0, type: 'other' as const },
    ],
  }));

  const removePricingLine = (index: number) => mutate(d => ({
    ...d,
    pricingLines: d.pricingLines.filter((_, i) => i !== index),
  }));

  const updatePricingLine = (index: number, key: keyof PricingLine, value: unknown) => mutate(d => {
    const lines = [...d.pricingLines];
    lines[index] = { ...lines[index], [key]: value };
    // Auto-calc total
    if (key === 'quantity' || key === 'unitPrice') {
      lines[index].total = lines[index].quantity * lines[index].unitPrice;
    }
    if (key === 'total') {
      lines[index].total = Number(value);
    }
    return { ...d, pricingLines: lines };
  });

  // ── List mutations (inclusions, exclusions, highlights) ──
  const addListItem = (field: 'inclusions' | 'exclusions' | 'highlights') => mutate(d => ({
    ...d,
    [field]: [...d[field], ''],
  }));

  const updateListItem = (field: 'inclusions' | 'exclusions' | 'highlights', index: number, val: string) => mutate(d => {
    const arr = [...d[field]];
    arr[index] = val;
    return { ...d, [field]: arr };
  });

  const removeListItem = (field: 'inclusions' | 'exclusions' | 'highlights', index: number) => mutate(d => ({
    ...d,
    [field]: d[field].filter((_, i) => i !== index),
  }));

  if (loading) return (
    <AdminShell title="Itinerary Editor" subtitle="Loading…">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    </AdminShell>
  );

  if (!data) return null;

  const totalPrice = data.pricingLines.reduce((s, l) => s + l.total, 0);
  const currentStatus = STATUS_OPTIONS.find(s => s.value === data.status) ?? STATUS_OPTIONS[0];

  return (
    <AdminShell title={data.title} subtitle={`${data.ref} · ${data.destination}`}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Link href="/admin/itinerary" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Save indicator */}
          <span className={`text-xs flex items-center gap-1 ${saved ? 'text-green-600' : saving ? 'text-amber-600' : 'text-gray-400'}`}>
            {saving ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-3 h-3" /> Saved</>
            ) : (
              <><Clock className="w-3 h-3" /> Unsaved changes</>
            )}
          </span>

          {/* Status selector */}
          <select
            value={data.status}
            onChange={e => mutate(d => ({ ...d, status: e.target.value }))}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${currentStatus.color} focus:outline-none cursor-pointer`}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={handleManualSave}
            disabled={saving || saved}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="flex-[2] min-w-0 space-y-4">

          {/* Overview Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-gray-900 text-sm">Overview</h3>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title</label>
              <Editable
                value={data.title}
                onChange={v => mutate(d => ({ ...d, title: v }))}
                placeholder="Itinerary title"
                className="text-base font-bold text-gray-900"
              />
            </div>

            {/* Subtitle */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Subtitle</label>
              <Editable
                value={data.subtitle ?? ''}
                onChange={v => mutate(d => ({ ...d, subtitle: v }))}
                placeholder="Brief subtitle"
                className="text-sm text-gray-600"
              />
            </div>

            {/* Overview text */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Overview</label>
              <Editable
                value={data.overview ?? ''}
                onChange={v => mutate(d => ({ ...d, overview: v }))}
                placeholder="Write an overview of this trip…"
                multiline rows={4}
                className="text-sm text-gray-700"
              />
            </div>

            {/* Highlights */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Highlights</label>
                <button onClick={() => addListItem('highlights')} className="text-xs text-brand-600 hover:text-brand-800 font-semibold">
                  + Add
                </button>
              </div>
              {data.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-green-500 text-xs font-bold shrink-0">✓</span>
                  <input
                    type="text"
                    value={h}
                    onChange={e => updateListItem('highlights', i, e.target.value)}
                    placeholder="Trip highlight"
                    className="flex-1 text-sm border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none rounded-lg px-2 py-1"
                  />
                  <button onClick={() => removeListItem('highlights', i)} className="text-gray-300 hover:text-red-400 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
            {[
              { key: 'days' as const,    label: 'Day-by-Day',    icon: Calendar },
              { key: 'details' as const, label: 'Details & Terms', icon: ScrollText },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Days Tab ── */}
          {activeTab === 'days' && (
            <div className="space-y-4">
              {data.dayBlocks.map((day, di) => (
                <div key={di} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Day Header */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="w-8 h-8 bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center justify-center shrink-0">
                      {day.day}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Editable
                        value={day.title}
                        onChange={v => updateDay(di, 'title', v)}
                        placeholder={`Day ${day.day} title`}
                        className="text-sm font-bold text-gray-900"
                      />
                      {day.date && <p className="text-xs text-gray-400 px-2">{formatDate(day.date)}</p>}
                    </div>
                    {/* Day controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveDay(di, 'up')} disabled={di === 0} className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => moveDay(di, 'down')} disabled={di === data.dayBlocks.length - 1} className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => removeDay(di)} className="p-1 rounded-lg hover:bg-red-100 transition-colors ml-1">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Day Body */}
                  <div className="p-5">
                    <Editable
                      value={day.description}
                      onChange={v => updateDay(di, 'description', v)}
                      placeholder="Brief description of this day…"
                      multiline rows={2}
                      className="text-sm text-gray-600 mb-4"
                    />

                    {/* Activities */}
                    <div className="space-y-2 mb-3">
                      {day.activities.map((act, ai) => (
                        <div key={act.id} className="group">
                          {editingActId === act.id ? (
                            /* Expanded edit form */
                            <div className="border border-brand-200 rounded-xl p-4 bg-brand-50/30">
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Time</label>
                                  <input
                                    type="time"
                                    value={act.time ?? ''}
                                    onChange={e => updateActivity(di, ai, 'time', e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                                  <select
                                    value={act.type}
                                    onChange={e => updateActivity(di, ai, 'type', e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  >
                                    {ACTIVITY_TYPES.map(t => (
                                      <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
                                <input
                                  type="text"
                                  value={act.title}
                                  onChange={e => updateActivity(di, ai, 'title', e.target.value)}
                                  placeholder="Activity name"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                              </div>
                              <div className="mb-3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                                <textarea
                                  value={act.description}
                                  onChange={e => updateActivity(di, ai, 'description', e.target.value)}
                                  placeholder="Describe this activity…"
                                  rows={2}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                                  <input
                                    type="text"
                                    value={act.duration ?? ''}
                                    onChange={e => updateActivity(di, ai, 'duration', e.target.value)}
                                    placeholder="e.g. 2 hours"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
                                  <input
                                    type="text"
                                    value={act.notes ?? ''}
                                    onChange={e => updateActivity(di, ai, 'notes', e.target.value)}
                                    placeholder="Tip or note"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => { removeActivity(di, ai); setEditingActId(null); }}
                                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                                <button
                                  onClick={() => setEditingActId(null)}
                                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
                                >
                                  <Check className="w-3.5 h-3.5" /> Done
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Collapsed preview */
                            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group/act" onClick={() => setEditingActId(act.id)}>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={e => { e.stopPropagation(); moveActivity(di, ai, 'up'); }}
                                  disabled={ai === 0}
                                  className="opacity-0 group-hover/act:opacity-100 p-0.5 hover:bg-gray-200 rounded disabled:opacity-0 transition-opacity"
                                >
                                  <ChevronUp className="w-3 h-3 text-gray-400" />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); moveActivity(di, ai, 'down'); }}
                                  disabled={ai === day.activities.length - 1}
                                  className="opacity-0 group-hover/act:opacity-100 p-0.5 hover:bg-gray-200 rounded disabled:opacity-0 transition-opacity"
                                >
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              {act.time && (
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md shrink-0 mt-0.5 w-14 text-center">
                                  {act.time}
                                </span>
                              )}
                              <span className="text-base shrink-0 mt-0.5">{act.emoji ?? '📍'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {act.title || <span className="text-gray-400 italic">Untitled activity</span>}
                                </p>
                                {act.description && <p className="text-xs text-gray-500 truncate">{act.description}</p>}
                              </div>
                              <Edit3 className="w-3.5 h-3.5 text-gray-400 shrink-0 opacity-0 group-hover/act:opacity-100" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add activity */}
                    <button
                      onClick={() => addActivity(di)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Activity
                    </button>

                    {/* Day footer */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Accommodation</label>
                        <input
                          type="text"
                          value={day.accommodation ?? ''}
                          onChange={e => updateDay(di, 'accommodation', e.target.value)}
                          placeholder="Hotel / villa name"
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Meals Included</label>
                        <div className="flex gap-2">
                          {MEAL_OPTIONS.map(m => (
                            <label key={m} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={day.meals.includes(m)}
                                onChange={e => {
                                  const meals = e.target.checked
                                    ? [...day.meals, m]
                                    : day.meals.filter(x => x !== m);
                                  updateDay(di, 'meals', meals);
                                }}
                                className="w-3 h-3 rounded accent-brand-600"
                              />
                              <span className="text-xs text-gray-600 capitalize">{m.slice(0, 1).toUpperCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Transfer / Transport Info</label>
                      <input
                        type="text"
                        value={day.transferInfo ?? ''}
                        onChange={e => updateDay(di, 'transferInfo', e.target.value)}
                        placeholder="How to get around this day"
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Day */}
              <button
                onClick={addDay}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-semibold text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Day
              </button>
            </div>
          )}

          {/* ── Details Tab ── */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Inclusions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span className="text-green-500">✓</span> What&apos;s Included
                  </h3>
                  <button onClick={() => addListItem('inclusions')} className="text-xs text-brand-600 font-semibold">+ Add</button>
                </div>
                {data.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="text-green-500 text-xs shrink-0">✓</span>
                    <input
                      type="text"
                      value={inc}
                      onChange={e => updateListItem('inclusions', i, e.target.value)}
                      placeholder="Included item"
                      className="flex-1 text-sm border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none rounded-lg px-2 py-1"
                    />
                    <button onClick={() => removeListItem('inclusions', i)} className="text-gray-300 hover:text-red-400 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Exclusions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span className="text-red-500">✕</span> Not Included
                  </h3>
                  <button onClick={() => addListItem('exclusions')} className="text-xs text-brand-600 font-semibold">+ Add</button>
                </div>
                {data.exclusions.map((exc, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="text-red-400 text-xs shrink-0">✕</span>
                    <input
                      type="text"
                      value={exc}
                      onChange={e => updateListItem('exclusions', i, e.target.value)}
                      placeholder="Excluded item"
                      className="flex-1 text-sm border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none rounded-lg px-2 py-1"
                    />
                    <button onClick={() => removeListItem('exclusions', i)} className="text-gray-300 hover:text-red-400 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-gray-400" /> Terms &amp; Conditions
                </h3>
                <textarea
                  value={data.terms ?? ''}
                  onChange={e => mutate(d => ({ ...d, terms: e.target.value }))}
                  placeholder="Booking terms, cancellation policy…"
                  rows={6}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Important Notes */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Important Notes</h3>
                <textarea
                  value={data.importantNotes ?? ''}
                  onChange={e => mutate(d => ({ ...d, importantNotes: e.target.value }))}
                  placeholder="Destination tips, visa info, what to pack…"
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Admin Notes */}
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                <h3 className="font-bold text-sm text-amber-800 mb-3">Internal Admin Notes (not in PDF)</h3>
                <textarea
                  value={data.adminNotes ?? ''}
                  onChange={e => mutate(d => ({ ...d, adminNotes: e.target.value }))}
                  placeholder="Internal notes, follow-up reminders…"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-amber-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-80 shrink-0 space-y-4 sticky top-6">

          {/* Trip Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Trip Details
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { icon: MapPin,   label: 'Destination', value: data.destination },
                { icon: Calendar, label: 'Dates',       value: [data.startDate, data.endDate].filter(Boolean).map(d => formatDate(d)).join(' – ') || '—' },
                { icon: Users,    label: 'Travelers',   value: `${data.travelers} person${data.travelers > 1 ? 's' : ''}` },
                { icon: Globe,    label: 'Language',    value: data.language.toUpperCase() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                    <p className="text-xs font-medium text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hotel</span>
                  <p className="text-xs font-medium text-gray-700">{HOTEL_LABELS[data.hotelCategory] ?? data.hotelCategory}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          {(data.clientName || data.clientEmail) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Client
              </h3>
              {data.clientName && <p className="text-sm font-semibold text-gray-900">{data.clientName}</p>}
              {data.clientEmail && <p className="text-xs text-gray-500">{data.clientEmail}</p>}
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-600" /> Pricing
              </h3>
              <button onClick={addPricingLine} className="text-xs text-brand-600 font-semibold hover:text-brand-800">
                + Add
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {data.pricingLines.map((line, i) => (
                <div key={line.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      type="text"
                      value={line.label}
                      onChange={e => updatePricingLine(i, 'label', e.target.value)}
                      placeholder="Service name"
                      className="flex-1 text-xs font-semibold border border-transparent hover:border-gray-200 focus:border-brand-400 focus:outline-none rounded-lg px-1.5 py-1"
                    />
                    <button onClick={() => removePricingLine(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[9px] text-gray-400 font-semibold uppercase">Qty</label>
                      <input
                        type="number"
                        value={line.quantity}
                        min={1}
                        onChange={e => updatePricingLine(i, 'quantity', Number(e.target.value))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-semibold uppercase">Unit ฿</label>
                      <input
                        type="number"
                        value={line.unitPrice}
                        min={0}
                        onChange={e => updatePricingLine(i, 'unitPrice', Number(e.target.value))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-semibold uppercase">Total ฿</label>
                      <input
                        type="number"
                        value={line.total}
                        min={0}
                        onChange={e => updatePricingLine(i, 'total', Number(e.target.value))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-extrabold text-brand-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Export */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-white" />
              <h3 className="font-bold text-sm text-white">Export PDF</h3>
            </div>
            <p className="text-xs text-white/70 mb-4">Generate a client-ready branded PDF with all itinerary details, pricing, and terms.</p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 bg-white text-brand-700 text-sm font-bold py-2.5 rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-70"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Generating…' : 'Download PDF'}
            </button>
            {data.exportedAt && (
              <p className="text-center text-[10px] text-white/50 mt-2">
                Last exported {formatDate(data.exportedAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
