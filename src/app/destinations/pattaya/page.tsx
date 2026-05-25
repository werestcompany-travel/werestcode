import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['pattaya']

export const metadata: Metadata = {
  title: `Private Transfers in Pattaya, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Pattaya — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function PattayaPage() {
  return <DestinationCityPage city={city} />
}
