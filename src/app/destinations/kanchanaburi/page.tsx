import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['kanchanaburi']

export const metadata: Metadata = {
  title: `Private Transfers in Kanchanaburi, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Kanchanaburi — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KanchanabaiPage() {
  return <DestinationCityPage city={city} />
}
