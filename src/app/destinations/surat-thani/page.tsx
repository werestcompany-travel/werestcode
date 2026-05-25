import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['surat-thani']

export const metadata: Metadata = {
  title: `Private Transfers in Surat Thani, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Surat Thani — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function SuratThaniPage() {
  return <DestinationCityPage city={city} />
}
