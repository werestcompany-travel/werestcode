import { type BlogPostSummary } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'

interface RelatedPostsProps {
  posts: BlogPostSummary[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-12 pt-10 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {posts.slice(0, 4).map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
