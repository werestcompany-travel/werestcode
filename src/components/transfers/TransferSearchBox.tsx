'use client'

import { Car } from 'lucide-react'
import PrivateRideForm from '@/components/search/PrivateRideForm'

export default function TransferSearchBox() {
  return (
    <div className="w-full max-w-5xl">
      {/* Tab bar */}
      <div
        className="inline-flex items-center gap-0.5 px-1 py-1.5 mb-2"
        style={{
          background: 'linear-gradient(to right, #2534ff 0%, #1420cc 100%)',
          borderRadius: '5px',
          clipPath: 'polygon(0 0, calc(100% - 44px) 0, 100% 100%, 0 100%)',
          paddingRight: '60px',
        }}
      >
        <button
          className="relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 select-none whitespace-nowrap bg-white text-[#2534ff] shadow-md"
        >
          <Car className="w-4 h-4" />
          Transfer
        </button>
      </div>

      {/* Form */}
      <div>
        <PrivateRideForm />
      </div>
    </div>
  )
}
