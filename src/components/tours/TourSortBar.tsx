'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

const SORT_OPTIONS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'popular',     label: 'Most Popular' },
  { key: 'rating',      label: 'Highest Rated' },
  { key: 'price_asc',   label: 'Price: Low to High' },
  { key: 'price_desc',  label: 'Price: High to Low' },
]

export default function TourSortBar({ count }: { count: number }) {
  const router = useRouter()
  const sp     = useSearchParams()
  const sort   = sp.get('sort') ?? 'recommended'

  function handleSort(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString())
    if (e.target.value === 'recommended') {
      params.delete('sort')
    } else {
      params.set('sort', e.target.value)
    }
    const q = params.toString()
    router.push(q ? `/tours?${q}` : '/tours', { scroll: false })
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <p className="text-sm text-gray-600">
        <span className="font-bold text-gray-900">{count}</span>{' '}
        {count === 1 ? 'experience' : 'experiences'} found
      </p>

      <div className="flex items-center gap-2 text-sm">
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <label htmlFor="tour-sort" className="text-gray-500 whitespace-nowrap">Sort by:</label>
        <select
          id="tour-sort"
          value={sort}
          onChange={handleSort}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
