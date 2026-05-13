'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function ToursHeroSearch() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');

  // Sync input value with URL param on mount / navigation
  useEffect(() => {
    const loc = searchParams.get('location') ?? searchParams.get('q') ?? '';
    setValue(loc);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) {
      p.set('location', trimmed);
    } else {
      p.delete('location');
    }
    p.delete('q');
    p.delete('page');
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center bg-white rounded-full shadow-xl w-full max-w-2xl overflow-hidden"
      style={{ height: 60 }}
    >
      <MapPin className="w-5 h-5 text-gray-400 ml-5 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Bangkok"
        aria-label="Search destination"
        className="flex-1 px-4 text-gray-800 text-base font-medium placeholder:text-gray-400 focus:outline-none bg-transparent"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex items-center justify-center rounded-full shrink-0 mr-2 transition-colors"
        style={{ width: 44, height: 44, background: '#FF6600' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#e55c00')}
        onMouseLeave={e => (e.currentTarget.style.background = '#FF6600')}
      >
        <Search className="w-5 h-5 text-white" />
      </button>
    </form>
  );
}
