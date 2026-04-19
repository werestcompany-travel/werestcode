'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TourCard from '@/components/tours/TourCard'
import { getToursForDestination, formatTHB, type Tour } from '@/lib/tours'
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'

export default function AddExperiencesPage() {
  return (
    <Suspense>
      <AddExperiencesInner />
    </Suspense>
  )
}

function StepBar({ current }: { current: number }) {
  const steps = ['Select your ride', 'Add Experiences', 'Details & Payment']
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const done = i + 1 < current
        const active = i + 1 === current
        return (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                ${active ? 'border-brand-600 bg-brand-600 text-white' : done ? 'border-brand-600 bg-white text-brand-600' : 'border-gray-300 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        )
      })}
    </div>
  )
}

function AddExperiencesInner() {
  const params = useSearchParams()
  const router = useRouter()

  // Carry all booking params through
  const bookingParamString = params.toString()

  const dropoffAddress = params.get('dropoff_address') ?? ''
  const pickupAddress  = params.get('pickup_address')  ?? ''

  const tours: Tour[] = useMemo(
    () => getToursForDestination(dropoffAddress || pickupAddress),
    [dropoffAddress, pickupAddress],
  )

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleTour = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const handleContinue = () => {
    const p = new URLSearchParams(bookingParamString)
    if (selected.size > 0) {
      p.set('exp_slugs', Array.from(selected).join(','))
    }
    router.push(`/booking?${p.toString()}`)
  }

  const handleSkip = () => {
    router.push(`/booking?${bookingParamString}`)
  }

  const destName = dropoffAddress
    ? dropoffAddress.split(',')[0]
    : 'your destination'

  const selectedCount = selected.size
  const selectedTours = tours.filter(t => selected.has(t.slug))
  const selectedTotal = selectedTours.reduce(
    (sum, t) => sum + Math.min(...t.options.map(o => o.pricePerPerson)),
    0,
  )

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Step bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="ml-auto">
              <StepBar current={2} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <span className="text-brand-600 text-sm font-semibold uppercase tracking-widest">Step 2</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  Add Experiences Near {destName}
                </h1>
                <p className="text-gray-500 mt-2 text-sm max-w-lg">
                  Enhance your trip with one of our hand-picked local experiences. Everything is pre-arranged — just show up.
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 shrink-0 transition-colors"
              >
                Skip for now <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tour grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tours.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🗺️</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No experiences found nearby</h2>
              <p className="text-gray-500 mb-6">We're still adding experiences for this area. Check back soon!</p>
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors text-sm"
              >
                Continue to booking <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tours.map(tour => (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  selected={selected.has(tour.slug)}
                  onToggle={toggleTour}
                  bookingParams={bookingParamString}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: selected summary */}
          <div>
            {selectedCount === 0 ? (
              <p className="text-sm text-gray-400">No experiences selected yet</p>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCount} experience{selectedCount > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-gray-400">
                  From {formatTHB(selectedTotal)} extra total
                </p>
              </div>
            )}
          </div>

          {/* Right: skip + continue */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              {selectedCount > 0
                ? `Continue with ${selectedCount} experience${selectedCount > 1 ? 's' : ''}`
                : 'Continue to booking'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20" />
    </>
  )
}
