'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, X, ChevronRight, Pencil, Trash2, Check,
  ToggleLeft, ToggleRight, Package, ChevronDown, ChevronUp, AlertTriangle,
  Image as ImageIcon, ListChecks, HelpCircle, MapPin, Info, Star,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface AttractionPackage {
  id: string; name: string; description: string | null;
  adultPrice: number; adultOriginal: number | null;
  childPrice: number; childOriginal: number | null;
  infantPrice: number; popular: boolean; badge: string | null;
  includes: string[]; isActive: boolean; sortOrder: number;
}
interface AttractionListing {
  id: string; slug: string; name: string; location: string; category: string;
  rating: number; reviewCount: string; price: number; originalPrice: number | null;
  badge: string | null; gradient: string; emoji: string; href: string;
  isActive: boolean; sortOrder: number;
  overview: string | null; highlights: string[] | null; included: string[] | null;
  excluded: string[] | null; infoItems: string[] | null;
  expectSteps: { time: string; title: string; icon: string; desc: string }[] | null;
  faqs: { q: string; a: string }[] | null;
  gallery: { src: string; alt: string }[] | null;
  packages: AttractionPackage[];
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  'Theme Parks', 'Water Parks', 'Museums', 'Parks & Gardens', 'Zoos & Aquariums',
  'Cable Cars', 'Observation Decks', 'Historical Sites', 'Playgrounds',
  'Indoor Games', 'Attraction Passes', 'Events & Shows',
];

const BADGE_OPTIONS = ['', 'Sale', 'Hot deal', 'Likely to sell out', 'Exclusive', 'New', 'Limited'];

const GRADIENT_PRESETS = [
  { label: 'Ocean',   value: 'from-blue-700 to-cyan-500'     },
  { label: 'Amber',   value: 'from-amber-700 to-yellow-500'  },
  { label: 'Forest',  value: 'from-green-700 to-emerald-500' },
  { label: 'Night',   value: 'from-slate-700 to-indigo-600'  },
  { label: 'Lime',    value: 'from-lime-700 to-green-500'    },
  { label: 'Purple',  value: 'from-purple-700 to-violet-500' },
  { label: 'Red',     value: 'from-red-700 to-orange-500'    },
  { label: 'Teal',    value: 'from-teal-700 to-green-500'    },
  { label: 'Fuchsia', value: 'from-fuchsia-700 to-pink-500'  },
  { label: 'Indigo',  value: 'from-indigo-800 to-blue-600'   },
  { label: 'Cyan',    value: 'from-cyan-700 to-sky-500'      },
  { label: 'Brand',   value: 'from-brand-600 to-brand-400'   },
];

type ModalTab = 'basic' | 'gallery' | 'content' | 'expect' | 'faq';

const EMPTY_FORM = {
  slug: '', name: '', location: '', category: CATEGORIES[0],
  rating: '4.5', reviewCount: '0', price: '', originalPrice: '',
  badge: '', gradient: GRADIENT_PRESETS[0].value, emoji: '🎫',
  href: '#', isActive: true, sortOrder: '0',
  overview: '', highlights: '', included: '', excluded: '', infoItems: '',
  gallery: [{ src: '', alt: '' }] as { src: string; alt: string }[],
  expectSteps: [{ time: '', title: '', icon: '⭐', desc: '' }] as { time: string; title: string; icon: string; desc: string }[],
  faqs: [{ q: '', a: '' }] as { q: string; a: string }[],
};

