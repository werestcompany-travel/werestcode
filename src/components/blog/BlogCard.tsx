'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { type BlogPostSummary, BLOG_CATEGORIES, formatBlogDate, formatReadingTime } from '@/lib/blog'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPostSummary
  featured?: boolean
}

// Fallback gradient when no image
const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-600',
  PATTAYA:  'from-emerald-400 to-teal-600',
  THAILAND: 'from-red-400 to-rose-600',
  PHUKET:   'from-purple-400 to-violet-600',
  KRABI:    'from-orange-400 to-amber-600',
}

// Badge colours per category
const BADGE_COLORS: Record<string, string> = {
  BANGKOK:  'bg-blue-100 text-[#2534ff]',
  PATTAYA:  'bg-emerald-100 text-emerald-700',
  THAILAND: 'bg-red-100 text-red-700',
  PHUKET:   'bg-purple-100 text-purple-700',
  KRABI:    'bg-orange-100 text-orange-700',
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const cat       = BLOG_CATEGORIES[post.category]
  const fallback  = FALLBACK_BG[post.category] ?? 'from-gray-400 to-gray-600'
  const badgeColor = BADGE_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)]',
        'transition-all duration-300 hover:-translate-y-1',
        'border border-gray-100',
      )}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes={
              featured
                ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className={cn('absolute inset-0 bg-gradient-to-br', fallback)} />
        )}

        {/* Category pill overlaid on image */}
        <div className="absolute top-3 left-3">
          <span className={cn('inline-block text-xs font-bold px-2.5 py-1 rounded-full', badgeColor)}>
            {cat?.label ?? post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <h3
          className={cn(
            'font-bold text-gray-900 leading-snug line-clamp-2',
            'group-hover:text-[#2534ff] transition-colors duration-150',
            featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
          )}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Author / date / read time row */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
          {/* Author avatar */}
          <div className="w-7 h-7 rounded-full bg-[#2534ff]/10 flex items-center justify-center text-[#2534ff] text-xs font-bold shrink-0">
            {post.authorName[0].toUpperCase()}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
            <span className="font-medium text-gray-600 truncate">{post.authorName}</span>
            <span className="text-gray-300">·</span>
            {post.publishedAt && (
              <>
                <span className="whitespace-nowrap">{formatBlogDate(post.publishedAt)}</span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
              {formatReadingTime(post.readingTimeMin)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
