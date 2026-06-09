'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/context/LocaleContext'

/* ── Column data — labelKey maps to i18n keys ─────────────────────────────── */

const COMPANY_LINKS = [
  { labelKey: 'footer.aboutWerest',     href: '/about'          },
  { labelKey: 'footer.travelBlog',      href: '/blog'           },
  { labelKey: 'footer.careers',         href: '/about'          },
  { labelKey: 'footer.corporateTravel', href: '/corporate'      },
  { labelKey: 'footer.partnerProgram',  href: '/partners'       },
  { labelKey: 'footer.hostAgencies',    href: '/host-agencies'  },
  { labelKey: 'footer.becomePartner',   href: '/partner'        },
]

const SERVICE_LINKS = [
  { labelKey: 'footer.privateTransfers', href: '/transfers'        },
  { labelKey: 'footer.airportTransfers', href: '/airport-transfers'},
  { labelKey: 'footer.toursExp',         href: '/tours'            },
  { labelKey: 'footer.groupBooking',     href: '/group-booking'    },
  { labelKey: 'footer.dealsOffers',      href: '/deals'            },
  { labelKey: 'footer.giftVouchers',     href: '/gift-vouchers'    },
  { labelKey: 'footer.charter',          href: '/charter'          },
]

const SUPPORT_LINKS = [
  { labelKey: 'footer.helpCenter',        href: '/help-center'         },
  { labelKey: 'footer.contactUs',         href: '/contact'             },
  { labelKey: 'footer.customerSupport',   href: '/inquiry'             },
  { labelKey: 'footer.trackBooking',      href: '/tracking'            },
  { labelKey: 'footer.cancellationPolicy',href: '/cancellation-policy' },
  { labelKey: 'footer.termsOfService',    href: '/terms-of-service'    },
  { labelKey: 'footer.privacyPolicy',     href: '/privacy-policy'      },
]

/* ── Social icon ─────────────────────────────────────────────────────────── */
function SocialBtn({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#2534ff] hover:text-white text-gray-500 flex items-center justify-center transition-colors duration-200"
    >
      {children}
    </a>
  )
}

