'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight,
  ChevronDown, AlertTriangle,
} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

// ── Types ─────────────────────────────────────────────────────────────────────

type RuleType = 'SURGE' | 'DISCOUNT' | 'FIXED_SURCHARGE';
type VehicleTypeOption = 'ALL' | 'SEDAN' | 'SUV' | 'MINIVAN' | 'LUXURY_MPV';

interface DynamicRule {
  id: string;
  name: string;
  description: string | null;
  ruleType: RuleType;
  vehicleType: string | null;
  multiplier: number;
  flatAmount: number | null;
  daysOfWeek: number[];
  startHour: number | null;
  endHour: number | null;
  startDate: string | null;
  endDate: string | null;
  pickupKeyword: string | null;
  dropoffKeyword: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
}

interface FormState {
  name: string;
  description: string;
  ruleType: RuleType;
  vehicleType: VehicleTypeOption;
  multiplier: string;
  flatAmount: string;
  useFlatAmount: boolean;
  daysOfWeek: number[];
  startHour: string;
  endHour: string;
  startDate: string;
  endDate: string;
  pickupKeyword: string;
  dropoffKeyword: string;
  isActive: boolean;
  priority: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RULE_TYPE_BADGE: Record<RuleType, string> = {
  SURGE:           'bg-red-100 text-red-700',
  DISCOUNT:        'bg-green-100 text-green-700',
  FIXED_SURCHARGE: 'bg-amber-100 text-amber-700',
};

const RULE_TYPE_LABEL: Record<RuleType, string> = {
  SURGE:           'Surge',
  DISCOUNT:        'Discount',
  FIXED_SURCHARGE: 'Fixed +/-',
};

const VEHICLE_BADGE: Record<string, string> = {
  ALL:        'bg-gray-100 text-gray-700',
  SEDAN:      'bg-blue-100 text-blue-700',
  SUV:        'bg-green-100 text-green-700',
  MINIVAN:    'bg-purple-100 text-purple-700',
  LUXURY_MPV: 'bg-amber-100 text-amber-700',
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  ruleType: 'SURGE',
  vehicleType: 'ALL',
  multiplier: '1.0',
  flatAmount: '',
  useFlatAmount: false,
  daysOfWeek: [],
  startHour: '',
  endHour: '',
  startDate: '',
  endDate: '',
  pickupKeyword: '',
  dropoffKeyword: '',
  isActive: true,
  priority: '0',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSummaryChip(rule: DynamicRule): string {
  const parts: string[] = [];

  // Type + adjustment
  if (rule.flatAmount !== null) {
    const sign = rule.flatAmount >= 0 ? '+' : '';
    parts.push(`${RULE_TYPE_LABEL[rule.ruleType as RuleType]} ${sign}฿${rule.flatAmount.toLocaleString()}`);
  } else {
    const pct = Math.round((rule.multiplier - 1) * 100);
    const sign = pct >= 0 ? '+' : '';
    parts.push(`${RULE_TYPE_LABEL[rule.ruleType as RuleType]} ×${rule.multiplier} (${sign}${pct}%)`);
  }

  // Days
  if (rule.daysOfWeek.length > 0 && rule.daysOfWeek.length < 7) {
    parts.push(rule.daysOfWeek.map(d => DAYS[d]).join('/'));
  }

  // Hours
  if (rule.startHour !== null && rule.endHour !== null) {
    const fmt = (h: number) => String(h).padStart(2, '0') + ':00';
    parts.push(`${fmt(rule.startHour)}–${fmt(rule.endHour)}`);
  }

  // Date range
  if (rule.startDate || rule.endDate) {
    const s = rule.startDate ? new Date(rule.startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '…';
    const e = rule.endDate   ? new Date(rule.endDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })   : '…';
    parts.push(`${s}–${e}`);
  }

  // Keywords
  if (rule.pickupKeyword)  parts.push(`From:${rule.pickupKeyword}`);
  if (rule.dropoffKeyword) parts.push(`To:${rule.dropoffKeyword}`);

  return parts.join(' • ');
}

function ruleToForm(rule: DynamicRule): FormState {
  return {
    name:          rule.name,
    description:   rule.description ?? '',
    ruleType:      rule.ruleType as RuleType,
    vehicleType:   (rule.vehicleType ?? 'ALL') as VehicleTypeOption,
    multiplier:    String(rule.multiplier),
    flatAmount:    rule.flatAmount !== null ? String(rule.flatAmount) : '',
    useFlatAmount: rule.flatAmount !== null,
    daysOfWeek:    rule.daysOfWeek,
    startHour:     rule.startHour !== null ? String(rule.startHour) : '',
    endHour:       rule.endHour   !== null ? String(rule.endHour)   : '',
    startDate:     rule.startDate ? rule.startDate.slice(0, 10) : '',
    endDate:       rule.endDate   ? rule.endDate.slice(0, 10)   : '',
    pickupKeyword:  rule.pickupKeyword  ?? '',
    dropoffKeyword: rule.dropoffKeyword ?? '',
    isActive:      rule.isActive,
    priority:      String(rule.priority),
  };
}

function formToPayload(form: FormState) {
  return {
    name:           form.name.trim(),
    description:    form.description.trim() || null,
    ruleType:       form.ruleType,
    vehicleType:    form.vehicleType === 'ALL' ? null : form.vehicleType,
    multiplier:     form.useFlatAmount ? 1.0 : parseFloat(form.multiplier) || 1.0,
    flatAmount:     form.useFlatAmount && form.flatAmount !== '' ? parseFloat(form.flatAmount) : null,
    daysOfWeek:     form.daysOfWeek,
    startHour:      form.startHour !== '' ? parseInt(form.startHour, 10) : null,
    endHour:        form.endHour   !== '' ? parseInt(form.endHour,   10) : null,
    startDate:      form.startDate || null,
    endDate:        form.endDate   || null,
    pickupKeyword:  form.pickupKeyword.trim()  || null,
    dropoffKeyword: form.dropoffKeyword.trim() || null,
    isActive:       form.isActive,
    priority:       parseInt(form.priority, 10) || 0,
  };
}

// ── Form Section Label ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{children}</p>
  );
}

