import type { Metadata } from 'next'
import { CITY_CONFIGS } from '@/lib/destination-cities'
import DestinationCityPage from '@/components/destinations/DestinationCityPage'

const city = CITY_CONFIGS['phang-nga']

export const metadata: Metadata = {
  title: `Private Transfers in Phang-Nga, Thailand — Werest Travel`,
  description: city.description,
  openGraph: { title: `Private Transfers in Phang-Nga — Werest Travel`, description: city.description, images: [{ url: city.heroImage }] },
}

export default function PhangNgaPage() {
  return <DestinationCityPage city={city} />
}
