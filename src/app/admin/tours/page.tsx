'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import {
  Plus, Search, Edit2, Trash2, X, ChevronDown, ChevronUp,
  MapPin, Clock, Users, Star, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TourRow {
  id:           string;
  slug:         string;
  title:        string;
  subtitle?:    string | null;
  location:     string;
  cities:       string[];
  duration:     string;
  maxGroupSize: number;
  languages:    string[];
  rating:       number;
  reviewCount:  number;
  category:     string;
  badge?:       string | null;
  images:       string[];
  highlights:   string[];
  description:  string;
  includes:     string[];
  excludes:     string[];
  meetingPoint?: string | null;
  importantInfo: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options:      any[];
  isActive:     boolean;
  sortOrder:    number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'day-trip':  'bg-blue-100 text-blue-700',
  'cultural':  'bg-amber-100 text-amber-700',
  'adventure': 'bg-orange-100 text-orange-700',
  'food':      'bg-rose-100 text-rose-700',
  'nature':    'bg-green-100 text-green-700',
  'water':     'bg-cyan-100 text-cyan-700',
};
const BADGE_COLORS: Record<string, string> = {
  'Best Seller': 'bg-brand-100 text-brand-700',
  'Top Rated':   'bg-amber-100 text-amber-700',
  'New':         'bg-green-100 text-green-700',
};

const BLANK_FORM = {
  title: '', subtitle: '', location: '', cities: '', duration: '',
  maxGroupSize: '15', languages: 'English', rating: '5.0', reviewCount: '0',
  category: 'day-trip', badge: '',
  description: '', highlights: '', includes: '', excludes: '',
  meetingPoint: '', importantInfo: '',
  addOns: '',
  adultPrice: '', childPrice: '',
  imageUrl: '',
};

