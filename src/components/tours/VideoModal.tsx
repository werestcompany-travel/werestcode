'use client'

import { X } from 'lucide-react'

interface VideoModalProps {
  videoUrl:  string
  tourTitle: string
  onClose:   () => void
}

export default function VideoModal({ videoUrl, tourTitle, onClose }: VideoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
          <p className="text-sm font-semibold text-white truncate">{tourTitle} — Preview</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors ml-4 shrink-0"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video w-full">
          <iframe
            src={`${videoUrl}?autoplay=1&rel=0`}
            title={`${tourTitle} preview`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
