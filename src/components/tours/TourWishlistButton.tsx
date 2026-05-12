'use client'

import { useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWishlist } from '@/context/WishlistContext'

interface TourWishlistButtonProps {
  slug:  string
  title: string
}

export default function TourWishlistButton({ slug, title }: TourWishlistButtonProps) {
  const wishlistId = `tour:${slug}`
  const { isWishlisted, toggle, loaded } = useWishlist()
  const [busy, setBusy] = useState(false)

  const saved = loaded && isWishlisted(wishlistId)

  const handleClick = async () => {
    if (busy) return
    setBusy(true)
    const result = await toggle({
      itemId:   wishlistId,
      itemName: title,
      itemUrl:  `/tours/${slug}`,
      itemType: 'tour',
    })
    setBusy(false)
    if (result === 'added') {
      toast.success('Saved to wishlist!')
    } else if (result === 'removed') {
      toast('Removed from wishlist', { icon: '💔' })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors disabled:opacity-60"
    >
      {busy
        ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        : <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      }
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
