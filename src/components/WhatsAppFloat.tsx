'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66800000000'

const WA_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20with%20a%20booking`

export default function WhatsAppFloat() {
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('werest_wa_label_seen')
      if (!seen) {
        setShowLabel(true)
        const t = setTimeout(() => {
          setShowLabel(false)
          localStorage.setItem('werest_wa_label_seen', '1')
        }, 5000)
        return () => clearTimeout(t)
      }
    } catch {
      // ignore localStorage errors in SSR / private mode
    }
  }, [])

  return (
    <div className="fixed bottom-[84px] right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {/* "Need help?" pill — desktop only, auto-hides after 5 s */}
      {showLabel && (
        <div className="hidden sm:flex items-center bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-gray-100 pointer-events-auto">
          Need help?
        </div>
      )}

      {/* Button */}
      <div className="relative pointer-events-auto">
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: '#25D366' }}
          aria-hidden="true"
        />

        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{ backgroundColor: '#25D366', width: 56, height: 56 }}
          className="relative flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
        >
          {/* WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="30"
            height="30"
            fill="white"
            aria-hidden="true"
          >
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.738 5.47 2.032 7.773L0 32l8.468-2.009A15.942 15.942 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.14 22.406c-.342.962-1.993 1.849-2.74 1.964-.698.107-1.576.151-2.542-.16-.586-.189-1.338-.44-2.296-.865-4.04-1.751-6.68-5.818-6.882-6.09-.2-.272-1.634-2.175-1.634-4.148s1.034-2.948 1.4-3.35c.367-.4.8-.5 1.067-.5h.767c.25 0 .584-.094.916.7.342.817 1.167 2.817 1.267 3.017.1.2.167.434.033.7-.133.267-.2.434-.4.667-.2.233-.42.52-.6.7-.2.2-.408.417-.175.817.233.4 1.034 1.7 2.217 2.75 1.517 1.35 2.8 1.767 3.2 1.967.4.2.633.167.867-.1.233-.267 1-1.167 1.267-1.567.267-.4.533-.333.9-.2.367.133 2.333 1.1 2.733 1.3.4.2.667.3.767.467.1.166.1.966-.242 1.93z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
