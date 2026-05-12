// TODO: Update these links to your actual business profiles

const LOGOS = [
  {
    icon: '🦉',
    name: 'Listed on TripAdvisor',
    color: 'text-green-700',
    bg: 'bg-green-50',
    href: 'https://www.tripadvisor.com',
    tooltip: 'View our TripAdvisor profile',
  },
  {
    icon: 'G',
    name: 'Find us on Google',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    special: 'google',
    href: 'https://www.google.com/maps/search/Werest+Travel',
    tooltip: 'View us on Google Maps',
  },
  {
    icon: '🇹🇭',
    name: 'Thailand Tourism',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    href: 'https://www.tourismthailand.org',
    tooltip: 'Tourism Authority of Thailand',
  },
]

export default function TrustLogos() {
  return (
    <section aria-label="Trust endorsements" className="bg-gray-50 py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
          Trusted by travellers worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {LOGOS.map((l) => (
            <a
              key={l.name}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              title={l.tooltip}
              className="flex items-center gap-2.5 select-none hover:opacity-80 transition-opacity"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg ${l.bg} ${l.color}`}
              >
                {l.special === 'google' ? (
                  <span
                    className="font-black text-xl"
                    style={{
                      background: 'linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    G
                  </span>
                ) : (
                  l.icon
                )}
              </div>
              <span className={`text-sm font-semibold ${l.color}`}>{l.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
