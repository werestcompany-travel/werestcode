'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogFAQProps {
  faqs: { q: string; a: string }[]
}

export default function BlogFAQ({ faqs }: BlogFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-card">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold text-gray-900 leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200',
                    isOpen && 'rotate-180 text-[#2534ff]',
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-5 animate-fade-in">
                  <p className="text-gray-600 leading-relaxed text-[15px]">{faq.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