/* ── Payment badge ───────────────────────────────────────────────────────── */
const PAYMENT_LOGOS = [
  { src: '/payments/visa.svg',       alt: 'Visa',        w: 52, h: 33 },
  { src: '/payments/mastercard.svg', alt: 'Mastercard',  w: 52, h: 33 },
  { src: '/payments/amex.svg',       alt: 'Amex',        w: 52, h: 33 },
  { src: '/payments/jcb.svg',        alt: 'JCB',         w: 52, h: 33 },
  { src: '/payments/promptpay.svg',  alt: 'PromptPay',   w: 72, h: 33 },
  { src: '/payments/truemoney.svg',  alt: 'TrueMoney',   w: 72, h: 33 },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PayBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 h-7 rounded text-[9px] font-bold border border-gray-200"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-700">

      {/* ══ Main 5-column section ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

          {/* ── Col 1: Logo + Contact ── */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image src="/images/logo.png" alt="Werest Travel" width={110} height={32} className="object-contain" />
            </Link>

            <ul className="space-y-3.5">
              {/* WhatsApp */}
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-500">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</p>
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`} className="text-[13px] text-gray-800 hover:text-[#2534ff] font-medium">{`+${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392').replace(/(\d{2})(\d{2})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}`}</a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-[#2534ff] stroke-2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 7 10-7"/>
                  </svg>
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                  <a href="mailto:support@werest.com" className="text-[13px] text-gray-800 hover:text-[#2534ff] font-medium">support@werest.com</a>
                </div>
              </li>

              {/* Line */}
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">LINE</p>
                  <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-800 hover:text-[#2534ff] font-medium">@weresttravel</a>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Col 2: Company ── */}
          <div>
            <p className="font-semibold text-[14px] text-gray-900 mb-4">{t('footer.company')}</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[13px] text-gray-500 hover:text-[#2534ff] transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Services ── */}
          <div>
            <p className="font-semibold text-[14px] text-gray-900 mb-4">{t('footer.services')}</p>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[13px] text-gray-500 hover:text-[#2534ff] transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Support ── */}
          <div>
            <p className="font-semibold text-[14px] text-gray-900 mb-4">{t('footer.support')}</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(l => (
                <li key={l.labelKey}>
                  <Link href={l.href} className="text-[13px] text-gray-500 hover:text-[#2534ff] transition-colors">
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 5: Get the app ── */}
          <div>
            <p className="font-semibold text-[14px] text-gray-900 mb-1">{t('footer.cheaperOnApp')}</p>
            <p className="text-[12px] text-gray-400 mb-4">{t('footer.appDeals')}</p>

            {/* App Store — coming soon */}
            <div
              title="App Store — coming soon"
              className="relative flex items-center gap-2.5 bg-black text-white rounded-xl px-4 py-2.5 mb-2.5 w-full max-w-[160px] opacity-60 cursor-not-allowed select-none"
              aria-label="App Store — coming soon"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
              </svg>
              <div>
                <p className="text-[9px] leading-none text-gray-300 mb-0.5">Download on the</p>
                <p className="text-[13px] font-semibold leading-none">App Store</p>
              </div>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-[8px] font-bold text-amber-900 px-1.5 py-0.5 rounded-full uppercase">Soon</span>
            </div>

            {/* Google Play — coming soon */}
            <div
              title="Google Play — coming soon"
              className="relative flex items-center gap-2.5 bg-black text-white rounded-xl px-4 py-2.5 w-full max-w-[160px] opacity-60 cursor-not-allowed select-none"
              aria-label="Google Play — coming soon"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
                <path d="M3.18 23.77c.3.17.65.2.98.07l11.46-6.62-2.5-2.5-9.94 9.05z" fill="#EA4335"/>
                <path d="M21.54 10.27L19.1 8.9l-2.82 2.82 2.82 2.83 2.47-1.43c.7-.41.7-1.44-.03-1.85z" fill="#FBBC04"/>
                <path d="M2.2.25C1.88.43 1.67.77 1.67 1.2v21.6c0 .43.2.77.53.95l11.97-11.97L2.2.25z" fill="#4285F4"/>
                <path d="M13.17 12L4.18.25 3.18.77 13.62 11.2l-.45.8z" fill="#34A853"/>
              </svg>
              <div>
                <p className="text-[9px] leading-none text-gray-300 mb-0.5">GET IT ON</p>
                <p className="text-[13px] font-semibold leading-none">Google Play</p>
              </div>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-[8px] font-bold text-amber-900 px-1.5 py-0.5 rounded-full uppercase">Soon</span>
            </div>
          </div>

        </div>
      </div>

      {/* ══ Middle strip: payment • awards • social ══ */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center gap-y-5 gap-x-10 lg:gap-0 lg:justify-between">

            {/* Secure payment */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('footer.secureTransaction')}</p>
              <div className="flex flex-wrap items-center gap-2">
                {PAYMENT_LOGOS.map((p) => (
                  <div
                    key={p.alt}
                    className="bg-white rounded-md border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden"
                    style={{ width: p.w, height: p.h }}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={p.w}
                      height={p.h}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Awards / partners */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('footer.trustedBy')}</p>
              <div className="flex items-center gap-3">
                {/* Google */}
                <span className="text-[17px] font-medium tracking-tight" style={{ fontFamily: 'sans-serif' }}>
                  <span style={{ color: '#4285F4' }}>G</span>
                  <span style={{ color: '#EA4335' }}>o</span>
                  <span style={{ color: '#FBBC05' }}>o</span>
                  <span style={{ color: '#4285F4' }}>g</span>
                  <span style={{ color: '#34A853' }}>l</span>
                  <span style={{ color: '#EA4335' }}>e</span>
                </span>
                {/* Tripadvisor */}
                <span className="flex items-center gap-1">
                  <span className="text-[17px]">🦉</span>
                  <span className="text-[12px] font-semibold text-[#00aa6c]">Tripadvisor</span>
                </span>
                {/* TAT */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-gray-200 rounded text-[10px] font-bold text-gray-600">
                  TAT Licensed
                </span>
              </div>
            </div>

            {/* Follow us */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('footer.followUs')}</p>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <SocialBtn href="https://facebook.com" label="Facebook">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </SocialBtn>
                {/* X / Twitter */}
                <SocialBtn href="https://x.com" label="X">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </SocialBtn>
                {/* Instagram */}
                <SocialBtn href="https://instagram.com" label="Instagram">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.8]">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </SocialBtn>
                {/* YouTube */}
                <SocialBtn href="https://youtube.com" label="YouTube">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                  </svg>
                </SocialBtn>
                {/* TikTok */}
                <SocialBtn href="https://tiktok.com" label="TikTok">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/>
                  </svg>
                </SocialBtn>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══ Copyright bar ══ */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-[12px] text-gray-400">
            © {new Date().getFullYear()} Werest Travel Co., Ltd. All rights reserved.
          </p>
          <p className="text-[12px] text-gray-400">
            Operated by <span className="text-[#2534ff] font-medium">Werest Travel Co., Ltd.</span> · Thailand
          </p>
        </div>
      </div>

    </footer>
  )
}
