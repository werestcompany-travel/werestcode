import { BLOG_CATEGORIES, type BlogCategoryKey } from '@/lib/blog'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: BlogCategoryKey
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const cat = BLOG_CATEGORIES[category]
  if (!cat) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        cat.color,
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
      )}
    >
      <span className={cn('rounded-full shrink-0', cat.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {cat.label}
    </span>
  )
}
