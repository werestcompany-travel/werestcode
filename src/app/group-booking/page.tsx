'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, Users, Phone, Mail, MapPin, Calendar, DollarSign, MessageSquare } from 'lucide-react';

const BENEFITS = [
  { icon: '💰', label: 'Up to 30% group discount' },
  { icon: '👤', label: 'Dedicated trip coordinator' },
  { icon: '🗺️', label: 'Custom itinerary' },
  { icon: '🧾', label: 'Group invoice' },
  { icon: '💳', label: 'Flexible payment' },
];

const HEAR_OPTIONS = [
  'Google Search', 'Facebook / Instagram', 'Friend recommendation',
  'TripAdvisor', 'Travel agent', 'Hotel concierge', 'Other',
];

const BUDGET_OPTIONS = [
  'Under ฿1,000', '฿1,000–฿2,000', '฿2,000–฿3,500', '฿3,500–฿5,000', 'Over ฿5,000', 'To be discussed',
];

interface FormState {
  groupName: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  destinations: string;
  travelDates: string;
  groupSize: string;
  budgetPerPerson: string;
  specialRequirements: string;
  hearAboutUs: string;
}

const EMPTY_FORM: FormState = {
  groupName: '', contactPerson: '', email: '', phone: '', whatsapp: '',
  destinations: '', travelDates: '', groupSize: '', budgetPerPerson: '',
  specialRequirements: '', hearAboutUs: '',
};

export default function GroupBookingPage() {
  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [submitting,  setSubmitting]  = useState(false);
  const [successRef,  setSuccessRef]  = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  function update(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/group-booking/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, groupSize: Number(form.groupSize) || 10 }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessRef(data.ref);
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#2534ff] to-blue-600 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-4">🚌</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
              Planning a Group Trip to Thailand?
            </h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              We handle groups up to 50 people. Custom itineraries, dedicated coordinator, group discounts.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-wrap justify-center gap-4">
              {BENEFITS.map(b => (
                <div key={b.label} className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-800 px-4 py-2.5 rounded-full text-sm font-semibold">
                  <span>{b.icon}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          {successRef ? (
            /* Success state */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Enquiry Received!</h2>
              <p className="text-gray-500 mb-4">
                Our team will contact you within 2 hours via WhatsApp or email.
              </p>
              <div className="bg-[#2534ff]/5 border border-[#2534ff]/20 rounded-2xl py-4 px-6 inline-block mb-6">
                <p className="text-xs text-gray-400 mb-1">Your reference number</p>
                <p className="text-2xl font-black text-[#2534ff] tracking-wider">{successRef}</p>
              </div>
              <p className="text-xs text-gray-400">Keep this reference for follow-up enquiries.</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2534ff]" /> Group Information
                </h2>
                <div className="space-y-4">
                  <Field label="Company / Group name *" icon={<Users className="w-4 h-4" />}>
                    <input required value={form.groupName} onChange={update('groupName')} placeholder="e.g. Acme Corp Team Trip" className={inputCls} />
                  </Field>
                  <Field label="Contact person *" icon={<Users className="w-4 h-4" />}>
                    <input required value={form.contactPerson} onChange={update('contactPerson')} placeholder="Your full name" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email *" icon={<Mail className="w-4 h-4" />}>
                      <input required type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className={inputCls} />
                    </Field>
                    <Field label="Phone *" icon={<Phone className="w-4 h-4" />}>
                      <input required value={form.phone} onChange={update('phone')} placeholder="+66 XX XXXX XXXX" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="WhatsApp number" icon={<Phone className="w-4 h-4" />}>
                    <input value={form.whatsapp} onChange={update('whatsapp')} placeholder="Same as phone if same" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#2534ff]" /> Trip Details
                </h2>
                <div className="space-y-4">
                  <Field label="Destination(s) *" icon={<MapPin className="w-4 h-4" />}>
                    <input required value={form.destinations} onChange={update('destinations')} placeholder="e.g. Bangkok, Pattaya, Phuket" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Travel dates *" icon={<Calendar className="w-4 h-4" />}>
                      <input required value={form.travelDates} onChange={update('travelDates')} placeholder="e.g. 15–22 Mar 2026" className={inputCls} />
                    </Field>
                    <Field label="Group size *" icon={<Users className="w-4 h-4" />}>
                      <input required type="number" min={10} max={200} value={form.groupSize} onChange={update('groupSize')} placeholder="Min. 10 people" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Budget per person" icon={<DollarSign className="w-4 h-4" />}>
                    <select value={form.budgetPerPerson} onChange={update('budgetPerPerson')} className={inputCls}>
                      <option value="">Select a range</option>
                      {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Special requirements" icon={<MessageSquare className="w-4 h-4" />}>
                    <textarea
                      rows={4}
                      value={form.specialRequirements}
                      onChange={update('specialRequirements')}
                      placeholder="Dietary restrictions, accessibility needs, language preferences, specific activities..."
                      className={inputCls + ' resize-none'}
                    />
                  </Field>
                  <Field label="How did you hear about us?" icon={<MessageSquare className="w-4 h-4" />}>
                    <select value={form.hearAboutUs} onChange={update('hearAboutUs')} className={inputCls}>
                      <option value="">Please select</option>
                      {HEAR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#2534ff] hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-base rounded-2xl transition-colors"
              >
                {submitting ? 'Sending enquiry...' : 'Submit Group Enquiry'}
              </button>

              <p className="text-center text-xs text-gray-400">
                We typically respond within 2 hours during business hours (9am–9pm BKK time).
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/40 focus:border-[#2534ff] transition-colors';

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
