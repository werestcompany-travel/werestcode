'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const DEMO_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80', alt: 'Golden temple spires at sunset'     },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', alt: 'Ornate temple entrance with offerings' },
  { src: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', alt: 'Floating market with colourful boats' },
  { src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', alt: 'Ancient temple ruins in the jungle'   },
  { src: 'https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=400&q=80', alt: 'Elephant bathing in a jungle river'  },
  { src: 'https://images.unsplash.com/photo-1512553313200-fe7f7d4c0a26?w=400&q=80', alt: 'Lantern festival at night'           },
];

interface TravellerPhotosProps {
  photos?: { src: string; alt: string }[];
}

export default function TravellerPhotos({ photos = DEMO_PHOTOS }: TravellerPhotosProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null);

  return (
    <>
      <div className="pt-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Traveller Photos</h2>
        <p className="text-sm text-gray-400 mb-5">Shared by visitors like you</p>

        {/* 3-column masonry-style grid */}
        <div className="columns-3 gap-2 space-y-2">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="block w-full overflow-hidden rounded-xl group cursor-pointer break-inside-avoid"
            >
              <div className="relative w-full" style={{ paddingBottom: i % 3 === 1 ? '133%' : '75%' }}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 33vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
            {lightbox + 1} / {photos.length}
          </div>

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-full border border-white/30 transition-colors"
          >
            <X className="w-4 h-4" /> Close
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-2xl max-h-[80vh] mx-4"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
              width={800}
              height={600}
              className="object-contain w-full h-full max-h-[80vh] rounded-xl"
              unoptimized
            />
          </div>

          {/* Caption */}
          <p className="text-white/50 text-xs mt-3">{photos[lightbox].alt}</p>

          {/* Prev / Next */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 flex gap-2 px-4">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i); }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  lightbox === i ? 'border-white scale-105' : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <Image src={p.src} alt={p.alt} fill className="object-cover" sizes="48px" unoptimized />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
