'use client'
import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/blog/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug])
  return null
}
