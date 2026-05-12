'use client';

import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

export default function StarRating({ value, onChange, size = 'md' }: Props) {
  const cls = sizes[size];
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange(n) : undefined}
          className={interactive ? 'focus:outline-none' : 'cursor-default'}
          aria-label={interactive ? `Rate ${n} stars` : undefined}
        >
          <Star
            className={`${cls} transition-colors ${
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
            } ${interactive ? 'hover:fill-amber-300 hover:text-amber-300' : ''}`}
          />
        </button>
      ))}
    </div>
  );
}
