import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['koh-larn']

export const metadata: Metadata = {
  title: `Private Transfers to Koh Larn (Coral Island), Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers to Koh Larn — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KohLarnPage() {
  return <DestinationCityPage city={city} />
}
