'use client'

import { useState } from 'react'
import { Tag, Copy, Check, ChevronRight } from 'lucide-react'

interface PromoCode {
  code:        string
  type:        string
  value:       number
  description: string | null
  expiresAt:   string   // ISO string (serialised from Date)
}

interface Props {
  codes: PromoCode[]
}

function formatDiscount(type: string, value: number) {
  if (type === 'PERCENTAGE') return `${value}% off`
  if (type === 'FIXED')      return `฿${value.toLocaleString()} off`
  return `฿${value.toLocaleString()} off`
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const days = Math.ceil(diff / 86_400_000)
  if (days <= 0)  return 'Expired'
  if (days === 1) return 'Expires today'
  if (days <= 7)  return `Expires in ${days} days`
  return `Expires ${new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
}

export default function PromoCodeSection({ codes }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  if (codes.length === 0) return null

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(prev => (prev === code ? null : prev)), 2500)
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(code)
      setTimeout(() => setCopied(prev => (prev === code ? null : prev)), 2500)
    })
  }

  return (
    <section id="promo-codes" className="py-8 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <Tag className="w-5 h-5 text-[#2534ff]" />
        <h2 className="text-xl font-bold text-gray-900">Promo codes</h2>
        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          {codes.length} available
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {codes.map(c => (
          <div
            key={c.code}
            className="flex items-stretch border border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 hover:border-[#2534ff]/40 transition-colors"
          >
            {/* Left accent */}
            <div className="w-1.5 bg-gradient-to-b from-[#2534ff] to-indigo-400 shrink-0" />

            {/* Content */}
            <div className="flex-1 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#2534ff] text-lg tracking-widest uppercase">
                    {c.code}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {formatDiscount(c.type, c.value)}
                  </p>
                  {c.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{c.description}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {daysUntil(c.expiresAt)}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(c.code)}
                  className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    copied === c.code
                      ? 'bg-green-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-[#2534ff] hover:text-white hover:border-[#2534ff]'
                  }`}
                  aria-label={`Copy code ${c.code}`}
                >
                  {copied === c.code
                    ? <><Check className="w-4 h-4" /><span>Copied!</span></>
                    : <><Copy className="w-4 h-4" /><span>Copy</span></>
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
        <Tag className="w-3 h-3" />
        Enter your promo code at checkout to claim your discount.
      </p>
    </section>
  )
}
