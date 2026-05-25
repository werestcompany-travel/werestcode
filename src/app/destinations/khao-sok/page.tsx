import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['khao-sok']

export const metadata: Metadata = {
  title: `Private Transfers to Khao Sok National Park, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Transfers to Khao Sok — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function KhaoSokPage() {
  return <DestinationCityPage city={city} />
}
