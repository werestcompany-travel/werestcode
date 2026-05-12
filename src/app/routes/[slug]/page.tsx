import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ALL_ROUTES, getTransferRoute } from '@/lib/routes';

const SITE_URL = 'https://www.werest.com';

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ALL_ROUTES.map(r => ({ slug: r.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const route = getTransferRoute(params.slug);
  if (!route) return { title: 'Route Not Found' };
  const title = `Private Transfer ${route.from} to ${route.to} | From ฿${route.priceFromTHB.toLocaleString()} | Werest Travel`;
  const description = `Book a private transfer from ${route.fromFull} to ${route.toFull}. ${route.distanceKm} km · ~${Math.round(route.durationMin / 60 * 10) / 10}h drive. Fixed price from ฿${route.priceFromTHB.toLocaleString()}.`;
  const canonical = `${SITE_URL}/routes/${route.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${route.from} → ${route.to} Private Transfer`,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// ─── Related routes helper ────────────────────────────────────────────────────

function getRelatedRoutes(currentSlug: string, from: string, to: string) {
  // Find routes sharing the same from or to city, excluding current
  const related = ALL_ROUTES.filter(
    r =>
      r.slug !== currentSlug &&
      (r.from.toLowerCase().includes(from.split(' ')[0].toLowerCase()) ||
        r.to.toLowerCase().includes(to.split(' ')[0].toLowerCase()) ||
        r.from.toLowerCase().includes(to.split(' ')[0].toLowerCase()) ||
        r.to.toLowerCase().includes(from.split(' ')[0].toLowerCase())),
  ).slice(0, 3);

  // If we don't have 3, fill from ALL_ROUTES
  if (related.length < 3) {
    const extra = ALL_ROUTES.filter(
      r => r.slug !== currentSlug && !related.find(x => x.slug === r.slug),
    ).slice(0, 3 - related.length);
    return [...related, ...extra];
  }
  return related;
}

// ─── Duration helper ──────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RouteSlugPage({ params }: { params: { slug: string } }) {
  const route = getTransferRoute(params.slug);
  if (!route) notFound();

  const relatedRoutes = getRelatedRoutes(route.slug, route.from, route.to);
  const duration = formatDuration(route.durationMin);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Private Transfer ${route.from} to ${route.to}`,
    serviceType: 'Private Car Transfer',
    areaServed: [route.from, route.to],
    offers: {
      '@type': 'Offer',
      price: route.priceFromTHB,
      priceCurrency: 'THB',
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Werest Travel',
      url: 'https://www.werest.com',
    },
    mainEntityOfPage: {
      '@type': 'FAQPage',
      mainEntity: route.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-[#2534ff] pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-white/60 text-sm mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/results" className="hover:text-white transition-colors">Transfers</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{route.from} to {route.to}</span>
            </nav>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Private Transfer: {route.from} &rarr; {route.to}
            </h1>
            <p className="text-white/75 text-lg mb-8">
              {route.fromFull} to {route.toFull}
            </p>

            {/* Distance + Duration badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {route.distanceKm} km
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                ~{duration} drive
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                1–10 passengers
              </span>
            </div>

            {/* CTA button */}
            <Link
              href={`/booking?pickup=${encodeURIComponent(route.fromFull)}&dropoff=${encodeURIComponent(route.toFull)}`}
              className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-base shadow-lg"
            >
              Book from ฿{route.priceFromTHB.toLocaleString()}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

          {/* ── Route info cards ─────────────────────────────────────────────── */}
          <section aria-labelledby="route-info-heading">
            <h2 id="route-info-heading" className="text-xl font-extrabold text-gray-900 mb-6">Route information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Distance */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#2534ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{route.distanceKm} km</p>
                <p className="text-sm text-gray-500 mt-1">Total distance</p>
              </div>
              {/* Duration */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#2534ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">~{duration}</p>
                <p className="text-sm text-gray-500 mt-1">Driving time</p>
              </div>
              {/* Vehicle types */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#2534ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <p className="text-base font-bold text-gray-900">Sedan · SUV · Minivan</p>
                <p className="text-sm text-gray-500 mt-1">Vehicle types available</p>
              </div>
            </div>
          </section>

          {/* ── Highlights ───────────────────────────────────────────────────── */}
          <section aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="text-xl font-extrabold text-gray-900 mb-5">Route highlights</h2>
            <ul className="space-y-3">
              {route.highlights.map(h => (
                <li key={h} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{h}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Popular for ──────────────────────────────────────────────────── */}
          <section aria-labelledby="popular-for-heading">
            <h2 id="popular-for-heading" className="text-xl font-extrabold text-gray-900 mb-4">Popular for</h2>
            <div className="flex flex-wrap gap-3">
              {route.popularFor.map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-blue-50 text-[#2534ff] text-sm font-semibold rounded-full border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* ── FAQ accordion ────────────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-extrabold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {route.faqs.map(faq => (
                <details
                  key={faq.q}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-[#2534ff] transition-colors select-none">
                    {faq.q}
                    <svg
                      className="w-5 h-5 shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ── Related routes ───────────────────────────────────────────────── */}
          {relatedRoutes.length > 0 && (
            <section aria-labelledby="related-routes-heading">
              <h2 id="related-routes-heading" className="text-xl font-extrabold text-gray-900 mb-6">
                Related routes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedRoutes.map(r => (
                  <Link
                    key={r.slug}
                    href={`/routes/${r.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 text-[#2534ff] font-bold text-base mb-2 group-hover:underline">
                      {r.from}
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {r.to}
                    </div>
                    <p className="text-sm text-gray-500">
                      {r.distanceKm} km &middot; ~{formatDuration(r.durationMin)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      From ฿{r.priceFromTHB.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── CTA banner ───────────────────────────────────────────────────── */}
          <section className="bg-[#2534ff] rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to book?</h2>
            <p className="text-white/75 text-base mb-8 max-w-lg mx-auto">
              Fixed price &middot; No hidden fees &middot; Free cancellation up to 24 h before pickup
            </p>
            <Link
              href={`/booking?pickup=${encodeURIComponent(route.fromFull)}&dropoff=${encodeURIComponent(route.toFull)}`}
              className="inline-flex items-center gap-2 bg-white text-[#2534ff] font-bold px-10 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-base shadow-lg"
            >
              Book your transfer — from ฿{route.priceFromTHB.toLocaleString()}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
