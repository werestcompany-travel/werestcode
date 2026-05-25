import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['bangkok']

export const metadata: Metadata = {
  title: `Private Transfers in Bangkok, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Bangkok — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function BangkokPage() {
  return <DestinationCityPage city={city} />
}
