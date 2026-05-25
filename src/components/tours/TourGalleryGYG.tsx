'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Camera, X, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  images: string[]
  title:  string
}

export default function TourGalleryGYG({ images, title }: Props) {
  const [open, setOpen] = useState(false)
  const [idx,  setIdx]  = useState(0)

  const safe   = images.length > 0 ? images : ['/images/placeholder.jpg']
  const close  = useCallback(() => setOpen(false), [])
  const goNext = useCallback(() => setIdx(i => (i + 1) % safe.length),                [safe.length])
  const goPrev = useCallback(() => setIdx(i => (i - 1 + safe.length) % safe.length), [safe.length])

  const open_ = (i: number) => { setIdx(i); setOpen(true) }

  /* keyboard nav in lightbox */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, close, goNext, goPrev])

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* thumbnail images for 2×2 grid (indices 1–4) */
  const thumbs = [1, 2, 3, 4] as const

  return (
    <>
      {/* ── Gallery grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 h-[380px] sm:h-[420px] rounded-2xl overflow-hidden">

        {/* Left — one large hero image */}
        <div
          className="relative cursor-pointer group overflow-hidden"
          onClick={() => open_(0)}
          aria-label="View main photo"
        >
          <Image
            src={safe[0]}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Right — 2 × 2 thumbnail grid */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1.5">
          {thumbs.map(n => {
            const src    = safe[n] ?? safe[0]
            const isLast = n === 4
            const extra  = safe.length - 5   // photos not shown

            return (
              <div
                key={n}
                className={`relative cursor-pointer group overflow-hidden ${
                  n === 1 ? 'rounded-tr-none' :
                  n === 2 ? '' :
                  n === 3 ? '' :
                  ''
                }`}
                onClick={() => open_(n)}
              >
                <Image
                  src={src}
                  alt={`${title} — photo ${n + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />

                {/* "View all" overlay on the last tile */}
                {isLast && (
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1.5">
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-white text-xs font-bold tracking-wide">
                      {extra > 0 ? `+${extra} · ` : ''}View all photos
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/70 text-sm font-medium">
              {idx + 1} / {safe.length}
            </span>
            <button
              onClick={close}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex-1 flex items-center justify-center px-14 min-h-0">
            <Image
              src={safe[idx]}
              alt={`${title} — photo ${idx + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
            {safe.length > 1 && (
              <>
                <button onClick={goPrev}
                  className="absolute left-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Previous photo">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={goNext}
                  className="absolute right-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  aria-label="Next photo">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {safe.length > 1 && (
            <div className="shrink-0 px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none justify-center">
              {safe.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden transition-all ${
                    i === idx ? 'ring-2 ring-white opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="56px" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
