'use client';

import { useState } from 'react';
import { Copy, Check, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PROMO_CODE = 'WELCOME10';

export default function MyDiscountPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#2534ff] flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Your Welcome Discount</h1>
            <p className="text-gray-500 text-sm">Use this code at checkout to get 10% off your first booking.</p>
          </div>

          {/* Code card */}
          <div className="bg-white rounded-3xl border-2 border-dashed border-[#2534ff] p-8 text-center mb-6 shadow-sm">
            <p className="text-xs font-bold text-[#2534ff] uppercase tracking-widest mb-3">Your promo code</p>
            <p className="text-4xl font-extrabold text-gray-900 tracking-widest mb-6">{PROMO_CODE}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-[#2534ff] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy code'}
            </button>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Discount</span>
              <span>10% off</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Valid on</span>
              <span>All transfers &amp; tours</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Usage</span>
              <span>One-time use</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/transfers"
            className="flex items-center justify-center gap-2 w-full bg-[#2534ff] hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-colors"
          >
            Book now &amp; use discount <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      </main>
      <Footer />
    </>
  );
}
