'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: '',           label: 'Recommended' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'popular',    label: 'Most Popular' },
]

export default function TourSortSelect() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = searchParams.get('sort') ?? ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = new URLSearchParams(searchParams.toString())
    if (e.target.value) { p.set('sort', e.target.value) } else { p.delete('sort') }
    router.replace(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={handleChange}
        className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}
