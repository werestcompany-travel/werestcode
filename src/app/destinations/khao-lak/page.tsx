import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['khao-lak']

export const metadata: Metadata = {
  title: `Private Transfers in Khao Lak, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Khao Lak — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KhaoLakPage() {
  return <DestinationCityPage city={city} />
}
