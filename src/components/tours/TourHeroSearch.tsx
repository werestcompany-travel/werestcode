'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function TourHeroSearch({ initialQ = '' }: { initialQ?: string }) {
  const [value, setValue] = useState(initialQ)
  const router = useRouter()

  const handleSearch = () => {
    const q = value.trim()
    router.push(q ? `/tours?q=${encodeURIComponent(q)}` : '/tours')
  }

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      <Search className="ml-5 w-5 h-5 text-gray-400 shrink-0" />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Search places and things to do"
        aria-label="Search tours and experiences"
        className="flex-1 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
      />
      <button
        onClick={handleSearch}
        className="bg-[#2534ff] hover:bg-[#1e2bdb] active:bg-[#1a26c4] text-white font-semibold text-base px-8 py-4 transition-colors shrink-0 flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </div>
  )
}
