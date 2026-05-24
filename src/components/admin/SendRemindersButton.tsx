'use client';
import { useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';

export default function SendRemindersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<string | null>(null);

  async function handleSend() {
    if (!confirm('Send WhatsApp reminders to all tomorrow\'s customers?')) return;
    setLoading(true);
    setResult(null);
    const r = await fetch('/api/cron/reminders');
    const d = await r.json();
    if (d.warning) setResult(`⚠️ ${d.warning}`);
    else setResult(`✅ ${d.sent} reminder${d.sent !== 1 ? 's' : ''} sent${d.failed > 0 ? `, ${d.failed} failed` : ''}`);
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-rose-300 hover:shadow-md transition-all text-left disabled:opacity-60"
      >
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
          {loading ? <Loader2 className="w-5 h-5 text-rose-500 animate-spin" /> : <Bell className="w-5 h-5 text-rose-500" />}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Send Reminders</p>
          <p className="text-xs text-gray-400">WhatsApp tomorrow&apos;s customers</p>
        </div>
      </button>
      {result && <p className="text-xs text-center mt-1 text-gray-600">{result}</p>}
    </div>
  );
}
