'use client'

import toast from 'react-hot-toast'
import { useWishlist } from '@/context/WishlistContext'
import TourCard from '@/components/tours/TourCard'
import { type Tour } from '@/lib/tours'

interface TourGridProps {
  tours: Tour[]
}

export default function TourGrid({ tours }: TourGridProps) {
  const { isWishlisted, toggle } = useWishlist()

  const handleWishlistToggle = async (tour: Tour) => {
    const result = await toggle({
      itemId:    `tour:${tour.slug}`,
      itemName:  tour.title,
      itemUrl:   `/tours/${tour.slug}`,
      itemType:  'tour',
      itemImage: tour.images?.[0],
    })
    if (result === 'added') {
      toast.success('Saved to wishlist!')
    } else if (result === 'removed') {
      toast('Removed from wishlist', { icon: '💔' })
    }
  }

  return (
    <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {tours.map(tour => (
        <TourCard
          key={tour.slug}
          tour={tour}
          wishlisted={isWishlisted(`tour:${tour.slug}`)}
          onWishlistToggle={() => handleWishlistToggle(tour)}
        />
      ))}
    </div>
  )
}
