'use client'

import { useState } from 'react'
import { Car, Clock } from 'lucide-react'
import PrivateRideForm from '@/components/search/PrivateRideForm'
import HourlyForm from '@/components/search/HourlyForm'

type Tab = 'transfer' | 'hourly'

export default function TransferSearchBox() {
  const [tab, setTab] = useState<Tab>('transfer')

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
          onClick={() => setTab('transfer')}
          className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 select-none whitespace-nowrap ${
            tab === 'transfer' ? 'bg-white text-[#2534ff] shadow-md' : 'text-white/90 hover:bg-white/20 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          Transfer
        </button>
        <button
          onClick={() => setTab('hourly')}
          className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-150 select-none whitespace-nowrap ${
            tab === 'hourly' ? 'bg-white text-[#2534ff] shadow-md' : 'text-white/90 hover:bg-white/20 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Hourly
        </button>
      </div>

      {/* Form */}
      <div>
        {tab === 'transfer' ? <PrivateRideForm /> : <HourlyForm />}
      </div>
    </div>
  )
}
