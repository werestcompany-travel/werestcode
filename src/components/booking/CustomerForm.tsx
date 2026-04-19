'use client';

import { useState } from 'react';
import { User, Phone, Mail, Globe, CalendarDays, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ───────────────────────────────────────────────────────────────── */
export interface CustomerFormData {
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  nationality:   string;
  birthDate:     string;
  specialNotes:  string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
}

/* ── CustomerForm ────────────────────────────────────────────────────────── */
export default function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormData>({
    customerName:  '',
    customerEmail: '',
    customerPhone: '',
    nationality:   '',
    birthDate:     '',
    specialNotes:  '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  const set = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!form.customerName.trim())
      e.customerName = 'Full name is required';
    if (!form.customerPhone.trim() || form.customerPhone.replace(/\D/g, '').length < 8)
      e.customerPhone = 'Valid phone number is required';
    if (!form.customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.customerEmail = 'Valid email address is required';
    if (!form.nationality.trim())
      e.nationality = 'Nationality is required';
    if (!form.birthDate)
      e.birthDate = 'Date of birth is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Your Details</h2>

      {/* Full Name */}
      <Field icon={<User className="w-4 h-4 text-gray-400" />} label="Full Name *" error={errors.customerName}>
        <input
          type="text"
          placeholder="John Doe"
          value={form.customerName}
          onChange={set('customerName')}
          className={fieldClass(!!errors.customerName)}
        />
      </Field>

      {/* Phone */}
      <Field icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone / WhatsApp *" error={errors.customerPhone}>
        <input
          type="tel"
          placeholder="+66 8X XXX XXXX"
          value={form.customerPhone}
          onChange={set('customerPhone')}
          className={fieldClass(!!errors.customerPhone)}
        />
      </Field>

      {/* Email */}
      <Field icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email Address *" error={errors.customerEmail}>
        <input
          type="email"
          placeholder="john@example.com"
          value={form.customerEmail}
          onChange={set('customerEmail')}
          className={fieldClass(!!errors.customerEmail)}
        />
      </Field>

      {/* Nationality + Birth Date — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={<Globe className="w-4 h-4 text-gray-400" />} label="Nationality *" error={errors.nationality}>
          <input
            type="text"
            placeholder="e.g. Thai, British…"
            value={form.nationality}
            onChange={set('nationality')}
            className={fieldClass(!!errors.nationality)}
          />
        </Field>

        <Field icon={<CalendarDays className="w-4 h-4 text-gray-400" />} label="Date of Birth *" error={errors.birthDate}>
          <input
            type="date"
            max={today}
            value={form.birthDate}
            onChange={set('birthDate')}
            className={cn(fieldClass(!!errors.birthDate), 'text-gray-700')}
          />
        </Field>
      </div>

      {/* Special requests */}
      <Field icon={<FileText className="w-4 h-4 text-gray-400" />} label="Special Requests (optional)">
        <textarea
          placeholder="Flight number, special instructions, dietary requirements…"
          value={form.specialNotes}
          onChange={set('specialNotes')}
          rows={3}
          className="input-base resize-none"
        />
      </Field>
    </form>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fieldClass(hasError: boolean) {
  return cn('input-base pl-10', hasError && 'border-red-400 focus:ring-red-400');
}

function Field({
  icon, label, error, children,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
    </div>
  );
}
