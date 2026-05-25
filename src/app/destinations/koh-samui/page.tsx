import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['koh-samui']

export const metadata: Metadata = {
  title: `Private Transfers in Koh Samui, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Koh Samui — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KohSamuiPage() {
  return <DestinationCityPage city={city} />
}
