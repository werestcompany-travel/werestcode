import Image from 'next/image'

// TODO: Replace with real Instagram API integration when INSTAGRAM_ACCESS_TOKEN is configured
const DEMO_POSTS = [
  { image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80', likes: 284, comments: 18 },
  { image: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400&q=80', likes: 431, comments: 32 },
  { image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80', likes: 516, comments: 47 },
  { image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80', likes: 328, comments: 24 },
  { image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&q=80', likes: 612, comments: 53 },
  { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', likes: 289, comments: 21 },
]

export default function SocialFeed() {
  return (
    <section aria-labelledby="social-heading" className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 id="social-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Travel Inspiration
          </h2>
          <p className="text-gray-400 text-sm">Inspiring moments from Thailand</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {DEMO_POSTS.map((post, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
              <Image
                src={post.image}
                alt={`Travel inspiration photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-sm font-bold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-sm font-bold">{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/weresttravel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 font-semibold text-sm px-6 py-3 rounded-full hover:border-brand-300 hover:text-brand-700 transition-colors shadow-sm"
          >
            {/* Instagram icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
            Follow us for more travel inspiration
          </a>
        </div>
      </div>
    </section>
  )
}
