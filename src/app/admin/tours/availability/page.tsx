'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Calendar, Plus, Trash2, RefreshCw } from 'lucide-react';

interface AvailabilityRecord {
  id: string;
  tourSlug: string;
  date: string;
  optionId: string | null;
  isBlocked: boolean;
  maxCapacity: number;
  booked: number;
  note: string | null;
}

interface TourListItem { slug: string; title: string }

export default function TourAvailabilityPage() {
  const [selectedSlug, setSelectedSlug] = useState('');
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [tourList, setTourList] = useState<TourListItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/tours')
      .then(r => r.json())
      .then(d => setTourList((d.tours ?? []).map((t: TourListItem) => ({ slug: t.slug, title: t.title }))))
      .catch(() => {});
  }, []);

  // Form state
  const [formDate, setFormDate] = useState('');
  const [formBlocked, setFormBlocked] = useState(false);
  const [formCapacity, setFormCapacity] = useState(15);
  const [formNote, setFormNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = useCallback(async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tours/availability?tourSlug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch {
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSlug) fetchRecords(selectedSlug);
    else setRecords([]);
  }, [selectedSlug, fetchRecords]);

  async function handleSave() {
    if (!selectedSlug || !formDate) {
      setError('Select a tour and date');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/tours/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourSlug: selectedSlug,
          date: formDate,
          isBlocked: formBlocked,
          maxCapacity: formCapacity,
          note: formNote || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to save');
      } else {
        setFormDate('');
        setFormBlocked(false);
        setFormCapacity(15);
        setFormNote('');
        await fetchRecords(selectedSlug);
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this availability override?')) return;
    await fetch(`/api/admin/tours/availability?id=${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter(r => r.id !== id));
  }

  return (
    <AdminShell title="Tour Availability" subtitle="Block dates or override capacity for specific tours">
      <div className="max-w-3xl space-y-6">

        {/* Tour selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Select Tour</h2>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2534ff]"
          >
            <option value="">— Choose a tour —</option>
            {tourList.map(t => (
              <option key={t.slug} value={t.slug}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Add override form */}
        {selectedSlug && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Add / Update Override</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date *</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Max Capacity</label>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={formCapacity}
                  onChange={e => setFormCapacity(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Public holiday – closed"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]"
              />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isBlocked"
                checked={formBlocked}
                onChange={e => setFormBlocked(e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
              <label htmlFor="isBlocked" className="text-sm font-semibold text-red-600">
                Block this date (no bookings allowed)
              </label>
            </div>
            {error && <p className="text-xs text-red-500 mb-3">⚠ {error}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#2534ff] hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Override
            </button>
          </div>
        )}

        {/* Records list */}
        {selectedSlug && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2534ff]" />
                <h2 className="text-sm font-bold text-gray-900">Availability Overrides</h2>
              </div>
              <button
                onClick={() => fetchRecords(selectedSlug)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading…</p>
            ) : records.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No overrides for this tour</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {records.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {r.isBlocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">BLOCKED</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Capacity: {r.maxCapacity} · Booked: {r.booked}
                        {r.note && ` · ${r.note}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