const EMPTY_PKG = {
  name: '', description: '', adultPrice: '', adultOriginal: '',
  childPrice: '', childOriginal: '', infantPrice: '',
  popular: false, badge: '', includes: '',
  isActive: true, sortOrder: '0',
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminAttractionsPage() {
  const [attractions, setAttractions] = useState<AttractionListing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [catFilter,   setCatFilter]   = useState('All');
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());

  // Attraction modal
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [modalTab,  setModalTab]  = useState<ModalTab>('basic');
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  // Package modal
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [pkgAttrId,    setPkgAttrId]    = useState<string | null>(null);
  const [pkgEditId,    setPkgEditId]    = useState<string | null>(null);
  const [pkgForm,      setPkgForm]      = useState({ ...EMPTY_PKG });
  const [pkgSaving,    setPkgSaving]    = useState(false);
  const [pkgError,     setPkgError]     = useState('');

  // Delete confirm
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [delPkgIds, setDelPkgIds] = useState<{ attrId: string; pkgId: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/admin/attractions');
    const d = await r.json();
    setAttractions(d.attractions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Attraction CRUD ── */
  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalTab('basic');
    setFormError('');
    setShowModal(true);
  }

  function openEdit(a: AttractionListing) {
    setEditId(a.id);
    setForm({
      slug: a.slug, name: a.name, location: a.location, category: a.category,
      rating: String(a.rating), reviewCount: a.reviewCount,
      price: String(a.price), originalPrice: a.originalPrice ? String(a.originalPrice) : '',
      badge: a.badge ?? '', gradient: a.gradient, emoji: a.emoji,
      href: a.href, isActive: a.isActive, sortOrder: String(a.sortOrder),
      overview: a.overview ?? '',
      highlights: (a.highlights ?? []).join('\n'),
      included:   (a.included   ?? []).join('\n'),
      excluded:   (a.excluded   ?? []).join('\n'),
      infoItems:  (a.infoItems  ?? []).join('\n'),
      gallery:     a.gallery?.length ? a.gallery : [{ src: '', alt: '' }],
      expectSteps: a.expectSteps?.length ? a.expectSteps : [{ time: '', title: '', icon: '⭐', desc: '' }],
      faqs:        a.faqs?.length ? a.faqs : [{ q: '', a: '' }],
    });
    setModalTab('basic');
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.location || !form.price) {
      setFormError('Name, location and price are required.'); return;
    }
    setSaving(true); setFormError('');
    try {
      const url    = editId ? `/api/admin/attractions/${editId}` : '/api/admin/attractions';
      const method = editId ? 'PATCH' : 'POST';

      const splitLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: form.slug || slugify(form.name),
          // Normalise rich content
          highlights:  splitLines(form.highlights),
          included:    splitLines(form.included),
          excluded:    splitLines(form.excluded),
          infoItems:   splitLines(form.infoItems),
          gallery:     form.gallery.filter(g => g.src.trim()),
          expectSteps: form.expectSteps.filter(s => s.title.trim()),
          faqs:        form.faqs.filter(f => f.q.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Save failed.'); return; }
      setShowModal(false);
      load();
    } finally { setSaving(false); }
  }

  async function handleToggleActive(a: AttractionListing) {
    const res = await fetch(`/api/admin/attractions/${a.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    const data = await res.json();
    setAttractions(prev => prev.map(x => x.id === a.id ? data.attraction : x));
  }

  async function handleDeleteAttr() {
    if (!deleteId) return;
    await fetch(`/api/admin/attractions/${deleteId}`, { method: 'DELETE' });
    setAttractions(prev => prev.filter(a => a.id !== deleteId));
    setDeleteId(null);
  }

  /* ── Package CRUD ── */
  function openNewPkg(attrId: string) {
    setPkgAttrId(attrId);
    setPkgEditId(null);
    setPkgForm({ ...EMPTY_PKG });
    setPkgError('');
    setShowPkgModal(true);
  }

  function openEditPkg(attrId: string, pkg: AttractionPackage) {
    setPkgAttrId(attrId);
    setPkgEditId(pkg.id);
    setPkgForm({
      name: pkg.name,
      description: pkg.description ?? '',
      adultPrice: String(pkg.adultPrice),
      adultOriginal: pkg.adultOriginal ? String(pkg.adultOriginal) : '',
      childPrice: String(pkg.childPrice),
      childOriginal: pkg.childOriginal ? String(pkg.childOriginal) : '',
      infantPrice: String(pkg.infantPrice),
      popular: pkg.popular,
      badge: pkg.badge ?? '',
      includes: (pkg.includes ?? []).join('\n'),
      isActive: pkg.isActive,
      sortOrder: String(pkg.sortOrder),
    });
    setPkgError('');
    setShowPkgModal(true);
  }

  async function handleSavePkg() {
    if (!pkgForm.name || !pkgForm.adultPrice) { setPkgError('Name and adult price are required.'); return; }
    setPkgSaving(true); setPkgError('');
    try {
      const url    = pkgEditId ? `/api/admin/attractions/${pkgAttrId}/packages/${pkgEditId}` : `/api/admin/attractions/${pkgAttrId}/packages`;
      const method = pkgEditId ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pkgForm,
          includes: pkgForm.includes.split('\n').map(l => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setPkgError(data.error ?? 'Save failed.'); return; }
      setShowPkgModal(false);
      load();
    } finally { setPkgSaving(false); }
  }

  async function handleTogglePkg(attrId: string, pkg: AttractionPackage) {
    await fetch(`/api/admin/attractions/${attrId}/packages/${pkg.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    setAttractions(prev => prev.map(a => a.id === attrId
      ? { ...a, packages: a.packages.map(p => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p) }
      : a,
    ));
  }

  async function handleDeletePkg() {
    if (!delPkgIds) return;
    await fetch(`/api/admin/attractions/${delPkgIds.attrId}/packages/${delPkgIds.pkgId}`, { method: 'DELETE' });
    setAttractions(prev => prev.map(a => a.id === delPkgIds.attrId
      ? { ...a, packages: a.packages.filter(p => p.id !== delPkgIds.pkgId) }
      : a,
    ));
    setDelPkgIds(null);
  }

  /* ── Derived data ── */
  const usedCategories = [...new Set(attractions.map(a => a.category))].sort();
  const filtered = catFilter === 'All' ? attractions : attractions.filter(a => a.category === catFilter);
  const grouped: Record<string, AttractionListing[]> = {};
  for (const a of filtered) {
    grouped[a.category] = grouped[a.category] ?? [];
    grouped[a.category].push(a);
  }

  const stats = {
    total:    attractions.length,
    active:   attractions.filter(a => a.isActive).length,
    packages: attractions.reduce((sum, a) => sum + a.packages.length, 0),
  };

  /* ── Tab helpers ── */
  const TABS: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'basic',   label: 'Basic Info', icon: <Star className="w-3.5 h-3.5" />       },
    { id: 'gallery', label: 'Gallery',    icon: <ImageIcon className="w-3.5 h-3.5" />  },
    { id: 'content', label: 'Content',    icon: <ListChecks className="w-3.5 h-3.5" /> },
    { id: 'expect',  label: 'Experience', icon: <MapPin className="w-3.5 h-3.5" />     },
    { id: 'faq',     label: 'FAQs',       icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
            Admin <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-gray-900 font-bold">Attraction Management</span>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add new attraction
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total attractions', value: stats.total,    text: 'text-brand-600' },
            { label: 'Active',            value: stats.active,   text: 'text-green-600' },
            { label: 'Total packages',    value: stats.packages, text: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {['All', ...usedCategories].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                catFilter === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Attractions list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No attractions yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first attraction with the button above</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">{cat}</h3>
                <span className="text-xs text-gray-400">{items.length} attraction{items.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="divide-y divide-gray-50">
                {items.map(a => {
                  const isExpanded = expanded.has(a.id);
                  return (
                    <div key={a.id}>
                      <div className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shrink-0 text-xl`}>
                          {a.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{a.name}</p>
                            {a.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">{a.badge}</span>}
                            {!a.isActive && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Hidden</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {a.location} · ฿{a.price.toLocaleString()}
                            {a.originalPrice ? ` (was ฿${a.originalPrice.toLocaleString()})` : ''}
                            {' · '}{a.packages.length} package{a.packages.length !== 1 ? 's' : ''}
                            {a.gallery?.length ? ` · ${a.gallery.length} photos` : ''}
                            {a.faqs?.length ? ` · ${a.faqs.length} FAQs` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => setExpanded(prev => { const next = new Set(prev); next.has(a.id) ? next.delete(a.id) : next.add(a.id); return next; })}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors hover:border-brand-300">
                            <Package className="w-3 h-3" /> Packages
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button onClick={() => handleToggleActive(a)} title={a.isActive ? 'Hide' : 'Show'}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-300 transition-colors">
                            {a.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-300" />}
                          </button>
                          <button onClick={() => openEdit(a)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(a.id)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-4 border-t border-gray-100 bg-gray-50/50">
                          <div className="flex items-center justify-between py-3 mb-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Packages</p>
                            <button onClick={() => openNewPkg(a.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                              <Plus className="w-3 h-3" /> Add package
                            </button>
                          </div>
                          {a.packages.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">No packages yet — add one to enable bookings.</p>
                          ) : (
                            <div className="space-y-2">
                              {a.packages.map(p => (
                                <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2.5">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-gray-800">{p.name}</p>
                                      {p.badge && <span className="text-[9px] bg-brand-100 text-brand-700 font-bold px-1 py-0.5 rounded-full">{p.badge}</span>}
                                      {p.popular && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1 py-0.5 rounded-full">Popular</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      Adult ฿{p.adultPrice.toLocaleString()}
                                      {p.adultOriginal ? ` (was ฿${p.adultOriginal.toLocaleString()})` : ''}
                                      {p.childPrice > 0 && ` · Child ฿${p.childPrice.toLocaleString()}`}
                                      {p.includes?.length ? ` · ${p.includes.length} includes` : ''}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => handleTogglePkg(a.id, p)}>
                                      {p.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-300" />}
                                    </button>
                                    <button onClick={() => openEditPkg(a.id, p)}
                                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                    <button onClick={() => setDelPkgIds({ attrId: a.id, pkgId: p.id })}
                                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── ATTRACTION MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-900">{editId ? 'Edit attraction' : 'Add new attraction'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setModalTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    modalTab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>}

              {/* ── BASIC INFO TAB ── */}
              {modalTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Attraction name *</label>
                      <input value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                        placeholder="e.g. Sanctuary of Truth, Pattaya"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Slug (URL path)</label>
                      <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                        placeholder="auto-generated"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location *</label>
                      <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Pattaya"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Starting price (฿) *</label>
                      <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="479"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Original price (฿)</label>
                      <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                        placeholder="531 (optional)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rating</label>
                      <input type="number" min="0" max="5" step="0.1" value={form.rating}
                        onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reviews</label>
                      <input value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))}
                        placeholder="15K+"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Badge</label>
                      <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                        {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Emoji icon</label>
                      <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                        placeholder="🎫"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center text-2xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sort order</label>
                      <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card gradient</label>
                    <div className="flex gap-2 flex-wrap">
                      {GRADIENT_PRESETS.map(g => (
                        <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, gradient: g.value }))}
                          title={g.label}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.value} transition-all ${form.gradient === g.value ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'opacity-70 hover:opacity-100'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Detail page URL</label>
                      <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                        placeholder="/attractions/my-attraction or #"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div className="flex flex-col justify-end">
                      <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-colors ${form.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        {form.isActive ? <><ToggleRight className="w-4 h-4" /> Visible on site</> : <><ToggleLeft className="w-4 h-4" /> Hidden from site</>}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden flex items-center gap-4 p-3 bg-gray-50">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center text-2xl shrink-0`}>
                      {form.emoji || '🎫'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{form.name || 'Attraction name'}</p>
                      <p className="text-xs text-gray-400">{form.location || 'Location'} · ฿{Number(form.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}

              {/* ── GALLERY TAB ── */}
              {modalTab === 'gallery' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Add up to 5 image URLs. The first image is the main hero photo.</p>
                  {form.gallery.map((img, i) => (
                    <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Photo {i + 1}{i === 0 ? ' (Main)' : ''}</span>
                        {form.gallery.length > 1 && (
                          <button type="button" onClick={() => setForm(f => ({ ...f, gallery: f.gallery.filter((_, j) => j !== i) }))}
                            className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        )}
                      </div>
                      <input value={img.src} onChange={e => setForm(f => ({ ...f, gallery: f.gallery.map((g, j) => j === i ? { ...g, src: e.target.value } : g) }))}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <input value={img.alt} onChange={e => setForm(f => ({ ...f, gallery: f.gallery.map((g, j) => j === i ? { ...g, alt: e.target.value } : g) }))}
                        placeholder="Image description (alt text)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  ))}
                  {form.gallery.length < 5 && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, gallery: [...f.gallery, { src: '', alt: '' }] }))}
                      className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add photo
                    </button>
                  )}
                </div>
              )}

              {/* ── CONTENT TAB ── */}
              {modalTab === 'content' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Overview text</label>
                    <p className="text-[11px] text-gray-400 mb-1.5">Supports {"<strong>"} tags. Use blank lines to separate paragraphs.</p>
                    <textarea value={form.overview} onChange={e => setForm(f => ({ ...f, overview: e.target.value }))}
                      rows={5} placeholder="The Sanctuary of Truth is…"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
                  </div>

                  {([
                    { key: 'highlights', label: 'Highlights', placeholder: 'Marvel at 105 metres of carved teak wood\nExplore all four halls…' },
                    { key: 'included',   label: 'What\'s included', placeholder: 'Entrance ticket\nCultural dance show\n…' },
                    { key: 'excluded',   label: 'What\'s not included', placeholder: 'Elephant riding (add-on)\nFood and beverages\n…' },
                    { key: 'infoItems',  label: 'Important information', placeholder: 'Wear comfortable shoes\nModest dress required\n…' },
                  ] as const).map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                      <p className="text-[11px] text-gray-400 mb-1.5">One item per line.</p>
                      <textarea value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        rows={4} placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── EXPECT TAB ── */}
              {modalTab === 'expect' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Add step-by-step "What to expect" steps for the visitor experience.</p>
                  {form.expectSteps.map((step, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Step {i + 1}</span>
                        {form.expectSteps.length > 1 && (
                          <button type="button" onClick={() => setForm(f => ({ ...f, expectSteps: f.expectSteps.filter((_, j) => j !== i) }))}
                            className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={step.icon} onChange={e => setForm(f => ({ ...f, expectSteps: f.expectSteps.map((s, j) => j === i ? { ...s, icon: e.target.value } : s) }))}
                          placeholder="🪖" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        <input value={step.time} onChange={e => setForm(f => ({ ...f, expectSteps: f.expectSteps.map((s, j) => j === i ? { ...s, time: e.target.value } : s) }))}
                          placeholder="On arrival" className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                        <input value={step.title} onChange={e => setForm(f => ({ ...f, expectSteps: f.expectSteps.map((s, j) => j === i ? { ...s, title: e.target.value } : s) }))}
                          placeholder="Step title" className="px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      </div>
                      <textarea value={step.desc} onChange={e => setForm(f => ({ ...f, expectSteps: f.expectSteps.map((s, j) => j === i ? { ...s, desc: e.target.value } : s) }))}
                        rows={2} placeholder="Description…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm(f => ({ ...f, expectSteps: [...f.expectSteps, { time: '', title: '', icon: '⭐', desc: '' }] }))}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add step
                  </button>
                </div>
              )}

              {/* ── FAQ TAB ── */}
              {modalTab === 'faq' && (
                <div className="space-y-4">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">FAQ {i + 1}</span>
                        {form.faqs.length > 1 && (
                          <button type="button" onClick={() => setForm(f => ({ ...f, faqs: f.faqs.filter((_, j) => j !== i) }))}
                            className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        )}
                      </div>
                      <input value={faq.q} onChange={e => setForm(f => ({ ...f, faqs: f.faqs.map((ff, j) => j === i ? { ...ff, q: e.target.value } : ff) }))}
                        placeholder="Question?"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <textarea value={faq.a} onChange={e => setForm(f => ({ ...f, faqs: f.faqs.map((ff, j) => j === i ? { ...ff, a: e.target.value } : ff) }))}
                        rows={3} placeholder="Answer…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm(f => ({ ...f, faqs: [...f.faqs, { q: '', a: '' }] }))}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add FAQ
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                {saving
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : editId ? 'Save changes' : 'Add attraction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PACKAGE MODAL ── */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{pkgEditId ? 'Edit package' : 'Add package'}</h2>
              <button onClick={() => setShowPkgModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {pkgError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{pkgError}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Package name *</label>
                <input value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Standard Entrance"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <input value={pkgForm.description} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Full access to the Sanctuary building and grounds"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'adultPrice',   label: 'Adult price (฿) *' },
                  { key: 'adultOriginal', label: 'Adult original (฿)' },
                  { key: 'childPrice',   label: 'Child price (฿)'   },
                  { key: 'childOriginal', label: 'Child original (฿)' },
                  { key: 'infantPrice',  label: 'Infant price (฿)'  },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input type="number" value={pkgForm[f.key] as string}
                      onChange={e => setPkgForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Badge label</label>
                  <input value={pkgForm.badge} onChange={e => setPkgForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="Best Value"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div className="flex flex-col justify-end">
                  <button type="button" onClick={() => setPkgForm(f => ({ ...f, popular: !f.popular }))}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-colors ${pkgForm.popular ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    {pkgForm.popular ? <><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Popular</> : <><Star className="w-4 h-4" /> Mark as popular</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Includes (one per line)</label>
                <textarea value={pkgForm.includes} onChange={e => setPkgForm(f => ({ ...f, includes: e.target.value }))}
                  rows={4} placeholder={"Entrance ticket\nCultural dance show\nElephant show\nFree parking"}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y" />
              </div>

              <button type="button" onClick={() => setPkgForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`w-full py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-colors ${pkgForm.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {pkgForm.isActive ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Inactive</>}
              </button>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button onClick={() => setShowPkgModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSavePkg} disabled={pkgSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                {pkgSaving
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <Check className="w-4 h-4" />}
                {pkgSaving ? 'Saving…' : pkgEditId ? 'Save changes' : 'Add package'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM (attraction) ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delete attraction?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete the attraction and all its packages. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAttr}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM (package) ── */}
      {delPkgIds && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delete package?</h3>
            <p className="text-sm text-gray-500 mb-6">This package will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelPkgIds(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeletePkg}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
