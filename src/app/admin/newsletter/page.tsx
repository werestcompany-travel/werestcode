'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { Search, Download, ToggleLeft, ToggleRight, Users } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: string;
}

// ── Inner component (uses useSearchParams — must be inside <Suspense>) ─────────

function NewsletterContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const q            = searchParams.get('q') ?? '';

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState(q);
  const [toggling,    setToggling]    = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const r = await fetch(`/api/admin/newsletter?q=${encodeURIComponent(query)}`);
    const d = await r.json() as { subscribers: Subscriber[]; total: number };
    setSubscribers(d.subscribers ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(q); }, [q, load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`?q=${encodeURIComponent(search)}`);
  }

  async function toggleActive(sub: Subscriber) {
    setToggling(sub.id);
    await fetch(`/api/admin/newsletter/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !sub.isActive }),
    });
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, isActive: !s.isActive } : s)),
    );
    setToggling(null);
  }

  function exportCsv() {
    const rows = [
      ['Email', 'Source', 'Subscribed', 'Active'],
      ...subscribers.map((s) => [
        s.email,
        s.source,
        new Date(s.createdAt).toLocaleDateString(),
        s.isActive ? 'Yes' : 'No',
      ]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'newsletter-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4" /> {total.toLocaleString()} total
          </span>
          <span className="text-sm text-gray-500">
            {subscribers.filter((s) => s.isActive).length} active in view
          </span>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 w-56"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Search
            </button>
          </form>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : subscribers.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">No subscribers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Subscribed</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{sub.source}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${sub.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(sub)}
                      disabled={toggling === sub.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                      style={
                        sub.isActive
                          ? { borderColor: '#ef4444', color: '#ef4444' }
                          : { borderColor: '#10b981', color: '#10b981' }
                      }
                    >
                      {sub.isActive
                        ? <><ToggleRight className="w-3.5 h-3.5" /> Unsubscribe</>
                        : <><ToggleLeft className="w-3.5 h-3.5" /> Reactivate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Page shell (safe to pre-render — no useSearchParams here) ─────────────────

export default function AdminNewsletterPage() {
  return (
    <AdminShell title="Newsletter Subscribers" subtitle="Manage email subscribers">
      <Suspense fallback={
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      }>
        <NewsletterContent />
      </Suspense>
    </AdminShell>
  );
}
