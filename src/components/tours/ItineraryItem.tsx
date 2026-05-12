'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ItineraryItemProps {
  step?: string
  title: string
  desc: string
  isLast: boolean
}

export default function ItineraryItem({ step, title, desc, isLast }: ItineraryItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`relative ${isLast ? 'pb-2' : 'pb-4'}`}>
      {/* Timeline dot */}
      <div
        className="absolute -left-7 top-3.5 w-3.5 h-3.5 rounded-full bg-[#2534ff] border-2 border-white shadow-sm z-10"
        aria-hidden="true"
      />

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header row — always visible */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left group"
          aria-expanded={expanded}
        >
          {step && (
            <span className="shrink-0 text-xs font-bold text-[#2534ff] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {step}
            </span>
          )}
          <p className="flex-1 text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#2534ff] transition-colors">
            {title}
          </p>
          <span className="shrink-0 text-gray-400">
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </span>
        </button>

        {/* Expandable description */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-gray-50">
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        )}
      </div>
    </div>
  )
}
