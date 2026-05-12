'use client'

import { useEffect, useRef, useState } from 'react'

interface StatsData {
  travellers: number;
  rating: number;
  reviewCount: number;
}

const DEFAULT_STATS: StatsData = { travellers: 2400, rating: 4.9, reviewCount: 0 };

function formatTravellers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return `${n}+`;
}

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data: StatsData) => {
        if (data && typeof data.travellers === 'number') setStats(data);
      })
      .catch(() => {});
  }, [])

  const STATS = [
    { number: formatTravellers(stats.travellers), label: 'Happy Travellers', icon: '😊' },
    { number: `${stats.rating}/5`,                label: 'Average Rating',   icon: '⭐' },
    { number: '6',                                 label: 'Cities Covered',   icon: '🏙️' },
    { number: 'Free',                              label: 'Cancellation',     icon: '✅' },
  ]

  return (
    <section
      ref={ref}
      aria-label="Trust statistics"
      className={`bg-white border-b border-gray-100 py-6 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-gray-100">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center py-4 transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="text-2xl mb-1" aria-hidden="true">{s.icon}</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.number}</span>
              <span className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
