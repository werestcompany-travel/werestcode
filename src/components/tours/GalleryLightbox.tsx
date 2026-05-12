'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Camera, X, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'

interface GalleryLightboxProps {
  images: string[]
  title: string
  slug: string
}

export default function GalleryLightbox({ images, title, slug }: GalleryLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const safeImages = images.length > 0 ? images : ['/images/placeholder.jpg']

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % safeImages.length)
  }, [safeImages.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, closeLightbox, goNext, goPrev])

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  const handleShare = async () => {
    const url = `${window.location.origin}/tours/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const thumb1 = safeImages[1]
  const thumb2 = safeImages[2]

  return (
    <>
      {/* ── Gallery Grid ────────────────────────────────────────────────────── */}
      <section aria-label="Tour photos" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2 h-[280px] sm:h-[460px] rounded-2xl overflow-hidden">

            {/* Main large image */}
            <div
              className="relative sm:col-span-2 row-span-2 cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={safeImages[0]}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 67vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

              {/* Share button — top left */}
              <button
                onClick={e => { e.stopPropagation(); handleShare() }}
                className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-white transition-colors"
                aria-label="Share tour"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Share'}
              </button>

              {/* View all photos button — bottom right */}
              <button
                onClick={e => { e.stopPropagation(); openLightbox(0) }}
                className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-full shadow-md hover:bg-white transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                View all {safeImages.length} photos
              </button>
            </div>

            {/* Right thumbnail column — desktop only */}
            <div className="hidden sm:flex flex-col gap-2">
              {/* Top thumbnail */}
              <div
                className="relative flex-1 cursor-pointer group overflow-hidden rounded-tr-2xl"
                onClick={() => openLightbox(1)}
              >
                {thumb1 ? (
                  <>
                    <Image
                      src={thumb1}
                      alt={`${title} — photo 2`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
              </div>

              {/* Bottom thumbnail */}
              <div
                className="relative flex-1 cursor-pointer group overflow-hidden rounded-br-2xl"
                onClick={() => openLightbox(2)}
              >
                {thumb2 ? (
                  <>
                    <Image
                      src={thumb2}
                      alt={`${title} — photo 3`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    {/* More photos overlay */}
                    {safeImages.length > 3 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">+{safeImages.length - 3} more</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lightbox Modal ───────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/70 text-sm font-medium">
              {currentIndex + 1} / {safeImages.length}
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main image */}
          <div className="relative flex-1 flex items-center justify-center px-14 min-h-0">
            <Image
              src={safeImages[currentIndex]}
              alt={`${title} — photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />

            {/* Prev button */}
            {safeImages.length > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Previous photo"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next button */}
            {safeImages.length > 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Next photo"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {safeImages.length > 1 && (
            <div className="shrink-0 px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none justify-center">
              {safeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden transition-all
                    ${i === currentIndex
                      ? 'ring-2 ring-white opacity-100 scale-105'
                      : 'opacity-50 hover:opacity-80'
                    }`}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
