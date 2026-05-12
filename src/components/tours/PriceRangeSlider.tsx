'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const MIN = 0
const MAX = 10000

function formatTHB(v: number) {
  return `฿${v.toLocaleString('en-US')}`
}

export default function PriceRangeSlider() {
  const router     = useRouter()
  const sp         = useSearchParams()

  const initMin = Number(sp.get('minPrice') ?? MIN)
  const initMax = Number(sp.get('maxPrice') ?? MAX)

  const [minVal, setMinVal] = useState(initMin)
  const [maxVal, setMaxVal] = useState(initMax)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = useCallback((min: number, max: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(sp.toString())
      if (min === MIN) {
        params.delete('minPrice')
      } else {
        params.set('minPrice', String(min))
      }
      if (max === MAX) {
        params.delete('maxPrice')
      } else {
        params.set('maxPrice', String(max))
      }
      router.push(`/tours?${params.toString()}`, { scroll: false })
    }, 300)
  }, [router, sp])

  // Sync from URL when it changes externally
  useEffect(() => {
    setMinVal(Number(sp.get('minPrice') ?? MIN))
    setMaxVal(Number(sp.get('maxPrice') ?? MAX))
  }, [sp])

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), maxVal - 500)
    setMinVal(v)
    push(v, maxVal)
  }

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), minVal + 500)
    setMaxVal(v)
    push(minVal, v)
  }

  const leftPct  = ((minVal - MIN) / (MAX - MIN)) * 100
  const rightPct = 100 - ((maxVal - MIN) / (MAX - MIN)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2534ff]">{formatTHB(minVal)}</span>
        <span className="text-xs text-gray-400">–</span>
        <span className="text-xs font-semibold text-[#2534ff]">{formatTHB(maxVal)}</span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-gray-200">
        {/* Active range */}
        <div
          className="absolute h-full bg-[#2534ff] rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={100}
          value={minVal}
          onChange={handleMin}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > MAX - 1000 ? 5 : 3 }}
          aria-label="Minimum price"
        />

        {/* Max handle */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={100}
          value={maxVal}
          onChange={handleMax}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
          aria-label="Maximum price"
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2534ff] border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${leftPct}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#2534ff] border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${100 - rightPct}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{formatTHB(MIN)}</span>
        <span>{formatTHB(MAX)}</span>
      </div>
    </div>
  )
}
