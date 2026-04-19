import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedService {
  title: string
  href: string
  description?: string
}

interface RelatedServicesProps {
  services: RelatedService[]
}

export default function RelatedServices({ services }: RelatedServicesProps) {
  if (!services || services.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Related Services</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service, index) => (
          <Link
            key={index}
            href={service.href}
            className="group flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-[#2534ff] transition-colors leading-snug">
                {service.title}
              </p>
              {service.description && (
                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2534ff] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  )
}
