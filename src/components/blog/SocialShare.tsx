'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

/* Facebook SVG */
const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

/* X / Twitter SVG */
const XIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

/* LINE SVG */
const LineIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.251 3.39 9.722 8.13 11.343-.112-.977-.213-2.477.044-3.545.235-.975 1.56-6.617 1.56-6.617s-.398-.797-.398-1.975c0-1.85 1.074-3.234 2.409-3.234 1.137 0 1.687.852 1.687 1.877 0 1.143-.729 2.855-1.106 4.44-.315 1.326.665 2.405 1.972 2.405 2.366 0 3.966-3.033 3.966-6.626 0-2.734-1.835-4.793-5.151-4.793-3.762 0-6.122 2.808-6.122 5.944 0 1.082.319 1.842.82 2.43.23.271.262.381.18.694-.059.228-.194.778-.25 1-.081.322-.33.439-.608.319-1.7-.703-2.496-2.59-2.496-4.71 0-3.503 2.96-7.737 8.836-7.737 4.747 0 7.86 3.449 7.86 7.153 0 4.909-2.718 8.578-6.723 8.578-1.346 0-2.614-.722-3.048-1.537l-.83 3.19c-.3 1.148-1.112 2.586-1.656 3.46.623.193 1.286.298 1.97.298 6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
)

interface SocialShareProps {
  url: string
  title: string
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const SHARES = [
    {
      label: 'Facebook',
      icon:  <FacebookIcon />,
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      hover: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white',
    },
    {
      label: 'X / Twitter',
      icon:  <XIcon />,
      href:  `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      hover: 'hover:bg-black hover:border-black hover:text-white',
    },
    {
      label: 'LINE',
      icon:  <LineIcon />,
      href:  `https://social-plugins.line.me/lineit/share?url=${encoded}`,
      hover: 'hover:bg-[#06C755] hover:border-[#06C755] hover:text-white',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Share</p>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Copy link */}
        <button
          onClick={handleCopy}
          title="Copy link"
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
            copied
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>

        {SHARES.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 transition-all duration-200 ${s.hover}`}
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  )
}
