import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['koh-kood']

export const metadata: Metadata = {
  title: `Private Transfers to Koh Kood, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers to Koh Kood — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KohKoodPage() {
  return <DestinationCityPage city={city} />
}
