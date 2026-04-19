import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CTABlock {
  title: string
  description: string
  href: string
  buttonLabel: string
}

interface BlogCTAProps {
  blocks: CTABlock[]
}

export default function BlogCTA({ blocks }: BlogCTAProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="mt-10 space-y-4">
      {blocks.map((block, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-[#2534ff] to-[#1420cc] rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-snug mb-1">
              {block.title}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {block.description}
            </p>
          </div>

          <Link
            href={block.href}
            className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold text-sm px-5 py-2.5 rounded-xl shrink-0 hover:bg-blue-50 transition-colors"
          >
            {block.buttonLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  )
}
