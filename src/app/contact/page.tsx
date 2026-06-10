/**
 * metadata for this page (cannot export from 'use client'):
 * title: 'Contact Us | Werest Travel'
 * description: 'Get in touch with Werest Travel via WhatsApp, email, or LINE. Support available 7:00–22:00 ICT, 7 days a week.'
 * alternates: { canonical: 'https://gowerest.com/contact' }
 */
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  MessageCircle,
  Mail,
  Phone,
  Copy,
  Check,
  ChevronRight,
  Clock,
  Zap,
  Send,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  topic: string
  name: string
  email: string
  phone: string
  bookingRef: string
  message: string
}

interface FormErrors {
  topic?: string
  name?: string
  email?: string
  message?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOPICS = [
  'Booking Enquiry',
  'Transfer Question',
  'Tour Question',
  'Cancellation / Refund',
  'Payment Issue',
  'Driver Feedback',
  'Partnership / Corporate',
  'Other',
]

const FAQ_LINKS = [
  'How do I cancel my booking?',
  'What is the free cancellation policy?',
  'How do I track my driver?',
  'When will I receive my refund?',
  'What vehicles are available?',
]

const INITIAL_FORM: FormData = {
  topic: '',
  name: '',
  email: '',
  phone: '',
  bookingRef: '',
  message: '',
}

// ---------------------------------------------------------------------------
// LINE Icon (simple inline SVG)
// ---------------------------------------------------------------------------

function LineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="#06C755" />
      <path
        d="M39.5 22.3C39.5 14.8 31.9 8.7 24 8.7C16.1 8.7 8.5 14.8 8.5 22.3C8.5 29 14.7 34.6 23 35.6C23.6 35.7 24.4 36 24.6 36.5C24.8 36.9 24.7 37.6 24.6 38C24.6 38 24.3 39.7 24.2 40.1C24.1 40.5 23.8 41.5 24 41.9C24.2 42.3 25 41.9 25 41.9C29.9 39.4 34.2 35.7 37 31.2C38.6 28.8 39.5 25.6 39.5 22.3Z"
        fill="white"
      />
      <path
        d="M21.1 19.2H19.7C19.5 19.2 19.3 19.4 19.3 19.6V27.1C19.3 27.3 19.5 27.5 19.7 27.5H21.1C21.3 27.5 21.5 27.3 21.5 27.1V19.6C21.5 19.4 21.3 19.2 21.1 19.2Z"
        fill="#06C755"
      />
      <path
        d="M28.7 19.2H27.3C27.1 19.2 26.9 19.4 26.9 19.6V23.8L23.8 19.4C23.8 19.3 23.7 19.3 23.6 19.2H22.1C21.9 19.2 21.7 19.4 21.7 19.6V27.1C21.7 27.3 21.9 27.5 22.1 27.5H23.5C23.7 27.5 23.9 27.3 23.9 27.1V22.9L27 27.3C27.1 27.4 27.2 27.5 27.3 27.5H28.7C28.9 27.5 29.1 27.3 29.1 27.1V19.6C29.1 19.4 28.9 19.2 28.7 19.2Z"
        fill="#06C755"
      />
      <path
        d="M18.1 25.3H15.3V19.6C15.3 19.4 15.1 19.2 14.9 19.2H13.5C13.3 19.2 13.1 19.4 13.1 19.6V27.1C13.1 27.2 13.1 27.3 13.2 27.4C13.3 27.5 13.4 27.5 13.5 27.5H18.1C18.3 27.5 18.5 27.3 18.5 27.1V25.7C18.5 25.5 18.3 25.3 18.1 25.3Z"
        fill="#06C755"
      />
      <path
        d="M35.6 21.6C35.8 21.6 36 21.4 36 21.2V19.8C36 19.6 35.8 19.4 35.6 19.4H31C30.9 19.4 30.8 19.4 30.7 19.5C30.6 19.6 30.6 19.7 30.6 19.8V27.3C30.6 27.4 30.6 27.5 30.7 27.6C30.8 27.7 30.9 27.7 31 27.7H35.6C35.8 27.7 36 27.5 36 27.3V25.9C36 25.7 35.8 25.5 35.6 25.5H32.8V24.4H35.6C35.8 24.4 36 24.2 36 24V22.6C36 22.4 35.8 22.2 35.6 22.2H32.8V21.6H35.6Z"
        fill="#06C755"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ContactPage() {
  // ── state ──────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  // ── handlers ───────────────────────────────────────────────────────────
  function handleCopy() {
    navigator.clipboard.writeText('hello@gowerest.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!formData.topic) newErrors.topic = 'Please select a topic.'
    if (!formData.name.trim()) newErrors.name = 'Full name is required.'
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    try {
      const subject = formData.bookingRef
        ? `[${formData.topic}] — Ref: ${formData.bookingRef}`
        : `[${formData.topic}]`
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    formData.name,
          email:   formData.email,
          subject,
          message: formData.phone
            ? `Phone: ${formData.phone}\n\n${formData.message}`
            : formData.message,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrors({ message: data.error ?? 'Something went wrong. Please try again.' })
        return
      }
      setSubmitted(true)
    } catch {
      setErrors({ message: 'Network error. Please try again or contact us via WhatsApp.' })
    }
  }

  // ── shared input class ─────────────────────────────────────────────────
  const inputCls =
    'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2534ff] focus:border-transparent transition'

  const errorCls = 'mt-1 text-xs text-red-600'

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar transparent />

      <main className="min-h-screen bg-white">

        {/* ══════════════════════════════════════════════════
            1. Hero / Header
        ══════════════════════════════════════════════════ */}
        <section className="bg-gray-50 pt-28 pb-10 px-4 text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-[#2534ff] uppercase mb-3">
            Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            We&apos;re just a click away
          </h1>
          <p className="text-gray-500 text-[15px] max-w-md mx-auto">
            Our team is available <strong className="text-gray-700">7:00–22:00 ICT</strong>, 7 days a week
          </p>
        </section>

        {/* ══════════════════════════════════════════════════
            2. Main Contact Channels (3 cards)
        ══════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1 — WhatsApp (primary, blue border) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#2534ff] bg-white shadow-sm p-6">
              {/* FASTEST badge */}
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5" />
                Fastest
              </span>

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-1">Chat on WhatsApp</h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Fastest response — usually within 5 minutes
              </p>

              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '66621871392'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp Chat
              </a>

              <p className="mt-3 text-center text-xs text-gray-400">
                Available 24/7 for urgent transfers
              </p>
            </div>

            {/* Card 2 — Email */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#2534ff]" />
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-1">Send an Email</h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                We&apos;ll reply within 2 hours during business hours
              </p>

              {/* Email + copy button */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-4">
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                  hello@gowerest.com
                </span>
                <button
                  onClick={handleCopy}
                  aria-label="Copy email address"
                  className="shrink-0 text-gray-400 hover:text-[#2534ff] transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 font-medium -mt-2 mb-3 text-center">
                  Copied!
                </p>
              )}

              <a
                href="mailto:hello@gowerest.com"
                className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a26cc] active:bg-[#1220b0] text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Compose Email
              </a>
            </div>

            {/* Card 3 — LINE */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="w-12 h-12 mb-4">
                <LineIcon className="w-12 h-12" />
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-1">LINE Official</h2>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-3">
                <span className="flex-1 text-sm font-medium text-gray-800">@werest</span>
              </div>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Add us on LINE for ongoing support
              </p>

              <a
                href="https://line.me/R/ti/p/@werest"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04b] active:bg-[#04963f] text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <LineIcon className="w-4 h-4" />
                Add on LINE
              </a>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            3. Send a Message Form
        ══════════════════════════════════════════════════ */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
            Send us a message
          </h2>

          <div className="shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-8 bg-white">
            {submitted ? (
              /* ── Success state ── */
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-500 text-sm">
                  We&apos;ll reply to{' '}
                  <span className="font-semibold text-gray-800">{formData.email}</span>{' '}
                  within 2 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData(INITIAL_FORM) }}
                  className="mt-6 text-sm text-[#2534ff] font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Topic */}
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className={`${inputCls} ${errors.topic ? 'border-red-400 focus:ring-red-400' : ''}`}
                  >
                    <option value="">Select a topic...</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.topic && <p className={errorCls}>{errors.topic}</p>}
                </div>

                {/* Full Name + Email (2-col on sm+) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`${inputCls} ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {errors.name && <p className={errorCls}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`${inputCls} ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {errors.email && <p className={errorCls}>{errors.email}</p>}
                  </div>
                </div>

                {/* Phone + Booking Ref (2-col on sm+) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number{' '}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+66 80 000 0000"
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bookingRef" className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Reference{' '}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="bookingRef"
                      name="bookingRef"
                      type="text"
                      value={formData.bookingRef}
                      onChange={handleChange}
                      placeholder="e.g. WRTF-12345"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className={`${inputCls} resize-none ${errors.message ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {errors.message && <p className={errorCls}>{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2534ff] hover:bg-[#1a26cc] active:bg-[#1220b0] text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>

              </form>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            4. Response Time Section
        ══════════════════════════════════════════════════ */}
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 text-center mb-8">
              How quickly we respond
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">WhatsApp</p>
                <p className="text-2xl font-extrabold text-gray-900 mb-1">Under 5 min</p>
                <p className="text-xs text-gray-500">For urgent transfers</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-[#2534ff]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Email</p>
                <p className="text-2xl font-extrabold text-gray-900 mb-1">Within 2 hours</p>
                <p className="text-xs text-gray-500">During business hours</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Business Hours</p>
                <p className="text-2xl font-extrabold text-gray-900 mb-1">7:00 – 22:00</p>
                <p className="text-xs text-gray-500">ICT, 7 days a week</p>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            5. Popular Questions
        ══════════════════════════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
            Common questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FAQ_LINKS.map((question) => (
              <Link
                key={question}
                href="/help-center#faq"
                className="group flex items-center justify-between gap-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#2534ff]/30 rounded-xl px-5 py-4 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 group-hover:text-[#2534ff] transition-colors">
                  {question}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#2534ff] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
