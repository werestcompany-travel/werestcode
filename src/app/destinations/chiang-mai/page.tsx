import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['chiang-mai']

export const metadata: Metadata = {
  title: `Private Transfers in Chiang Mai, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Chiang Mai — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function ChiangMaiPage() {
  return <DestinationCityPage city={city} />
}
