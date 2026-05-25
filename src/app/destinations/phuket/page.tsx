import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['phuket']

export const metadata: Metadata = {
  title: `Private Transfers in Phuket, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Phuket — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function PhuketPage() {
  return <DestinationCityPage city={city} />
}
