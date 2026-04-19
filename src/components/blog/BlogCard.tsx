'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { type BlogPostSummary, BLOG_CATEGORIES } from '@/lib/blog'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPostSummary
  featured?: boolean
}

// Solid colour fallback when no featured image
const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-600',
  PATTAYA:  'from-emerald-400 to-teal-600',
  THAILAND: 'from-red-400 to-rose-600',
  PHUKET:   'from-purple-400 to-violet-600',
  KRABI:    'from-orange-400 to-amber-600',
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const cat      = BLOG_CATEGORIES[post.category]
  const fallback = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.14)]',
        'transition-all duration-200 hover:-translate-y-0.5',
        'border border-gray-100',
      )}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <div
        className={cn(
          'relative w-full overflow-hidden shrink-0',
          featured ? 'aspect-[16/9]' : 'aspect-[4/3]',
        )}
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes={featured
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className={cn('absolute inset-0 bg-gradient-to-br', fallback)} />
        )}
      </div>

      {/* ── Text ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        {/* Title */}
        <p
          className={cn(
            'font-semibold text-gray-800 leading-snug line-clamp-2',
            'group-hover:text-[#2534ff] transition-colors duration-150',
            featured ? 'text-base' : 'text-[13px]',
          )}
        >
          {post.title}
        </p>

        {/* Spacer pushes location to bottom */}
        <div className="flex-1" />

        {/* Location / category row */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{cat?.label ?? post.category}</span>
        </div>
      </div>
    </Link>
  )
}
