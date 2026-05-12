'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FaqItemProps {
  q: string
  a: string
}

export default function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <p className="pt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}
