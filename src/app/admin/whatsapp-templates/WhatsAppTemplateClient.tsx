'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  description: string;
  body: string;
  variables: string[];
  status: 'Submit to Meta' | 'Auto-sent' | 'Manual';
}

const TEMPLATES: Template[] = [
  {
    id: 'booking_confirmation',
    name: 'booking_confirmation',
    category: 'UTILITY',
    language: 'en',
    description: 'Sent immediately when a booking is created',
    status: 'Auto-sent',
    variables: ['customer_first_name', 'booking_ref', 'pickup_date', 'pickup_time', 'pickup_address', 'drop_off_address', 'vehicle_type'],
    body: `Hi {{1}}! 🎉 Your Werest Travel booking is confirmed.

📋 *Ref:* {{2}}
📅 *Date:* {{3}} at {{4}}
📍 *Pickup:* {{5}}
🏁 *Drop-off:* {{6}}
🚗 *Vehicle:* {{7}}

Payment is due on the day. Your driver will contact you before pickup. Track your booking: https://werest.com/tracking

Reply if you have any questions! — Werest Team 🙏`,
  },
  {
    id: 'pickup_reminder',
    name: 'pickup_reminder',
    category: 'UTILITY',
    language: 'en',
    description: 'Sent the evening before pickup (via day-before reminder cron)',
    status: 'Auto-sent',
    variables: ['customer_first_name', 'pickup_date', 'pickup_time', 'pickup_address', 'driver_name', 'booking_ref'],
    body: `🌟 *Pickup Reminder — Werest Travel*

Hi {{1}}! Your transfer is tomorrow.

📅 *Date:* {{2}}
⏰ *Pickup:* {{3}}
📍 *From:* {{4}}
👤 *Driver:* {{5}}

📋 *Ref:* {{6}}

Reply if you need anything. See you tomorrow! 🙏`,
  },
  {
    id: 'driver_assigned',
    name: 'driver_assigned',
    category: 'UTILITY',
    language: 'en',
    description: 'Sent when a driver is assigned to the booking',
    status: 'Manual',
    variables: ['customer_first_name', 'driver_name', 'driver_phone', 'vehicle_type', 'vehicle_plate', 'pickup_time', 'booking_ref'],
    body: `🚗 *Driver Assigned — Werest Travel*

Hi {{1}}! Your driver has been assigned.

👤 *Driver:* {{2}}
📞 *Driver Phone:* {{3}}
🚗 *Vehicle:* {{4}}
🔢 *Plate:* {{5}}
⏰ *Pickup at:* {{6}}

📋 *Ref:* {{7}}

Your driver will contact you 30 minutes before arrival. — Werest Team 🙏`,
  },
  {
    id: 'tour_confirmation',
    name: 'tour_confirmation',
    category: 'UTILITY',
    language: 'en',
    description: 'Sent when a tour booking is confirmed',
    status: 'Auto-sent',
    variables: ['customer_first_name', 'tour_name', 'tour_date', 'tour_time', 'booking_ref'],
    body: `Hi {{1}}! 🗺️ Your tour is booked with Werest Travel!

🗺️ *Tour:* {{2}}
📅 *Date:* {{3}}
⏰ *Departure:* {{4}}

📋 *Ref:* {{5}}

Please be ready 10 minutes before departure. We'll send a reminder the day before. — Werest Team 🙏`,
  },
  {
    id: 'review_request',
    name: 'review_request',
    category: 'MARKETING',
    language: 'en',
    description: 'Sent 1 hour after booking marked COMPLETED',
    status: 'Auto-sent',
    variables: ['customer_first_name', 'booking_ref', 'review_url'],
    body: `Hi {{1}}! 🌟 Thank you for traveling with Werest Travel!

We hope you had a wonderful experience. We'd love to hear your feedback — it takes just 1 minute:

{{3}}

Your review helps us improve and helps other travelers. Thank you! 🙏 — Werest Team

📋 Booking: {{2}}`,
  },
  {
    id: 'status_update',
    name: 'status_update',
    category: 'UTILITY',
    language: 'en',
    description: 'Sent when booking status changes (auto-sent by system)',
    status: 'Auto-sent',
    variables: ['customer_first_name', 'status_label', 'booking_ref', 'tracking_url'],
    body: `🔔 *Booking Update — Werest Travel*

Hi {{1}}, your booking status has been updated.

📋 *Ref:* {{3}}
✅ *Status:* {{2}}

Track your booking: {{4}}

Questions? Reply to this message. — Werest Team 🙏`,
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  UTILITY:        'bg-blue-100 text-blue-700',
  MARKETING:      'bg-purple-100 text-purple-700',
  AUTHENTICATION: 'bg-orange-100 text-orange-700',
};

const STATUS_COLOR: Record<string, string> = {
  'Auto-sent':      'bg-green-100 text-green-700',
  'Manual':         'bg-amber-100 text-amber-700',
  'Submit to Meta': 'bg-gray-100 text-gray-600',
};

export default function WhatsAppTemplateClient() {
  const [copied, setCopied] = useState<string | null>(null);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Info banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
        <strong>📱 WhatsApp Business Templates</strong> — These are your approved message templates.
        Templates marked &ldquo;Auto-sent&rdquo; fire automatically. For others, copy the text and send manually via WhatsApp.
        To enable auto-sending, add templates to{' '}
        <a href="https://business.facebook.com/wa/manage/message-templates/" target="_blank" rel="noopener noreferrer" className="underline font-bold">
          Meta Business Manager
        </a>.
      </div>

      {TEMPLATES.map(t => (
        <div key={t.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <code className="text-sm font-mono font-bold text-gray-900">{t.name}</code>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLOR[t.category]}`}>{t.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[t.status]}`}>{t.status}</span>
              </div>
              <p className="text-xs text-gray-500">{t.description}</p>
            </div>
            <button
              onClick={() => copyToClipboard(t.body, t.id)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              {copied === t.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === t.id ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Body preview */}
          <div className="px-5 py-4">
            <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm p-4 text-sm text-gray-900 font-mono whitespace-pre-wrap leading-relaxed max-w-sm">
              {t.body}
            </div>
            {/* Variables */}
            <div className="mt-3 flex flex-wrap gap-2">
              {t.variables.map((v, i) => (
                <span key={v} className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-mono">
                  {`{{${i + 1}}}`} = {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
