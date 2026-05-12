'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search, MapPin, Star, Clock, ArrowRight, Ticket, BookOpen, Globe2 } from 'lucide-react'
import { formatTHB } from '@/lib/tours'

// ─── Review widgets ───────────────────────────────────────────────────────────

function TrustpilotWidget() {
  return (
    <a
      href="https://www.trustpilot.com/review/werest.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white border border-gray-200 hover:border-[#00b67a]/40 hover:shadow-md rounded-2xl px-5 py-3 transition-all group"
    >
      {/* Trustpilot logo mark */}
      <div className="flex items-center gap-1.5 shrink-0">
        <svg width="22" height="22" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <path fill="#00b67a" d="M128 0L157.6 92.8H256L180.2 150.3L209.8 243.1L128 185.6L46.2 243.1L75.8 150.3L0 92.8H98.4L128 0Z"/>
          <path fill="#005128" d="M183.8 168.1L180.2 150.3L128 185.6L183.8 168.1Z"/>
        </svg>
        <span className="text-[13px] font-extrabold text-gray-800 tracking-tight">Trustpilot</span>
      </div>

      <div className="flex flex-col items-start">
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-0.5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-5 h-5 bg-[#00b67a] flex items-center justify-center rounded-sm">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-white">
                <path d="M10 1l2.39 6.26H19l-5.35 4.14 2.04 6.27L10 14.27l-5.69 3.4 2.04-6.27L1 7.26h6.61L10 1z"/>
              </svg>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-gray-800">Excellent</span>
          <span className="text-[11px] text-gray-400">4.8 · 200+ reviews</span>
        </div>
      </div>
    </a>
  )
}

function TripAdvisorWidget() {
  return (
    <a
      href="https://www.tripadvisor.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white border border-gray-200 hover:border-[#34E0A1]/40 hover:shadow-md rounded-2xl px-5 py-3 transition-all group"
    >
      {/* Tripadvisor owl logo */}
      <div className="w-9 h-9 shrink-0">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#34E0A1"/>
          <ellipse cx="33" cy="52" rx="11" ry="11" fill="white"/>
          <ellipse cx="67" cy="52" rx="11" ry="11" fill="white"/>
          <circle cx="33" cy="52" r="6" fill="#222"/>
          <circle cx="67" cy="52" r="6" fill="#222"/>
          <circle cx="35" cy="50" r="2" fill="white"/>
          <circle cx="69" cy="50" r="2" fill="white"/>
          <path d="M24 38 Q50 20 76 38" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M38 67 Q50 75 62 67" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="flex flex-col items-start">
        <span className="text-[11px] font-bold text-gray-800 mb-0.5">Tripadvisor</span>
        {/* Bubble rating */}
        <div className="flex items-center gap-0.5 mb-0.5">
          {[1,2,3,4].map(i => (
            <svg key={i} viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-[#34E0A1]">
              <circle cx="10" cy="10" r="8"/>
            </svg>
          ))}
          <svg viewBox="0 0 20 20" className="w-3.5 h-3.5">
            <circle cx="10" cy="10" r="8" fill="#34E0A1" opacity="0.4"/>
          </svg>
        </div>
        <span className="text-[11px] text-gray-400">Travellers' Choice · 150+ reviews</span>
      </div>
    </a>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourResult {
  slug: string; title: string; subtitle: string; location: string
  image: string; rating: number; price: number; badge: string | null; category: string
}
interface AttractionResult {
  slug: string; title: string; location: string; category: string
  image: string | null; rating: number; price: number; badge: string | null; emoji: string
}
interface BlogResult {
  slug: string; title: string; excerpt: string; image: string | null
  category: string; date: string | null; readTime: number
}

type Tab = 'all' | 'tours' | 'attractions' | 'blog'

// ─── Inner page ───────────────────────────────────────────────────────────────

function SearchInner() {
  const params = useSearchParams()
  const router = useRouter()

  const [query,       setQuery]       = useState(params.get('q') ?? '')
  const [activeTab,   setActiveTab]   = useState<Tab>('all')
  const [loading,     setLoading]     = useState(false)
  const [tours,       setTours]       = useState<TourResult[]>([])
  const [attractions, setAttractions] = useState<AttractionResult[]>([])
  const [blog,        setBlog]        = useState<BlogResult[]>([])
  const [searched,    setSearched]    = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) return
    setLoading(true)
    setSearched(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      const data = await res.json()
      setTours(data.tours ?? [])
      setAttractions(data.attractions ?? [])
      setBlog(data.blog ?? [])
      router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [router])

  // Run search on mount if ?q= present
  useEffect(() => {
    const q = params.get('q')
    if (q) doSearch(q)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
  }

  const total = tours.length + attractions.length + blog.length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all',         label: 'All',         count: total },
    { id: 'tours',       label: 'Tours',       count: tours.length },
    { id: 'attractions', label: 'Attractions', count: attractions.length },
    { id: 'blog',        label: 'Blog',        count: blog.length },
  ]

  const showTours       = activeTab === 'all' || activeTab === 'tours'
  const showAttractions = activeTab === 'all' || activeTab === 'attractions'
  const showBlog        = activeTab === 'all' || activeTab === 'blog'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-16">

        {/* ── Search hero ── */}
        <div className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
              Find tours, attractions & more
            </h1>
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search destinations, tours, attractions…"
                autoFocus
                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none text-gray-900 text-base shadow-sm transition-all"
              />
              <button
                type="submit"
                disabled={loading || query.trim().length < 2}
                className="absolute right-2 top-2 bottom-2 px-5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm transition-colors"
              >
                {loading ? '…' : 'Search'}
              </button>
            </form>

            {/* Review trust badges */}
            {!searched && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <TrustpilotWidget />
                <div className="hidden sm:block w-px h-10 bg-gray-200" />
                <TripAdvisorWidget />
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm font-medium">Searching…</span>
            </div>
          )}

          {/* No results */}
          {!loading && searched && total === 0 && (
            <div className="text-center py-20">
              <Globe2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700 mb-2">No results for "{query}"</h2>
              <p className="text-gray-400 text-sm mb-6">Try a destination name, tour type, or attraction.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Bangkok', 'Phuket', 'Floating Market'].map(term => (
                  <button key={term} onClick={() => { setQuery(term); doSearch(term) }}
                    className="text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
                    Try "{term}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results with tabs */}
          {!loading && searched && total > 0 && (
            <>
              {/* Summary + tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{total}</span> results for <span className="font-semibold">"{query}"</span>
                </p>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {tabs.filter(t => t.id === 'all' || t.count > 0).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab.label} {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Tour results ── */}
              {showTours && tours.length > 0 && (
                <section className="mb-10">
                  {activeTab === 'all' && (
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Globe2 className="w-4 h-4" /> Tours
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tours.map(tour => (
                      <Link key={tour.slug} href={`/tours/${tour.slug}`}
                        className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all overflow-hidden group">
                        <div className="relative h-40">
                          {tour.image
                            ? <Image src={tour.image} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                            : <div className="w-full h-full bg-brand-100 flex items-center justify-center"><Globe2 className="w-8 h-8 text-brand-300" /></div>
                          }
                          {tour.badge && (
                            <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tour.badge}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{tour.location}</p>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{tour.title}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /><span className="font-semibold text-gray-700">{tour.rating}</span>
                            </div>
                            <span className="text-sm font-extrabold text-brand-600">{formatTHB(tour.price)}<span className="text-xs text-gray-400 font-normal">/person</span></span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {activeTab === 'all' && (
                    <div className="mt-4 text-center">
                      <button onClick={() => setActiveTab('tours')} className="text-sm font-semibold text-brand-600 hover:underline">
                        View all tour results →
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* ── Attraction results ── */}
              {showAttractions && attractions.length > 0 && (
                <section className="mb-10">
                  {activeTab === 'all' && (
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Ticket className="w-4 h-4" /> Attractions
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attractions.map(a => (
                      <Link key={a.slug} href={`/attractions/${a.slug}`}
                        className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all overflow-hidden group">
                        <div className="relative h-40 bg-gray-100">
                          {a.image
                            ? <Image src={a.image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                            : <div className="w-full h-full flex items-center justify-center text-4xl">{a.emoji}</div>
                          }
                          {a.badge && (
                            <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{a.badge}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</p>
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{a.title}</h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="font-semibold text-gray-700">{a.rating}</span>
                            </div>
                            <span className="text-sm font-extrabold text-brand-600">{formatTHB(a.price)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Blog results ── */}
              {showBlog && blog.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Blog
                    </h2>
                  )}
                  <div className="space-y-4">
                    {blog.map(post => (
                      <Link key={post.slug} href={`/blog/${post.slug}`}
                        className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all p-5 flex gap-4 group">
                        {post.image && (
                          <div className="relative w-28 h-20 shrink-0 rounded-xl overflow-hidden">
                            <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="120px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{post.category}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min read</span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600 transition-colors shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Empty state before first search */}
          {!loading && !searched && (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Start typing to search across tours, attractions and blog articles.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