// ── Day Checkbox ──────────────────────────────────────────────────────────────

function DayCheckbox({
  day, index, checked, onToggle,
}: { day: string; index: number; checked: boolean; onToggle: (i: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(index)}
      className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors ${
        checked
          ? 'bg-brand-600 border-brand-600 text-white'
          : 'bg-white border-gray-200 text-gray-500 hover:border-brand-300'
      }`}
    >
      {day}
    </button>
  );
}

// ── Rule Form Modal ───────────────────────────────────────────────────────────

function RuleFormModal({
  title,
  form,
  setForm,
  onSave,
  onClose,
  saving,
  error,
}: {
  title: string;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  function toggleDay(i: number) {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(i)
        ? f.daysOfWeek.filter(d => d !== i)
        : [...f.daysOfWeek, i].sort((a, b) => a - b),
    }));
  }

  const inputCls =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white';
  const selectCls = inputCls + ' appearance-none cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name + Description */}
          <div className="space-y-3">
            <SectionLabel>Rule info</SectionLabel>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Songkran Surge, Late Night, Airport Discount"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional internal note"
                className={inputCls}
              />
            </div>
          </div>

          {/* Rule type + Vehicle */}
          <div className="space-y-3">
            <SectionLabel>Type &amp; vehicle</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rule Type *</label>
                <div className="relative">
                  <select
                    value={form.ruleType}
                    onChange={e => setForm(f => ({ ...f, ruleType: e.target.value as RuleType }))}
                    className={selectCls}
                  >
                    <option value="SURGE">SURGE</option>
                    <option value="DISCOUNT">DISCOUNT</option>
                    <option value="FIXED_SURCHARGE">FIXED SURCHARGE</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Type</label>
                <div className="relative">
                  <select
                    value={form.vehicleType}
                    onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value as VehicleTypeOption }))}
                    className={selectCls}
                  >
                    <option value="ALL">All Vehicles</option>
                    <option value="SEDAN">SEDAN</option>
                    <option value="SUV">SUV</option>
                    <option value="MINIVAN">MINIVAN</option>
                    <option value="LUXURY_MPV">LUXURY MPV</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Adjustment */}
          <div className="space-y-3">
            <SectionLabel>Price adjustment</SectionLabel>

            {/* Toggle multiplier vs flat */}
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, useFlatAmount: false }))}
                className={`flex-1 py-2 transition-colors ${!form.useFlatAmount ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Multiplier
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, useFlatAmount: true }))}
                className={`flex-1 py-2 transition-colors ${form.useFlatAmount ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Flat Amount (฿)
              </button>
            </div>

            {form.useFlatAmount ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Flat Amount (THB) — negative = discount
                </label>
                <input
                  type="number"
                  value={form.flatAmount}
                  onChange={e => setForm(f => ({ ...f, flatAmount: e.target.value }))}
                  placeholder="e.g. 200 or -150"
                  className={inputCls}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Multiplier (1.0 = no change, 1.3 = +30%, 0.85 = −15%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.multiplier}
                  onChange={e => setForm(f => ({ ...f, multiplier: e.target.value }))}
                  placeholder="1.3"
                  className={inputCls}
                />
              </div>
            )}
          </div>

          {/* Days of week */}
          <div className="space-y-2">
            <SectionLabel>Days of week (empty = all days)</SectionLabel>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day, i) => (
                <DayCheckbox
                  key={day}
                  day={day}
                  index={i}
                  checked={form.daysOfWeek.includes(i)}
                  onToggle={toggleDay}
                />
              ))}
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, daysOfWeek: [] }))}
                className="px-3 h-9 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <SectionLabel>Hour range (empty = all hours, supports overnight e.g. 22–06)</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Hour (0–23)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.startHour}
                  onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))}
                  placeholder="e.g. 22"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Hour (0–23)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.endHour}
                  onChange={e => setForm(f => ({ ...f, endHour: e.target.value }))}
                  placeholder="e.g. 6"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <SectionLabel>Date range (optional — e.g. Songkran dates)</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <SectionLabel>Route keywords (optional partial match)</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup contains</label>
                <input
                  type="text"
                  value={form.pickupKeyword}
                  onChange={e => setForm(f => ({ ...f, pickupKeyword: e.target.value }))}
                  placeholder="e.g. Airport, Suvarnabhumi"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Dropoff contains</label>
                <input
                  type="text"
                  value={form.dropoffKeyword}
                  onChange={e => setForm(f => ({ ...f, dropoffKeyword: e.target.value }))}
                  placeholder="e.g. Pattaya, Hotel"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Priority + Active */}
          <div className="space-y-2">
            <SectionLabel>Priority &amp; status</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Priority (higher = first)</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Active</label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    form.isActive
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  {form.isActive
                    ? <><ToggleRight className="w-4 h-4" /> Active</>
                    : <><ToggleLeft className="w-4 h-4" /> Inactive</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end border-t border-gray-100 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {saving
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  rule,
  onConfirm,
  onClose,
  deleting,
}: {
  rule: DynamicRule;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="font-bold text-gray-900 mb-1">Delete rule?</h2>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-700">{rule.name}</span> will be permanently deleted and cannot be restored.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {deleting
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DynamicPricingPage() {
  const [rules,        setRules]        = useState<DynamicRule[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingRule,  setEditingRule]  = useState<DynamicRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DynamicRule | null>(null);
  const [form,         setForm]         = useState<FormState>({ ...EMPTY_FORM });
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [formError,    setFormError]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/pricing/dynamic');
      const data = await res.json();
      setRules(data.rules ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Open create form ───────────────────────────────────────────────────────
  function openCreate() {
    setEditingRule(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowForm(true);
  }

  // ── Open edit form ─────────────────────────────────────────────────────────
  function openEdit(rule: DynamicRule) {
    setEditingRule(rule);
    setForm(ruleToForm(rule));
    setFormError('');
    setShowForm(true);
  }

  // ── Save (create or update) ────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url    = editingRule ? `/api/admin/pricing/dynamic/${editingRule.id}` : '/api/admin/pricing/dynamic';
      const method = editingRule ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Save failed'); return; }
      setShowForm(false);
      load();
    } catch {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/pricing/dynamic/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  async function toggleActive(rule: DynamicRule) {
    await fetch(`/api/admin/pricing/dynamic/${rule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    load();
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeCount   = rules.filter(r => r.isActive).length;
  const surgeCount    = rules.filter(r => r.ruleType === 'SURGE').length;
  const discountCount = rules.filter(r => r.ruleType === 'DISCOUNT').length;

  return (
    <AdminShell title="Dynamic Pricing" subtitle="Surge, discount, and surcharge rules applied on top of base fares">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total rules',    value: String(rules.length)   },
            { label: 'Active rules',   value: String(activeCount)    },
            { label: 'Surge rules',    value: String(surgeCount)     },
            { label: 'Discount rules', value: String(discountCount)  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Table header row */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-700">Pricing Rules</p>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Zap className="w-7 h-7 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500 text-sm">No dynamic pricing rules yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Add surge, discount, or surcharge rules that apply on top of base fares.</p>
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add first rule
              </button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_120px_120px_1fr_80px_100px] gap-4 px-5 py-2.5 border-b border-gray-100">
                {['Name', 'Type', 'Vehicle', 'Conditions summary', 'Priority', 'Actions'].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`grid grid-cols-[1fr_120px_120px_1fr_80px_100px] gap-4 px-5 py-3.5 items-start hover:bg-gray-50 transition-colors ${
                      !rule.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Name + description */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{rule.name}</p>
                      {rule.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{rule.description}</p>
                      )}
                    </div>

                    {/* Type badge */}
                    <div>
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${RULE_TYPE_BADGE[rule.ruleType as RuleType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {RULE_TYPE_LABEL[rule.ruleType as RuleType] ?? rule.ruleType}
                      </span>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold ${VEHICLE_BADGE[rule.vehicleType ?? 'ALL'] ?? 'bg-gray-100 text-gray-600'}`}>
                        {rule.vehicleType ?? 'ALL'}
                      </span>
                    </div>

                    {/* Summary chip */}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 leading-relaxed break-words">{buildSummaryChip(rule)}</p>
                    </div>

                    {/* Priority */}
                    <div>
                      <span className="text-sm font-bold text-gray-700">{rule.priority}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(rule)}
                        title={rule.isActive ? 'Deactivate' : 'Activate'}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                          rule.isActive
                            ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        {rule.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEdit(rule)}
                        title="Edit rule"
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(rule)}
                        title="Delete rule"
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <RuleFormModal
          title={editingRule ? `Edit: ${editingRule.name}` : 'Add dynamic pricing rule'}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          saving={saving}
          error={formError}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          rule={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </AdminShell>
  );
}