export default function ToursPage() {
  const [tours,     setTours]     = useState<TourRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...BLANK_FORM });
  const [saving,    setSaving]    = useState(false);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/tours');
      const data = await res.json();
      if (res.ok) setTours(data.tours ?? []);
      else toast.error('Failed to load tours');
    } catch {
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTours(); }, [fetchTours]);

  const filtered = tours.filter((t) => {
    const q       = search.toLowerCase();
    const matchQ  = !q || t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
    const matchCat = filterCat === 'ALL' || t.category === filterCat;
    return matchQ && matchCat;
  });

  const openAdd = () => {
    setForm({ ...BLANK_FORM });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (tour: TourRow) => {
    setForm({
      title:         tour.title,
      subtitle:      tour.subtitle ?? '',
      location:      tour.location,
      cities:        tour.cities.join(', '),
      duration:      tour.duration,
      maxGroupSize:  String(tour.maxGroupSize),
      languages:     tour.languages.join(', '),
      rating:        String(tour.rating),
      reviewCount:   String(tour.reviewCount),
      category:      tour.category,
      badge:         tour.badge ?? '',
      description:   tour.description,
      highlights:    tour.highlights.join('\n'),
      includes:      tour.includes.join('\n'),
      excludes:      tour.excludes.join('\n'),
      meetingPoint:  tour.meetingPoint ?? '',
      importantInfo: tour.importantInfo.join('\n'),
      addOns:        '',
      adultPrice:    String(tour.options?.[0]?.pricePerPerson ?? ''),
      childPrice:    String(tour.options?.[0]?.childPrice ?? ''),
      imageUrl:      tour.images?.[0] ?? '',
    });
    setEditId(tour.id);
    setShowForm(true);
  };

  const buildPayload = () => ({
    title:         form.title,
    subtitle:      form.subtitle || null,
    location:      form.location,
    cities:        form.cities.split(',').map((c) => c.trim()).filter(Boolean),
    duration:      form.duration,
    maxGroupSize:  parseInt(form.maxGroupSize) || 15,
    languages:     form.languages.split(',').map((l) => l.trim()).filter(Boolean),
    rating:        parseFloat(form.rating) || 5.0,
    reviewCount:   parseInt(form.reviewCount) || 0,
    category:      form.category,
    badge:         form.badge || null,
    images:        form.imageUrl ? [form.imageUrl] : [],
    description:   form.description,
    highlights:    form.highlights.split('\n').filter(Boolean),
    includes:      form.includes.split('\n').filter(Boolean),
    excludes:      form.excludes.split('\n').filter(Boolean),
    itinerary:     [],
    options:       [{
      id: 'default', time: '08:00 AM',
      pricePerPerson: parseInt(form.adultPrice) || 0,
      childPrice:     parseInt(form.childPrice)  || 0,
      availability:   'available',
    }],
    meetingPoint:  form.meetingPoint || null,
    importantInfo: [
      ...form.importantInfo.split('\n').filter(Boolean),
      // Add-ons stored as a note in importantInfo
      ...(form.addOns.trim() ? [`Available add-ons: ${form.addOns.trim()}`] : []),
    ],
    reviews:       [],
    isActive:      true,
  });

  const handleSave = async () => {
    if (!form.title || !form.location || !form.category) {
      toast.error('Title, location and category are required'); return;
    }
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url    = editId ? `/api/admin/tours/${editId}` : '/api/admin/tours';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to save tour');
        return;
      }
      toast.success(editId ? 'Tour updated' : 'Tour added');
      setShowForm(false);
      fetchTours();
    } catch {
      toast.error('Failed to save tour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to delete tour'); return; }
      toast.success('Tour deleted');
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to delete tour');
    }
  };

  return (
    <AdminShell title="Tours" subtitle="Manage tour listings and add new tours">

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Tours',  value: tours.length },
          { label: 'Categories',  value: [...new Set(tours.map((t) => t.category))].length },
          { label: 'Avg Rating',  value: tours.length ? (tours.reduce((s, t) => s + t.rating, 0) / tours.length).toFixed(1) : '–' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tours…"
              className="bg-transparent text-xs text-gray-700 outline-none flex-1 placeholder:text-gray-400" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['ALL','day-trip','cultural','adventure','food','nature','water'].map((c) => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filterCat === c ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {c === 'ALL' ? 'All' : c}
              </button>
            ))}
          </div>
          <button onClick={fetchTours}
            className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add New Tour
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading tours…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No tours found.</p>
            <button onClick={openAdd} className="mt-3 text-xs text-brand-600 font-semibold hover:underline">Add your first tour</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((tour) => (
              <div key={tour.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 shrink-0 overflow-hidden">
                    {tour.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tour.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{tour.title}</p>
                      {tour.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[tour.badge] ?? 'bg-gray-100 text-gray-500'}`}>
                          {tour.badge}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[tour.category] ?? 'bg-gray-100 text-gray-500'}`}>
                        {tour.category}
                      </span>
                      {!tour.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />Max {tour.maxGroupSize}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tour.rating} ({tour.reviewCount})</span>
                      {tour.options?.[0]?.pricePerPerson && (
                        <span className="font-semibold text-brand-700">฿{tour.options[0].pricePerPerson.toLocaleString()} / person</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpanded(expanded === tour.id ? null : tour.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      {expanded === tour.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(tour)}
                      className="p-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-gray-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tour.id, tour.title)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {expanded === tour.id && (
                  <div className="px-5 pb-4 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1.5">Highlights</p>
                      <ul className="space-y-1">
                        {tour.highlights.map((h) => <li key={h} className="flex gap-1.5 items-start"><span className="text-brand-500 mt-0.5">•</span>{h}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1.5">Includes</p>
                      <ul className="space-y-1">
                        {tour.includes.map((i) => <li key={i} className="flex gap-1.5 items-start"><span className="text-green-500 mt-0.5">✓</span>{i}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400">
          Showing {filtered.length} of {tours.length} tours
        </div>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-bold text-gray-900">{editId ? 'Edit Tour' : 'Add New Tour'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tour Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Bangkok Temples Day Trip" />
                <FormField label="Location *" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="e.g. Bangkok, Thailand" />
              </div>
              <FormField label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="Short description" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-400 bg-white">
                    {['day-trip','cultural','adventure','food','nature','water'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Badge</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-400 bg-white">
                    <option value="">None</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Top Rated">Top Rated</option>
                    <option value="New">New</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField label="Duration"        value={form.duration}      onChange={(v) => setForm({ ...form, duration: v })}     placeholder="e.g. 8 hours" />
                <FormField label="Max Group"       value={form.maxGroupSize}  onChange={(v) => setForm({ ...form, maxGroupSize: v })} placeholder="15" type="number" />
                <FormField label="Adult Price (฿)" value={form.adultPrice}    onChange={(v) => setForm({ ...form, adultPrice: v })}   placeholder="1200" type="number" />
                <FormField label="Child Price (฿)" value={form.childPrice}    onChange={(v) => setForm({ ...form, childPrice: v })}   placeholder="900" type="number" />
              </div>
              <FormField label="Cities (comma-separated)"    value={form.cities}    onChange={(v) => setForm({ ...form, cities: v })}    placeholder="Bangkok, Pattaya, Hua Hin" />
              <FormField label="Languages (comma-separated)" value={form.languages} onChange={(v) => setForm({ ...form, languages: v })} placeholder="English, Thai" />
              <TextareaField label="Description"               value={form.description}   onChange={(v) => setForm({ ...form, description: v })}   rows={4} />
              <TextareaField label="Highlights (one per line)" value={form.highlights}    onChange={(v) => setForm({ ...form, highlights: v })}    rows={4} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextareaField label="Includes (one per line)" value={form.includes} onChange={(v) => setForm({ ...form, includes: v })} rows={4} />
                <TextareaField label="Excludes (one per line)" value={form.excludes} onChange={(v) => setForm({ ...form, excludes: v })} rows={4} />
              </div>
              <FormField label="Meeting Point" value={form.meetingPoint} onChange={(v) => setForm({ ...form, meetingPoint: v })} placeholder="e.g. Hotel pickup included" />
              <TextareaField label="Important Info (one per line)" value={form.importantInfo} onChange={(v) => setForm({ ...form, importantInfo: v })} rows={3} />
              <FormField label="Add-ons (comma separated)" value={form.addOns} onChange={(v) => setForm({ ...form, addOns: v })} placeholder="e.g. Lunch, Entrance fee, Photo package" />
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl ?? ''}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-400 placeholder:text-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">Paste a direct image URL (Unsplash, Supabase Storage, etc.)</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Tour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-400 placeholder:text-gray-300" />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-400 resize-none" />
    </div>
  );
}
