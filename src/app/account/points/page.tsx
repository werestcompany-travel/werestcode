'use client';

import { useEffect, useState } from 'react';
import { Coins, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  points: number;
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';
  description: string;
  bookingRef: string | null;
  createdAt: string;
}

interface LoyaltyData {
  points: number;
  transactions: Transaction[];
}

const TX_ICON: Record<string, React.ReactNode> = {
  EARN:   <ArrowUpRight   className="w-4 h-4 text-green-500" />,
  REDEEM: <ArrowDownLeft  className="w-4 h-4 text-blue-500" />,
  EXPIRE: <RefreshCw      className="w-4 h-4 text-gray-400" />,
  ADJUST: <RefreshCw      className="w-4 h-4 text-gray-400" />,
};

export default function PointsPage() {
  const [data, setData]     = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/loyalty')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-[#2534ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-gray-500 py-12">Could not load points data.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Balance card */}
      <div className="bg-[#2534ff] rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <p className="text-white/80 text-sm font-medium">Your Points Balance</p>
        </div>
        <p className="text-5xl font-extrabold mb-1">{data.points.toLocaleString()}</p>
        <p className="text-white/70 text-sm">= ฿{data.points.toLocaleString()} redeemable value</p>

        <div className="mt-5 pt-5 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Earn rate</p>
            <p className="font-semibold">฿20 spent = 1 point</p>
          </div>
          <div>
            <p className="text-white/60">Redeem rate</p>
            <p className="font-semibold">1 point = ฿1 discount</p>
          </div>
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
        <h3 className="font-bold text-gray-900 mb-3">How to earn points</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">+</span>
            Pay for a <strong>transfer booking</strong> → earn ฿20 = 1 pt
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">+</span>
            Pay for a <strong>tour booking</strong> → earn ฿20 = 1 pt
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">+</span>
            Pay for an <strong>attraction ticket</strong> → earn ฿20 = 1 pt
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-500 font-bold">★</span>
            Points are also awarded when a trip is <strong>manually completed</strong> by an admin
          </li>
        </ul>
      </div>

      {/* Transaction history */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Transaction History</h3>
        {data.transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Coins className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No transactions yet. Book your first trip to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {data.transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 bg-white">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {TX_ICON[tx.type] ?? TX_ICON.ADJUST}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.bookingRef && <span className="mr-2 font-mono">{tx.bookingRef}</span>}
                    {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
