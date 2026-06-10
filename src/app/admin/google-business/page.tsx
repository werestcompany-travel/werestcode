'use client';

import AdminShell from '@/components/admin/AdminShell';
import { CheckCircle2, XCircle, ExternalLink, Globe, MapPin, Star } from 'lucide-react';

function EnvRow({ label, envKey, value }: { label: string; envKey: string; value: string | undefined }) {
  const set = Boolean(value);
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">{envKey}</p>
      </div>
      <div className="flex items-center gap-2">
        {set ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 font-semibold">Set</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-500 font-semibold">Missing</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleBusinessPage() {
  const placeId        = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
  const reviewUrl      = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL;
  const siteVerif      = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  const steps = [
    {
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      title: 'Claim / create Google Business Profile',
      desc: 'Go to business.google.com and claim or create your listing. Verify ownership via phone, postcard, or video.',
      link: { href: 'https://business.google.com', label: 'Open Google Business' },
    },
    {
      icon: <MapPin className="w-5 h-5 text-red-500" />,
      title: 'Find your Place ID',
      desc: 'Search for "Werest Travel" on Google Maps. Click Share → Embed a map. Copy the Place ID from the embed URL (starts with ChIJ…). Or use the Place ID Finder tool.',
      link: { href: 'https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder', label: 'Place ID Finder' },
    },
    {
      icon: <Star className="w-5 h-5 text-amber-500" />,
      title: 'Get your direct review link',
      desc: 'Search for your business on Google Maps. Click "Write a review" and copy the URL from your browser. Set it as NEXT_PUBLIC_GOOGLE_REVIEW_URL.',
    },
    {
      icon: <Globe className="w-5 h-5 text-green-500" />,
      title: 'Verify site ownership in Google Search Console',
      desc: 'Go to search.google.com/search-console. Add property https://gowerest.com. Copy the verification meta tag value and set it as NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION. Then submit your sitemap at /sitemap.xml.',
      link: { href: 'https://search.google.com/search-console', label: 'Open Search Console' },
    },
  ];

  return (
    <AdminShell title="Google Business Profile">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Env var status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Environment Variable Status</h2>
          <EnvRow label="Google Place ID"               envKey="GOOGLE_PLACE_ID"                        value={placeId} />
          <EnvRow label="Google Review URL (public)"    envKey="NEXT_PUBLIC_GOOGLE_REVIEW_URL"          value={reviewUrl} />
          <EnvRow label="Site Verification Token"       envKey="NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"  value={siteVerif} />
          <p className="text-xs text-gray-400 mt-4">
            Set these in your Vercel project settings under Environment Variables, then redeploy.
            <br />
            <span className="font-mono">GOOGLE_MAPS_SERVER_API_KEY</span> is also required for the Reviews API (server-side only, already used for other features).
          </p>
        </div>

        {/* Setup steps */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Setup Checklist</h2>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{step.desc}</p>
                  {step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2534ff] hover:underline"
                    >
                      {step.link.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What gets enabled */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-blue-900 mb-2">What gets enabled once configured</h3>
          <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Google Reviews Widget</strong> — displays live rating + 3 recent reviews on the homepage</li>
            <li><strong>Leave a Review buttons</strong> — shown on transfer and tour confirmation pages</li>
            <li><strong>Site verification meta tag</strong> — proves ownership to Google Search Console</li>
            <li><strong>Sitemap submission</strong> — submit <span className="font-mono">https://gowerest.com/sitemap.xml</span> in Search Console</li>
          </ul>
        </div>

      </div>
    </AdminShell>
  );
}
