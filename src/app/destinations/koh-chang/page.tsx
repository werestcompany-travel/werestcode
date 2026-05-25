import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['koh-chang']

export const metadata: Metadata = {
  title: `Private Transfers to Koh Chang, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers to Koh Chang — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KohChangPage() {
  return <DestinationCityPage city={city} />
}
