import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['krabi']

export const metadata: Metadata = {
  title: `Private Transfers in Krabi, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Krabi — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KrabiPage() {
  return <DestinationCityPage city={city} />
}
