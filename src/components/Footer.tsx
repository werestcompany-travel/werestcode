import Link from 'next/link'

/* ─────────────────────────────────────────────────────────────────────────── */

const CONTACT_LINKS = [
  { label: 'Customer support',  href: '/inquiry'  },
  { label: 'Contact Us',        href: '/contact'  },
  { label: 'FAQ',               href: '/faq'      },
  { label: 'Service Guarantee', href: '/about'    },
]

const ABOUT_LINKS = [
  { label: 'About Werest',          href: '/about',               blue: false },
  { label: 'Travel Blog',           href: '/blog',                blue: false },
  { label: 'Terms of Service',      href: '/terms-of-service',    blue: false },
  { label: 'Privacy Policy',        href: '/privacy-policy',      blue: false },
  { label: 'Cookie Policy',         href: '/cookie-policy',       blue: false },
  { label: 'Cancellation Policy',   href: '/cancellation-policy', blue: false },
]

const OTHER_LINKS = [
  { label: 'Corporate Travel',  href: '/corporate',      blue: false },
  { label: 'Deals & Offers',    href: '/deals',          blue: true  },
  { label: 'Partner Program',   href: '/partners',       blue: true  },
  { label: 'Host Agencies',     href: '/host-agencies',  blue: true  },
  { label: 'Become a Partner',  href: '/partner',        blue: false },
  { label: 'Gift Vouchers',     href: '/gift-vouchers',  blue: false },
]

/* Payment icon data — bg / text colour */
const PAYMENTS: { label: string; bg: string; color: string }[] = [
  { label: 'VISA',      bg: '#1a1f71', color: '#fff'    },
  { label: 'MC',        bg: '#eb001b', color: '#fff'    },
  { label: 'AMEX',      bg: '#007bc1', color: '#fff'    },
  { label: 'JCB',       bg: '#003087', color: '#fff'    },
  { label: 'UnionPay',  bg: '#c0392b', color: '#fff'    },
  { label: 'Discover',  bg: '#ff6600', color: '#fff'    },
  { label: 'PromptPay', bg: '#4b2d80', color: '#fff'    },
  { label: 'TrueMoney', bg: '#f37021', color: '#fff'    },
  { label: 'G Pay',     bg: '#fff',    color: '#5f6368' },
  { label: 'PayPal',    bg: '#003087', color: '#fff'    },
]


/* Social icon wrapper */
function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
      style={{ backgroundColor: '#596578' }}
    >
      {children}
    </a>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="text-gray-700 dark:text-gray-300 bg-[#f5f6f8] dark:bg-gray-900">

      {/* ══ Main 4-column grid ══ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1: Contact us ── */}
          <div>
            <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-4">Contact us</p>
            <ul className="space-y-2.5 mb-6">
              {CONTACT_LINKS.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-[#1677ff] hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <Social href="https://facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-current">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </Social>
              {/* Instagram */}
              <Social href="https://instagram.com" label="Instagram">
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-none stroke-current stroke-[1.8]">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="white"/>
                </svg>
              </Social>
              {/* X / Twitter */}
              <Social href="https://x.com" label="X">
                <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Social>
              {/* YouTube */}
              <Social href="https://youtube.com" label="YouTube">
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-current">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </Social>
            </div>
          </div>

          {/* ── Col 2: About ── */}
          <div>
            <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-4">About</p>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map(l => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={`text-[13px] hover:underline ${l.blue ? 'text-[#1677ff]' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Other services ── */}
          <div>
            <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-4">Other services</p>
            <ul className="space-y-2.5">
              {OTHER_LINKS.map(l => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={`text-[13px] hover:underline ${l.blue ? 'text-[#1677ff]' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Payment methods + Our partners ── */}
          <div>
            <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-4">Payment methods</p>
            <div className="grid grid-cols-5 gap-1.5 mb-6">
              {PAYMENTS.map(p => (
                <span
                  key={p.label}
                  className="flex items-center justify-center h-7 rounded text-[9px] font-bold border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  {p.label}
                </span>
              ))}
            </div>

            <p className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-3">Our partners</p>
            <div className="flex items-center gap-4">
              {/* Google text logo */}
              <span className="text-[18px] font-medium tracking-tight" style={{ fontFamily: 'sans-serif' }}>
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
              </span>
              {/* Tripadvisor */}
              <span className="flex items-center gap-1">
                <span className="text-[18px]">🦉</span>
                <span className="text-[13px] font-semibold text-[#00aa6c]">Tripadvisor</span>
              </span>
            </div>
          </div>

        </div>
      </div>


      {/* ══ Bottom copyright ══ */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="py-4 text-center">
          <p className="text-[12px] text-gray-500 dark:text-gray-400">
            Copyright © {new Date().getFullYear()} Werest Travel Co., Ltd. All rights reserved.
          </p>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
            Service Operator: <span className="text-[#1677ff]">Werest Travel Co., Ltd.</span>
          </p>
        </div>
      </div>

    </footer>
  )
}
