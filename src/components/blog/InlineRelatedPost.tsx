import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { type BlogPostSummary, BLOG_CATEGORIES, formatReadingTime } from '@/lib/blog'
import { cn } from '@/lib/utils'

const FALLBACK_BG: Record<string, string> = {
  BANGKOK:  'from-[#2534ff] to-indigo-700',
  PATTAYA:  'from-emerald-500 to-teal-700',
  THAILAND: 'from-red-500 to-rose-700',
  PHUKET:   'from-purple-500 to-violet-700',
  KRABI:    'from-orange-500 to-amber-700',
}

const CAT_COLOR: Record<string, string> = {
  BANGKOK:  'text-blue-600  bg-blue-50',
  PATTAYA:  'text-emerald-600 bg-emerald-50',
  THAILAND: 'text-red-600   bg-red-50',
  PHUKET:   'text-purple-600 bg-purple-50',
  KRABI:    'text-orange-600 bg-orange-50',
}

export default function InlineRelatedPost({ post }: { post: BlogPostSummary }) {
  const cat      = BLOG_CATEGORIES[post.category]
  const fallback = FALLBACK_BG[post.category] ?? 'from-gray-500 to-gray-700'
  const catColor = CAT_COLOR[post.category]   ?? 'text-gray-600 bg-gray-50'

  return (
    <div className="my-10 not-prose">
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Related Article</p>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex rounded-2xl border border-gray-200 overflow-hidden bg-white hover:border-brand-300 hover:shadow-[0_4px_24px_rgba(37,52,255,0.10)] transition-all duration-200"
      >
        {/* Thumbnail */}
        <div className="relative w-40 sm:w-56 shrink-0 overflow-hidden bg-gray-100">
          {post.featuredImage
            ? <Image src={post.featuredImage} alt={post.title} fill sizes="224px" className="object-cover group-hover:scale-105 transition-transform duration-400" />
            : <div className={cn('absolute inset-0 bg-gradient-to-br', fallback)} />
          }
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-2 p-5 flex-1 min-w-0">
          <span className={cn('self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', catColor)}>
            {cat?.label}
          </span>
          <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {post.title}
          </h4>
          {post.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 hidden sm:block">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 mt-1">
            Read article <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  )
}
