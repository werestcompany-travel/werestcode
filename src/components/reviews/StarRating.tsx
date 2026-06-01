'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

export default function StarRating({ value, onChange, readonly, size = 'md' }: Props) {
  const [hover, setHover] = useState(0);
  const cls = sizes[size];
  const interactive = !!onChange && !readonly;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : 'button'}
          onClick={interactive ? () => onChange!(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          className={interactive ? 'focus:ring-2 focus:ring-[#2534ff] rounded' : 'cursor-default pointer-events-none'}
          aria-label={interactive ? `Rate ${n} out of 5 stars` : undefined}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            className={`${cls} transition-colors ${
              n <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
