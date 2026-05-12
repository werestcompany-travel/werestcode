'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Plus, Edit2, Trash2, X, RefreshCw, Phone, Star, Car } from 'lucide-react';
import toast from 'react-hot-toast';

interface VehicleRow {
  id:          string;
  plateNumber: string;
  make:        string;
  model:       string;
  vehicleType: string;
  color?:      string | null;
}

interface DriverRow {
  id:            string;
  name:          string;
  phone:         string;
  licenseNumber?: string | null;
  languages:     string[];
  photoUrl?:     string | null;
  isActive:      boolean;
  rating:        number;
  totalTrips:    number;
  notes?:        string | null;
  vehicles:      VehicleRow[];
}

const EMPTY_FORM = {
  name: '', phone: '', licenseNumber: '', languages: 'Thai, English', photoUrl: '', notes: '',
};

export default function AdminDriversPage() {
  const [drivers, setDrivers]   = useState<DriverRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<DriverRow | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drivers');
      const json = await res.json();
      setDrivers(json.drivers ?? []);
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(d: DriverRow) {
    setEditing(d);
    setForm({
      name:          d.name,
      phone:         d.phone,
      licenseNumber: d.licenseNumber ?? '',
      languages:     d.languages.join(', '),
      photoUrl:      d.photoUrl ?? '',
      notes:         d.notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        phone:         form.phone.trim(),
        licenseNumber: form.licenseNumber.trim() || null,
        languages:     form.languages.split(',').map(s => s.trim()).filter(Boolean),
        photoUrl:      form.photoUrl.trim() || null,
        notes:         form.notes.trim() || null,
      };
      const url    = editing ? `/api/admin/drivers/${editing.id}` : '/api/admin/drivers';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Save failed');
      }
      toast.success(editing ? 'Driver updated' : 'Driver added');
      setShowForm(false);
      fetchDrivers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(d: DriverRow) {
    if (!confirm(`Deactivate ${d.name}? They won't appear in future assignments.`)) return;
    try {
      await fetch(`/api/admin/drivers/${d.id}`, { method: 'DELETE' });
      toast.success('Driver deactivated');
      fetchDrivers();
    } catch {
      toast.error('Failed to deactivate');
    }
  }

  const active   = drivers.filter(d => d.isActive);
  const inactive = drivers.filter(d => !d.isActive);

  return (
    <AdminShell title="Drivers" subtitle="Manage your driver roster">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Drivers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{active.length} active · {inactive.length} inactive</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDrivers} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add driver
          </button>
        </div>
      </div>

      {/* Driver grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No drivers yet</p>
          <p className="text-sm mt-1">Add your first driver to start assigning bookings.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map(d => <DriverCard key={d.id} driver={d} onEdit={openEdit} onDeactivate={handleDeactivate} />)}
        </div>
      )}

      {/* Inactive section */}
      {inactive.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Inactive drivers</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {inactive.map(d => <DriverCard key={d.id} driver={d} onEdit={openEdit} onDeactivate={handleDeactivate} />)}
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit driver' : 'Add driver'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Full name *',       key: 'name',          type: 'text',  placeholder: 'Somchai Jaidee' },
                { label: 'Phone *',           key: 'phone',         type: 'tel',   placeholder: '+66 8x xxx xxxx' },
                { label: 'License number',    key: 'licenseNumber', type: 'text',  placeholder: 'Optional' },
                { label: 'Languages (comma)', key: 'languages',     type: 'text',  placeholder: 'Thai, English' },
                { label: 'Photo URL',         key: 'photoUrl',      type: 'url',   placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-600 text-white font-semibold py-2.5 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors text-sm"
              >
                {saving ? 'Saving…' : editing ? 'Update' : 'Add driver'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function DriverCard({
  driver,
  onEdit,
  onDeactivate,
}: {
  driver:       DriverRow;
  onEdit:       (d: DriverRow) => void;
  onDeactivate: (d: DriverRow) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          {driver.photoUrl ? (
            <img src={driver.photoUrl} alt={driver.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-brand-700 font-bold text-base">{driver.name[0]}</span>
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900 text-sm">{driver.name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />{driver.phone}
            </p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(driver)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDeactivate(driver)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {driver.languages.map(l => (
          <span key={l} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600">{l}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {driver.rating.toFixed(1)}
        </span>
        <span>{driver.totalTrips} trips</span>
        {driver.vehicles.length > 0 && (
          <span className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            {driver.vehicles[0].plateNumber}
          </span>
        )}
        {!driver.isActive && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">Inactive</span>
        )}
      </div>
    </div>
  );
}
