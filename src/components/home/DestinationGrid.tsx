import Image from 'next/image'
import Link from 'next/link'

const destinations = [
  { city: 'Bangkok',     image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80', tours: 4, transfers: true },
  { city: 'Phuket',      image: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=600&q=80', tours: 2, transfers: true },
  { city: 'Chiang Mai',  image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', tours: 2, transfers: true },
  { city: 'Krabi',       image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80', tours: 2, transfers: true },
  { city: 'Pattaya',     image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', tours: 2, transfers: true },
  { city: 'Chiang Rai',  image: 'https://images.unsplash.com/photo-1612977958850-34cbbfe0d8a2?w=600&q=80', tours: 2, transfers: false },
]

export default function DestinationGrid() {
  return (
    <section aria-labelledby="dest-grid-heading" className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="dest-grid-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center">
          Explore Thailand&apos;s Most Beautiful Destinations
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">Handpicked cities — click to explore tours &amp; transfers</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.city}
              href={`/tours?destination=${encodeURIComponent(dest.city)}`}
              className="relative group rounded-2xl overflow-hidden h-52 block"
            >
              {/* Image */}
              <Image
                src={dest.image}
                alt={dest.city}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-xl leading-tight">{dest.city}</h3>
                <p className="text-white/75 text-sm mt-0.5">
                  {dest.tours} tours{dest.transfers ? ' · Private transfers' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
