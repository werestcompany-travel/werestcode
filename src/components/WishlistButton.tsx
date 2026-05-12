'use client';

import { Heart } from 'lucide-react';
import { useWishlist, type WishlistTogglePayload } from '@/context/WishlistContext';

interface WishlistButtonProps extends WishlistTogglePayload {
  /** Additional Tailwind classes (e.g. positioning) */
  className?: string;
  /** 'sm' = 28px  'md' = 36px */
  size?: 'sm' | 'md';
  /** Variant: 'overlay' for dark/image bg, 'card' for white bg */
  variant?: 'overlay' | 'card';
}

export default function WishlistButton({
  itemId, itemName, itemUrl, itemType = 'attraction', itemImage,
  className = '',
  size    = 'sm',
  variant = 'overlay',
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(itemId);

  const dim   = size === 'sm' ? 'w-7 h-7'    : 'w-9 h-9';
  const icon  = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';

  const bg = wishlisted
    ? 'bg-red-500 hover:bg-red-600 shadow'
    : variant === 'overlay'
      ? 'bg-white/25 hover:bg-white/45 backdrop-blur-sm'
      : 'bg-gray-100 hover:bg-gray-200';

  const iconColor = wishlisted
    ? 'fill-white text-white'
    : variant === 'overlay'
      ? 'text-white'
      : 'text-gray-400';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ itemId, itemName, itemUrl, itemType, itemImage });
      }}
      className={`${dim} rounded-full flex items-center justify-center transition-all duration-200 ${bg} ${className}`}
      aria-label={wishlisted ? `Remove ${itemName} from wishlist` : `Save ${itemName} to wishlist`}
      aria-pressed={wishlisted}
    >
      <Heart className={`${icon} transition-all duration-200 ${iconColor} ${wishlisted ? 'scale-110' : ''}`} />
    </button>
  );
}
