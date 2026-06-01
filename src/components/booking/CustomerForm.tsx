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

const TOP_NATIONALITIES = [
  'Thai', 'British', 'American', 'Australian', 'German', 'French', 'Chinese',
  'Japanese', 'Korean', 'Singaporean', 'Malaysian', 'Indian', 'Russian',
  'Canadian', 'Dutch', 'Swedish', 'Italian', 'Spanish', 'Swiss', 'Israeli',
];

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
  const [emailTouched, setEmailTouched] = useState(false);

  const set = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (form.customerEmail && !form.customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors(p => ({ ...p, customerEmail: 'Please enter a valid email address' }));
    } else {
      setErrors(p => ({ ...p, customerEmail: '' }));
    }
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
      <Field htmlFor="cf-customerName" icon={<User className="w-4 h-4 text-gray-400" />} label="Full Name *" error={errors.customerName}>
        <input
          id="cf-customerName"
          type="text"
          placeholder="John Doe"
          value={form.customerName}
          onChange={set('customerName')}
          autoComplete="name"
          className={fieldClass(!!errors.customerName)}
        />
      </Field>

      {/* Phone */}
      <Field htmlFor="cf-customerPhone" icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone / WhatsApp *" error={errors.customerPhone}>
        <input
          id="cf-customerPhone"
          type="tel"
          placeholder="+66 8X XXX XXXX"
          value={form.customerPhone}
          onChange={set('customerPhone')}
          autoComplete="tel"
          className={fieldClass(!!errors.customerPhone)}
        />
      </Field>

      {/* Email */}
      <Field htmlFor="cf-customerEmail" icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email Address *" error={errors.customerEmail}>
        <input
          id="cf-customerEmail"
          type="email"
          placeholder="john@example.com"
          value={form.customerEmail}
          onChange={set('customerEmail')}
          onBlur={handleEmailBlur}
          autoComplete="email"
          className={fieldClass(!!errors.customerEmail)}
        />
      </Field>

      {/* Nationality + Birth Date — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field htmlFor="cf-nationality" icon={<Globe className="w-4 h-4 text-gray-400" />} label="Nationality *" error={errors.nationality}>
          <select
            id="cf-nationality"
            value={form.nationality}
            onChange={set('nationality')}
            className={cn('input-base pl-10 bg-white', !!errors.nationality && 'border-red-400 focus:ring-red-400')}
          >
            <option value="">Select nationality…</option>
            {TOP_NATIONALITIES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field
          htmlFor="cf-birthDate"
          icon={<CalendarDays className="w-4 h-4 text-gray-400" />}
          label="Date of Birth (optional)"
          error={errors.birthDate}
        >
          <input
            id="cf-birthDate"
            type="date"
            max={today}
            value={form.birthDate}
            onChange={set('birthDate')}
            title="Required for identification purposes"
            className={cn(fieldClass(!!errors.birthDate), 'text-gray-700')}
          />
        </Field>
      </div>

      {/* Special requests */}
      <Field htmlFor="cf-specialNotes" icon={<FileText className="w-4 h-4 text-gray-400" />} label="Special Requests (optional)">
        <textarea
          id="cf-specialNotes"
          placeholder="Flight number, special instructions, dietary requirements…"
          value={form.specialNotes}
          onChange={set('specialNotes')}
          rows={3}
          className="input-base resize-none"
        />
      </Field>

      {/* PDPA / GDPR consent */}
      <div className="flex items-start gap-3 mt-4">
        <input
          type="checkbox"
          id="pdpa-consent"
          required
          className="mt-0.5 w-4 h-4 accent-[#2534ff] shrink-0"
        />
        <label htmlFor="pdpa-consent" className="text-xs text-gray-600 leading-relaxed">
          I consent to Werest Travel collecting and processing my personal data (name, email, phone) to process this booking, in accordance with our{' '}
          <a href="/privacy-policy" className="text-[#2534ff] hover:underline">Privacy Policy</a>.
          Required under Thailand PDPA and GDPR.
        </label>
      </div>
    </form>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fieldClass(hasError: boolean) {
  return cn('input-base pl-10', hasError && 'border-red-400 focus:ring-red-400');
}

function Field({
  icon, label, error, children, htmlFor,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
    </div>
  );
}
