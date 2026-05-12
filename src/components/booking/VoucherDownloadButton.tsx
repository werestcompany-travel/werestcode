'use client'

import { Ticket } from 'lucide-react'

interface VoucherDownloadButtonProps {
  bookingRef: string
  className?: string
}

export default function VoucherDownloadButton({
  bookingRef,
  className = '',
}: VoucherDownloadButtonProps) {
  return (
    <a
      href={`/api/voucher/${bookingRef}`}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5',
        'text-sm font-semibold text-gray-700 shadow-sm transition-colors',
        'hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Ticket className="h-4 w-4 shrink-0 text-gray-500" />
      Download Voucher
    </a>
  )
}
