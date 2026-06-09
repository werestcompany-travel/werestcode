'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Search, X, Check } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  loyaltyPoints: number;
  createdAt: string;
}

interface UserDetail extends UserRow {
  loyaltyTransactions: Array<{
    id: string; points: number; type: string; description: string; bookingRef: string | null; createdAt: string;
  }>;
}

interface Stats { total: number; }


export default function AdminUsersPage() {
  const [users,         setUsers]         = useState<UserRow[]>([]);
  const [stats,         setStats]         = useState<Stats>({ total: 0 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedUser,  setSelectedUser]  = useState<UserDetail | null>(null);
  const [panelLoading,  setPanelLoading]  = useState(false);
  const [adjustPoints,  setAdjustPoints]  = useState('');
  const [adjustDesc,    setAdjustDesc]    = useState('');
  const [adjustSaving,  setAdjustSaving]  = useState(false);
  const [adjustMsg,     setAdjustMsg]     = useState('');

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const r  = await fetch(`/api/admin/users${qs}`);
    const d  = await r.json();
    setUsers(d.users ?? []);
    setStats(d.stats ?? { total: 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(search), 400);
    return () => clearTimeout(id);
  }, [search, load]);

  async function openUser(u: UserRow) {
    setPanelLoading(true);
    setSelectedUser(null);
    setAdjustMsg('');
    const r = await fetch(`/api/admin/users/${u.id}`);
    const d = await r.json();
    setSelectedUser(d.user);
    setPanelLoading(false);
  }

  async function handleAdjust() {
    if (!selectedUser || !adjustPoints || !adjustDesc) return;
    setAdjustSaving(true); setAdjustMsg('');
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: Number(adjustPoints), description: adjustDesc }),
    });
    if (res.ok) {
      setAdjustMsg('Points adjusted!');
      setAdjustPoints('');
      setAdjustDesc('');
      // Refresh user detail
      const r2 = await fetch(`/api/admin/users/${selectedUser.id}`);
      const d2 = await r2.json();
      setSelectedUser(d2.user);
      load(search);
    } else {
      setAdjustMsg('Adjustment failed.');
    }
    setAdjustSaving(false);
  }

  return (
    <AdminShell title="Users" subtitle="Registered customer accounts">

      <div className="flex items-center justify-between mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 max-w-xs">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-xl font-extrabold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-semibold text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_1fr_80px_90px_100px_80px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  {['Name', 'Email', 'Phone', 'Tier', 'Points', 'Joined'].map(h => (
                    <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <button key={u.id} onClick={() => openUser(u)}
                      className="w-full grid grid-cols-[1fr_1fr_80px_90px_100px_80px] gap-4 px-5 py-3.5 items-center hover:bg-brand-50 transition-colors text-left">
                      <Link href={`/admin/customers/${u.id}`} onClick={e => e.stopPropagation()}
                        className="font-semibold text-sm text-brand-600 hover:underline truncate">{u.name}</Link>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.phone ?? '—'}</p>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2534ff]">
                        💎 {u.loyaltyPoints.toLocaleString()} pts
                      </span>
                      <p className="text-sm font-bold text-gray-900">{u.loyaltyPoints.toLocaleString()} pts</p>
                      <p className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Detail panel */}
          {(selectedUser || panelLoading) && (
            <div className="w-[320px] bg-white rounded-2xl border border-gray-100 p-5 shrink-0 h-fit">
              {panelLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedUser ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{selectedUser.name}</p>
                      <p className="text-xs text-gray-500">{selectedUser.email}</p>
                    </div>
                    <button onClick={() => setSelectedUser(null)}
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Tier</p>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2534ff]">
                        💎 {selectedUser.loyaltyPoints.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Points</p>
                      <p className="text-lg font-extrabold text-gray-900">{selectedUser.loyaltyPoints.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Manual Point Adjustment</p>
                    <div className="space-y-2">
                      <input type="number" value={adjustPoints} onChange={e => setAdjustPoints(e.target.value)}
                        placeholder="Points (negative to deduct)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <input value={adjustDesc} onChange={e => setAdjustDesc(e.target.value)}
                        placeholder="Reason / description"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                      <button onClick={handleAdjust} disabled={adjustSaving || !adjustPoints || !adjustDesc}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors">
                        {adjustSaving
                          ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                          : <Check className="w-4 h-4" />}
                        {adjustSaving ? 'Saving…' : 'Adjust Points'}
                      </button>
                      {adjustMsg && <p className="text-xs text-center font-semibold text-green-600">{adjustMsg}</p>}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Transactions</p>
                    {selectedUser.loyaltyTransactions.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No transactions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedUser.loyaltyTransactions.map(tx => (
                          <div key={tx.id} className="flex items-start justify-between gap-2 text-xs">
                            <div>
                              <p className="text-gray-700 font-medium">{tx.description}</p>
                              <p className="text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</p>
                            </div>
                            <span className={`font-bold shrink-0 ${tx.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {tx.points >= 0 ? '+' : ''}{tx.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
