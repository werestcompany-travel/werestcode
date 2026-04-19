'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  content: string
}

function extractHeadings(html: string): Heading[] {
  const regex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\2>/gi
  const headings: Heading[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10) as 2 | 3
    // Strip inner HTML tags to get plain text
    const text = match[3].replace(/<[^>]+>/g, '').trim()
    if (!text) continue

    // Use existing id or generate one from text
    const id =
      match[2] ||
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60)

    headings.push({ id, text, level })
  }

  return headings
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    // Clean up previous observer
    observerRef.current?.disconnect()

    const headingEls = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    if (headingEls.length === 0) return

    observerRef.current = new IntersectionObserver(
      entries => {
        // Find the topmost intersecting heading
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 },
    )

    headingEls.forEach(el => observerRef.current!.observe(el))

    return () => observerRef.current?.disconnect()
  }, [headings])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Only show if there are 3+ headings
  if (headings.length < 3) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-[#2534ff]" />
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contents</span>
      </div>

      <nav aria-label="Table of contents">
        <ol className="space-y-1">
          {headings.map(heading => {
            const isActive = activeId === heading.id
            return (
              <li key={heading.id}>
                <button
                  onClick={() => handleClick(heading.id)}
                  className={cn(
                    'w-full text-left text-sm leading-snug py-1.5 px-3 rounded-lg transition-all duration-150',
                    heading.level === 3 && 'pl-6',
                    isActive
                      ? 'bg-blue-50 text-[#2534ff] font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  )}
                >
                  <span
                    className={cn(
                      'block',
                      isActive && 'border-l-2 border-[#2534ff] pl-2 -ml-2',
                    )}
                  >
                    {heading.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
